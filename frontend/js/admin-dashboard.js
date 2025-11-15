// Variables globales
let sidebarOpen = true;

// Función auxiliar para manejar errores de autenticación
function handleAuthError(response) {
  if (response.status === 401 || response.status === 403) {
    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
    return true;
  }
  return false;
}

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

  // Inicializar gráfico ecosistema
  initEcosystemChart();

  // Cargar restaurantes populares (dashboard) fijo de hoy
  loadPopularRestaurants('day');

  // Reportes: versión con selector día/semana/mes
  const reportsRange = document.getElementById('popularRangeReports');
  if (reportsRange) {
    // Carga inicial
    loadPopularRestaurantsReports(reportsRange.value || 'day');
    // Cambio de rango
    reportsRange.addEventListener('change', () => {
      loadPopularRestaurantsReports(reportsRange.value);
    });
  }

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

  // Inicializar selects de Departamento/Municipio en el modal de edición
  initEditUserLocationSelects();

  // Manejar envío del formulario de edición
  const editForm = document.getElementById("editUserForm");
  if (editForm) {
    editForm.addEventListener("submit", onEditUserSubmit);
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

// Función para inicializar el gráfico (datos reales desde backend)
async function initChart() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/v1/admin/dashboard/orders-by-day', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      if (handleAuthError(res)) return;
      throw new Error('No se pudo obtener pedidos por día');
    }
    const payload = await res.json();
    const labels = payload.labels || ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
    const series = payload.data || [0,0,0,0,0,0,0];

    const ctx = document.getElementById('ordersChart').getContext('2d');

    // Gradiente suave
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(231, 76, 60, 0.35)');
    gradient.addColorStop(1, 'rgba(231, 76, 60, 0.05)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Pedidos',
          data: series,
          borderColor: '#e74c3c',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#e74c3c'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.08)' } },
          x: { grid: { color: 'rgba(0,0,0,0.05)' } }
        },
        plugins: { legend: { display: false } },
        interaction: { intersect: false, mode: 'index' }
      }
    });
  } catch (err) {
    console.error('initChart error:', err);
  }
}

// Inicializar gráfico del Modelo Ecosistema (Presas-Depredadores-Enfermedades)
async function initEcosystemChart() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/v1/admin/dashboard/ecosystem-model?days=30', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      if (handleAuthError(res)) return;
      throw new Error('No se pudo obtener modelo ecosistema');
    }
    const payload = await res.json();
    const data = payload.data || [];

    const labels = data.map(d => d.date);
    const S = data.map(d => d.S);
    const U = data.map(d => d.U);
    const I = data.map(d => d.I);

    const ctx = document.getElementById('ecosystemChart').getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'S(t) - Tiendas activas',
            data: S,
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#27ae60'
          },
          {
            label: 'U(t) - Usuarios activos',
            data: U,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#3498db'
          },
          {
            label: 'I(t) - Incidencias',
            data: I,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#e74c3c'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(0,0,0,0.08)' },
            title: { display: true, text: 'Cantidad' }
          },
          x: { 
            grid: { color: 'rgba(0,0,0,0.05)' },
            title: { display: true, text: 'Fecha' },
            ticks: { maxTicksLimit: 10 }
          }
        },
        plugins: { 
          legend: { 
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    });
  } catch (err) {
    console.error('initEcosystemChart error:', err);
  }
}

// Responsive: cerrar sidebar en móviles al hacer clic en menu
if (window.innerWidth <= 992) {
  sidebarOpen = false;
  document.getElementById("sidebar").classList.add("collapsed");
  document.querySelector(".main-content").classList.add("expanded");
}

// (Eliminado catálogo duplicado y helpers duplicados para evitar errores de redeclaración)

// ====== Catálogo de Colombia (Departamentos y Municipios) ======
// Nota: valores de <option> serán los nombres (strings) para enviar al backend tal como espera.
const AD_DEPARTAMENTOS = {
  1: "Amazonas",
  2: "Antioquia",
  3: "Arauca",
  4: "Atlántico",
  5: "Bolívar",
  6: "Boyacá",
  7: "Caldas",
  8: "Caquetá",
  9: "Casanare",
  10: "Cauca",
  11: "Cesar",
  12: "Chocó",
  13: "Córdoba",
  14: "Cundinamarca",
  15: "Guainía",
  16: "Guaviare",
  17: "Huila",
  18: "La Guajira",
  19: "Magdalena",
  20: "Meta",
  21: "Nariño",
  22: "Norte de Santander",
  23: "Putumayo",
  24: "Quindío",
  25: "Risaralda",
  26: "San Andrés y Providencia",
  27: "Santander",
  28: "Sucre",
  29: "Tolima",
  30: "Valle del Cauca",
  31: "Vaupés",
  32: "Vichada",
};

