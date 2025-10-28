// Variables globales
let sidebarOpen = true;

// Función para alternar sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.querySelector(".main-content");

  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");
  sidebarOpen = !sidebarOpen;
}

// Función para mostrar secciones
function showSection(sectionName) {
  // Ocultar todas las secciones
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  // Mostrar la sección seleccionada
  document.getElementById(sectionName + "-section").classList.add("active");

  // Actualizar el título de la página
  const titles = {
    dashboard: "Dashboard",
    users: "Gestión de Usuarios",
    orders: "Gestión de Pedidos",
    restaurants: "Gestión de Restaurantes",
    "delivery-applications": "Solicitudes de Domiciliarios",
    reports: "Reportes y Análisis",
    settings: "Configuración del Sistema",
  };
  document.getElementById("pageTitle").textContent = titles[sectionName];

  // Actualizar menu activo
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.classList.remove("active");
  });
  event.target.closest(".menu-item").classList.add("active");
}

// Función de logout
function logout() {
  console.log("Logout function called");
  try {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      console.log("User confirmed logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("Tokens removed, redirecting...");
      window.location.href = "/login";
    } else {
      console.log("User cancelled logout");
    }
  } catch (error) {
    console.error("Error in logout function:", error);
    alert("Error al cerrar sesión: " + error.message);
  }
}

// Verificar autenticación al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  // Verificar si es admin (ahora user.roles es un array)
  const roles = user.roles || [];
  if (!roles.includes("admin")) {
    alert("Acceso denegado. Solo administradores pueden acceder.");
    window.location.href = "/";
    return;
  }

  // Mostrar nombre y rol del usuario
  if (user.username) {
    document.getElementById("adminName").textContent = user.username;
  }

  // Mostrar el rol principal (el primero que encuentre)
  if (roles.length > 0) {
    let roleLabel = "";
    const primaryRole = roles.includes("admin") ? "admin" : roles[0];

    switch (primaryRole) {
      case "admin":
        roleLabel = "Administrador";
        break;
      case "delivery":
      case "domiciliario":
        roleLabel = "Domiciliario";
        break;
      case "cliente":
      case "user":
        roleLabel = "Cliente";
        break;
      default:
        roleLabel = primaryRole || "Usuario";
    }
    const roleElem = document.getElementById("adminRole");
    if (roleElem) roleElem.textContent = roleLabel;
  }

  // Cargar datos del dashboard
  loadDashboardData();

  // Inicializar gráfico
  initChart();

  // Event listener para el botón de logout como respaldo
  const logoutBtn = document.querySelector(".btn-logout");
  if (logoutBtn) {
    console.log("Logout button found, adding event listener");
    logoutBtn.addEventListener("click", function (e) {
      console.log("Logout button clicked via event listener");
      e.preventDefault();
      logout();
    });
  } else {
    console.error("Logout button not found!");
  }
});

