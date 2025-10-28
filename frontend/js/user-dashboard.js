// Mostrar modal si falta info de user_details
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (!token) return;
  fetch("/api/v1/user-info/me/complete", {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => res.json())
    .then((data) => {
      // Backend devuelve { success, isComplete }
      const isComplete = data.complete || data.isComplete;
      if ((data.ok || data.success) && !isComplete) {
        // Oculta dashboard y muestra modal
        document.body.classList.add("modal-open");
        const mainContent =
          document.querySelector(".main-container") ||
          document.querySelector("main");
        if (mainContent) mainContent.style.display = "none";
        const modal = new bootstrap.Modal(
          document.getElementById("userDetailsModal"),
          { backdrop: "static", keyboard: false }
        );
        modal.show();
      }
    });
});

// Datos de municipios por departamento
const municipiosPorDepartamento = {
  1: [
    { id: "1", nombre: "Cali" },
    { id: "2", nombre: "Palmira" },
    { id: "3", nombre: "Jamundí" },
    { id: "4", nombre: "Tuluá" },
    { id: "5", nombre: "Buenaventura" },
    { id: "6", nombre: "Candelaria" },
  ],
  2: [
    { id: "7", nombre: "Bogotá" },
    { id: "8", nombre: "Soacha" },
    { id: "9", nombre: "Chía" },
    { id: "10", nombre: "Zipaquirá" },
    { id: "11", nombre: "Facatativá" },
  ],
  3: [
    { id: "12", nombre: "Medellín" },
    { id: "13", nombre: "Bello" },
    { id: "14", nombre: "Itagüí" },
    { id: "15", nombre: "Envigado" },
    { id: "16", nombre: "Rionegro" },
  ],
  4: [
    { id: "17", nombre: "Manizales" },
    { id: "18", nombre: "Chinchiná" },
    { id: "19", nombre: "La Dorada" },
    { id: "20", nombre: "Villamaría" },
    { id: "21", nombre: "Anserma" },
  ],
};

// Manejar cambio de departamento para actualizar municipios
document.addEventListener("DOMContentLoaded", function () {
  const departamentoSelect = document.getElementById("ud_departamento");
  const municipioSelect = document.getElementById("ud_municipio");

  if (departamentoSelect && municipioSelect) {
    departamentoSelect.addEventListener("change", function () {
      const departamentoId = this.value;
      municipioSelect.innerHTML =
        '<option value="">Seleccione un municipio</option>';

      if (departamentoId && municipiosPorDepartamento[departamentoId]) {
        municipioSelect.disabled = false;
        municipiosPorDepartamento[departamentoId].forEach(function (
          municipio
        ) {
          const option = document.createElement("option");
          option.value = municipio.id;
          option.textContent = municipio.nombre;
          municipioSelect.appendChild(option);
        });
      } else {
        municipioSelect.disabled = true;
        municipioSelect.innerHTML =
          '<option value="">Primero seleccione un departamento</option>';
      }
    });
  }
});

// Enviar formulario de user_details
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("userDetailsForm");
  if (!form) return;
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const errorDiv = document.getElementById("userDetailsError");
    errorDiv.textContent = "";
    const formData = new FormData(form);
    const body = {};
    formData.forEach((v, k) => {
      // No agregar campos vacíos o solo con espacios
      if (k === "telefono2" && (!v || v.trim() === "")) {
        // No agregar el campo si está vacío
      } else if (v && v.toString().trim() !== "") {
        body[k] = v;
      }
    });

    console.log("Datos a enviar:", body); // Debug

    try {
      const res = await fetch("/api/v1/user-info/me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      console.log("Respuesta del servidor:", data); // Debug

      if (data.ok || data.success) {
        // Oculta modal y muestra dashboard
        const modalEl = document.getElementById("userDetailsModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        document.body.classList.remove("modal-open");
        const mainContent =
          document.querySelector(".main-container") ||
          document.querySelector("main");
        if (mainContent) mainContent.style.display = "";
        location.reload();
      } else {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorDiv.innerHTML = data.errors
            .map((e) => `<div>${e.msg}</div>`)
            .join("");
        } else {
          errorDiv.textContent =
            data.message || data.msg || "Error al guardar. Verifica los datos.";
        }
      }
    } catch (err) {
      errorDiv.textContent = "Error de conexión.";
    }
  });
});