const AD_MUNICIPIOS = {
  1: [
    { id: "1", nombre: "Leticia" },
    { id: "2", nombre: "Puerto Nariño" },
    { id: "3", nombre: "Tarapacá" },
    { id: "4", nombre: "La Chorrera" },
    { id: "5", nombre: "Puerto Arica" },
    { id: "6", nombre: "Mirití-Paraná" },
  ],
  2: [
    { id: "7", nombre: "Medellín" },
    { id: "8", nombre: "Bello" },
    { id: "9", nombre: "Itagüí" },
    { id: "10", nombre: "Envigado" },
    { id: "11", nombre: "Rionegro" },
    { id: "12", nombre: "Apartadó" },
  ],
  3: [
    { id: "13", nombre: "Arauca" },
    { id: "14", nombre: "Arauquita" },
    { id: "15", nombre: "Tame" },
    { id: "16", nombre: "Fortul" },
    { id: "17", nombre: "Saravena" },
    { id: "18", nombre: "Puerto Rondón" },
  ],
  4: [
    { id: "19", nombre: "Barranquilla" },
    { id: "20", nombre: "Soledad" },
    { id: "21", nombre: "Malambo" },
    { id: "22", nombre: "Sabanalarga" },
    { id: "23", nombre: "Galapa" },
    { id: "24", nombre: "Baranoa" },
  ],
  5: [
    { id: "25", nombre: "Cartagena" },
    { id: "26", nombre: "Turbaco" },
    { id: "27", nombre: "Magangué" },
    { id: "28", nombre: "El Carmen de Bolívar" },
    { id: "29", nombre: "Arjona" },
    { id: "30", nombre: "Santa Catalina" },
  ],
  6: [
    { id: "31", nombre: "Tunja" },
    { id: "32", nombre: "Duitama" },
    { id: "33", nombre: "Sogamoso" },
    { id: "34", nombre: "Chiquinquirá" },
    { id: "35", nombre: "Paipa" },
    { id: "36", nombre: "Tibasosa" },
  ],
  7: [
    { id: "37", nombre: "Manizales" },
    { id: "38", nombre: "Chinchiná" },
    { id: "39", nombre: "La Dorada" },
    { id: "40", nombre: "Villamaría" },
    { id: "41", nombre: "Neira" },
    { id: "42", nombre: "Anserma" },
  ],
  8: [
    { id: "43", nombre: "Florencia" },
    { id: "44", nombre: "San Vicente del Caguán" },
    { id: "45", nombre: "Belén de los Andaquíes" },
    { id: "46", nombre: "Puerto Rico" },
  ],
  9: [
    { id: "47", nombre: "Yopal" },
    { id: "48", nombre: "Aguazul" },
    { id: "49", nombre: "Villanueva" },
    { id: "50", nombre: "Tauramena" },
  ],
  10: [
    { id: "51", nombre: "Popayán" },
    { id: "52", nombre: "Santander de Quilichao" },
    { id: "53", nombre: "Puerto Tejada" },
    { id: "54", nombre: "Patía" },
  ],
  11: [
    { id: "55", nombre: "Valledupar" },
    { id: "56", nombre: "Agustín Codazzi" },
    { id: "57", nombre: "Bosconia" },
    { id: "58", nombre: "Aguachica" },
  ],
  12: [
    { id: "59", nombre: "Quibdó" },
    { id: "60", nombre: "Istmina" },
    { id: "61", nombre: "Tadó" },
    { id: "62", nombre: "Condoto" },
  ],
  13: [
    { id: "63", nombre: "Montería" },
    { id: "64", nombre: "Lorica" },
    { id: "65", nombre: "Sahagún" },
    { id: "66", nombre: "Tierralta" },
  ],
  14: [
    { id: "67", nombre: "Bogotá" },
    { id: "68", nombre: "Soacha" },
    { id: "69", nombre: "Zipaquirá" },
    { id: "70", nombre: "Facatativá" },
  ],
  15: [
    { id: "71", nombre: "Inírida" },
  ],
  16: [
    { id: "72", nombre: "San José del Guaviare" },
  ],
  17: [
    { id: "73", nombre: "Neiva" },
    { id: "74", nombre: "Pitalito" },
    { id: "75", nombre: "Garzón" },
    { id: "76", nombre: "La Plata" },
  ],
  18: [
    { id: "77", nombre: "Riohacha" },
    { id: "78", nombre: "Maicao" },
    { id: "79", nombre: "Uribia" },
    { id: "80", nombre: "Fonseca" },
  ],
  19: [
    { id: "81", nombre: "Santa Marta" },
    { id: "82", nombre: "Ciénaga" },
    { id: "83", nombre: "Fundación" },
    { id: "84", nombre: "Aracataca" },
  ],
  20: [
    { id: "85", nombre: "Villavicencio" },
    { id: "86", nombre: "Acacías" },
    { id: "87", nombre: "Granada" },
    { id: "88", nombre: "Puerto López" },
  ],
  21: [
    { id: "89", nombre: "Pasto" },
    { id: "90", nombre: "Ipiales" },
    { id: "91", nombre: "Tumaco" },
    { id: "92", nombre: "Túquerres" },
  ],
  22: [
    { id: "93", nombre: "Cúcuta" },
    { id: "94", nombre: "Ocaña" },
    { id: "95", nombre: "Pamplona" },
    { id: "96", nombre: "Villa del Rosario" },
  ],
  23: [
    { id: "97", nombre: "Mocoa" },
    { id: "98", nombre: "Puerto Asís" },
    { id: "99", nombre: "Orito" },
    { id: "100", nombre: "Sibundoy" },
  ],
  24: [
    { id: "101", nombre: "Armenia" },
    { id: "102", nombre: "Calarcá" },
    { id: "103", nombre: "La Tebaida" },
    { id: "104", nombre: "Montenegro" },
  ],
  25: [
    { id: "105", nombre: "Pereira" },
    { id: "106", nombre: "Dosquebradas" },
    { id: "107", nombre: "Santa Rosa de Cabal" },
  ],
  26: [
    { id: "108", nombre: "San Andrés" },
    { id: "109", nombre: "Providencia" },
  ],
  27: [
    { id: "110", nombre: "Bucaramanga" },
    { id: "111", nombre: "Floridablanca" },
    { id: "112", nombre: "Girón" },
    { id: "113", nombre: "Piedecuesta" },
  ],
  28: [
    { id: "114", nombre: "Sincelejo" },
    { id: "115", nombre: "Corozal" },
    { id: "116", nombre: "Tolú" },
    { id: "117", nombre: "San Marcos" },
  ],
  29: [
    { id: "118", nombre: "Ibagué" },
    { id: "119", nombre: "Espinal" },
    { id: "120", nombre: "Melgar" },
    { id: "121", nombre: "Honda" },
  ],
  30: [
    { id: "122", nombre: "Cali" },
    { id: "123", nombre: "Palmira" },
    { id: "124", nombre: "Buenaventura" },
    { id: "125", nombre: "Tuluá" },
    { id: "126", nombre: "Buga" },
  ],
  31: [
    { id: "127", nombre: "Mitú" },
  ],
  32: [
    { id: "128", nombre: "Puerto Carreño" },
  ],
};

