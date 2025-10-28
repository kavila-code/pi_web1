// DomiTuluá - My Orders JavaScript

let allOrders = [];

// Verificar autenticación
if (!requireAuth()) {
  // requireAuth() ya redirige si no está autenticado
}

// Cargar pedidos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});

// Cargar pedidos del usuario
async function loadOrders() {
  const loadingEl = document.getElementById("loading");
  const containerEl = document.getElementById("ordersContainer");

  if (loadingEl) loadingEl.style.display = "block";

  try {
    const data = await authenticatedFetch("http://localhost:3000/api/v1/orders/my-orders");

    if (data && data.ok) {
      allOrders = data.data;
      renderOrders();
    } else {
      showError("Error al cargar pedidos");
    }
  } catch (error) {
    console.error("Error:", error);
    showError("Error de conexión");
  } finally {
    if (loadingEl) loadingEl.style.display = "none";
  }
}

// Renderizar pedidos
function renderOrders() {
  const container = document.getElementById("ordersContainer");
  if (!container) return;

  if (allOrders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-bag-x" style="font-size: 4rem; color: #ddd;"></i>
        <h4 class="mt-3">No tienes pedidos aún</h4>
        <p class="text-muted">¡Haz tu primer pedido y disfruta!</p>
        <a href="/public/restaurants.html" class="btn btn-primary btn-lg mt-3">
          <i class="bi bi-shop"></i> Ver Restaurantes
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = allOrders
    .map(
      (order) => `
        <div class="order-card">
          <div class="order-header">
            <div>
              <h5 class="mb-1">${order.restaurant_name || "Restaurante"}</h5>
              <p class="mb-0 text-muted small">Pedido #${order.id} - ${formatDate(order.created_at)}</p>
            </div>
            <span class="badge ${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</span>
          </div>
          <div class="order-body">
            ${order.items ? order.items.map(item => `
              <div class="order-item">
                <span>${item.quantity}x ${item.product_name}</span>
                <span>$${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join("") : ""}
            <div class="order-total">
              <span class="fw-bold">Total:</span>
              <span class="fw-bold text-primary">$${order.total_amount.toLocaleString()}</span>
            </div>
          </div>
          <div class="order-footer">
            <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails(${order.id})">
              <i class="bi bi-eye"></i> Ver Detalles
            </button>
            ${order.status === "delivered" ? `
              <button class="btn btn-sm btn-warning" onclick="rateOrder(${order.id})">
                <i class="bi bi-star"></i> Calificar
              </button>
            ` : ""}
            ${order.status === "pending" ? `
              <button class="btn btn-sm btn-danger" onclick="cancelOrder(${order.id})">
                <i class="bi bi-x-circle"></i> Cancelar
              </button>
            ` : ""}
          </div>
        </div>
    `
    )
    .join("");
}

// Obtener clase del badge según estado
function getStatusBadgeClass(status) {
  const classes = {
    pending: "bg-warning",
    confirmed: "bg-info",
    preparing: "bg-primary",
    ready: "bg-success",
    in_delivery: "bg-primary",
    delivered: "bg-success",
    cancelled: "bg-danger"
  };
  return classes[status] || "bg-secondary";
}

// Obtener texto del estado
function getStatusText(status) {
  const texts = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    preparing: "Preparando",
    ready: "Listo",
    in_delivery: "En Camino",
    delivered: "Entregado",
    cancelled: "Cancelado"
  };
  return texts[status] || status;
}

// Ver detalles del pedido
function viewOrderDetails(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  // Aquí puedes mostrar un modal con más detalles
  alert(`Detalles del pedido #${orderId}\n\nEstado: ${getStatusText(order.status)}\nTotal: $${order.total_amount.toLocaleString()}`);
}

// Calificar pedido
function rateOrder(orderId) {
  alert("Funcionalidad de calificación en desarrollo");
}

// Cancelar pedido
async function cancelOrder(orderId) {
  if (!confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
    return;
  }

  try {
    const data = await authenticatedFetch(`http://localhost:3000/api/v1/orders/${orderId}/cancel`, {
      method: "PUT"
    });

    if (data && data.ok) {
      showToast("Pedido cancelado exitosamente", "success");
      loadOrders();
    } else {
      showToast("Error al cancelar el pedido", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showToast("Error de conexión", "error");
  }
}

// Mostrar error
function showError(message) {
  const container = document.getElementById("ordersContainer");
  if (container) {
    container.innerHTML = `
      <div class="alert alert-danger">${message}</div>
    `;
  }
}
