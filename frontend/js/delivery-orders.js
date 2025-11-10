let currentTab = "available";
let availableOrders = [];
let myDeliveries = [];

// Verificar autenticación y rol
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

if (!token) {
  window.location.href = "/login.html";
}

// Compatibilidad: preferir `roles` (array) y caer a `role` si existe
const roles = user.roles || (user.role ? [user.role] : []);
if (!(roles.includes("delivery") || roles.includes("domiciliario"))) {
  alert("Acceso denegado. Solo domiciliarios pueden acceder a esta página.");
  window.location.href = "/public/user-dashboard.html";
}

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadAvailableOrders();
  loadMyDeliveries();

  // Auto-refresh cada 15 segundos
  setInterval(() => {
    if (currentTab === "available") {
      loadAvailableOrders();
    } else {
      loadMyDeliveries();
    }
  }, 15000);
});

// Cambiar de tab
function switchTab(tab) {
  currentTab = tab;

  // Actualizar botones
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // Mostrar/ocultar contenido
  if (tab === "available") {
    document.getElementById("availableTab").style.display = "block";
    document.getElementById("myDeliveriesTab").style.display = "none";
    loadAvailableOrders();
  } else {
    document.getElementById("availableTab").style.display = "none";
    document.getElementById("myDeliveriesTab").style.display = "block";
    loadMyDeliveries();
  }
}

// Cargar pedidos disponibles
async function loadAvailableOrders() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/v1/orders/available",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.ok) {
      availableOrders = data.data;
      renderAvailableOrders();
    } else {
      showEmptyAvailable();
    }
  } catch (error) {
    console.error("Error:", error);
    showEmptyAvailable();
  }
}

// Renderizar pedidos disponibles
function renderAvailableOrders() {
  const container = document.getElementById("availableOrders");

  if (availableOrders.length === 0) {
    container.innerHTML = `
                    <div class="empty-state-delivery">
                        <i class="bi bi-inbox" style="font-size: 4rem; color: #ddd;"></i>
                        <h4 class="mt-4">No hay pedidos disponibles</h4>
                        <p class="text-muted">Los nuevos pedidos aparecerán aquí automáticamente</p>
                    </div>
                `;
    return;
  }

  container.innerHTML = availableOrders
    .map(
      (order) => `
                <div class="order-card-delivery available">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="d-flex align-items-start gap-3 mb-3">
                                <img src="${
                                  order.restaurant_logo ||
                                  "https://via.placeholder.com/60"
                                }" 
                                     style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;" 
                                     alt="${order.restaurant_name}">
                                <div class="flex-grow-1">
                                    <h5 class="fw-bold mb-1">${
                                      order.restaurant_name
                                    }</h5>
                                    <p class="text-muted mb-2">Pedido #${
                                      order.order_number
                                    }</p>
                                    <div class="d-flex gap-3 text-muted small">
                                        <span><i class="bi bi-geo-alt"></i> ${
                                          order.restaurant_address
                                        }</span>
                                        <span><i class="bi bi-box-seam"></i> ${
                                          order.items_count
                                        } productos</span>
                                    </div>
                                </div>
                            </div>

                            <div class="customer-info">
                                <h6 class="fw-bold mb-2">
                                    <i class="bi bi-person"></i> Información del Cliente
                                </h6>
                                <p class="mb-1"><strong>Nombre:</strong> ${
                                  order.customer_name
                                }</p>
                                <p class="mb-1"><strong>Dirección:</strong> ${
                                  order.delivery_address
                                }</p>
                                <p class="mb-0"><strong>Teléfono:</strong> ${
                                  order.delivery_phone
                                }</p>
                            </div>
                        </div>

                        <div class="col-md-4 text-end">
                            <h3 class="fw-bold text-success mb-2">$${order.total.toLocaleString()}</h3>
                            <span class="distance-badge">
                                <i class="bi bi-geo"></i> ~2.5 km
                            </span>
                            <div class="mt-4">
                                <button class="btn accept-btn w-100 mb-2" onclick="acceptOrder(${order.id})">
                                    <i class="bi bi-check-circle me-2"></i>
                                    Aceptar Pedido
                                </button>
                                <button class="btn btn-outline-secondary w-100" onclick="viewOrderDetail(${order.id})">
                                    <i class="bi bi-eye"></i> Ver Detalle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `
    )
    .join("");
}