function ad_findDepartamentoIdByName(nombre) {
  if (!nombre) return null;
  const norm = (s) => (s || "").toString().trim().toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const target = norm(nombre);
  for (const [id, n] of Object.entries(AD_DEPARTAMENTOS)) {
    const cand = norm(n);
    if (cand === target || cand.includes(target) || target.includes(cand)) return id;
  }
  return null;
}

function ad_populateDepartamentos(select) {
  if (!select) return;
  const current = select.value;
  // Mantener primera opción
  const first = select.querySelector("option:first-child");
  select.innerHTML = "";
  if (first && first.value === "") select.appendChild(first);
  else select.insertAdjacentHTML("beforeend", '<option value="">Seleccione un departamento</option>');

  Object.keys(AD_DEPARTAMENTOS)
    .sort((a, b) => AD_DEPARTAMENTOS[a].localeCompare(AD_DEPARTAMENTOS[b]))
    .forEach((id) => {
      const nombre = AD_DEPARTAMENTOS[id];
      const opt = document.createElement("option");
      opt.value = nombre; // enviamos nombre al backend
      opt.textContent = nombre;
      opt.dataset.depId = id; // por si se requiere
      select.appendChild(opt);
    });

  if (current) select.value = current;
}

function ad_populateMunicipios(select, departamentoNombre, preselectNombre) {
  if (!select) return;
  const depId = ad_findDepartamentoIdByName(departamentoNombre);
  select.disabled = true;
  select.innerHTML = '<option value="">Primero seleccione un departamento</option>';
  if (!depId || !AD_MUNICIPIOS[depId]) return;

  select.disabled = false;
  select.innerHTML = '<option value="">Seleccione un municipio</option>';
  AD_MUNICIPIOS[depId].forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m.nombre; // enviamos nombre al backend
    opt.textContent = m.nombre;
    select.appendChild(opt);
  });
  if (preselectNombre) select.value = preselectNombre;
}

