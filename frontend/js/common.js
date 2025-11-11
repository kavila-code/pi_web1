// DomiTuluá - Common Utilities JavaScript
// Este archivo contiene funciones compartidas por todas las páginas

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean} - True si está autenticado
 */
function isAuthenticated() {
  return !!localStorage.getItem("token");
}

/**
 * Obtener el token del usuario
 * @returns {string|null} - Token o null
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Obtener datos del usuario
 * @returns {Object|null} - Datos del usuario o null
 */
function getUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Verificar si el usuario tiene un rol específico
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
function hasRole(role) {
  const user = getUser();
  return user && user.roles && user.roles.includes(role);
}

/**
 * Cerrar sesión
 */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("cart");
  window.location.href = "/login";
}

/**
 * Redirigir a login si no está autenticado
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "/login";
    return false;
  }
  return true;
}

/**
 * Redirigir si el usuario no tiene el rol requerido
 * @param {string} requiredRole - Rol requerido
 */
function requireRole(requiredRole) {
  if (!requireAuth()) return false;
  
  if (!hasRole(requiredRole)) {
    alert("No tienes permisos para acceder a esta página");
    window.location.href = "/user-dashboard";
    return false;
  }
  return true;
}

/**
 * Hacer una petición fetch con autenticación
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones de fetch
 * @returns {Promise}
 */
async function authenticatedFetch(url, options = {}) {
  const token = getToken();
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json();

    // Si el token expiró, redirigir a login
    if (response.status === 401) {
      logout();
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error en petición:", error);
    throw error;
  }
}

/**
 * Formatear precio en pesos colombianos
 * @param {number} price - Precio a formatear
 * @returns {string}
 */
function formatPrice(price) {
  return `$${price.toLocaleString("es-CO")}`;
}

/**
 * Formatear fecha
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string}
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Mostrar un toast/notificación
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: success, error, warning, info
 */
function showToast(message, type = "success") {
  // Si hay un toast de Bootstrap en la página, usarlo
  const toastElement = document.getElementById("successToast") || 
                      document.getElementById("toast");
  
  if (toastElement) {
    const toastMessage = toastElement.querySelector(".toast-body") ||
                        document.getElementById("toastMessage");
    
    if (toastMessage) {
      toastMessage.textContent = message;
    }
    
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  } else {
    // Fallback a alert si no hay toast
    alert(message);
  }
}

/**
 * Validar email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validar teléfono colombiano
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  // Acepta formatos: 3001234567, 300 123 4567, 300-123-4567
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10;
}

/**
 * Debounce function para búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function}
 */
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

/**
 * Obtener parámetro de la URL
 * @param {string} param - Nombre del parámetro
 * @returns {string|null}
 */