// Cargar mis entregas
async function loadMyDeliveries() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/v1/orders/my-deliveries",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.ok) {
      myDeliveries = data.data;
      renderMyDeliveries();
      updateStats();
    } else {
      showEmptyDeliveries();
    }
  } catch (error) {
    console.error("Error:", error);
    showEmptyDeliveries();
  }
}

// Renderizar mis entregas
function renderMyDeliveries() {
  const container = document.getElementById("myDeliveries");

  if (myDeliveries.length === 0) {
    container.innerHTML = `
                    <div class="empty-state-delivery">
                        <i class="bi bi-truck" style="font-size: 4rem; color: #ddd;"></i>
                        <h4 class="mt-4">No tienes entregas activas</h4>
                        <p class="text-muted">Acepta pedidos desde la pestaña de disponibles</p>
                    </div>
                `;
    return;
  }

  container.innerHTML = myDeliveries
    .map(
      (order) => `
                <div class="order-card-delivery in-delivery">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="d-flex align-items-start gap-3 mb-3">
                                <img src="${
                                  order.restaurant_logo ||
                                  "https://via.placeholder.com/60"
                                }" 
                                     style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;" 
                                     alt="${order.restaurant_name}">
                                <div class="flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h5 class="fw-bold mb-1">${
                                              order.restaurant_name
                                            }</h5>
                                            <p class="text-muted mb-2">Pedido #${
                                              order.order_number
                                            }</p>
                                        </div>
                                        <span class="badge bg-success">${getStatusText(
                                          order.status
                                        )}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="customer-info">
                                <h6 class="fw-bold mb-2">
                                    <i class="bi bi-person"></i> Cliente
                                </h6>
                                <p class="mb-1"><strong>Nombre:</strong> ${
                                  order.customer_name
                                }</p>
                                <p class="mb-1"><strong>Dirección:</strong> ${
                                  order.delivery_address
                                }</p>
                                <p class="mb-1"><strong>Teléfono:</strong> ${
                                  order.delivery_phone
                                }</p>
                                ${
                                  order.delivery_notes
                                    ? `<p class="mb-0 fst-italic text-muted"><i class="bi bi-chat-left-text"></i> ${order.delivery_notes}</p>`
                                    : ""
                                }
                            </div>

                            <div class="mt-3">
                                <small class="text-muted">
                                    <i class="bi bi-clock"></i> Recogido: ${new Date(
                                      order.picked_up_at
                                    ).toLocaleTimeString("es-CO", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                </small>
                            </div>
                        </div>

                        <div class="col-md-4 text-end">
                            <h3 class="fw-bold text-success mb-3">$${order.total.toLocaleString()}</h3>
                            
                            <div class="action-buttons">
                                <button class="btn btn-success" onclick="markAsDelivered(${order.id})">
                                    <i class="bi bi-check-circle"></i>
                                    Entregado
                                </button>
                                <button class="btn btn-outline-secondary" onclick="viewOrderDetail(${order.id})">
                                    <i class="bi bi-eye"></i>
                                </button>
                            </div>

                            <div class="mt-3">
                                <a href="tel:${order.customer_email}" class="btn btn-outline-primary btn-sm w-100">
                                    <i class="bi bi-telephone"></i> Llamar Cliente
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `
    )
    .join("");
}