function initEditUserLocationSelects() {
  const depSelect = document.getElementById("editDepartamento");
  const munSelect = document.getElementById("editMunicipio");
  if (!depSelect || !munSelect) return;

  // Poblar departamentos inicialmente
  ad_populateDepartamentos(depSelect);

  // Cuando cambia el departamento, repoblar municipios
  depSelect.addEventListener("change", function () {
    ad_populateMunicipios(munSelect, depSelect.value, null);
  });

  // Al abrir el modal, intentar preseleccionar valores existentes
  const editModal = document.getElementById("editUserModal");
  if (editModal) {
    editModal.addEventListener("shown.bs.modal", function () {
      // Si algún script de llenado previo ya puso el valor (string), respetarlo
      const currentDep = depSelect.value || depSelect.getAttribute("data-current") || "";
      if (currentDep) depSelect.value = currentDep;
      ad_populateMunicipios(munSelect, depSelect.value, munSelect.value || munSelect.getAttribute("data-current") || "");
    });
  }
}

// ====== Edición de Usuario (abrir modal con datos y guardar) ======
async function fetchAdminUserById(userId) {
  try {
    const token = localStorage.getItem("token");
    const resp = await fetch(`/api/v1/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (handleAuthError(resp)) return null;
    if (!resp.ok) {
      console.error("Error al obtener usuario:", resp.status);
      return null;
    }
    const data = await resp.json();
    return data && (data.user || data.data || data);
  } catch (err) {
    console.error("fetchAdminUserById error:", err);
    return null;
  }
}

function fillEditUserForm(user) {
  if (!user) return;
  const $ = (id) => document.getElementById(id);
  $("editUserId").value = user.id || user.uid || "";
  $("editUsername").value = user.username || "";
  $("editEmail").value = user.email || "";
  $("editCedula").value = user.cedula || "";
  $("editNombre").value = user.nombre || "";
  $("editApellidos").value = user.apellidos || "";
  $("editTelefono1").value = user.telefono1 || "";
  $("editTelefono2").value = user.telefono2 || "";
  $("editDireccion").value = user.direccion || "";

  const depSelect = $("editDepartamento");
  const munSelect = $("editMunicipio");
  const departamento = user.departamento || "";
  const municipio = user.municipio || "";

  // Asegurarnos de que departamentos están cargados
  ad_populateDepartamentos(depSelect);
  // Intentar mapear el nombre guardado al catálogo para mostrarlo seleccionado
  const depId = ad_findDepartamentoIdByName(departamento);
  const depNombreCatalogo = depId ? AD_DEPARTAMENTOS[depId] : (departamento || "");
  // Setear y poblar municipios con preselección
  depSelect.value = depNombreCatalogo || "";
  // Guardar como data-current por si al abrir el modal se recalcula
  depSelect.setAttribute("data-current", depNombreCatalogo || "");
  munSelect.setAttribute("data-current", municipio || "");
  ad_populateMunicipios(munSelect, depNombreCatalogo, municipio || "");
}

async function onEditUserSubmit(e) {
  e.preventDefault();
  const $ = (id) => document.getElementById(id);
  const userId = $("editUserId").value;
  const body = {
    username: $("editUsername").value.trim(),
    email: $("editEmail").value.trim(),
    cedula: $("editCedula").value.trim(),
    nombre: $("editNombre").value.trim(),
    apellidos: $("editApellidos").value.trim(),
    telefono1: $("editTelefono1").value.trim(),
    telefono2: $("editTelefono2").value.trim(),
    direccion: $("editDireccion").value.trim(),
    municipio: $("editMunicipio").value || "",
    departamento: $("editDepartamento").value || "",
  };

  try {
    const token = localStorage.getItem("token");
    const resp = await fetch(`/api/v1/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (handleAuthError(resp)) return;
    const data = await resp.json();
    if (resp.ok && (data.ok || data.success !== false)) {
      try { showToast("Usuario actualizado correctamente", "success"); } catch (_) { alert("Usuario actualizado correctamente"); }
      // Cerrar modal
      const modalEl = document.getElementById("editUserModal");
      if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();
      }
      // Recargar listado si existe función
      if (typeof loadUsers === "function") {
        try { await loadUsers(); } catch (_) {}
      }
    } else {
      const msg = data && (data.message || data.msg) || "No se pudo actualizar";
      try { showToast(msg, "error"); } catch (_) { alert(msg); }
    }
  } catch (err) {
    console.error("onEditUserSubmit error:", err);
    try { showToast("Error de red al actualizar", "error"); } catch (_) { alert("Error de red al actualizar"); }
  }
}

