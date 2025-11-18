// ===== VERIFICACIÓN Y GUARD =====
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const guard = document.getElementById("guardMessage");

  if (!token || !userRaw) {
    window.location.href = "/public/login.html";
    return;
  }

  const user = JSON.parse(userRaw);

  // Mostrar información del usuario
  document.getElementById("userEmail").textContent = user.email || "—";
  document.getElementById("userName").textContent =
    user.name || user.email || "Domiciliario";

  // Verificar si tiene rol de delivery
  const roles = user.roles || [];
  if (!roles.includes("delivery") && !roles.includes("domiciliario")) {
    guard.classList.remove("d-none");
    guard.innerHTML =
      '<i class="bi bi-exclamation-triangle-fill me-2"></i>Acceso restringido: este panel es solo para usuarios con rol <strong>domiciliario</strong>.';
    setTimeout(() => (window.location.href = "/public/user-inicio.html"), 2000);
    return;
  }

  // Inicializar role switcher
  initRoleSwitcher();

  // Cargar datos
  loadMyApplication();
  loadMyDocuments();
  loadAssignedOrders();
  loadAvailableOrders();
  loadDeliveryStats();
});

// ===== CARGAR ESTADÍSTICAS DEL DOMICILIARIO =====
async function loadDeliveryStats() {
  try {
    const res = await fetch('/api/v1/orders/my-stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    if (!data.success || !data.data) return;
    document.getElementById('statTotal').textContent = data.data.total;
    document.getElementById('statToday').textContent = data.data.today;
    document.getElementById('statActive').textContent = data.data.inProcess;
    document.getElementById('statEarnings').textContent = `$${data.data.earningsToday.toLocaleString('es-CO')}`;
  } catch (e) {
    console.error('Error cargando estadísticas:', e);
  }
}
});