// Función para cargar datos del dashboard (usuarios, pedidos, restaurantes, ingresos)
async function loadDashboardData() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/v1/admin/dashboard/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      if (result.ok) {
        updateDashboardStats(result.stats);
      }
    } else if (response.status === 403) {
      alert("Acceso denegado");
      logout();
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// Actualiza las tarjetas de estadísticas con datos reales
function updateDashboardStats(stats) {
  document.getElementById("totalUsers").textContent =
    stats.totalUsers?.toLocaleString() ?? "0";
  document.getElementById("totalOrders").textContent =
    stats.totalOrders?.toLocaleString() ?? "0";
  document.getElementById("totalRestaurants").textContent =
    stats.totalRestaurants ?? "0";
  document.getElementById("totalRevenue").textContent = `$${
    stats.totalRevenue?.toLocaleString() ?? "0"
  }`;
  // Si el backend provee tendencias, puedes mostrarlas aquí:
  if (stats.usersTrend)
    document.getElementById("usersTrend").innerHTML =
      `<i class='bi bi-arrow-up'></i> ${stats.usersTrend}`;
  if (stats.ordersTrend)
    document.getElementById("ordersTrend").innerHTML =
      `<i class='bi bi-arrow-up'></i> ${stats.ordersTrend}`;
  if (stats.restaurantsTrend)
    document.getElementById("restaurantsTrend").innerHTML =
      `<i class='bi bi-arrow-up'></i> ${stats.restaurantsTrend}`;
  if (stats.revenueTrend)
    document.getElementById("revenueTrend").innerHTML =
      `<i class='bi bi-arrow-up'></i> ${stats.revenueTrend}`;
}

// Función para inicializar el gráfico
function initChart() {
  const ctx = document.getElementById("ordersChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      datasets: [
        {
          label: "Pedidos",
          data: [65, 59, 80, 81, 56, 95, 40],
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231, 76, 60, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0,0,0,0.1)",
          },
        },
        x: {
          grid: {
            color: "rgba(0,0,0,0.1)",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

// Responsive: cerrar sidebar en móviles al hacer clic en menu
if (window.innerWidth <= 992) {
  sidebarOpen = false;
  document.getElementById("sidebar").classList.add("collapsed");
  document.querySelector(".main-content").classList.add("expanded");
}

// === FUNCIONES PARA SOLICITUDES DE DOMICILIARIOS ===

// Cargar solicitudes de domiciliarios
async function loadDeliveryApplications(status = "all") {
  try {
    showApplicationsLoading(true);

    const token = localStorage.getItem("token");
    const url =
      status === "all"
        ? "/api/v1/delivery-applications/all"
        : `/api/v1/delivery-applications/all?status=${status}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      displayApplications(data.data);
      loadApplicationsStats(); // Cargar estadísticas
    } else {
      console.error("Error cargando solicitudes:", data.message);
      showNoApplicationsMessage(true);
    }
  } catch (error) {
    console.error("Error:", error);
    showNoApplicationsMessage(true);
  } finally {
    showApplicationsLoading(false);
  }
}

// Mostrar/ocultar loading
function showApplicationsLoading(show) {
  const loading = document.getElementById("applicationsLoading");
  const table = document.querySelector(
    "#delivery-applications-section .table-responsive"
  );

  if (show) {
    loading.classList.remove("d-none");
    table.style.opacity = "0.5";
  } else {
    loading.classList.add("d-none");
    table.style.opacity = "1";
  }
}

// Mostrar mensaje de no solicitudes
function showNoApplicationsMessage(show) {
  const message = document.getElementById("noApplicationsMessage");
  const table = document.querySelector(
    "#delivery-applications-section .table-responsive"
  );

  if (show) {
    message.classList.remove("d-none");
    table.classList.add("d-none");
  } else {
    message.classList.add("d-none");
    table.classList.remove("d-none");
  }
}

// Mostrar solicitudes en la tabla
function displayApplications(applications) {
  const tbody = document.getElementById("applicationsTableBody");

  if (applications.length === 0) {
    showNoApplicationsMessage(true);
    return;
  }

  showNoApplicationsMessage(false);

  tbody.innerHTML = applications
    .map(
      (app) => `
          <tr>
            <td>
              <div class="user-info">
                <strong>${app.full_name || app.nombre}</strong>
                <small class="text-muted d-block">${app.email}</small>
                <small class="text-muted d-block">ID: ${app.user_id}</small>
              </div>
            </td>
            <td>
              <div>
                ${
                  app.phone
                    ? `<i class="bi bi-telephone"></i> ${app.phone}<br>`
                    : ""
                }
                ${
                  app.document_id
                    ? `<i class="bi bi-card-text"></i> ${app.document_id}`
                    : "Sin datos de contacto"
                }
              </div>
            </td>
            <td>
              <div>
                ${
                  app.vehicle_type
                    ? `
                  <span class="badge bg-secondary">
                    <i class="bi bi-${getVehicleIcon(app.vehicle_type)}"></i>
                    ${getVehicleTypeText(app.vehicle_type)}
                  </span>
                  ${
                    app.has_license
                      ? '<br><small class="text-success"><i class="bi bi-check-circle"></i> Con licencia</small>'
                      : ""
                  }
                `
                    : '<span class="text-muted">No especificado</span>'
                }
              </div>
            </td>
            <td>
              <small>${formatDate(app.fecha_solicitud)}</small>
            </td>
            <td>
              <span class="badge ${getStatusBadgeClass(app.status)}">
                ${getStatusText(app.status)}
              </span>
              ${
                app.fecha_revision
                  ? `<br><small class="text-muted">${formatDate(
                      app.fecha_revision
                    )}</small>`
                  : ""
              }
              ${
                app.admin_nombre
                  ? `<br><small class="text-muted">Por: ${app.admin_nombre}</small>`
                  : ""
              }
            </td>
            <td>
              <div class="d-flex gap-1">
                ${
                  app.cv_file_path
                    ? '<i class="bi bi-file-earmark-pdf text-primary" title="CV" style="cursor: pointer;" onclick="previewDocument(\'' +
                      app.cv_file_path +
                      "', 'CV - " +
                      (app.full_name || app.nombre) +
                      "')\"></i>"
                    : ""
                }
                ${
                  app.id_document_path
                    ? '<i class="bi bi-card-image text-info" title="Documento ID" style="cursor: pointer;" onclick="previewDocument(\'' +
                      app.id_document_path +
                      "', 'Documento ID - " +
                      (app.full_name || app.nombre) +
                      "')\"></i>"
                    : ""
                }
                ${
                  app.license_photo_path
                    ? '<i class="bi bi-card-text text-success" title="Licencia" style="cursor: pointer;" onclick="previewDocument(\'' +
                      app.license_photo_path +
                      "', 'Licencia - " +
                      (app.full_name || app.nombre) +
                      "')\"></i>"
                    : ""
                }
                ${
                  !app.cv_file_path && !app.id_document_path
                    ? '<span class="text-muted">Sin docs</span>'
                    : ""
                }
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  class="btn btn-sm btn-outline-primary" 
                  onclick="reviewApplication(${app.id})"
                  title="Revisar solicitud"
                >
                  <i class="bi bi-eye"></i>
                </button>
                ${
                  app.status === "pendiente"
                    ? `
                  <button 
                    class="btn btn-sm btn-success" 
                    onclick="quickApprove(${app.id})"
                    title="Aprobar rápidamente"
                  >
                    <i class="bi bi-check"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-danger" 
                    onclick="quickReject(${app.id})"
                    title="Rechazar rápidamente"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                `
                    : ""
                }
              </div>
            </td>
          </tr>
        `
    )
    .join("");
}

// Obtener clase CSS para el badge de estado
function getStatusBadgeClass(status) {
  const classes = {
    pendiente: "bg-warning",
    aprobada: "bg-success",
    rechazada: "bg-danger",
  };
  return classes[status] || "bg-secondary";
}

// Obtener texto del estado
function getStatusText(status) {
  const texts = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
  };
  return texts[status] || status;
}

// Obtener texto del tipo de vehículo
function getVehicleTypeText(vehicleType) {
  const texts = {
    a_pie: "A pie",
    bicicleta: "Bicicleta",
    moto: "Motocicleta",
    carro: "Automóvil",
  };
  return texts[vehicleType] || vehicleType;
}

// Formatear disponibilidad
function getAvailabilityText(schedule) {
  try {
    const scheduleObj =
      typeof schedule === "string" ? JSON.parse(schedule) : schedule;
    if (
      scheduleObj &&
      scheduleObj.days &&
      scheduleObj.from &&
      scheduleObj.to
    ) {
      const days = Array.isArray(scheduleObj.days)
        ? scheduleObj.days.join(", ")
        : scheduleObj.days;
      return `${days} de ${scheduleObj.from} a ${scheduleObj.to}`;
    }
    return "No especificada";
  } catch (error) {
    return "No especificada";
  }
}

// Obtener ícono del vehículo
function getVehicleIcon(vehicleType) {
  const icons = {
    a_pie: "person-walking",
    bicicleta: "bicycle",
    moto: "scooter",
    carro: "car-front",
  };
  return icons[vehicleType] || "question-circle";
}

// Obtener URL correcta del documento
function getDocumentUrl(filePath) {
  if (!filePath) return "";

  // Si ya es una URL completa, devolverla tal como está
  if (filePath.startsWith("http")) {
    return filePath;
  }

  // Obtener solo el nombre del archivo
  let fileName = filePath;

  // Si es una ruta completa (Windows o Unix), extraer solo el nombre
  if (filePath.includes("\\") || filePath.includes("/")) {
    fileName = filePath.split(/[\\\/]/).pop();
  }

  return `/uploads/delivery-applications/${fileName}`;
}

// Previsualizar documento en modal
function previewDocument(filePath, title) {
  console.log("Previewing document:", filePath); // Debug

  const url = getDocumentUrl(filePath);
  console.log("Document URL:", url); // Debug

  const extension = filePath.split(".").pop().toLowerCase();

  // Crear modal si no existe
  let modal = document.getElementById("documentPreviewModal");
  if (!modal) {
    modal = createDocumentPreviewModal();
    document.body.appendChild(modal);
  }

  // Actualizar contenido del modal
  document.getElementById("previewModalTitle").textContent = title;
  const previewContent = document.getElementById("previewContent");

  // Mostrar loading inicial
  previewContent.innerHTML = `
          <div class="text-center p-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando documento...</p>
          </div>
        `;

  // Mostrar modal inmediatamente
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();

  // Verificar si el archivo existe antes de intentar cargarlo
  fetch(url, { method: "HEAD" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Archivo no encontrado (${response.status})`);
      }

      // El archivo existe, proceder con la previsualización
      if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
        // Mostrar imagen
        previewContent.innerHTML = `
                <div class="text-center">
                  <img src="${url}" class="img-fluid" alt="${title}" style="max-height: 70vh;" 
                       onload="console.log('Imagen cargada correctamente')"
                       onerror="console.error('Error cargando imagen'); this.style.display='none'; this.nextElementSibling.style.display='block';">
                  <div class="alert alert-danger" style="display: none;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error al cargar la imagen.
                  </div>
                </div>
              `;
      } else if (extension === "pdf") {
        // Mostrar PDF
        previewContent.innerHTML = `
                <div class="pdf-container">
                  <iframe src="${url}" width="100%" height="500px" frameborder="0"
                          onload="console.log('PDF cargado correctamente')"
                          onerror="console.error('Error cargando PDF')">
                    <p>Tu navegador no soporta visualización de PDF. 
                      <a href="${url}" target="_blank" class="btn btn-primary">Descargar PDF</a>
                    </p>
                  </iframe>
                  <div class="text-center mt-2">
                    <a href="${url}" target="_blank" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-external-link-alt"></i> Abrir en nueva pestaña
                    </a>
                  </div>
                </div>
              `;
      } else {
        // Para otros tipos, mostrar enlace de descarga
        previewContent.innerHTML = `
                <div class="text-center p-4">
                  <i class="fas fa-file fa-3x text-muted mb-3"></i>
                  <h5>Archivo: ${extension.toUpperCase()}</h5>
                  <p>No se puede previsualizar este tipo de archivo.</p>
                  <a href="${url}" target="_blank" class="btn btn-primary">
                    <i class="fas fa-download"></i> Descargar archivo
                  </a>
                </div>
              `;
      }
    })
    .catch((error) => {
      console.error("Error accessing document:", error);
      previewContent.innerHTML = `
              <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h5>Error al cargar el documento</h5>
                <p>${error.message}</p>
                <small class="text-muted">URL: ${url}</small>
                <br>
                <button onclick="window.open('${url}', '_blank')" class="btn btn-outline-primary mt-2">
                  <i class="fas fa-external-link-alt"></i> Intentar abrir en nueva pestaña
                </button>
              </div>
            `;
    });
}

