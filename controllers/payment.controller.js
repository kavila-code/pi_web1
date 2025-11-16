import Stripe from 'stripe';
import express from 'express';
import { OrderModel } from '../models/order.model.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

// Helpers para Stripe
const stripe = (() => {
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key) return null;
  try { return new Stripe(key); } catch { return null; }
})();

const getPublicUrl = () => process.env.PUBLIC_URL || 'http://localhost:3000';

export const createStripeCheckoutSession = async (req, res) => {
  try {
    if (!stripe) return res.status(400).json({ ok: false, message: 'Stripe no está configurado (STRIPE_SECRET_KEY)' });
    const { order_id } = req.body;
    if (!order_id) return res.status(400).json({ ok: false, message: 'order_id es requerido' });

    // Obtener pedido con items
    const order = await OrderModel.getById(order_id);
    if (!order) return res.status(404).json({ ok: false, message: 'Pedido no encontrado' });
    if (order.customer_uid !== req.user?.uid) return res.status(403).json({ ok: false, message: 'No autorizado' });

    // Construir line items (Stripe usa cantidades en centavos)
    const line_items = (order.items || []).map(it => ({
      price_data: {
        currency: 'cop',
        product_data: { name: it.product_name },
        unit_amount: Math.round(Number(it.product_price) * 100),
      },
      quantity: Number(it.quantity) || 1,
    }));

    // Cargos adicionales como posiciones separadas
    if (Number(order.delivery_fee) > 0) {
      line_items.push({
        price_data: {
          currency: 'cop', product_data: { name: 'Domicilio' },
          unit_amount: Math.round(Number(order.delivery_fee) * 100)
        }, quantity: 1
      });
    }
    if (Number(order.tax_amount) > 0) {
      line_items.push({
        price_data: {
          currency: 'cop', product_data: { name: 'Impuestos' },
          unit_amount: Math.round(Number(order.tax_amount) * 100)
        }, quantity: 1
      });
    }

    const successUrl = `${getPublicUrl()}/public/order-success.html?order_id=${order.id}`;
    const cancelUrl = `${getPublicUrl()}/public/checkout.html?canceled=1`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: order.customer_email || undefined,
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { order_id: String(order.id), user_id: String(order.customer_uid) },
    });

    return res.status(200).json({ ok: true, url: session.url, id: session.id });
  } catch (err) {
    console.error('❌ createStripeCheckoutSession error:', err);
    console.error('Error details:', err.message);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ ok: false, message: `No se pudo iniciar el pago: ${err.message}` });
  }
};

export const stripeWebhook = async (req, res) => {
  try {
    if (!stripe) return res.sendStatus(200); // ignorar si no está configurado
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.error('⚠️  Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      // Sin validación (dev): req.body ya es objeto si no usamos raw
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session?.metadata?.order_id;
        if (orderId) {
          try {
            await OrderModel.updatePaymentStatus(orderId, 'pagado');
          } catch (e) {
            console.error('No se pudo marcar pago:', e.message);
          }
        }
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('stripeWebhook error:', err);
    res.status(400).send('Bad request');
  }
};

// Router auxiliar (excepto webhook que requiere raw)
export const paymentRouter = express.Router();
// Proteger la creación de sesión: requiere usuario autenticado
paymentRouter.post('/payments/stripe/create-session', authMiddleware, createStripeCheckoutSession);