// Variables globales
let applicationModal;

// Inicialización
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  // Verificar si es admin y redirigir (ahora user.roles es un array)
  const roles = user.roles || [];
  if (roles.includes("admin")) {
    window.location.href = "/admin-dashboard";
    return;
  }

  // Cargar información del usuario
  loadUserInfo(user);

  // Inicializar modal
  applicationModal = new bootstrap.Modal(
    document.getElementById("deliveryApplicationModal")
  );

  // Verificar si ya tiene una aplicación pendiente
  checkDeliveryApplication();

  // Event listener para el botón de cerrar banner
  const closeBannerBtn = document.querySelector(".btn-close-banner");
  if (closeBannerBtn) {
    console.log("Close banner button found, adding event listener");
    closeBannerBtn.addEventListener("click", function (e) {
      console.log("Close banner clicked via event listener");
      e.preventDefault();
      closeBanner();
    });
  }

  // Event listener para el botón de logout
  const logoutDropdown = document.querySelector('a[onclick="logout()"]');
  if (logoutDropdown) {
    console.log("Logout dropdown found, adding event listener");
    logoutDropdown.addEventListener("click", function (e) {
      console.log("Logout clicked via event listener");
      e.preventDefault();
      logout();
    });
  } else {
    console.error("Logout dropdown not found!");
  }

  // Cargar favoritos al iniciar
  loadFavoriteRestaurants();
});

// Renderiza los restaurantes favoritos en el dashboard
async function loadFavoriteRestaurants() {
  const token = localStorage.getItem("token");
  const favoritesGrid = document.getElementById("favoritesGrid");
  favoritesGrid.innerHTML =
    '<p class="text-center text-muted">Cargando favoritos...</p>';
  try {
    const response = await fetch("/api/v1/users/favorites", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok)
      throw new Error("No se pudieron cargar los favoritos");
    const favorites = await response.json();
    if (!favorites.length) {
      favoritesGrid.innerHTML =
        '<p class="text-center text-muted">No tienes restaurantes favoritos aún.</p>';
      return;
    }
    favoritesGrid.innerHTML = "";
    favorites.forEach((rest) => {
      // Usa cover_image_url, logo_url o fallback SVG
      let imgSrc = rest.cover_image_url || rest.logo_url || "";
      let imgTag = imgSrc
        ? `<img src='${imgSrc}' alt='${rest.name}' class='restaurant-image' onerror=\"this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'80\\' fill=\\'%23ff6b35\\' viewBox=\\'0 0 16 16\\'/%3E'\" />`
        : `<img src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'80\' fill=\'%23ff6b35\' viewBox=\'0 0 16 16\'/%3E' alt='${rest.name}' class='restaurant-image' />`;
      favoritesGrid.innerHTML += `
                  <div class='restaurant-card favorite'>
                    <div class='restaurant-image'>
                      ${imgTag}
                      <div class='favorite-badge'><i class='bi bi-heart-fill'></i></div>
                    </div>
                    <div class='restaurant-info'>
                      <h5>${rest.name}</h5>
                      <div class='restaurant-rating'>
                        <i class='bi bi-star-fill'></i>
                        <span>${
                          rest.rating ? rest.rating.toFixed(1) : "4.5"
                        }</span>
                      </div>
                      <p class='restaurant-category'>${rest.category || ""}</p>
                      <div class='restaurant-meta'>
                        <span class='delivery-time'><i class='bi bi-clock'></i> ${
                          rest.delivery_time || "--"
                        }</span>
                        <span class='delivery-fee'><i class='bi bi-truck'></i> ${
                          rest.delivery_fee || "--"
                        }</span>
                      </div>
                    </div>
                  </div>
                `;
    });
  } catch (err) {
    favoritesGrid.innerHTML = `<p class='text-center text-danger'>Error cargando favoritos</p>`;
  }
}