// Crear modal de previsualización
function createDocumentPreviewModal() {
  const modalHtml = `
          <div class="modal fade" id="documentPreviewModal" tabindex="-1" aria-labelledby="previewModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-xl">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="previewModalTitle">Previsualización de documento</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div id="previewContent">
                    <div class="text-center">
                      <div class="spinner-border" role="status">
                        <span class="visually-hidden">Cargando...</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        `;

  const div = document.createElement("div");
  div.innerHTML = modalHtml;
  return div.firstElementChild;
}

// Cargar estadísticas de solicitudes
async function loadApplicationsStats() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/v1/delivery-applications/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      const stats = data.data;
      document.getElementById("pendingApplications").textContent =
        stats.pendientes || 0;
      document.getElementById("approvedApplications").textContent =
        stats.aprobadas || 0;
      document.getElementById("rejectedApplications").textContent =
        stats.rechazadas || 0;
      document.getElementById("totalApplications").textContent =
        stats.total || 0;
    }
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
  }
}

// Revisar solicitud (abrir modal)
async function reviewApplication(applicationId) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `/api/v1/delivery-applications/${applicationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      const app = data.data;

      // Llenar detalles en el modal
      document.getElementById("applicationId").value = app.id;
      document.getElementById("applicationDetails").innerHTML = `
              <div class="row">
                <div class="col-md-6">
                  <h6><i class="fas fa-user"></i> Información Personal</h6>
                  <p><strong>Nombre:</strong> ${
                    app.full_name || app.nombre || "No proporcionado"
                  }</p>
                  <p><strong>Email:</strong> ${app.email}</p>
                  <p><strong>Teléfono:</strong> ${
                    app.phone || "No proporcionado"
                  }</p>
                  <p><strong>Dirección:</strong> ${
                    app.address || "No proporcionada"
                  }</p>
                  <p><strong>Documento:</strong> ${
                    app.document_id || "No proporcionado"
                  }</p>
                  <p><strong>Fecha de nacimiento:</strong> ${
                    app.birth_date
                      ? formatDate(app.birth_date)
                      : "No proporcionada"
                  }</p>
                </div>
                <div class="col-md-6">
                  <h6><i class="fas fa-info-circle"></i> Detalles de la Solicitud</h6>
                  <p><strong>Fecha de solicitud:</strong> ${formatDate(
                    app.fecha_solicitud
                  )}</p>
                  <p><strong>Estado:</strong> 
                    <span class="badge ${getStatusBadgeClass(app.status)}">
                      ${getStatusText(app.status)}
                    </span>
                  </p>
                  ${
                    app.observaciones
                      ? `<p><strong>Observaciones:</strong> ${app.observaciones}</p>`
                      : ""
                  }
                </div>
              </div>
              
              ${
                app.vehicle_type
                  ? `
              <hr>
              <div class="row">
                <div class="col-md-6">
                  <h6><i class="fas fa-motorcycle"></i> Información de Transporte</h6>
                  <p><strong>Tipo de vehículo:</strong> ${getVehicleTypeText(
                    app.vehicle_type
                  )}</p>
                  <p><strong>Licencia:</strong> ${
                    app.has_license ? "Sí" : "No"
                  }</p>
                  ${
                    app.license_number
                      ? `<p><strong>Número de licencia:</strong> ${app.license_number}</p>`
                      : ""
                  }
                  ${
                    app.work_zones
                      ? `<p><strong>Zonas de trabajo:</strong> ${
                          Array.isArray(app.work_zones)
                            ? app.work_zones.join(", ")
                            : app.work_zones
                        }</p>`
                      : ""
                  }
                </div>
                <div class="col-md-6">
                  <h6><i class="fas fa-clock"></i> Disponibilidad</h6>
                  ${
                    app.availability_schedule
                      ? `
                    <p><strong>Horario:</strong> ${getAvailabilityText(
                      app.availability_schedule
                    )}</p>
                  `
                      : "<p>No especificada</p>"
                  }
                  ${
                    app.previous_experience
                      ? `<p><strong>Experiencia previa:</strong> ${app.previous_experience.substring(
                          0,
                          100
                        )}${
                          app.previous_experience.length > 100 ? "..." : ""
                        }</p>`
                      : ""
                  }
                </div>
              </div>
              `
                  : ""
              }
              
              ${
                app.why_delivery || app.customer_service_experience
                  ? `
              <hr>
              <div class="row">
                <div class="col-12">
                  <h6><i class="fas fa-comment"></i> Motivación y Experiencia</h6>
                  ${
                    app.why_delivery
                      ? `<p><strong>¿Por qué quiere trabajar como domiciliario?</strong><br>${app.why_delivery}</p>`
                      : ""
                  }
                  ${
                    app.customer_service_experience
                      ? `<p><strong>Experiencia en atención al cliente:</strong><br>${app.customer_service_experience}</p>`
                      : ""
                  }
                </div>
              </div>
              `
                  : ""
              }
              
              ${
                app.cv_file_path ||
                app.id_document_path ||
                app.license_photo_path
                  ? `
              <hr>
              <div class="row">
                <div class="col-12">
                  <h6><i class="fas fa-file"></i> Documentos</h6>
                  <div class="d-flex gap-2 flex-wrap">
                    ${
                      app.cv_file_path
                        ? `<button onclick="previewDocument('${
                            app.cv_file_path
                          }', 'CV - ${
                            app.full_name || app.nombre
                          }')" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-file-pdf"></i> Hoja de Vida
                           </button>
                           <a href="${getDocumentUrl(
                             app.cv_file_path
                           )}" target="_blank" class="btn btn-sm btn-link p-0 ms-1">
                            <i class="fas fa-external-link-alt"></i>
                           </a>`
                        : ""
                    }
                    ${
                      app.id_document_path
                        ? `<button onclick="previewDocument('${
                            app.id_document_path
                          }', 'Documento ID - ${
                            app.full_name || app.nombre
                          }')" class="btn btn-sm btn-outline-info">
                            <i class="fas fa-id-card"></i> Documento ID
                           </button>
                           <a href="${getDocumentUrl(
                             app.id_document_path
                           )}" target="_blank" class="btn btn-sm btn-link p-0 ms-1">
                            <i class="fas fa-external-link-alt"></i>
                           </a>`
                        : ""
                    }
                    ${
                      app.license_photo_path
                        ? `<button onclick="previewDocument('${
                            app.license_photo_path
                          }', 'Licencia - ${
                            app.full_name || app.nombre
                          }')" class="btn btn-sm btn-outline-success">
                            <i class="fas fa-car"></i> Licencia
                           </button>
                           <a href="${getDocumentUrl(
                             app.license_photo_path
                           )}" target="_blank" class="btn btn-sm btn-link p-0 ms-1">
                            <i class="fas fa-external-link-alt"></i>
                           </a>`
                        : ""
                    }
                    ${
                      !app.cv_file_path &&
                      !app.id_document_path &&
                      !app.license_photo_path
                        ? '<span class="text-muted">No hay documentos adjuntos</span>'
                        : ""
                    }
                  </div>
                </div>
              </div>
              `
                  : ""
              }
            `;

      // Mostrar el modal
      const modal = new bootstrap.Modal(
        document.getElementById("reviewApplicationModal")
      );
      modal.show();
    }
  } catch (error) {
    console.error("Error cargando detalles:", error);
    alert("Error cargando los detalles de la solicitud");
  }
}

// Enviar revisión
async function submitReview() {
  try {
    const applicationId = document.getElementById("applicationId").value;
    const status = document.getElementById("applicationStatus").value;
    const observaciones = document.getElementById(
      "applicationObservations"
    ).value;

    if (!status) {
      alert("Por favor selecciona una decisión");
      return;
    }

    const token = localStorage.getItem("token");
    const response = await fetch(
      `/api/v1/delivery-applications/${applicationId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: status,
          observaciones: observaciones,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      alert(`Solicitud ${status} exitosamente`);

      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("reviewApplicationModal")
      );
      modal.hide();

      // Recargar solicitudes
      loadDeliveryApplications();

      // Limpiar formulario
      document.getElementById("reviewForm").reset();
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error enviando revisión:", error);
    alert("Error de conexión");
  }
}

