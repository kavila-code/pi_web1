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

// Cargar restaurantes recomendados
document.addEventListener("DOMContentLoaded", function () {
  try { loadRecommendedRestaurants(); } catch (e) { console.error(e); }
});

async function loadRecommendedRestaurants() {
  const grid = document.getElementById('recommendedGrid') || document.querySelector('.recommended-restaurants .restaurants-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="text-center py-3 w-100">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    </div>`;

  try {
    const res = await fetch('/api/v1/restaurants/recommended?limit=3');
    const data = await res.json();
    if (!data || !data.ok) throw new Error('Respuesta inválida');
    const items = Array.isArray(data.data) ? data.data : [];

    if (items.length === 0) {
      grid.innerHTML = '<div class="text-muted py-3">No hay restaurantes disponibles por ahora.</div>';
      return;
    }

    grid.innerHTML = items.map(r => renderRecommendedCard(r)).join('');
  } catch (err) {
    console.warn('recommended error, using fallback:', err);
    // Fallback: usar listado general y tomar 3 con imagen
    try {
      const res2 = await fetch('/api/v1/restaurants');
      const data2 = await res2.json();
      const list = (data2 && data2.data) ? data2.data : [];
      const filtered = list.filter(r => (r.logo_url || r.cover_image_url)).slice(0,3);
      if (filtered.length > 0) {
        grid.innerHTML = filtered.map(r => renderRecommendedCard(r)).join('');
      } else {
        grid.innerHTML = '<div class="text-muted py-3">No fue posible cargar recomendados.</div>';
      }
    } catch (e2) {
      console.error('fallback error:', e2);
      grid.innerHTML = '<div class="text-muted py-3">No fue posible cargar recomendados.</div>';
    }
  }
}

function mapImageUrl(url) {
  if (!url) return '';
  // Normalizar rutas antiguas '/IMAGENES/RESTAURANTES' -> '/imagenes/restaurantes'
  return url.replace('/IMAGENES/RESTAURANTES', '/imagenes/restaurantes');
}

function renderRecommendedCard(r) {
  const name = r.name || 'Restaurante';
  const category = r.category || '';
  const rating = typeof r.avg_rating === 'number' ? r.avg_rating.toFixed(1) : (r.avg_rating || r.rating || '4.5');
  const tmin = r.delivery_time_min || 30;
  const tmax = r.delivery_time_max || 45;
  const time = `${tmin}-${tmax} min`;
  const logo = mapImageUrl(r.logo_url) || '';
  const cover = mapImageUrl(r.cover_image_url) || '';
  const img = cover || logo || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='80' fill='%23ff6b35' viewBox='0 0 16 16'%3E%3Cpath d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z'/%3E%3C/svg%3E";
  const href = `/public/restaurant-menu.html?id=${r.id}`;

  return `
    <div class="restaurant-card" role="button" onclick="location.href='${href}'">
      <img src="${img}" alt="${name}" class="restaurant-image" onerror="this.src='${logo || img}'"/>
      <div class="restaurant-info">
        <h6>${name}</h6>
        <p class="restaurant-category">${category}</p>
        <div class="restaurant-meta">
          <span class="rating"><i class="bi bi-star-fill"></i> ${rating}</span>
          <span class="delivery-time">${time}</span>
        </div>
      </div>
    </div>`;
}

// Nombres de departamentos (orden alfabético por nombre)
const departamentos = {
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
  32: "Vichada"
};

// Datos de municipios por departamento
const municipiosPorDepartamento = {
  1: [
    { id: "1", nombre: "Leticia" },
    { id: "2", nombre: "Puerto Nariño" },
    { id: "3", nombre: "Tarapacá" },
    { id: "4", nombre: "La Chorrera" },
    { id: "5", nombre: "Puerto Arica" },
    { id: "6", nombre: "Mirití-Paraná" }
  ],
  2: [
    { id: "7", nombre: "Medellín" },
    { id: "8", nombre: "Bello" },
    { id: "9", nombre: "Itagüí" },
    { id: "10", nombre: "Envigado" },
    { id: "11", nombre: "Rionegro" },
    { id: "12", nombre: "Apartadó" }
  ],
  3: [
    { id: "13", nombre: "Arauca" },
    { id: "14", nombre: "Arauquita" },
    { id: "15", nombre: "Tame" },
    { id: "16", nombre: "Fortul" },
    { id: "17", nombre: "Saravena" },
    { id: "18", nombre: "Puerto Rondón" }
  ],
  4: [
    { id: "19", nombre: "Barranquilla" },
    { id: "20", nombre: "Soledad" },
    { id: "21", nombre: "Malambo" },
    { id: "22", nombre: "Sabanalarga" },
    { id: "23", nombre: "Galapa" },
    { id: "24", nombre: "Baranoa" }
  ],
  5: [
    { id: "25", nombre: "Cartagena" },
    { id: "26", nombre: "Turbaco" },
    { id: "27", nombre: "Magangué" },
    { id: "28", nombre: "El Carmen de Bolívar" },
    { id: "29", nombre: "Arjona" },
    { id: "30", nombre: "Santa Catalina" }
  ],
  6: [
    { id: "31", nombre: "Tunja" },
    { id: "32", nombre: "Duitama" },
    { id: "33", nombre: "Sogamoso" },
    { id: "34", nombre: "Chiquinquirá" },
    { id: "35", nombre: "Paipa" },
    { id: "36", nombre: "Tibasosa" }
  ],
  7: [
    { id: "37", nombre: "Manizales" },
    { id: "38", nombre: "Chinchiná" },
    { id: "39", nombre: "La Dorada" },
    { id: "40", nombre: "Villamaría" },
    { id: "41", nombre: "Neira" },
    { id: "42", nombre: "Anserma" }
  ],
  8: [
    { id: "43", nombre: "Florencia" },
    { id: "44", nombre: "Belén de los Andaquíes" },
    { id: "45", nombre: "La Montañita" },
    { id: "46", nombre: "Morelia" },
    { id: "47", nombre: "Puerto Rico" },
    { id: "48", nombre: "Valparaíso" }
  ],
  9: [
    { id: "49", nombre: "Yopal" },
    { id: "50", nombre: "Aguazul" },
    { id: "51", nombre: "Orocué" },
    { id: "52", nombre: "Sabanalarga (Casanare)" },
    { id: "53", nombre: "Chámeza" },
    { id: "54", nombre: "Tauramena" }
  ],
  10: [
    { id: "55", nombre: "Popayán" },
    { id: "56", nombre: "Santander de Quilichao" },
    { id: "57", nombre: "Puerto Tejada" },
    { id: "58", nombre: "Almaguer" },
    { id: "59", nombre: "Silvia" },
    { id: "60", nombre: "Patía" }
  ],
  11: [
    { id: "61", nombre: "Valledupar" },
    { id: "62", nombre: "Aguachica" },
    { id: "63", nombre: "Codazzi" },
    { id: "64", nombre: "El Copey" },
    { id: "65", nombre: "Bosconia" },
    { id: "66", nombre: "La Jagua de Ibirico" }
  ],
  12: [
    { id: "67", nombre: "Quibdó" },
    { id: "68", nombre: "Istmina" },
    { id: "69", nombre: "Tadó" },
    { id: "70", nombre: "Riosucio (Chocó)" },
    { id: "71", nombre: "Nuquí" },
    { id: "72", nombre: "Bojayá" }
  ],
  13: [
    { id: "73", nombre: "Montería" },
    { id: "74", nombre: "Cereté" },
    { id: "75", nombre: "Lorica" },
    { id: "76", nombre: "Sahagún" },
    { id: "77", nombre: "Montelíbano" },
    { id: "78", nombre: "Puerto Escondido" }
  ],
  14: [
    { id: "79", nombre: "Bogotá" },
    { id: "80", nombre: "Soacha" },
    { id: "81", nombre: "Facatativá" },
    { id: "82", nombre: "Fusagasugá" },
    { id: "83", nombre: "Zipaquirá" },
    { id: "84", nombre: "Chía" }
  ],
  15: [
    { id: "85", nombre: "Inírida" },
    { id: "86", nombre: "Barranco Minas" },
    { id: "87", nombre: "Cacahual" },
    { id: "88", nombre: "Mapiripana" },
    { id: "89", nombre: "San Felipe" },
    { id: "90", nombre: "Pana Pana" }
  ],
  16: [
    { id: "91", nombre: "San José del Guaviare" },
    { id: "92", nombre: "Calamar (Guaviare)" },
    { id: "93", nombre: "El Retorno" },
    { id: "94", nombre: "Miraflores (Guaviare)" },
    { id: "95", nombre: "La Macarena" },
    { id: "96", nombre: "Mapiripana (Guaviare)" }
  ],
  17: [
    { id: "97", nombre: "Neiva" },
    { id: "98", nombre: "Pitalito" },
    { id: "99", nombre: "Garzón" },
    { id: "100", nombre: "La plata" },
    { id: "101", nombre: "Tello" },
    { id: "102", nombre: "Campoalegre" }
  ],
  18: [
    { id: "103", nombre: "Riohacha" },
    { id: "104", nombre: "Maicao" },
    { id: "105", nombre: "Uribia" },
    { id: "106", nombre: "Dibulla" },
    { id: "107", nombre: "Manaure" },
    { id: "108", nombre: "Hatonuevo" }
  ],
  19: [
    { id: "109", nombre: "Santa Marta" },
    { id: "110", nombre: "Ciénaga" },
    { id: "111", nombre: "Fundación" },
    { id: "112", nombre: "El Banco" },
    { id: "113", nombre: "Aracataca" },
    { id: "114", nombre: "Sitionuevo" }
  ],
  20: [
    { id: "115", nombre: "Villavicencio" },
    { id: "116", nombre: "Acacías" },
    { id: "117", nombre: "Granada (Meta)" },
    { id: "118", nombre: "Puerto López" },
    { id: "119", nombre: "Mapiripán" },
    { id: "120", nombre: "Restrepo" }
  ],
  21: [
    { id: "121", nombre: "Pasto" },
    { id: "122", nombre: "Tumaco" },
    { id: "123", nombre: "Ipiales" },
    { id: "124", nombre: "Tuquerres" },
    { id: "125", nombre: "Tumlado" },
    { id: "126", nombre: "La Unión (Nariño)" }
  ],
  22: [
    { id: "127", nombre: "Cúcuta" },
    { id: "128", nombre: "Ocaña" },
    { id: "129", nombre: "Pamplona" },
    { id: "130", nombre: "Sardinata" },
    { id: "131", nombre: "Chinácota" },
    { id: "132", nombre: "Los Patios" }
  ],
  23: [
    { id: "133", nombre: "Mocoa" },
    { id: "134", nombre: "Puerto Asís" },
    { id: "135", nombre: "Valle del Guamuez" },
    { id: "136", nombre: "Puerto Caicedo" },
    { id: "137", nombre: "Colón (Putumayo)" },
    { id: "138", nombre: "Orito" }
  ],
  24: [
    { id: "139", nombre: "Armenia" },
    { id: "140", nombre: "Calarcá" },
    { id: "141", nombre: "Montenegro" },
    { id: "142", nombre: "Pereira (Quindío?)" },
    { id: "143", nombre: "La Tebaida" },
    { id: "144", nombre: "Quimbaya" }
  ],
  25: [
    { id: "145", nombre: "Pereira" },
    { id: "146", nombre: "Dosquebradas" },
    { id: "147", nombre: "La Virginia" },
    { id: "148", nombre: "Santuario" },
    { id: "149", nombre: "Marsella" },
    { id: "150", nombre: "Belén de Umbría" }
  ],
  26: [
    { id: "151", nombre: "San Andrés" },
    { id: "152", nombre: "Providencia" },
    { id: "153", nombre: "Santa Catalina" },
    { id: "154", nombre: "North End" },
    { id: "155", nombre: "Coveñas (?)" },
    { id: "156", nombre: "Saint George" }
  ],
  27: [
    { id: "157", nombre: "Bucaramanga" },
    { id: "158", nombre: "Floridablanca" },
    { id: "159", nombre: "Piedecuesta" },
    { id: "160", nombre: "Barrancabermeja" },
    { id: "161", nombre: "Girón" },
    { id: "162", nombre: "Socorro" }
  ],
  28: [
    { id: "163", nombre: "Sincelejo" },
    { id: "164", nombre: "Corozal" },
    { id: "165", nombre: "Tolú" },
    { id: "166", nombre: "Sampués" },
    { id: "167", nombre: "Colosó" },
    { id: "168", nombre: "Santiago de Tolú" }
  ],
  29: [
    { id: "169", nombre: "Ibagué" },
    { id: "170", nombre: "Espinal" },
    { id: "171", nombre: "Melgar" },
    { id: "172", nombre: "Honda" },
    { id: "173", nombre: "Lérida" },
    { id: "174", nombre: "Chaparral" }
  ],
  30: [
    { id: "175", nombre: "Cali" },
    { id: "176", nombre: "Palmira" },
    { id: "177", nombre: "Buenaventura" },
    { id: "178", nombre: "Tuluá" },
    { id: "179", nombre: "Cartago" },
    { id: "180", nombre: "Buga" }
  ],
  31: [
    { id: "181", nombre: "Mitú" },
    { id: "182", nombre: "Carurú" },
    { id: "183", nombre: "Taraira" },
    { id: "184", nombre: "Papunaua" },
    { id: "185", nombre: "Yavaraté" },
    { id: "186", nombre: "Uaupés" }
  ],
  32: [
    { id: "187", nombre: "Puerto Carreño" },
    { id: "188", nombre: "La Primavera" },
    { id: "189", nombre: "Santa Rosalía" },
    { id: "190", nombre: "Cumaribo" },
    { id: "191", nombre: "Manacacías" },
    { id: "192", nombre: "Puerto Colombia (Vichada)" }
  ]
};

// Manejar cambio de departamento para actualizar municipios
document.addEventListener("DOMContentLoaded", function () {
  const departamentoSelect = document.getElementById("ud_departamento");
  const municipioSelect = document.getElementById("ud_municipio");

  if (departamentoSelect && municipioSelect) {
    // Poblar select de departamentos si está vacío o solo tiene la opción por defecto
    if (departamentoSelect.options.length <= 1) {
      departamentoSelect.innerHTML = '<option value="">Seleccione un departamento</option>';
      Object.keys(departamentos).forEach((key) => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = departamentos[key];
        departamentoSelect.appendChild(opt);
      });
    }

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

  // Cargar estadísticas reales del usuario
  try { loadUserStats(); } catch (e) { console.error('loadUserStats error', e); }

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

  // Las estadísticas reales se cargan desde loadUserStats()
}

async function loadUserStats() {
  try {
    const resp = await authenticatedFetch('/api/v1/users/me/stats');
    if (!resp || !resp.ok) return;
    const s = resp.data || {};

    const formatMoney = (v) => `$${Number(v || 0).toLocaleString('es-CO')}`;
    const delta = Number(s.orders_this_month_delta || 0);
    const deltaStr = `Este mes: ${delta >= 0 ? '+' : ''}${delta}`;

    const favName = s.top_favorite_restaurant?.name || '';
    const favText = favName ? `${favName} es tu favorito` : 'Sin favorito aún';
    const savings = Number(s.savings_percent || 0);

    const totalOrders = Number(s.total_orders || 0);
    const totalSpent = formatMoney(s.total_spent || 0);
    const favCount = Number(s.favorites_count || 0);

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    // Sidebar perfil
    setText('totalOrders', String(totalOrders));
    setText('totalSpent', totalSpent);
    setText('favoriteRestaurants', String(favCount));

    // Tarjetas dashboard
    setText('dashTotalOrders', String(totalOrders));
    setText('dashTotalSpent', totalSpent);
    setText('dashFavorites', String(favCount));
    setText('dashThisMonthDelta', deltaStr);
    setText('dashSavingsPercent', `Ahorro del ${savings}%`);
    setText('dashTopFavorite', favText);
  } catch (e) {
    console.error('Error cargando estadísticas de usuario:', e);
  }
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

// ========== FUNCIONES DE PEDIDOS PARA DOMICILIARIOS ==========

// Función para cargar pedidos disponibles
window.loadAvailableOrders = async function() {
  const container = document.getElementById("availableOrdersList");
  if (!container) {
    console.error('Container availableOrdersList no encontrado');
    return;
  }
  
  container.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Cargando pedidos disponibles...</p></div>';

  try {
    console.log('[loadAvailableOrders] Iniciando carga...');
    const token = localStorage.getItem('token');
    console.log('[loadAvailableOrders] Token:', token ? 'Existe' : 'No existe');
    
    const response = await fetch('/api/v1/orders/available', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('[loadAvailableOrders] Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('[loadAvailableOrders] Datos recibidos:', data);
      const orders = data.orders || data.data || [];
      console.log('[loadAvailableOrders] Pedidos encontrados:', orders.length);
      
      if (orders.length === 0) {
        container.innerHTML = `
          <div class="text-center py-5">
            <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
            <p class="text-muted mt-3">No hay pedidos disponibles en este momento</p>
          </div>
        `;
      } else {
        container.innerHTML = orders.map(order => `
          <div class="card mb-3">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <h5>Pedido #${order.order_number || order.id}</h5>
                  <p class="mb-1"><i class="bi bi-shop me-2"></i><strong>Restaurante:</strong> ${order.restaurant_name || 'N/A'}</p>
                  <p class="mb-1"><i class="bi bi-geo-alt me-2"></i><strong>Destino:</strong> ${order.delivery_address || 'N/A'}</p>
                  <p class="mb-1"><i class="bi bi-cash me-2"></i><strong>Total:</strong> $${Number(order.total || 0).toLocaleString('es-CO')}</p>
                </div>
                <div class="col-md-4 text-end">
                  <button class="btn btn-primary" onclick="acceptDelivery(${order.id})">
                    <i class="bi bi-check-circle me-1"></i>Aceptar Pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }
    } else {
      const errorText = await response.text();
      console.error('[loadAvailableOrders] Error response:', response.status, errorText);
      throw new Error(`Error al cargar pedidos: ${response.status}`);
    }
  } catch (error) {
    console.error('[loadAvailableOrders] Error completo:', error);
    container.innerHTML = `
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se pudieron cargar los pedidos. ${error.message}
        <br><small>Verifica que hayas iniciado sesión correctamente.</small>
      </div>
    `;
  }
};

// Función para cargar mis entregas
window.loadMyDeliveries = async function() {
  const container = document.getElementById("myDeliveriesList");
  if (!container) {
    console.error('Container myDeliveriesList no encontrado');
    return;
  }
  
  container.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"></div></div>';

  try {
    console.log('[loadMyDeliveries] Iniciando carga...');
    const response = await fetch('/api/v1/orders/my-deliveries', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    console.log('[loadMyDeliveries] Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('[loadMyDeliveries] Datos recibidos:', data);
      const orders = data.orders || data.data || [];
      console.log('[loadMyDeliveries] Entregas encontradas:', orders.length);
      
      if (orders.length === 0) {
        container.innerHTML = `
          <div class="text-center py-5">
            <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
            <p class="text-muted mt-3">No has tomado pedidos aún</p>
          </div>
        `;
      } else {
        container.innerHTML = orders.map(order => {
          const statusBadge = getStatusBadge(order.status);
          const actionButtons = getActionButtons(order);
          
          return `
            <div class="card mb-3">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-7">
                    <h5>Pedido #${order.order_number || order.id}</h5>
                    <p class="mb-1"><i class="bi bi-shop me-2"></i><strong>Restaurante:</strong> ${order.restaurant_name || 'N/A'}</p>
                    <p class="mb-1"><i class="bi bi-geo-alt me-2"></i><strong>Destino:</strong> ${order.delivery_address || 'N/A'}</p>
                    <p class="mb-1"><i class="bi bi-cash me-2"></i><strong>Total:</strong> $${Number(order.total || 0).toLocaleString('es-CO')}</p>
                    <p class="mb-0"><i class="bi bi-clock me-2"></i><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString('es-ES')}</p>
                  </div>
                  <div class="col-md-5 text-end">
                    ${statusBadge}
                    <div class="mt-3">
                      ${actionButtons}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    } else {
      throw new Error('Error al cargar entregas');
    }
  } catch (error) {
    console.error('[loadMyDeliveries] Error:', error);
    container.innerHTML = `
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se pudieron cargar tus entregas. Intenta de nuevo más tarde.
      </div>
    `;
  }
};

// Función para obtener badge según estado
window.getStatusBadge = function(status) {
  const badges = {
    'pendiente': '<span class="badge bg-secondary">Pendiente</span>',
    'confirmado': '<span class="badge bg-info">Confirmado</span>',
    'preparando': '<span class="badge bg-warning">Preparando</span>',
    'listo': '<span class="badge bg-primary">Listo para recoger</span>',
    'en_camino': '<span class="badge bg-info">En camino</span>',
    'entregado': '<span class="badge bg-success">Entregado</span>',
    'cancelado': '<span class="badge bg-danger">Cancelado</span>'
  };
  return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
};

// Función para obtener botones de acción según estado
window.getActionButtons = function(order) {
  if (order.status === 'entregado' || order.status === 'cancelado') {
    return '';
  }
  
  if (order.status === 'en_camino') {
    return `
      <button class="btn btn-success btn-sm" onclick="markAsDelivered(${order.id})">
        <i class="bi bi-check-circle me-1"></i>Marcar como Entregado
      </button>
    `;
  }
  
  // Para estados: pendiente, confirmado, preparando, listo
  return `
    <button class="btn btn-primary btn-sm" onclick="markAsPickedUp(${order.id})">
      <i class="bi bi-box-arrow-right me-1"></i>Marcar como Recogido
    </button>
  `;
};

// Inicializar pedidos de domiciliario cuando la página carga
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      try { if (typeof loadAvailableOrders === 'function') loadAvailableOrders(); } catch(e) { console.error('Error loading available orders:', e); }
      try { if (typeof loadMyDeliveries === 'function') loadMyDeliveries(); } catch(e) { console.error('Error loading my deliveries:', e); }
      try { if (typeof loadEarnings === 'function') loadEarnings(); } catch(e) { console.error('Error loading earnings:', e); }
    }, 500); // Esperar 500ms para asegurar que el DOM esté listo
  });
} else {
  // DOM ya está listo, ejecutar inmediatamente
  setTimeout(() => {
    try { if (typeof loadAvailableOrders === 'function') loadAvailableOrders(); } catch(e) { console.error('Error loading available orders:', e); }
    try { if (typeof loadMyDeliveries === 'function') loadMyDeliveries(); } catch(e) { console.error('Error loading my deliveries:', e); }
    try { if (typeof loadEarnings === 'function') loadEarnings(); } catch(e) { console.error('Error loading earnings:', e); }
  }, 500);
}