// Cargar información del usuario
function loadUserInfo(user) {
  document.getElementById("userName").textContent =
    user.username || "Usuario";
  document.getElementById("profileUserName").textContent =
    user.username || "Usuario";
  document.getElementById("welcomeUserName").textContent =
    user.username || "Usuario";
  document.getElementById("profileUserEmail").textContent =
    user.email || "";
  document.getElementById("editUserName").value = user.username || "";
  document.getElementById("editUserEmail").value = user.email || "";
  document.getElementById("editUserDate").value = formatDate(
    user.created_at
  );

  // Cargar datos adicionales de user_details desde el backend
  const token = localStorage.getItem("token");
  if (token) {
    fetch("/api/v1/user-info/me", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        if ((data.ok || data.success) && data.data) {
          const userDetails = data.data;
          document.getElementById("editUserCedula").value =
            userDetails.cedula || "";
          document.getElementById("editUserFullName").value =
            userDetails.nombre && userDetails.apellidos
              ? `${userDetails.nombre} ${userDetails.apellidos}`
              : "";
          document.getElementById("editUserDireccion").value =
            userDetails.direccion || "";
          document.getElementById("editUserMunicipio").value =
            userDetails.municipio || "";
          document.getElementById("editUserDepartamento").value =
            userDetails.departamento || "";
          document.getElementById("editUserPhone").value =
            userDetails.telefono1 || "";
          document.getElementById("editUserPhone2").value =
            userDetails.telefono2 || "";
        }
      })
      .catch((err) => {
        console.log("No se pudieron cargar los detalles del usuario");
      });
  }

  // Mostrar el rol dinámicamente (ahora user.roles es un array)
  const roles = user.roles || [];
  if (roles.length > 0) {
    let roleLabel = "";
    const primaryRole = roles.includes("admin")
      ? "admin"
      : roles.includes("delivery")
      ? "delivery"
      : roles[0];

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
    const badge = document.getElementById("userRoleBadge");
    if (badge) badge.textContent = roleLabel;
  }

  // Cargar estadísticas mock
  document.getElementById("totalOrders").textContent = "8";
  document.getElementById("totalSpent").textContent = "$156";
  document.getElementById("favoriteRestaurants").textContent = "3";
  document.getElementById("dashTotalOrders").textContent = "8";
  document.getElementById("dashTotalSpent").textContent = "$156";
  document.getElementById("dashFavorites").textContent = "3";
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

  // Actualizar menú activo
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.classList.remove("active");
  });
  if (event && event.target) {
    event.target.closest(".menu-item").classList.add("active");
  }
}

// Funciones del banner de domiciliario
function openDeliveryApplication() {
  // Confirmar que el usuario quiere aplicar
  if (
    confirm(
      "¿Estás seguro de que quieres solicitar trabajar como domiciliario?"
    )
  ) {
    submitDeliveryApplication();
  }
}

// Nueva función para enviar la solicitud a la API
async function submitDeliveryApplication() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("/api/v1/delivery-applications/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      alert(
        "¡Solicitud enviada exitosamente! El administrador revisará tu aplicación."
      );

      // Ocultar el banner y mostrar el estado
      document.getElementById("deliveryBanner").style.display = "none";
      showApplicationStatus("pendiente");

      // Recargar la información de la aplicación
      checkDeliveryApplication();
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error enviando solicitud:", error);
    alert("Error de conexión. Inténtalo nuevamente.");
  }
}

function closeBanner() {
  const banner = document.getElementById("deliveryBanner");
  if (banner) {
    banner.style.display = "none";
    banner.style.visibility = "hidden";
    banner.style.opacity = "0";
    localStorage.setItem("deliveryBannerClosed", "true");
    console.log("Banner cerrado exitosamente");
  } else {
    console.error("No se pudo encontrar el banner para cerrar");
  }
}