// Aprobación rápida
async function quickApprove(applicationId) {
  if (confirm("¿Estás seguro de que quieres aprobar esta solicitud?")) {
    await updateApplicationStatus(
      applicationId,
      "aprobada",
      "Aprobación rápida"
    );
  }
}

// Rechazo rápido
async function quickReject(applicationId) {
  const reason = prompt("Razón del rechazo (opcional):");
  if (reason !== null) {
    await updateApplicationStatus(
      applicationId,
      "rechazada",
      reason || "Rechazado"
    );
  }
}

// Actualizar estado de solicitud
async function updateApplicationStatus(
  applicationId,
  status,
  observaciones
) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `/api/v1/delivery-applications/${applicationId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: status,
          observaciones: observaciones,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      alert(`Solicitud ${status} exitosamente`);
      loadDeliveryApplications();
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión");
  }
}

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Event listeners para delivery applications
document.addEventListener("DOMContentLoaded", function () {
  // Cargar solicitudes cuando se muestre la sección
  const deliverySection = document.getElementById(
    "delivery-applications-section"
  );
  if (deliverySection) {
    // Observer para detectar cuando se muestra la sección
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          if (deliverySection.classList.contains("active")) {
            loadDeliveryApplications();
          }
        }
      });
    });

    observer.observe(deliverySection, { attributes: true });
  }

  // Búsqueda en tiempo real
  const searchInput = document.getElementById("searchApplications");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document.querySelectorAll("#applicationsTableBody tr");

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }
});

// ===== SISTEMA DE NOTIFICACIONES =====

function showNotification(message, type = "info", duration = 5000) {
  const container = document.getElementById("notificationContainer");
  const notificationId = "notification_" + Date.now();

  const notification = document.createElement("div");
  notification.id = notificationId;
  notification.className = `toast align-items-center text-bg-${type} border-0`;
  notification.setAttribute("role", "alert");
  notification.setAttribute("aria-live", "assertive");
  notification.setAttribute("aria-atomic", "true");

  notification.innerHTML = `
          <div class="d-flex">
            <div class="toast-body">
              <i class="bi bi-${getNotificationIcon(type)}"></i>
              ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        `;

  container.appendChild(notification);

  const toast = new bootstrap.Toast(notification, {
    autohide: true,
    delay: duration,
  });

  toast.show();

  // Eliminar del DOM después de que se oculte
  notification.addEventListener("hidden.bs.toast", function () {
    notification.remove();
  });
}

function getNotificationIcon(type) {
  const icons = {
    success: "check-circle",
    danger: "exclamation-triangle",
    warning: "exclamation-triangle",
    info: "info-circle",
  };
  return icons[type] || "info-circle";
}

// Sobrescribir las funciones de aprobación/rechazo para incluir notificaciones
const originalQuickApprove = window.quickApprove;
window.quickApprove = async function (applicationId) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `/api/v1/delivery-applications/${applicationId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "aprobada",
          observaciones: "Aprobación rápida desde el dashboard",
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      showNotification("Solicitud aprobada exitosamente", "success");
      loadDeliveryApplications();
      loadApplicationsStats();
    } else {
      showNotification(
        "Error al aprobar la solicitud: " + data.message,
        "danger"
      );
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification(
      "Error de conexión al aprobar la solicitud",
      "danger"
    );
  }
};