// Exponer función global para el botón lápiz
window.editUser = async function (userId) {
  const user = await fetchAdminUserById(userId);
  if (!user) {
    try { showToast("No se pudo cargar el usuario", "error"); } catch (_) { alert("No se pudo cargar el usuario"); }
    return;
  }
  fillEditUserForm(user);
  const modalEl = document.getElementById("editUserModal");
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
};

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

// Cargar y renderizar "Restaurantes Populares" por rango (day|week|month)
async function loadPopularRestaurants(range = 'day') {
  const container = document.getElementById('popularRestaurantsContainer');
  if (!container) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/v1/admin/dashboard/popular-restaurants?range=${encodeURIComponent(range)}` , {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      if (handleAuthError(res)) return;
      throw new Error('No se pudo obtener restaurantes populares');
    }
    const payload = await res.json();
    const items = payload.data || [];
    if (!items.length) {
      container.innerHTML = '<div class="text-muted py-4 text-center">Sin pedidos en el periodo seleccionado</div>';
      return;
    }

    container.innerHTML = items.map((r, idx) => `
      <div class="d-flex align-items-center py-2 border-bottom ${idx===0?'pt-0':''}">
        <div class="me-3 rounded-circle bg-light d-flex align-items-center justify-content-center" style="width:38px;height:38px;">
          <span class="fw-bold text-muted" style="font-size:0.9rem;">${idx+1}</span>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center">
            <div class="fw-semibold">${r.name}</div>
            <div class="text-end small text-muted">Pedidos: <strong>${r.orders_today}</strong></div>
          </div>
          <div class="d-flex align-items-center gap-3 mt-1">
            <div class="text-warning" aria-label="Rating">
              <i class="bi bi-star-fill"></i>
              <span class="small fw-semibold">${Number(r.rating).toFixed(1)}</span>
            </div>
            <div class="small text-muted">Ingresos: <strong>$${Number(r.revenue_today).toLocaleString()}</strong></div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('loadPopularRestaurants error:', err);
    container.innerHTML = '<div class="text-danger py-3">Error al cargar restaurantes populares</div>';
  }
}