// Funciones del stepper (versión simple - hay otra mejorada más abajo)
function nextStep() {
  if (currentStep < 3) {
    document
      .querySelector(`.step-content[data-step="${currentStep}"]`)
      .classList.remove("active");
    document
      .querySelector(`.step[data-step="${currentStep}"]`)
      .classList.remove("active");

    currentStep++;

    document
      .querySelector(`.step-content[data-step="${currentStep}"]`)
      .classList.add("active");
    document
      .querySelector(`.step[data-step="${currentStep}"]`)
      .classList.add("active");

    updateButtons();
  }
}

function previousStep() {
  if (currentStep > 1) {
    document
      .querySelector(`.step-content[data-step="${currentStep}"]`)
      .classList.remove("active");
    document
      .querySelector(`.step[data-step="${currentStep}"]`)
      .classList.remove("active");

    currentStep--;

    document
      .querySelector(`.step-content[data-step="${currentStep}"]`)
      .classList.add("active");
    document
      .querySelector(`.step[data-step="${currentStep}"]`)
      .classList.add("active");

    updateButtons();
  }
}

function updateButtons() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  prevBtn.style.display = currentStep > 1 ? "block" : "none";
  nextBtn.style.display = currentStep < 3 ? "block" : "none";
  submitBtn.style.display = currentStep === 3 ? "block" : "none";
}

// Enviar aplicación (legacy)
async function submitApplication() {
  const form = document.getElementById("deliveryApplicationForm");
  const formData = new FormData(form);

  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/v1/users/apply-delivery", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      if (result.ok) {
        alert(
          "¡Aplicación enviada exitosamente! Te contactaremos pronto."
        );
        applicationModal.hide();
        document.getElementById("deliveryBanner").style.display = "none";
        document.getElementById("deliveryAppMenu").style.display =
          "block";
        showApplicationStatus("pending");
      }
    } else {
      alert("Error al enviar la aplicación. Inténtalo nuevamente.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión. Inténtalo nuevamente.");
  }
}

// Verificar aplicación de delivery
async function checkDeliveryApplication() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "/api/v1/delivery-applications/my-application",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (data.success && data.data) {
      // El usuario tiene una solicitud
      const application = data.data;
      document.getElementById("deliveryBanner").style.display = "none";

      if (application.status === "aprobada") {
        // Si fue aprobada, mostrar opciones de domiciliario
        showDeliveryDriverMenu();
      } else {
        // Mostrar estado de la aplicación
        showApplicationStatus(
          application.status,
          application.observaciones
        );
      }
    } else {
      // No tiene solicitud, verificar si el banner fue cerrado
      const bannerClosed = localStorage.getItem("deliveryBannerClosed");
      if (bannerClosed) {
        document.getElementById("deliveryBanner").style.display = "none";
      } else {
        // Mostrar banner por defecto
        document.getElementById("deliveryBanner").style.display = "block";
      }
    }
  } catch (error) {
    console.error("Error verificando aplicación:", error);
    // En caso de error, mostrar el banner por defecto
    const bannerClosed = localStorage.getItem("deliveryBannerClosed");
    if (!bannerClosed) {
      document.getElementById("deliveryBanner").style.display = "block";
    }
  }
}