const originalQuickReject = window.quickReject;
window.quickReject = async function (applicationId) {
  if (confirm("¿Estás seguro de que quieres rechazar esta solicitud?")) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/v1/delivery-applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "rechazada",
            observaciones: "Rechazo rápido desde el dashboard",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        showNotification("Solicitud rechazada", "warning");
        loadDeliveryApplications();
        loadApplicationsStats();
      } else {
        showNotification(
          "Error al rechazar la solicitud: " + data.message,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(
        "Error de conexión al rechazar la solicitud",
        "danger"
      );
    }
  }
};

// ===== FUNCIONES DE FILTRADO =====

function clearFilters() {
  document.getElementById("statusFilter").value = "";
  document.getElementById("vehicleFilter").value = "";
  document.getElementById("searchApplications").value = "";
  applyFilters();
}

function applyFilters() {
  const statusFilter = document.getElementById("statusFilter").value;
  const vehicleFilter = document.getElementById("vehicleFilter").value;
  const searchTerm = document
    .getElementById("searchApplications")
    .value.toLowerCase();

  const rows = document.querySelectorAll("#applicationsTableBody tr");

  rows.forEach((row) => {
    const status = row.querySelector(".badge")?.textContent.toLowerCase();
    const vehicleElement = row.querySelector(".badge.bg-secondary");
    const vehicle = vehicleElement
      ? vehicleElement.textContent.toLowerCase()
      : "";
    const text = row.textContent.toLowerCase();

    let showRow = true;

    // Filtro por estado
    if (statusFilter && !status.includes(statusFilter.toLowerCase())) {
      showRow = false;
    }

    // Filtro por vehículo
    if (
      vehicleFilter &&
      !vehicle.includes(getVehicleTypeText(vehicleFilter).toLowerCase())
    ) {
      showRow = false;
    }

    // Filtro por búsqueda
    if (searchTerm && !text.includes(searchTerm)) {
      showRow = false;
    }

    row.style.display = showRow ? "" : "none";
  });
}

// Event listeners para los filtros
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("statusFilter")?.addEventListener("change", applyFilters);
  document.getElementById("vehicleFilter")?.addEventListener("change", applyFilters);
  document.getElementById("searchApplications")?.addEventListener("input", applyFilters);

  // Agregar función de debug para documentos
  window.debugDocuments = function () {
    console.log("=== DEBUG: Estado de documentos ===");

    // Probar acceso directo a un archivo conocido
    const testFile = "4_1760148157461_cv.pdf";
    fetch(`/uploads/delivery-applications/${testFile}`, {
      method: "HEAD",
    })
      .then((response) => {
        console.log(
          `✅ Archivo ${testFile}:`,
          response.ok ? "ACCESIBLE" : "NO ACCESIBLE",
          `(${response.status})`
        );
      })
      .catch((error) => {
        console.log(`❌ Error accediendo a ${testFile}:`, error);
      });
  };

  // Ejecutar debug automáticamente en desarrollo
  if (window.location.hostname === "localhost") {
    setTimeout(window.debugDocuments, 2000);
  }
});
