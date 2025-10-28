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
