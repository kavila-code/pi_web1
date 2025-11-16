# Pasarela de Pagos (Stripe) - Guía de Configuración

Esta guía deja listo Stripe Checkout en modo prueba para tu app. Cubre entorno local (Windows) y despliegue en Raspberry Pi (Debian/Raspbian).

## Variables de entorno (.env)
Añade estas variables (completa los valores reales):

```
# Base
DATABASE_URL=postgresql://postgres:password@localhost:5432/jwt_db
JWT_SECRET=palabrasecreta
PUBLIC_URL=http://localhost:3000

# Stripe (modo prueba)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

> PUBLIC_URL debe ser la URL pública donde corre tu servidor (localhost o IP/dominio de tu Pi).

---

## Instalación local (Windows)

1) Instalar Stripe CLI (solo una vez):
```
winget install Stripe.StripeCLI
```

2) Autenticarse y crear forward del webhook:
```
stripe login
stripe listen --forward-to localhost:3000/api/v1/payments/stripe/webhook
```
Copia el `Signing secret` (formato `whsec_...`) y ponlo en `STRIPE_WEBHOOK_SECRET` en tu `.env`.

3) Instalar dependencias e iniciar el server:
```
cmd /c npm install
npm start
```

4) Probar: ve a `http://localhost:3000/public/checkout.html`, elige “Pago en línea”, completa con tarjeta de prueba `4242 4242 4242 4242`.

---

## Despliegue en Raspberry Pi

### A. Preparación del sistema (una vez)

```
# Actualizar
sudo apt-get update -y

# Node.js LTS (si no lo tienes)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

# Stripe CLI (opción paquete precompilado)
# Descarga última versión desde https://github.com/stripe/stripe-cli/releases
# Ejemplo (amd64/armv7/arm64 puede variar):
curl -L https://github.com/stripe/stripe-cli/releases/download/v1.15.7/stripe_1.15.7_linux_arm64.tar.gz -o stripe.tar.gz
sudo tar -xzf stripe.tar.gz -C /usr/local/bin --strip-components=1 stripe
stripe version
```

### B. Configurar proyecto

```
# Ubicación del proyecto
echo "Clona o sincroniza el repo en /opt/pi_web" 
sudo mkdir -p /opt/pi_web
sudo chown $USER:$USER /opt/pi_web
cd /opt/pi_web

# Si ya tienes el código en tu PC, puedes copiarlo por scp:
# scp -r C:/Users/User/Documents/pi_web/* pi@<IP_PI>:/opt/pi_web/

npm install --production
cp .env.example .env  # luego edita valores reales
```

Edita `/opt/pi_web/.env` con:
```
PUBLIC_URL=http://<IP_O_DOMINIO_PI>:3000
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### C. Servicios systemd

Archivos de ejemplo incluidos en `scripts/systemd/`:
- `pi_web.service`: levanta el servidor Node en el puerto 3000
- `stripe-webhook.service`: mantiene `stripe listen` enviando eventos al webhook local

Instalación:
```
sudo cp scripts/systemd/pi_web.service /etc/systemd/system/
sudo cp scripts/systemd/stripe-webhook.service /etc/systemd/system/

# Ajusta la ruta WorkingDirectory si tu proyecto no está en /opt/pi_web
sudo systemctl daemon-reload
sudo systemctl enable pi_web.service
sudo systemctl enable stripe-webhook.service
sudo systemctl start pi_web.service
sudo systemctl start stripe-webhook.service

# Verificar
systemctl status pi_web.service --no-pager
systemctl status stripe-webhook.service --no-pager
```

> Si prefieres no usar Stripe CLI en la Pi, configura el webhook directamente en el Dashboard de Stripe apuntando a `https://tu-dominio/api/v1/payments/stripe/webhook` y elimina `stripe-webhook.service`.

---

## Pruebas útiles

- Simular un evento desde Stripe CLI (dev):
```
stripe trigger checkout.session.completed
```
- Consultar pagos en tu app (DB):
```
SELECT id, order_number, payment_status, total, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

---

## Notas
- La ruta del webhook ya está montada en `index.js` antes de `express.json()` (requisito Stripe).
- Si usas Nginx como proxy en la Pi, asegúrate de pasar `application/json` sin tocar el cuerpo para `/api/v1/payments/stripe/webhook`.
- En producción, usa HTTPS (LetsEncrypt o similar) y crea el webhook en el Dashboard de Stripe (más robusto que Stripe CLI).