// ===== CARGAR PEDIDOS ASIGNADOS =====
async function loadAssignedOrders() {
  const box = document.getElementById("assignedOrdersBox");
  box.innerHTML = `
          <div class="text-center text-muted py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando pedidos asignados...</p>
          </div>
        `;

  try {
    const res = await fetch("/api/v1/orders/my-deliveries", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();

    if (!data.success || !Array.isArray(data.orders) || data.orders.length === 0) {
      box.innerHTML = `
              <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <h5>No tienes pedidos asignados</h5>
                <p>Los pedidos que aceptes aparecerán aquí</p>
              </div>
            `;
      document.getElementById("statActive").textContent = "0";
      return;
    }

    // Actualizar estadística de pedidos activos
    document.getElementById("statActive").textContent = data.orders.length;

    box.innerHTML = data.orders.map((order) => renderAssignedOrder(order)).join("");
  } catch (e) {
    console.error("Error cargando pedidos asignados:", e);
    box.innerHTML = `
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-circle me-2"></i>
              Error cargando pedidos asignados. Por favor, intenta nuevamente.
            </div>
          `;
  }
}

// ===== RENDERIZAR PEDIDO ASIGNADO =====
function renderAssignedOrder(order) {
  const statusMap = {
    pendiente: "pending",
    aceptado: "accepted",
    en_camino: "in-transit",
    entregado: "delivered",
  };

  const statusClass = statusMap[order.status] || "pending";
  const statusText = order.status.replace(/_/g, " ").toUpperCase();

  let nextStatus = "";
  let nextStatusText = "";
  let nextStatusIcon = "";

  if (order.status === "aceptado") {
    nextStatus = "en_camino";
    nextStatusText = "En Camino";
    nextStatusIcon = "truck";
  } else if (order.status === "en_camino") {
    nextStatus = "entregado";
    nextStatusText = "Entregado";
    nextStatusIcon = "check-circle-fill";
  }

  // Calcular tiempo estimado (ejemplo: 30 min)
  const estimatedTime = "30 min";

  return `
          <div class="order-card fade-in-up">
            <div class="order-header">
              <div class="order-number">
                <i class="bi bi-receipt"></i>
                #${order.order_number || order.id}
              </div>
              <div>
                <span class="status-badge status-${statusClass}">${statusText}</span>
                ${
                  order.status === "en_camino"
                    ? '<span class="time-badge ms-2"><i class="bi bi-clock"></i> ' +
                      estimatedTime +
                      "</span>"
                    : ""
                }
              </div>
            </div>
            
            <div class="order-info">
              <i class="bi bi-person-fill"></i>
              <strong>Cliente:</strong>
              <span>${order.customer_name || "Sin nombre"}</span>
            </div>
            
            <div class="order-info">
              <i class="bi bi-geo-alt-fill"></i>
              <strong>Dirección:</strong>
              <span>${order.delivery_address || "Sin dirección"}</span>
            </div>
            
            <div class="order-info">
              <i class="bi bi-telephone-fill"></i>
              <strong>Teléfono:</strong>
              <span>${order.delivery_phone || "Sin teléfono"}</span>
            </div>
            
            <div class="order-info">
              <i class="bi bi-cash-stack"></i>
              <strong>Total:</strong>
              <span class="fw-bold text-success">$${Number(
                order.total
              ).toLocaleString("es-CO")}</span>
            </div>
            
            ${
              nextStatus
                ? `
              <div class="order-actions">
                <button 
                  class="btn btn-success"
                  onclick="updateOrderStatus('${order.id}', '${nextStatus}')"
                >
                  <i class="bi bi-${nextStatusIcon}"></i> Marcar como ${nextStatusText}
                </button>
              </div>
            `
                : ""
            }
          </div>
        `;
}

// ===== CARGAR PEDIDOS DISPONIBLES =====
async function loadAvailableOrders() {
  const box = document.getElementById("availableOrdersBox");
  box.innerHTML = `
          <div class="text-center text-muted py-4">
            <div class="spinner-border text-secondary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando pedidos disponibles...</p>
          </div>
        `;

  try {
    const res = await fetch("/api/v1/orders/available", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();

    if (!data.success || !Array.isArray(data.orders) || data.orders.length === 0) {
      box.innerHTML = `
              <div class="empty-state">
                <i class="bi bi-search"></i>
                <h5>No hay pedidos disponibles</h5>
                <p>Los nuevos pedidos aparecerán aquí para que puedas aceptarlos</p>
              </div>
            `;
      return;
    }

    box.innerHTML = data.orders.map((order) => renderAvailableOrder(order)).join("");
  } catch (e) {
    console.error("Error cargando pedidos disponibles:", e);
    box.innerHTML = `
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-circle me-2"></i>
              Error cargando pedidos disponibles. Por favor, intenta nuevamente.
            </div>
          `;
  }
}

// ===== RENDERIZAR PEDIDO DISPONIBLE =====
function renderAvailableOrder(order) {
  // Calcular distancia estimada (ejemplo)
  const estimatedDistance = "2.5 km";

  return `
          <div class="order-card fade-in-up">
            <div class="order-header">
              <div class="order-number">
                <i class="bi bi-receipt"></i>
                #${order.order_number || order.id}
              </div>
              <div>
                <span class="status-badge status-pending">NUEVO</span>
                <span class="time-badge ms-2">
                  <i class="bi bi-geo"></i> ${estimatedDistance}
                </span>
              </div>
            </div>
            
            <div class="order-info">
              <i class="bi bi-shop"></i>
              <strong>Restaurante:</strong>
              <span>${order.restaurant_name || "Sin nombre"}</span>
            </div>
            
            <div class="order-info">
              <i class="bi bi-geo-alt-fill"></i>
              <strong>Dirección:</strong>
              <span>${order.delivery_address || "Sin dirección"}</span>
            </div>
            
            <div class="order-info">
              <i class="bi bi-cash-stack"></i>
              <strong>Total:</strong>
              <span class="fw-bold text-success">$${Number(
                order.total
              ).toLocaleString("es-CO")}</span>
            </div>
            
            <div class="order-actions">
              <button 
                class="btn btn-primary"
                onclick="acceptOrder('${order.id}')"
              >
                <i class="bi bi-hand-thumbs-up"></i> Aceptar Pedido
              </button>
            </div>
          </div>
        `;
}

// ===== ACEPTAR PEDIDO =====
async function acceptOrder(orderId) {
  if (!confirm("¿Deseas aceptar este pedido?")) return;

  try {
    const res = await fetch(`/api/v1/orders/${orderId}/assign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();

    if (data.success) {
      alert("✅ ¡Pedido asignado correctamente!");
      loadAssignedOrders();
      loadAvailableOrders();
    } else {
      alert("❌ " + (data.message || "No se pudo asignar el pedido."));
    }
  } catch (e) {
    console.error("Error al asignar pedido:", e);
    alert("❌ Error al asignar el pedido.");
  }
}

// ===== ACTUALIZAR ESTADO DE PEDIDO =====
async function updateOrderStatus(orderId, newStatus) {
  const statusLabels = {
    en_camino: "En Camino",
    entregado: "Entregado",
  };

  if (
    !confirm(
      `¿Deseas marcar este pedido como ${statusLabels[newStatus] || newStatus}?`
    )
  )
    return;

  try {
    const res = await fetch(`/api/v1/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();

    if (data.success) {
      alert("✅ Estado actualizado correctamente");
      loadAssignedOrders();
    } else {
      alert("❌ " + (data.message || "No se pudo actualizar el estado."));
    }
  } catch (e) {
    console.error("Error actualizando estado:", e);
    alert("❌ Error al actualizar el estado del pedido.");
  }
}

// ===== CARGAR MI SOLICITUD =====
async function loadMyApplication() {
  const box = document.getElementById("applicationBox");

  try {
    const res = await fetch("/api/v1/delivery-applications/my-application", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();

    if (!data.success || !data.data) {
      box.innerHTML = `
              <div class="text-muted text-center py-3">
                <i class="bi bi-file-earmark-x"></i>
                <p class="mb-0 mt-2">No se encontró tu solicitud</p>
              </div>
            `;
      return;
    }

    const app = data.data;
    const statusClass = `status-${app.status}`;

    box.innerHTML = `
            <div class="application-status ${statusClass}">
              <i class="bi bi-${
                app.status === "aprobada"
                  ? "check-circle"
                  : app.status === "rechazada"
                  ? "x-circle"
                  : "clock"
              }"></i>
              ${app.status.toUpperCase()}
            </div>
            <div class="mb-2">
              <small class="text-muted d-block">Fecha de solicitud</small>
              <strong>${formatDate(app.fecha_solicitud)}</strong>
            </div>
            ${
              app.fecha_revision
                ? `
              <div class="mb-2">
                <small class="text-muted d-block">Fecha de revisión</small>
                <strong>${formatDate(app.fecha_revision)}</strong>
              </div>
            `
                : ""
            }
            ${
              app.observaciones
                ? `
              <div class="mt-3 pt-3 border-top">
                <small class="text-muted d-block">Observaciones</small>
                <p class="mb-0">${app.observaciones}</p>
              </div>
            `
                : ""
            }
          `;
  } catch (e) {
    console.error("Error cargando solicitud:", e);
    box.innerHTML = `
            <div class="text-danger text-center py-3">
              <i class="bi bi-exclamation-circle"></i>
              <p class="mb-0 mt-2">Error cargando tu solicitud</p>
            </div>
          `;
  }
}

// ===== CARGAR MIS DOCUMENTOS =====
async function loadMyDocuments() {
  const box = document.getElementById("docsBox");

  try {
    const res = await fetch("/api/v1/delivery-applications/my-application", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const { data } = await res.json();

    if (!data) {
      box.innerHTML = `
              <div class="text-muted text-center py-3">
                <i class="bi bi-folder-x"></i>
                <p class="mb-0 mt-2">Sin documentos</p>
              </div>
            `;
      return;
    }

    const docs = [];

    if (data.cv_file_path) {
      docs.push(docLink("Hoja de Vida", data.cv_file_path, "file-earmark-person"));
    }
    if (data.id_document_path) {
      docs.push(docLink("Documento ID", data.id_document_path, "card-text"));
    }
    if (data.license_photo_path) {
      docs.push(docLink("Licencia", data.license_photo_path, "card-checklist"));
    }

    box.innerHTML = docs.length
      ? docs.join("")
      : `<div class="text-muted text-center py-3">Sin documentos adjuntos</div>`;
  } catch (e) {
    console.error("Error cargando documentos:", e);
    box.innerHTML = `
            <div class="text-danger text-center py-3">
              <i class="bi bi-exclamation-circle"></i>
              <p class="mb-0 mt-2">Error cargando documentos</p>
            </div>
          `;
  }
}

// ===== CREAR LINK DE DOCUMENTO =====
function docLink(label, path, icon = "file-earmark") {
  const url = getDocumentUrl(path);
  return `
          <a href="${url}" target="_blank" class="doc-link d-flex">
            <i class="bi bi-${icon}"></i>
            <span>${label}</span>
          </a>
        `;
}

// ===== OBTENER URL DEL DOCUMENTO =====
function getDocumentUrl(filePath) {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  const fileName = filePath.split(/[\\\/]/).pop();
  return `/uploads/delivery-applications/${fileName}`;
}

// ===== FORMATEAR FECHA =====
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ===== CERRAR SESIÓN =====
function logout() {
  if (confirm("¿Deseas cerrar sesión?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/public/login.html";
  }
}

// ===== CAMBIAR DE ROL/VISTA =====
function switchRole(role) {
  if (!role) return;

  const dashboardMap = {
    delivery: "/public/delivery-dashboard.html",
    user: "/public/user-dashboard.html",
    admin: "/public/admin-dashboard.html",
  };

  const url = dashboardMap[role];
  if (url) {
    window.location.href = url;
  }
}

// ===== INICIALIZAR ROLE SWITCHER =====
function initRoleSwitcher() {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      console.log("No hay usuario en localStorage");
      return;
    }

    const user = JSON.parse(userStr);
    const roles = user.roles || [];

    console.log("Roles del usuario:", roles);

    // Si solo tiene un rol, no mostrar el switcher
    if (roles.length <= 1) {
      console.log("Usuario tiene solo un rol, no se muestra switcher");
      return;
    }

    // Mostrar el menú de cambio de rol
    const roleSwitcherMenu = document.getElementById("roleSwitcherMenu");
    const roleSwitcherDivider = document.getElementById("roleSwitcherDivider");

    if (roleSwitcherMenu) {
      roleSwitcherMenu.classList.remove("d-none");
    }
    if (roleSwitcherDivider) {
      roleSwitcherDivider.classList.remove("d-none");
    }

    // Mostrar opciones según roles disponibles
    if (roles.includes("user")) {
      const userOption = document.getElementById("roleOptionUser");
      if (userOption) {
        userOption.classList.remove("d-none");
      }
    }

    if (roles.includes("admin")) {
      const adminOption = document.getElementById("roleOptionAdmin");
      if (adminOption) {
        adminOption.classList.remove("d-none");
      }
    }

    console.log("Role switcher inicializado correctamente");
  } catch (error) {
    console.error("Error al inicializar role switcher:", error);
  }
}