function showApplicationStatus(status, observaciones = null) {
  // Crear o encontrar el contenedor del estado
  let statusContainer = document.getElementById(
    "applicationStatusContainer"
  );

  if (!statusContainer) {
    // Crear el contenedor si no existe
    statusContainer = document.createElement("div");
    statusContainer.id = "applicationStatusContainer";
    statusContainer.className = "application-status-container";

    // Insertar después del delivery banner o al inicio del contenido
    const targetElement =
      document.getElementById("deliveryBanner") ||
      document.querySelector(".main-container .container-fluid .row");
    if (targetElement) {
      targetElement.parentNode.insertBefore(
        statusContainer,
        targetElement.nextSibling
      );
    }
  }

  let statusClass = "";
  let statusText = "";
  let statusIcon = "";
  let message = "";

  switch (status) {
    case "pendiente":
      statusClass = "warning";
      statusText = "Solicitud Pendiente";
      statusIcon = "bi-clock-history";
      message =
        "Tu solicitud está siendo revisada por nuestro equipo. Te contactaremos en las próximas 24-48 horas.";
      break;
    case "aprobada":
      statusClass = "success";
      statusText = "¡Solicitud Aprobada!";
      statusIcon = "bi-check-circle-fill";
      message =
        "¡Felicitaciones! Tu solicitud ha sido aprobada. Ya puedes acceder a las funciones de domiciliario.";
      break;
    case "rechazada":
      statusClass = "danger";
      statusText = "Solicitud Rechazada";
      statusIcon = "bi-x-circle-fill";
      message =
        "Tu solicitud ha sido rechazada. Puedes contactar al administrador para más información.";
      if (observaciones) {
        message += `<br><strong>Observaciones:</strong> ${observaciones}`;
      }
      break;
  }

  statusContainer.innerHTML = `
            <div class="alert alert-${statusClass} d-flex align-items-center position-relative" role="alert">
              <i class="bi ${statusIcon} me-3" style="font-size: 1.5rem;"></i>
              <div class="flex-grow-1">
                <h5 class="alert-heading mb-2">${statusText}</h5>
                <p class="mb-0">${message}</p>
              </div>
              ${
                status === "rechazada"
                  ? `<button class="btn btn-outline-${statusClass} btn-sm ms-3" onclick="reapplyDelivery()">Aplicar de Nuevo</button>`
                  : ""
              }
              <button type="button" class="btn-close position-absolute top-0 end-0 m-2" aria-label="Cerrar" onclick="closeApplicationStatusAlert()"></button>
            </div>
          `;

  // Add close function globally if not present
  if (typeof window.closeApplicationStatusAlert !== "function") {
    window.closeApplicationStatusAlert = function () {
      const el = document.getElementById("applicationStatusContainer");
      if (el) el.style.display = "none";
    };
  }

  statusContainer.style.display = "block";
}

// Función para mostrar menú de domiciliario aprobado
function showDeliveryDriverMenu() {
  console.log(
    "Usuario aprobado como domiciliario - Mostrar funciones especiales"
  );
  // Aquí puedes agregar lógica para mostrar opciones especiales de domiciliario

  // Mostrar estado aprobado
  showApplicationStatus("aprobada");

  // Agregar opciones en el sidebar si es necesario
  addDeliveryDriverOptions();
}

// Función para agregar opciones de domiciliario en el sidebar
function addDeliveryDriverOptions() {
  const sidebar = document.querySelector(".sidebar-menu");
  if (sidebar && !document.getElementById("deliveryDriverMenu")) {
    const deliveryMenu = document.createElement("div");
    deliveryMenu.id = "deliveryDriverMenu";
    deliveryMenu.innerHTML = `
              <div class="menu-item" onclick="showContent('delivery-orders')">
                <i class="bi bi-truck"></i>
                <span>Pedidos Disponibles</span>
              </div>
              <div class="menu-item" onclick="showContent('my-deliveries')">
                <i class="bi bi-list-check"></i>
                <span>Mis Entregas</span>
              </div>
              <div class="menu-item" onclick="showContent('delivery-earnings')">
                <i class="bi bi-cash-coin"></i>
                <span>Mis Ganancias</span>
              </div>
            `;
    sidebar.appendChild(deliveryMenu);
  }
}

// Función para reaplicar después de un rechazo
async function reapplyDelivery() {
  if (
    confirm("¿Estás seguro de que quieres enviar una nueva solicitud?")
  ) {
    await submitDeliveryApplication();
  }
}

// Otras funciones
function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("es-ES");
}

function editProfile() {
  const inputs = document.querySelectorAll(
    "#profile-section input[readonly]"
  );
  inputs.forEach((input) => {
    if (input.id !== "editUserEmail" && input.id !== "editUserDate") {
      input.removeAttribute("readonly");
    }
  });
  document.getElementById("profileActions").style.display = "block";
}

