import { OrderModel } from '../models/order.model.js';
import { ProductModel } from '../models/product.model.js';

// Crear un nuevo pedido
export const createOrder = async (req, res) => {
  try {
    const customerId = req.user.uid;
    const { restaurant_id, items, delivery_address, delivery_phone, delivery_notes, payment_method } = req.body;

    // Validaciones básicas
    if (!restaurant_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Restaurante e items son requeridos',
      });
    }

    if (!delivery_address || !delivery_phone) {
      return res.status(400).json({
        ok: false,
        message: 'Dirección y teléfono de entrega son requeridos',
      });
    }

    // Obtener productos para validar precios
    const productIds = items.map(item => item.product_id);
    const products = await ProductModel.getByIds(productIds);

    if (products.length !== productIds.length) {
      return res.status(400).json({
        ok: false,
        message: 'Algunos productos no existen',
      });
    }

    // Verificar que todos los productos sean del mismo restaurante
    const invalidProducts = products.filter(p => p.restaurant_id !== restaurant_id);
    if (invalidProducts.length > 0) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los productos deben ser del mismo restaurante',
      });
    }

    // Calcular totales
    let subtotal = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      
      if (!product.is_available) {
        throw new Error(`El producto ${product.name} no está disponible`);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      return {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        special_instructions: item.special_instructions || null,
      };
    });

    // Calcular costos adicionales
    const delivery_fee = 3000; // $3.000 fijo (puede ser dinámico)
    const tax_amount = subtotal * 0.19; // IVA 19%
    const total = subtotal + delivery_fee + tax_amount;

    const orderData = {
      customer_id: customerId,
      restaurant_id,
      delivery_address,
      delivery_phone,
      delivery_notes,
      subtotal,
      delivery_fee,
      discount_amount: 0,
      tax_amount,
      total,
      payment_method: payment_method || 'efectivo',
    };

    const newOrder = await OrderModel.create(orderData, orderItems);

    return res.status(201).json({
      ok: true,
      message: 'Pedido creado exitosamente',
      data: newOrder,
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return res.status(500).json({
      ok: false,
      message: error.message || 'Error al crear pedido',
    });
  }
};

// Obtener mis pedidos (cliente)
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.uid;

    const filters = {
      status: req.query.status,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    };

    const orders = await OrderModel.getByCustomer(customerId, filters);

    return res.status(200).json({
      ok: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener pedidos',
      error: error.message,
    });
  }
};

// Obtener pedidos de un restaurante (admin/restaurant)
export const getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const filters = {
      status: req.query.status,
    };

    const orders = await OrderModel.getByRestaurant(restaurantId, filters);

    return res.status(200).json({
      ok: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error al obtener pedidos del restaurante:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener pedidos del restaurante',
      error: error.message,
    });
  }
};

// Obtener pedidos disponibles para domiciliarios
export const getAvailableOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getAvailableForDelivery();

    return res.status(200).json({
      ok: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error al obtener pedidos disponibles:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener pedidos disponibles',
      error: error.message,
    });
  }
};

// Obtener mis pedidos como domiciliario
export const getMyDeliveries = async (req, res) => {
  try {
    const deliveryPersonId = req.user.uid;

    const filters = {
      status: req.query.status,
    };

    const orders = await OrderModel.getByDeliveryPerson(deliveryPersonId, filters);

    return res.status(200).json({
      ok: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error al obtener mis entregas:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener mis entregas',
      error: error.message,
    });
  }
};

// Obtener todos los pedidos (admin)
export const getAllOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      restaurant_id: req.query.restaurant_id ? parseInt(req.query.restaurant_id) : undefined,
      delivery_person_id: req.query.delivery_person_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    };

    const orders = await OrderModel.getAll(filters);

    return res.status(200).json({
      ok: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener todos los pedidos',
      error: error.message,
    });
  }
};

// Obtener detalle de un pedido
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const userRole = req.user.role;

    const order = await OrderModel.getById(id);

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Pedido no encontrado',
      });
    }

    // Verificar permisos
    if (userRole !== 'admin') {
      if (order.customer_uid !== userId && order.delivery_person_uid !== userId) {
        return res.status(403).json({
          ok: false,
          message: 'No tienes permiso para ver este pedido',
        });
      }
    }

    return res.status(200).json({
      ok: true,
      data: order,
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener pedido',
      error: error.message,
    });
  }
};

// Actualizar estado del pedido
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.uid;

    const validStatuses = ['pendiente', 'confirmado', 'preparando', 'listo', 'en_camino', 'entregado', 'cancelado'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Estado inválido',
      });
    }

    const updatedOrder = await OrderModel.updateStatus(id, status, userId, notes);

    return res.status(200).json({
      ok: true,
      message: 'Estado actualizado exitosamente',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar estado',
      error: error.message,
    });
  }
};

// Asignar domiciliario a un pedido
export const assignDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryPersonId = req.user.uid;

    const updatedOrder = await OrderModel.assignDeliveryPerson(id, deliveryPersonId, deliveryPersonId);

    return res.status(200).json({
      ok: true,
      message: 'Pedido asignado exitosamente',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error al asignar domiciliario:', error);
    return res.status(500).json({
      ok: false,
      message: error.message || 'Error al asignar domiciliario',
    });
  }
};

// Cancelar pedido
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.uid;

    if (!reason) {
      return res.status(400).json({
        ok: false,
        message: 'La razón de cancelación es requerida',
      });
    }

    const cancelledOrder = await OrderModel.cancel(id, userId, reason);

    return res.status(200).json({
      ok: true,
      message: 'Pedido cancelado exitosamente',
      data: cancelledOrder,
    });
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al cancelar pedido',
      error: error.message,
    });
  }
};

// Agregar calificación y reseña
export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const customerId = req.user.uid;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        ok: false,
        message: 'La calificación debe estar entre 1 y 5',
      });
    }

    const updatedOrder = await OrderModel.addReview(id, customerId, rating, review);

    if (!updatedOrder) {
      return res.status(400).json({
        ok: false,
        message: 'No se pudo agregar la reseña. Verifica que el pedido esté entregado y sea tuyo.',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Reseña agregada exitosamente',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error al agregar reseña:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al agregar reseña',
      error: error.message,
    });
  }
};

// Obtener estadísticas de pedidos (admin)
export const getOrderStats = async (req, res) => {
  try {
    const stats = await OrderModel.getStats();

    return res.status(200).json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
};