// Variante para la sección de Reportes (usa otro contenedor)
async function loadPopularRestaurantsReports(range = 'day') {
  const container = document.getElementById('popularRestaurantsReportsContainer');
  if (!container) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/v1/admin/dashboard/popular-restaurants?range=${encodeURIComponent(range)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      if (handleAuthError(res)) return;
      throw new Error('No se pudo obtener restaurantes populares');
    }
    const payload = await res.json();
    const items = payload.data || [];
    if (!items.length) {
      container.innerHTML = '<div class="text-muted py-4 text-center">Sin pedidos en el periodo seleccionado</div>';
      return;
    }
    container.innerHTML = items.map((r, idx) => `
      <div class="d-flex align-items-center py-2 border-bottom ${idx===0?'pt-0':''}">
        <div class="me-3 rounded-circle bg-light d-flex align-items-center justify-content-center" style="width:38px;height:38px;">
          <span class="fw-bold text-muted" style="font-size:0.9rem;">${idx+1}</span>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center">
            <div class="fw-semibold">${r.name}</div>
            <div class="text-end small text-muted">Pedidos: <strong>${r.orders_today}</strong></div>
          </div>
          <div class="d-flex align-items-center gap-3 mt-1">
            <div class="text-warning" aria-label="Rating">
              <i class="bi bi-star-fill"></i>
              <span class="small fw-semibold">${Number(r.rating).toFixed(1)}</span>
            </div>
            <div class="small text-muted">Ingresos: <strong>$${Number(r.revenue_today).toLocaleString()}</strong></div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('loadPopularRestaurantsReports error:', err);
    container.innerHTML = '<div class="text-danger py-3">Error al cargar restaurantes populares</div>';
  }
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

// ===== Gestión de Restaurantes (Admin) =====
async function adminLoadRestaurants() {
  const tbody = document.getElementById('restaurantsTableBody');
  const loading = document.getElementById('restaurantsLoading');
  const empty = document.getElementById('restaurantsEmpty');
  const status = document.getElementById('restaurantsStatusFilter')?.value || 'active';
  const search = document.getElementById('restaurantsSearch')?.value?.trim() || '';

  if (!tbody) return;

  try {
    loading?.classList.remove('d-none');
    empty?.classList.add('d-none');
    tbody.innerHTML = '';

    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    const res = await fetch(`/api/v1/admin/restaurants?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      if (handleAuthError(res)) return;
      throw new Error('No se pudo cargar restaurantes');
    }
    const json = await res.json();
    const data = json.restaurants || json.data || [];

    if (!data.length) {
      empty?.classList.remove('d-none');
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Sin resultados</td></tr>';
      return;
    }

    const rows = data.map(r => {
      const logo = normalizeLogoUrl(r.logo_url);
      const stateBadge = r.is_active ? '<span class="badge bg-success">Aceptado</span>' : '<span class="badge bg-warning text-dark">Pendiente</span>';
      const actions = r.is_active
        ? `<button class="btn btn-sm btn-outline-danger" data-action="deactivate" data-id="${r.id}"><i class="bi bi-slash-circle"></i> Desactivar</button>`
        : `<button class="btn btn-sm btn-success" data-action="approve" data-id="${r.id}"><i class="bi bi-check2-circle"></i> Aprobar</button>`;
      return `
        <tr>
          <td style="width:64px">
            <img src="${logo}" alt="logo" width="48" height="48" class="rounded" onerror="this.src='/imagenes/restaurantes/placeholder.png'">
          </td>
          <td>
            <div class="fw-semibold">${r.name}</div>
            <div class="small text-muted">${r.address || ''}</div>
          </td>
          <td>${r.category || '-'}</td>
          <td>
            <div class="small">${r.phone || '-'}</div>
            <div class="small text-muted">${r.email || ''}</div>
          </td>
          <td>${Number(r.total_orders || 0).toLocaleString()}</td>
          <td>${Number(r.avg_rating || 0).toFixed(1)}</td>
          <td>${stateBadge}</td>
          <td class="d-flex gap-2">
            ${actions}
            <a class="btn btn-sm btn-outline-secondary" href="/restaurant.html?id=${r.id}" target="_blank"><i class="bi bi-box-arrow-up-right"></i></a>
          </td>
        </tr>`;
    }).join('');

    tbody.innerHTML = rows;

    // Wire actions
    tbody.querySelectorAll('button[data-action]')?.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const action = e.currentTarget.getAttribute('data-action');
        if (action === 'approve') await adminApproveRestaurant(id);
        if (action === 'deactivate') await adminDeactivateRestaurant(id);
      });
    });
  } catch (err) {
    console.error('adminLoadRestaurants error:', err);
    tbody.innerHTML = '<tr><td colspan="8" class="text-danger">Error al cargar restaurantes</td></tr>';
  } finally {
    loading?.classList.add('d-none');
  }
}

function normalizeLogoUrl(url) {
  if (!url) return '/imagenes/restaurantes/placeholder.png';
  return url.replace('/IMAGENES', '/imagenes');
}

async function adminApproveRestaurant(id) {
  if (!confirm('¿Aprobar este restaurante?')) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/v1/admin/restaurants/${id}/approve`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
  const js = await res.json();
  if (!res.ok || !js.ok) {
    alert(js.message || 'No se pudo aprobar');
    return;
  }
  showNotification('Restaurante aprobado', 'success', 3000);
  adminLoadRestaurants();
}

async function adminDeactivateRestaurant(id) {
  if (!confirm('¿Desactivar este restaurante?')) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/v1/admin/restaurants/${id}/deactivate`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
  const js = await res.json();
  if (!res.ok || !js.ok) {
    alert(js.message || 'No se pudo desactivar');
    return;
  }
  showNotification('Restaurante desactivado', 'warning', 3000);
  adminLoadRestaurants();
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

  // Cargar usuarios al iniciar
  loadUsers();
  
  // Agregar event listeners para filtros de usuarios
  const searchUsers = document.getElementById('searchUsers');
  const roleFilter = document.getElementById('roleFilter');
  
  if (searchUsers) {
    searchUsers.addEventListener('input', debounce(loadUsers, 500));
  }
  
  if (roleFilter) {
    roleFilter.addEventListener('change', loadUsers);
  }

  // ==== Gestión de Restaurantes (Admin) ====
  const rsStatus = document.getElementById('restaurantsStatusFilter');
  const rsSearch = document.getElementById('restaurantsSearch');
  const rsRefresh = document.getElementById('restaurantsRefresh');
  if (rsStatus) rsStatus.addEventListener('change', adminLoadRestaurants);
  if (rsSearch) rsSearch.addEventListener('input', debounce(adminLoadRestaurants, 400));
  if (rsRefresh) rsRefresh.addEventListener('click', adminLoadRestaurants);

  // Cargar cuando se muestre la sección o al inicio si ya está activa
  const restaurantsSection = document.getElementById('restaurants-section');
  if (restaurantsSection) {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class' && restaurantsSection.classList.contains('active')) {
          adminLoadRestaurants();
        }
      }
    });
    observer.observe(restaurantsSection, { attributes: true });
  }
});