function saveProfile() {
  // Aquí implementarías la lógica para guardar el perfil
  alert("Perfil actualizado exitosamente");
  cancelEdit();
}

function cancelEdit() {
  const inputs = document.querySelectorAll("#profile-section input");
  inputs.forEach((input) => {
    input.setAttribute("readonly", true);
  });
  document.getElementById("profileActions").style.display = "none";
}

function addAddress() {
  alert("Funcionalidad para agregar dirección - En desarrollo");
}

function addPaymentMethod() {
  alert("Funcionalidad para agregar método de pago - En desarrollo");
}

function logout() {
  console.log("Logout function called in user dashboard");
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

// ===== NUEVAS FUNCIONES PARA EL FORMULARIO MEJORADO =====

let currentStep = 1;
const totalSteps = 4;

// Mostrar el modal del formulario de solicitud
function showDeliveryApplicationForm() {
  const modal = new bootstrap.Modal(
    document.getElementById("deliveryApplicationModal")
  );
  modal.show();
  currentStep = 1;
  showStep(1);
}

// Navegación entre pasos
function nextStep() {
  if (validateCurrentStep()) {
    currentStep++;
    showStep(currentStep);
  }
}

function previousStep() {
  currentStep--;
  showStep(currentStep);
}

function showStep(step) {
  // Ocultar todos los pasos
  for (let i = 1; i <= totalSteps; i++) {
    document.getElementById(`step${i}`).style.display = "none";
  }

  // Mostrar el paso actual
  document.getElementById(`step${step}`).style.display = "block";

  // Actualizar barra de progreso
  const progress = (step / totalSteps) * 100;
  const progressBar = document.getElementById("formProgress");
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", progress);
  progressBar.textContent = `Paso ${step} de ${totalSteps}`;

  // Mostrar/ocultar botones
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  prevBtn.style.display = step > 1 ? "inline-block" : "none";
  nextBtn.style.display = step < totalSteps ? "inline-block" : "none";
  submitBtn.style.display = step === totalSteps ? "inline-block" : "none";
}

// Validar paso actual
function validateCurrentStep() {
  const currentStepElement = document.getElementById(`step${currentStep}`);
  const requiredFields = currentStepElement.querySelectorAll("[required]");

  for (let field of requiredFields) {
    if (!field.value.trim()) {
      field.focus();
      field.classList.add("is-invalid");
      alert(
        `Por favor completa el campo: ${
          field.labels[0]?.textContent || field.name
        }`
      );
      return false;
    } else {
      field.classList.remove("is-invalid");
    }
  }

  // Validaciones específicas por paso
  if (currentStep === 2) {
    const workZones = document.querySelectorAll(
      'input[id^="zone_"]:checked'
    );
    if (workZones.length === 0) {
      alert("Selecciona al menos una zona de trabajo");
      return false;
    }
  }

  if (currentStep === 3) {
    const availableDays = document.querySelectorAll(
      'input[id^="day_"]:checked'
    );
    if (availableDays.length === 0) {
      alert("Selecciona al menos un día disponible");
      return false;
    }
  }

  return true;
}

// Toggle de campos de licencia
function toggleLicenseFields() {
  const vehicleType = document.getElementById("vehicleType").value;
  const licenseFields = document.getElementById("licenseFields");
  const licensePhotoField = document.getElementById("licensePhotoField");

  if (vehicleType === "moto" || vehicleType === "carro") {
    licenseFields.style.display = "block";
    licensePhotoField.style.display = "block";
  } else {
    licenseFields.style.display = "none";
    licensePhotoField.style.display = "none";
    document.getElementById("hasLicense").checked = false;
    document.getElementById("licenseNumber").value = "";
  }
}

// Toggle de número de licencia
document
  .getElementById("hasLicense")
  ?.addEventListener("change", function () {
    const licenseNumberField = document.getElementById("licenseNumberField");
    licenseNumberField.style.display = this.checked ? "block" : "none";
    if (!this.checked) {
      document.getElementById("licenseNumber").value = "";
    }
  });

// Enviar formulario completo
async function submitDeliveryApplicationForm() {
  if (!validateCurrentStep()) return;

  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    // Datos personales
    formData.append("fullName", document.getElementById("fullName").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("address", document.getElementById("address").value);
    formData.append("birthDate", document.getElementById("birthDate").value);
    formData.append("documentId", document.getElementById("documentId").value);

    // Datos de transporte
    formData.append("vehicleType", document.getElementById("vehicleType").value);
    formData.append("hasLicense", document.getElementById("hasLicense").checked);
    formData.append("licenseNumber", document.getElementById("licenseNumber").value);

    // Zonas de trabajo
    const workZones = Array.from(
      document.querySelectorAll('input[id^="zone_"]:checked')
    ).map((cb) => cb.value);
    formData.append("workZones", JSON.stringify(workZones));

    // Disponibilidad
    const availableDays = Array.from(
      document.querySelectorAll('input[id^="day_"]:checked')
    ).map((cb) => cb.value);
    const availability = {
      days: availableDays,
      from: document.getElementById("availableFrom").value,
      to: document.getElementById("availableTo").value,
    };
    formData.append("availabilitySchedule", JSON.stringify(availability));

    // Experiencia
    formData.append(
      "previousExperience",
      document.getElementById("previousExperience").value
    );
    formData.append(
      "whyDelivery",
      document.getElementById("whyDelivery").value
    );
    formData.append(
      "customerServiceExperience",
      document.getElementById("customerServiceExperience").value
    );

    // Archivos
    const cvFile = document.getElementById("cv").files[0];
    const idFile = document.getElementById("id_document").files[0];
    const licenseFile = document.getElementById("license_photo").files[0];

    if (cvFile) formData.append("cv", cvFile);
    if (idFile) formData.append("id_document", idFile);
    if (licenseFile) formData.append("license_photo", licenseFile);

    // Enviar solicitud
    const response = await fetch("/api/v1/delivery-applications/apply", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      alert(
        "¡Solicitud enviada exitosamente! El administrador revisará tu aplicación."
      );

      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("deliveryApplicationModal")
      );
      modal.hide();

      // Ocultar banner y recargar información
      document.getElementById("deliveryBanner").style.display = "none";
      checkDeliveryApplication();
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error enviando solicitud:", error);
    alert("Error de conexión. Inténtalo nuevamente.");
  }
}

// Función legacy para compatibilidad (mantener funcionalidad simple)
function openDeliveryApplication() {
  showDeliveryApplicationForm();
}

// ===== FUNCIONES DE CAMBIO DE ROL =====

/**
 * Cambia la vista al dashboard correspondiente según el rol seleccionado
 */
function switchRole(role) {
  console.log("Cambiando a rol:", role);

  const dashboardMap = {
    admin: "/public/admin-dashboard.html",
    delivery: "/public/delivery-dashboard.html",
    user: "/public/user-dashboard.html",
  };

  const dashboardUrl = dashboardMap[role];
  if (dashboardUrl) {
    window.location.href = dashboardUrl;
  } else {
    console.error("Rol desconocido:", role);
  }
}

/**
 * Inicializa el selector de roles basado en los roles del usuario
 * Muestra solo las opciones de roles que el usuario tiene
 */
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
    const roleSwitcherDivider = document.getElementById(
      "roleSwitcherDivider"
    );

    if (roleSwitcherMenu) {
      roleSwitcherMenu.classList.remove("d-none");
    }
    if (roleSwitcherDivider) {
      roleSwitcherDivider.classList.remove("d-none");
    }

    // Mostrar opciones según roles disponibles
    if (roles.includes("delivery")) {
      const deliveryOption = document.getElementById("roleOptionDelivery");
      if (deliveryOption) {
        deliveryOption.classList.remove("d-none");
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

// Inicializar role switcher al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  initRoleSwitcher();
});
