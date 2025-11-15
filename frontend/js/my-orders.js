// DomiTuluá - My Orders JavaScript

let allOrders = [];
let currentStatusFilter = ""; // '', 'pendiente', 'en_camino', 'entregado', 'cancelado'

// Verificar autenticación
if (!requireAuth()) {
  // requireAuth() ya redirige si no está autenticado
}

// Cargar pedidos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  // Vista inicial: Entregados
  filterOrders('entregado');
});

// Cargar pedidos del usuario
async function loadOrders(status) {
  const listEl = document.getElementById("ordersList");
  const emptyEl = document.getElementById("emptyState");
  if (emptyEl) emptyEl.style.display = "none";
  if (listEl) {
    listEl.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando tus pedidos...</p>
      </div>`;
  }

  try {
    const params = new URLSearchParams();
    // Comportamientos:
    // - status undefined: fallback a 'entregado' (solo en llamadas internas)
    // - status '': 'Todos' → no filtra por estado, incluye cancelados
    // - status explícito: aplica ese estado
    if (typeof status === 'undefined') {
      params.set("status", "entregado");
    } else if (status === '' || status === 'all' || status === 'todos') {
      // no setear status → API devolverá todos los estados
    } else {
      params.set("status", status);
    }

    const data = await authenticatedFetch(`/api/v1/orders/my-orders?${params.toString()}`);

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
    // el loader se reemplaza dentro de renderOrders/showError
  }
}

// Renderizar pedidos
function renderOrders() {
  const container = document.getElementById("ordersList");
  const emptyEl = document.getElementById("emptyState");
  if (!container) return;

  if (allOrders.length === 0) {
    container.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "block";
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
              <span class="fw-bold text-primary">$${Number(order.total || 0).toLocaleString("es-CO")}</span>
            </div>
          </div>
          <div class="order-footer">
            <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails(${order.id})">
              <i class="bi bi-eye"></i> Ver Detalles
            </button>
            ${order.status === "entregado" ? `
              <button class="btn btn-sm btn-warning" onclick="rateOrder(${order.id})">
                <i class="bi bi-star"></i> Calificar
              </button>
            ` : ""}
            ${order.status === "pendiente" ? `
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
    pendiente: "bg-warning",
    confirmado: "bg-info",
    preparando: "bg-primary",
    listo: "bg-success",
    en_camino: "bg-primary",
    entregado: "bg-success",
    cancelado: "bg-danger"
  };
  return classes[status] || "bg-secondary";
}

// Obtener texto del estado
function getStatusText(status) {
  const texts = {
    pendiente: "Pendiente",
    confirmado: "Confirmado",
    preparando: "Preparando",
    listo: "Listo",
    en_camino: "En Camino",
    entregado: "Entregado",
    cancelado: "Cancelado"
  };
  return texts[status] || status;
}

// Ver detalles del pedido
function viewOrderDetails(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  // Aquí puedes mostrar un modal con más detalles
  alert(`Detalles del pedido #${orderId}\n\nEstado: ${getStatusText(order.status)}\nTotal: $${Number(order.total || 0).toLocaleString('es-CO')}`);
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
    const data = await authenticatedFetch(`/api/v1/orders/${orderId}/cancel`, {
      method: "POST"
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
  const container = document.getElementById("ordersList");
  const emptyEl = document.getElementById("emptyState");
  if (emptyEl) emptyEl.style.display = "none";
  if (container) {
    container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  }
}

// Filtros de estado (desde botones en la página)
function filterOrders(status) {
  currentStatusFilter = status || "";
  // Actualizar estado activo en UI si los botones existen
  try {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (status) {
      const map = {
        '': 0,
        'pendiente': 1,
        'en_camino': 2,
        'entregado': 3,
        'cancelado': 4
      };
      const idx = map[status];
      const btns = document.querySelectorAll('.filter-btn');
      if (typeof idx === 'number' && btns[idx]) btns[idx].classList.add('active');
    }
  } catch {}

  loadOrders(currentStatusFilter);
}