function getUrlParameter(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Guardada segura del carrito. Si no hay token redirige a login y devuelve false.
 * @param {Array} cartArr
 * @returns {boolean} true si se guardó, false si redirigió
 */
function setCartSafe(cartArr) {
  const token = localStorage.getItem('token');
  if (!token) {
    try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (e) {}
    // Mostrar aviso en lugar de redirigir inmediatamente. Usar showClaimToast si está disponible
    try {
      if (typeof showClaimToast === 'function') {
        showClaimToast('Debes iniciar sesión');
      } else {
        // fallback a showToast definido en este archivo
        showToast('Debes iniciar sesión', 'warning');
      }
    } catch (err) {
      console.warn('No se pudo mostrar toast, usando alert fallback', err);
      try { alert('Debes iniciar sesión'); } catch (e) {}
    }
    return false;
  }

  try {
    localStorage.setItem('cart', JSON.stringify(cartArr));
    return true;
  } catch (e) {
    console.error('Error saving cart:', e);
    return false;
  }
}

/* --- Cart preview modal (top navbar) --- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch (e) {
    console.warn('Error parsing cart from localStorage', e);
    return [];
  }
}

function ensureCartPreviewModal() {
  if (document.getElementById('cartPreviewOverlay')) return;

  const html = `
  <div id="cartPreviewOverlay" class="preview-modal-overlay" aria-hidden="true">
    <div class="preview-modal" role="dialog" aria-modal="true" aria-labelledby="cartPreviewTitle">
      <button class="preview-close" aria-label="Cerrar">&times;</button>
      <div class="preview-body">
        <h4 id="cartPreviewTitle">Carrito</h4>
        <div class="cart-preview-list" style="max-height:360px; overflow:auto; margin-top:12px"></div>
        <div class="preview-price mt-3">Subtotal: <strong class="cart-preview-subtotal">$0</strong></div>
        <div class="preview-actions mt-3 d-flex gap-2">
          <button class="btn btn-primary btn-view-cart">Ver Carrito</button>
          <button class="btn btn-outline-secondary btn-checkout">Proceder al pago</button>
        </div>
      </div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const overlay = document.getElementById('cartPreviewOverlay');
  overlay.querySelector('.preview-close').addEventListener('click', () => closeCartPreview());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCartPreview(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCartPreview(); });

  overlay.querySelector('.btn-view-cart').addEventListener('click', function () {
    // go to cart page; global guards will redirect to login if needed
    window.location.href = '/public/cart.html';
  });

  overlay.querySelector('.btn-checkout').addEventListener('click', function () {
    // Proceed to checkout - navigate to cart page where checkout flow lives
    window.location.href = '/public/cart.html';
  });
}

function openCartPreview() {
  ensureCartPreviewModal();
  const overlay = document.getElementById('cartPreviewOverlay');
  const list = overlay.querySelector('.cart-preview-list');
  const subtotalEl = overlay.querySelector('.cart-preview-subtotal');
  const cart = getCart();

  list.innerHTML = '';
  if (!cart || cart.length === 0) {
    list.innerHTML = `<div class="text-center py-4 text-muted">Tu carrito está vacío</div>`;
    subtotalEl.textContent = '$0';
  } else {
    let subtotal = 0;
    cart.forEach((item) => {
      const itemTotal = (item.product_price || 0) * (item.quantity || 1);
      subtotal += itemTotal;

      const row = document.createElement('div');
      row.className = 'd-flex align-items-center mb-3';
      row.innerHTML = `
        <img src="${item.product_image || '/imagenes/comida/default.jpg'}" alt="" style="width:56px; height:56px; object-fit:cover; border-radius:8px; margin-right:12px">
        <div style="flex:1">
          <div class="fw-bold">${item.product_name || 'Producto'}</div>
          <div class="text-muted small">Cantidad: ${item.quantity || 1}</div>
        </div>
        <div class="text-end fw-bold">${formatPrice(itemTotal)}</div>
      `;
      list.appendChild(row);
    });
    subtotalEl.textContent = formatPrice(subtotal);
  }

  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}

function closeCartPreview() {
  const overlay = document.getElementById('cartPreviewOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden','true');
  document.body.style.overflow = 'auto';
}

function setupCartPreviewButton() {
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.querySelector('.btn-cart');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      // update count from cart (in case other pages modified it)
      const cart = getCart();
      const totalItems = cart.reduce((s, it) => s + (it.quantity || 0), 0);
      const badge = document.querySelector('.cart-count');
      if (badge) badge.textContent = totalItems;
      openCartPreview();
    });
  });
}

// Inicializar el botón del carrito para abrir la previsualización
setupCartPreviewButton();

/* --- Restaurants master list & Load more utility --- */
// Lista basada en los archivos en IMAGENES/RESTAURANTES
const MASTER_RESTAURANTS = [
  { id: 1, name: 'LA BELLA ITALIA', image: '/imagenes/restaurantes/LA%20BELLA%20ITALIA.jpg', category: 'Pizza • Italiana', rating: 4.8, reviews: 127, deliveryTimeMin: 25, priceLevel: 3, deliveryFee: 'Gratis' },
  { id: 2, name: 'Burger Master', image: '/imagenes/restaurantes/burger-master.jpg', category: 'Hamburguesas • Americana', rating: 4.6, reviews: 89, deliveryTimeMin: 20, priceLevel: 2, deliveryFee: '$2.50' },
  { id: 3, name: 'Café Central', image: '/imagenes/restaurantes/cafe%20central.jpg', category: 'Café • Desayunos', rating: 4.6, reviews: 89, deliveryTimeMin: 15, priceLevel: 2, deliveryFee: '$2.00' },
  { id: 4, name: 'Comida China Dragon', image: '/imagenes/restaurantes/comida%20china%20dragon.jpg', category: 'China • Asiática', rating: 4.3, reviews: 98, deliveryTimeMin: 25, priceLevel: 2, deliveryFee: '$2.50' },
  { id: 5, name: 'GREEN LIFE', image: '/imagenes/restaurantes/GREEN%20LIFE.jpg', category: 'Healthy', rating: 4.5, reviews: 60, deliveryTimeMin: 18, priceLevel: 2, deliveryFee: '$1.50' },
  { id: 6, name: 'Heladería Tropical', image: '/imagenes/restaurantes/heladeria%20tropical.jpg', category: 'Helados • Postres', rating: 4.8, reviews: 67, deliveryTimeMin: 10, priceLevel: 1, deliveryFee: '$1.50' },
  { id: 7, name: 'Casa de las Empanadas', image: '/imagenes/restaurantes/la%20casa%20de%20las%20empanadas.png', category: 'Colombiana • Empanadas', rating: 4.5, reviews: 78, deliveryTimeMin: 20, priceLevel: 2, deliveryFee: 'Gratis' },
  { id: 8, name: 'Parrilla Los Amigos', image: '/imagenes/restaurantes/parrilla%20los%20amigos.jpg', category: 'Parrilla • Carnes', rating: 4.7, reviews: 132, deliveryTimeMin: 30, priceLevel: 3, deliveryFee: '$3.00' },
  { id: 9, name: 'Pollo Dorado', image: '/imagenes/restaurantes/pollo%20dorado.png', category: 'Pollo • Comida Rápida', rating: 4.4, reviews: 156, deliveryTimeMin: 20, priceLevel: 2, deliveryFee: '$2.50' },
  { id: 10, name: 'Sabor Valluno', image: '/imagenes/restaurantes/sabor%20valluno.jpg', category: 'Regional', rating: 4.2, reviews: 40, deliveryTimeMin: 22, priceLevel: 2, deliveryFee: '$2.00' },
  { id: 11, name: 'SAKURA SUSHI', image: '/imagenes/restaurantes/SAKURA%20SUSHI.jpg', category: 'Sushi • Japonesa', rating: 4.9, reviews: 156, deliveryTimeMin: 35, priceLevel: 4, deliveryFee: 'Gratis' },
  { id: 12, name: 'AZTECA MEXICANO', image: '/imagenes/restaurantes/AZTECA%20MEXICANO.jpg', category: 'Mexicana • Tacos', rating: 4.7, reviews: 94, deliveryTimeMin: 15, priceLevel: 2, deliveryFee: '$1.50' },
];

function getAllRestaurants() {
  // Devolver copia para evitar mutaciones externas
  return MASTER_RESTAURANTS.map(r => ({ ...r }));
}

// Estado compartido (se usa para render/ordenar)
window._CURRENT_RESTAURANTS = getAllRestaurants();

/** Renderiza los primeros `count` restaurantes en el contenedor especificado.
 * Si count es undefined, renderiza todos. */
function renderRestaurantsContainer(count, containerSelector = '#restaurantsList') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '';
  const source = window._CURRENT_RESTAURANTS || getAllRestaurants();
  const toRender = typeof count === 'number' ? source.slice(0, count) : source;

  const temp = document.createElement('div');
  const fragment = document.createDocumentFragment();
  toRender.forEach(r => {
    temp.innerHTML = createRestaurantCardHTML(r);
    Array.from(temp.children).forEach(node => fragment.appendChild(node));
  });

  container.appendChild(fragment);
}

