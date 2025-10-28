// DomiTuluá - Order Success JavaScript

// Verificar autenticación
if (!requireAuth()) {
  // requireAuth() ya redirige
}

// Cargar datos del pedido
document.addEventListener("DOMContentLoaded", () => {
  const orderData = JSON.parse(localStorage.getItem("lastOrder") || "{}");

  if (!orderData.id) {
    // No hay pedido, redirigir
    window.location.href = "/public/restaurants.html";
    return;
  }

  displayOrderInfo(orderData);

  // Limpiar después de mostrar
  setTimeout(() => {
    localStorage.removeItem("lastOrder");
  }, 1000);
});

// Mostrar información del pedido
function displayOrderInfo(order) {
  const orderNumberEl = document.getElementById("orderNumber");
  const orderTimeEl = document.getElementById("orderTime");
  const deliveryAddressEl = document.getElementById("deliveryAddress");
  const orderTotalEl = document.getElementById("orderTotal");

  if (orderNumberEl) orderNumberEl.textContent = `#${order.id}`;
  if (orderTimeEl) orderTimeEl.textContent = formatDate(order.created_at || new Date());
  if (deliveryAddressEl) deliveryAddressEl.textContent = order.delivery_address || "Dirección no especificada";
  if (orderTotalEl) orderTotalEl.textContent = `$${(order.total_amount || 0).toLocaleString()}`;

  // Mostrar items si están disponibles
  const itemsContainer = document.getElementById("orderItems");
  if (itemsContainer && order.items && order.items.length > 0) {
    itemsContainer.innerHTML = order.items.map(item => `
      <div class="d-flex justify-content-between mb-2">
        <span>${item.quantity}x ${item.product_name}</span>
        <span>$${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    `).join("");
  }
}

// Continuar comprando
function continueOrdering() {
  window.location.href = "/public/restaurants.html";
}

// Ver mis pedidos
function viewMyOrders() {
  window.location.href = "/public/my-orders.html";
}