// ===== FUNCIÓN PARA CARGAR GANANCIAS DEL DOMICILIARIO =====
window.loadEarnings = async function() {
  console.log('[loadEarnings] Iniciando carga de ganancias...');
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('[loadEarnings] No hay token de autenticación');
      return;
    }

    const response = await fetch('/api/v1/orders/my-earnings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    console.log('[loadEarnings] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[loadEarnings] Datos recibidos:', result);

    if (result.success && result.data) {
      const { totalEarnings, monthEarnings, completedDeliveries, details } = result.data;

      // Actualizar tarjetas de resumen
      const totalElem = document.getElementById('totalEarnings');
      const monthElem = document.getElementById('monthEarnings');
      const deliveriesElem = document.getElementById('completedDeliveries');

      if (totalElem) totalElem.textContent = `$${totalEarnings.toLocaleString('es-CO')}`;
      if (monthElem) monthElem.textContent = `$${monthEarnings.toLocaleString('es-CO')}`;
      if (deliveriesElem) deliveriesElem.textContent = completedDeliveries;

      // Actualizar tabla de detalles
      const tbody = document.getElementById('earningsTableBody');
      if (tbody) {
        if (!details || details.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="4" class="text-center text-muted">
                <i class="bi bi-info-circle me-2"></i>
                No hay datos de ganancias aún. Completa entregas para ver tus ganancias.
              </td>
            </tr>
          `;
        } else {
          tbody.innerHTML = details.map(order => `
            <tr>
              <td>${new Date(order.created_at).toLocaleDateString('es-CO', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</td>
              <td>
                <span class="badge bg-secondary">#${order.order_number || order.id}</span>
              </td>
              <td class="text-success fw-bold">$${order.delivery_fee.toLocaleString('es-CO')}</td>
              <td>
                <span class="badge bg-success">
                  <i class="bi bi-check-circle me-1"></i>Pagado
                </span>
              </td>
            </tr>
          `).join('');
        }
      }

      console.log('[loadEarnings] Ganancias cargadas exitosamente');
    } else {
      throw new Error('Formato de respuesta inválido');
    }
  } catch (error) {
    console.error('[loadEarnings] Error:', error);
    
    // Mostrar mensaje de error en las tarjetas
    const tbody = document.getElementById('earningsTableBody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center">
            <div class="alert alert-warning mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Error al cargar ganancias: ${error.message}
            </div>
          </td>
        </tr>
      `;
    }
  }
};