/** Ordena la lista actual por el criterio y re-renderiza la cantidad actualmente visible. */
function sortAndRender(criteria) {
  if (!window._CURRENT_RESTAURANTS) window._CURRENT_RESTAURANTS = getAllRestaurants();

  const list = window._CURRENT_RESTAURANTS;
  switch (criteria) {
    case 'rating':
      list.sort((a,b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'delivery-time':
      list.sort((a,b) => (a.deliveryTimeMin || 0) - (b.deliveryTimeMin || 0));
      break;
    case 'price-low':
      list.sort((a,b) => (a.priceLevel || 0) - (b.priceLevel || 0));
      break;
    case 'price-high':
      list.sort((a,b) => (b.priceLevel || 0) - (a.priceLevel || 0));
      break;
    default:
      // no change
  }

  // Re-render same number of items that are visible
  const container = document.querySelector('#restaurantsList');
  const visible = container ? container.querySelectorAll('.restaurant-card').length : 0;
  const count = visible > 0 ? visible : 6;
  renderRestaurantsContainer(count, '#restaurantsList');
}

function createRestaurantCardHTML(restaurant) {
  // Devuelve un fragmento HTML compatible con la plantilla usada en user-inicio
  return `
    <div class="col-lg-4 col-md-6 mb-4">
      <div class="restaurant-card">
        <div class="restaurant-image">
          <img src="${restaurant.image}" alt="${restaurant.name}" onerror="this.src='/frontend/placeholder-restaurant.svg'">
          <div class="favorite-toggle" onclick="toggleFavorite(${restaurant.id})">
            <i class="bi bi-heart"></i>
          </div>
        </div>
        <div class="restaurant-info">
          <h5>${restaurant.name}</h5>
          <div class="restaurant-rating">
            <i class="bi bi-star-fill"></i>
            <span>${restaurant.rating || (Math.random()*1.5+3.5).toFixed(1)}</span>
            <small>(${restaurant.reviews || Math.floor(Math.random()*200)+20} reseñas)</small>
          </div>
          <p class="restaurant-category">${restaurant.category || 'Varios'}</p>
          <div class="restaurant-meta">
            <span class="delivery-time"><i class="bi bi-clock"></i> ${restaurant.deliveryTime || '20-35 min'}</span>
            <span class="delivery-fee"><i class="bi bi-truck"></i> ${restaurant.deliveryFee || 'Gratis'}</span>
          </div>
          <button class="btn btn-primary w-100 mt-2" onclick="viewRestaurant(${restaurant.id})">Ver Menú</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Inicializa el comportamiento del botón "Cargar Más Restaurantes".
 * @param {Object} opts - Opciones: { buttonSelector, containerSelector, batchSize }
 */
function initLoadMoreRestaurants(opts = {}) {
  const buttonSelector = opts.buttonSelector || '#loadMoreRestaurants';
  const containerSelector = opts.containerSelector || '#restaurantsList';
  const batchSize = typeof opts.batchSize === 'number' ? opts.batchSize : 6;
  function attach() {
    const btn = document.querySelector(buttonSelector);
    const container = document.querySelector(containerSelector);
    if (!btn || !container) return;

    // Añadir hint si no existe
    if (!btn.getAttribute('title')) {
      btn.setAttribute('title', 'Click: cargar más. Shift+Click: ver previsualización de todos');
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const all = window._CURRENT_RESTAURANTS || getAllRestaurants();
      const already = container.querySelectorAll('.restaurant-card').length;

      // Si el usuario mantiene Shift, abrir previsualización modal con todos
      if (e.shiftKey || btn.dataset.preview === 'true') {
        openRestaurantsPreviewModal(all);
        return;
      }

      if (already >= all.length) {
        // Ya mostró todo
        btn.disabled = true;
        btn.textContent = 'No hay más restaurantes';
        return;
      }

      // Calcular siguientes batch
  const next = all.slice(already, already + batchSize);
      const fragment = document.createDocumentFragment();
      const temp = document.createElement('div');
      next.forEach(r => {
        temp.innerHTML = createRestaurantCardHTML(r);
        // temp may contain multiple nodes (the wrapper col)
        Array.from(temp.children).forEach(node => fragment.appendChild(node));
      });

      container.appendChild(fragment);

      // Si ya no quedan, deshabilitar y cambiar texto
      const newCount = container.querySelectorAll('.restaurant-card').length;
      if (newCount >= all.length) {
        btn.disabled = true;
        btn.textContent = 'Todos los restaurantes cargados';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
}

/** Modal de previsualización de restaurantes (muestra todos en un grid) */
function openRestaurantsPreviewModal(restaurants) {
  if (!Array.isArray(restaurants)) restaurants = getAllRestaurants();

  // Reusar si ya existe
  let modal = document.getElementById('restaurantsPreviewModal');
  if (!modal) {
    const html = `
      <div id="restaurantsPreviewModal" class="preview-modal-overlay" aria-hidden="true">
        <div class="preview-modal large" role="dialog" aria-modal="true" aria-labelledby="restaurantsPreviewTitle">
          <button class="preview-close" aria-label="Cerrar">&times;</button>
          <div class="preview-body">
            <h4 id="restaurantsPreviewTitle">Todos los Restaurantes</h4>
            <div class="restaurants-preview-grid row" style="gap:12px; margin-top:12px"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    modal = document.getElementById('restaurantsPreviewModal');

    modal.querySelector('.preview-close').addEventListener('click', () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
    });

    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.remove('active'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow='auto'; } });
  }

  const grid = modal.querySelector('.restaurants-preview-grid');
  grid.innerHTML = '';

  restaurants.forEach(r => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg-3 mb-3';
    col.innerHTML = `
      <div class="small-restaurant-card">
        <img src="${r.image}" alt="${r.name}" style="width:100%; height:120px; object-fit:cover; border-radius:8px;">
        <div style="padding:6px">
          <div class="fw-bold">${r.name}</div>
          <div class="text-muted small">${r.category || ''}</div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });

  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}

/**
 * Mostrar modal informando que la acción requiere autenticación
 * @param {string} message
 */
function openAuthRequiredModal(message = 'Debes iniciar sesión para comprar') {
  // Reusar si ya existe
  let modal = document.getElementById('authRequiredModal');
  if (!modal) {
    const html = `
      <div id="authRequiredModal" class="preview-modal-overlay" aria-hidden="true">
        <div class="preview-modal" role="dialog" aria-modal="true">
          <button class="preview-close" aria-label="Cerrar">&times;</button>
          <div class="preview-body text-center">
            <h4>Acceso requerido</h4>
            <p class="mt-2 mb-3">${message}</p>
            <div class="d-flex justify-content-center gap-2">
              <button class="btn btn-danger btn-go-login">Iniciar sesión</button>
              <button class="btn btn-outline-secondary btn-close-auth">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    modal = document.getElementById('authRequiredModal');

    modal.querySelector('.preview-close').addEventListener('click', () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
    });

    modal.querySelector('.btn-close-auth').addEventListener('click', () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
    });

    modal.querySelector('.btn-go-login').addEventListener('click', () => {
      try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (e) {}
      window.location.href = '/login';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // actualizar mensaje por si fue llamado con distinto texto
  const bodyP = modal.querySelector('.preview-body p');
  if (bodyP) bodyP.textContent = message;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

// Exportar funciones (para uso modular si se necesita)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    isAuthenticated,
    getToken,
    getUser,
    hasRole,
    logout,
    requireAuth,
    requireRole,
    authenticatedFetch,
    formatPrice,
    formatDate,
    showToast,
    isValidEmail,
    isValidPhone,
    debounce,
    getUrlParameter,
  };
}