// Función debounce para búsqueda
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Función para cargar usuarios desde la base de datos
async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  const usersCount = document.getElementById('usersCount');
  const searchTerm = document.getElementById('searchUsers')?.value || '';
  const roleFilter = document.getElementById('roleFilter')?.value || '';
  
  try {
    // Mostrar loading
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </td>
      </tr>
    `;

    const token = localStorage.getItem('token');
    const response = await fetch('/api/v1/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (handleAuthError(response)) {
      return;
    }

    if (!response.ok) {
      throw new Error('Error al cargar usuarios');
    }

    const raw = await response.json();
    console.log('🔄 Respuesta /admin/users:', raw);
    // Adaptar a ambos formatos (array directo o {ok, users, total})
    let users = Array.isArray(raw) ? raw : (raw.users || []);
    const totalFromServer = Array.isArray(raw) ? raw.length : (raw.total || users.length);
    
    // Aplicar filtros
    if (roleFilter) {
      console.log(`🔍 Filtrando por rol: "${roleFilter}"`);
      users = users.filter(user => {
        const roles = user.roles || [];
        const hasRole = roles.includes(roleFilter);
        if (hasRole) {
          console.log(`  ✓ Usuario ${user.username} tiene rol ${roleFilter}`, roles);
        }
        return hasRole;
      });
      console.log(`📊 Usuarios después de filtrar por rol: ${users.length}`);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      users = users.filter(user => 
        (user.username || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        (user.nombre || '').toLowerCase().includes(term) ||
        (user.apellidos || '').toLowerCase().includes(term)
      );
    }

    // Actualizar contador con información de filtros
    if (usersCount) {
      let countText = `Total: ${users.length}`;
      if (roleFilter || searchTerm) {
        countText += ` de ${totalFromServer}`;
      }
      countText += ` usuario${users.length !== 1 ? 's' : ''}`;
      usersCount.textContent = countText;
    }

    // Mostrar usuarios
    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-4">
            <i class="bi bi-inbox" style="font-size: 2rem;"></i>
            <p class="mt-2">No se encontraron usuarios</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = users.map(user => {
      const roles = user.roles || [];
      const roleLabels = roles.map(role => {
        const labels = {
          'admin': '<span class="badge bg-danger">Admin</span>',
          'delivery': '<span class="badge bg-info">Domiciliario</span>',
          'domiciliario': '<span class="badge bg-info">Domiciliario</span>',
          'cliente': '<span class="badge bg-secondary">Cliente</span>',
          'user': '<span class="badge bg-secondary">Usuario</span>'
        };
        return labels[role] || `<span class="badge bg-secondary">${role}</span>`;
      }).join(' ');

      const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A';
      
      return `
        <tr>
          <td>${user.id}</td>
          <td><strong>${user.username || 'N/A'}</strong></td>
          <td>${user.email || 'N/A'}</td>
          <td>${user.nombre || ''} ${user.apellidos || ''}</td>
          <td>${roleLabels || '<span class="badge bg-secondary">Cliente</span>'}</td>
          <td>${user.telefono1 || 'N/A'}</td>
          <td>${createdAt}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="viewUser(${user.id})" title="Ver detalles">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-warning" onclick="editUser(${user.id})" title="Editar">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger" onclick="deleteUser(${user.id})" title="Eliminar">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
          <p class="mt-2">Error al cargar usuarios. Por favor, intenta de nuevo.</p>
        </td>
      </tr>
    `;
  }
}

// Función para ver detalles de un usuario
async function viewUser(userId) {
  const modal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
  const modalContent = document.getElementById('userDetailsContent');
  
  // Mostrar loading
  modalContent.innerHTML = `
    <div class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Cargando información del usuario...</p>
    </div>
  `;
  
  modal.show();
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/v1/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar datos del usuario');
    }

    const data = await response.json();
    const user = data.users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Formatear roles
    const roles = user.roles || [];
    const roleLabels = roles.map(role => {
      const labels = {
        'admin': '<span class="badge bg-danger">Administrador</span>',
        'delivery': '<span class="badge bg-info">Domiciliario</span>',
        'domiciliario': '<span class="badge bg-info">Domiciliario</span>',
        'cliente': '<span class="badge bg-secondary">Cliente</span>',
        'user': '<span class="badge bg-secondary">Usuario</span>'
      };
      return labels[role] || `<span class="badge bg-secondary">${role}</span>`;
    }).join(' ');

    const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';

    // Resolver nombres para ubicaciones si vienen como IDs desde user_details
    const depNameResolved = (() => {
      if (user.departamento) return user.departamento;
      if (typeof user.departamento_id !== 'undefined' && user.departamento_id !== null) {
        const dep = AD_DEPARTAMENTOS[user.departamento_id];
        return dep || '';
      }
      return '';
    })();
    const munNameResolved = (() => {
      if (user.municipio) return user.municipio;
      const depId = user.departamento_id;
      if (depId && AD_MUNICIPIOS[depId]) {
        const list = AD_MUNICIPIOS[depId];
        const found = list.find(m => (m.id+'' === (user.municipio_id+'')) || (m.nombre === user.municipio));
        return found ? found.nombre : '';
      }
      return '';
    })();

    // Mostrar detalles del usuario
    modalContent.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-3">
          <h6 class="text-muted mb-2"><i class="bi bi-person-badge me-2"></i>Información Básica</h6>
          <div class="card">
            <div class="card-body">
              <p class="mb-2"><strong>ID:</strong> ${user.id}</p>
              <p class="mb-2"><strong>Usuario:</strong> ${user.username || 'N/A'}</p>
              <p class="mb-2"><strong>Email:</strong> ${user.email || 'N/A'}</p>
              <p class="mb-2"><strong>Roles:</strong> ${roleLabels || '<span class="badge bg-secondary">Sin roles</span>'}</p>
              <p class="mb-0"><strong>Fecha de registro:</strong> ${createdAt}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <h6 class="text-muted mb-2"><i class="bi bi-person me-2"></i>Información Personal</h6>
          <div class="card">
            <div class="card-body">
              <p class="mb-2"><strong>Cédula:</strong> ${user.cedula || 'No proporcionada'}</p>
              <p class="mb-2"><strong>Nombre:</strong> ${user.nombre || 'No proporcionado'}</p>
              <p class="mb-2"><strong>Apellidos:</strong> ${user.apellidos || 'No proporcionado'}</p>
              <p class="mb-0"><strong>Nombre completo:</strong> ${user.nombre && user.apellidos ? `${user.nombre} ${user.apellidos}` : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <h6 class="text-muted mb-2"><i class="bi bi-telephone me-2"></i>Contacto</h6>
          <div class="card">
            <div class="card-body">
              <p class="mb-2"><strong>Teléfono 1:</strong> ${user.telefono1 || 'No proporcionado'}</p>
              <p class="mb-0"><strong>Teléfono 2:</strong> ${user.telefono2 || 'No proporcionado'}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <h6 class="text-muted mb-2"><i class="bi bi-geo-alt me-2"></i>Ubicación</h6>
          <div class="card">
            <div class="card-body">
              <p class="mb-2"><strong>Dirección:</strong> ${user.direccion || 'No proporcionada'}</p>
              <p class="mb-2"><strong>Municipio:</strong> ${munNameResolved || 'No proporcionado'}</p>
              <p class="mb-0"><strong>Departamento:</strong> ${depNameResolved || 'No proporcionado'}</p>
            </div>
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Error al cargar detalles del usuario:', error);
    modalContent.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Error al cargar los detalles del usuario. Por favor, intenta de nuevo.
      </div>
    `;
  }
}

// (Eliminado duplicado de editUser y submit handler; se usa window.editUser + onEditUserSubmit definidos arriba)

// Función para eliminar un usuario
async function deleteUser(userId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/v1/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      alert('Usuario eliminado exitosamente');
      loadUsers(); // Recargar la lista
    } else {
      alert('Error al eliminar el usuario');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar el usuario');
  }
}