// Aceptar pedido
async function acceptOrder(orderId) {
  if (!confirm("¿Deseas aceptar este pedido?")) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/orders/${orderId}/assign`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.ok) {
      showToast("Pedido aceptado exitosamente");
      loadAvailableOrders();
      loadMyDeliveries();

      // Cambiar a pestaña de mis entregas
      setTimeout(() => {
        document.querySelectorAll(".tab-btn")[1].click();
      }, 1000);
    } else {
      alert(data.message || "Error al aceptar el pedido");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al aceptar el pedido");
  }
}

// Marcar como entregado
async function markAsDelivered(orderId) {
  if (!confirm("¿Confirmas que el pedido fue entregado al cliente?")) return;

  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "entregado",
          notes: "Entregado por el domiciliario",
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      showToast("¡Entrega completada exitosamente!");
      loadMyDeliveries();
    } else {
      alert(data.message || "Error al actualizar el estado");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al actualizar el estado");
  }
}

// Ver detalle del pedido
async function viewOrderDetail(orderId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.ok) {
      const order = data.data;
      document.getElementById("modalBody").innerHTML = `
                        <div class="mb-4">
                            <h6 class="fw-bold mb-3">📋 Información del Pedido</h6>
                            <p><strong>Número:</strong> #${order.order_number}</p>
                            <p><strong>Restaurante:</strong> ${order.restaurant_name}</p>
                            <p><strong>Dirección Restaurant:</strong> ${order.restaurant_address}</p>
                            <p><strong>Teléfono Restaurant:</strong> ${order.restaurant_phone}</p>
                        </div>

                        <div class="mb-4">
                            <h6 class="fw-bold mb-3">📦 Productos (${order.items.length})</h6>
                            ${order.items
                              .map(
                                (item) => `
                                <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                    <div>
                                        <strong>${item.product_name}</strong> x${item.quantity}
                                        ${
                                          item.special_instructions
                                            ? `<br><small class="text-muted fst-italic">${item.special_instructions}</small>`
                                            : ""
                                        }
                                    </div>
                                    <div>$${item.subtotal.toLocaleString()}</div>
                                </div>
                            `
                              )
                              .join("")}
                        </div>

                        <div class="mb-4">
                            <h6 class="fw-bold mb-3">👤 Cliente</h6>
                            <p><strong>Nombre:</strong> ${order.customer_name}</p>
                            <p><strong>Dirección:</strong> ${order.delivery_address}</p>
                            <p><strong>Teléfono:</strong> ${order.delivery_phone}</p>
                            ${
                              order.delivery_notes
                                ? `<p><strong>Notas:</strong> ${order.delivery_notes}</p>`
                                : ""
                            }
                        </div>

                        <div class="mb-4">
                            <h6 class="fw-bold mb-3">💰 Totales</h6>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span>$${order.subtotal.toLocaleString()}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Domicilio</span>
                                <span>$${order.delivery_fee.toLocaleString()}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>IVA</span>
                                <span>$${order.tax_amount.toLocaleString()}</span>
                            </div>
                            <div class="d-flex justify-content-between fw-bold fs-5 text-success pt-2 border-top">
                                <span>Total a Cobrar</span>
                                <span>$${order.total.toLocaleString()}</span>
                            </div>
                            <p class="text-muted mt-2 mb-0">
                                <i class="bi bi-cash"></i> Método de pago: ${order.payment_method}
                            </p>
                        </div>
                    `;

      const modal = new bootstrap.Modal(
        document.getElementById("orderDetailModal")
      );
      modal.show();
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar el detalle");
  }
}

// Actualizar estadísticas
function updateStats() {
  const active = myDeliveries.filter((o) => o.status === "en_camino").length;
  const completed = myDeliveries.filter((o) => o.status === "entregado").length;

  document.getElementById("activeDeliveries").textContent = active;
  document.getElementById("totalDeliveries").textContent = completed;
}

// Obtener texto del estado
function getStatusText(status) {
  const texts = {
    listo: "Listo para Recoger",
    en_camino: "En Camino",
    entregado: "Entregado",
  };
  return texts[status] || status;
}

// Mostrar vacío
function showEmptyAvailable() {
  document.getElementById("availableOrders").innerHTML = `
                <div class="empty-state-delivery">
                    <i class="bi bi-inbox" style="font-size: 4rem; color: #ddd;"></i>
                    <h4 class="mt-4">No hay pedidos disponibles</h4>
                    <p class="text-muted">Los nuevos pedidos aparecerán aquí automáticamente</p>
                </div>
            `;
}

function showEmptyDeliveries() {
  document.getElementById("myDeliveries").innerHTML = `
                <div class="empty-state-delivery">
                    <i class="bi bi-truck" style="font-size: 4rem; color: #ddd;"></i>
                    <h4 class="mt-4">No tienes entregas activas</h4>
                    <p class="text-muted">Acepta pedidos desde la pestaña de disponibles</p>
                </div>
            `;
}

// Mostrar toast
function showToast(message) {
  document.getElementById("toastMessage").textContent = message;
  const toast = new bootstrap.Toast(document.getElementById("successToast"));
  toast.show();
}

// Cerrar sesión
function logout() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
  }
}
