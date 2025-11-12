// DomiTuluá - Index Page JavaScript

// Navbar scroll effect
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  const scrollPosition = window.scrollY;

  if (scrollPosition > 100) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Función para abrir el formulario de registro de restaurantes
function openRestaurantRegistration(event) {
  event.preventDefault();
  
  const modalHTML = `
    <div class="modal fade" id="restaurantRegisterModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-warning text-white">
            <h5 class="modal-title">
              <i class="bi bi-shop"></i> Registra tu Restaurante
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-3">
              <i class="bi bi-shop-window" style="font-size: 3rem; color: var(--orange-accent);"></i>
            </div>
            <h6 class="text-center mb-3">¡Únete a DomiTuluá!</h6>
            <p class="text-center">
              Aumenta las ventas de tu restaurante llegando a más clientes en Tuluá.
            </p>
            <div class="alert alert-info">
              <strong>Beneficios:</strong>
              <ul class="mb-0 mt-2">
                <li>Mayor visibilidad para tu negocio</li>
                <li>Sistema de pedidos en línea</li>
                <li>Gestión de menú digital</li>
                <li>Estadísticas de ventas</li>
              </ul>
            </div>
            <div class="d-grid gap-2 mt-3">
              <a href="/public/register-restaurant.html" class="btn btn-warning btn-lg">
                <i class="bi bi-pencil-square"></i> Registrar mi restaurante
              </a>
              <p class="text-muted small text-center mb-0">
                Completa un formulario rápido y nos pondremos en contacto contigo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Insertar modal si no existe
  if (!document.getElementById('restaurantRegisterModal')) {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('restaurantRegisterModal'));
  modal.show();
}

// Scroll suave para los enlaces del navbar
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Añadir IDs a las secciones para el scroll suave
document.addEventListener("DOMContentLoaded", function () {
  // Añadir ID a la sección hero
  const heroSection = document.querySelector(".hero-section");
  if (heroSection && !heroSection.id) {
    heroSection.id = "inicio";
  }

  // Añadir ID a la sección de servicios
  const servicesSection = document.querySelector(".services-section");
  if (servicesSection && !servicesSection.id) {
    servicesSection.id = "servicios";
  }
});

// Funcionalidad del buscador
const searchInput = document.getElementById("mainSearch");
const searchBtn = document.querySelector(".search-btn");
const suggestionTags = document.querySelectorAll(".suggestion-tag");

// Detectar si estamos en la página raíz (homepage)
const IS_HOMEPAGE = (function() {
  try {
    const p = window.location.pathname || '';
    return p === '/' || p.endsWith('/index.html') || p.endsWith('/public/index.html');
  } catch (e) {
    return false;
  }
})();

// Función de búsqueda
function performSearch() {
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    console.log("Buscando:", searchTerm);
    alert(`Buscando: "${searchTerm}"\n¡Pronto tendremos resultados reales!`);
  }
}

// Event listeners para búsqueda
if (searchBtn) {
  searchBtn.addEventListener("click", performSearch);
}

if (searchInput) {
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // Efecto de foco en el input
  searchInput.addEventListener("focus", function () {
    this.parentElement.style.transform = "scale(1.02)";
  });

  searchInput.addEventListener("blur", function () {
    this.parentElement.style.transform = "scale(1)";
  });
}

// Funcionalidad de sugerencias
suggestionTags.forEach((tag) => {
  tag.addEventListener("click", function () {
    const suggestion = this.textContent.trim();
    searchInput.value = suggestion;
    searchInput.focus();
  });
});

// Funcionalidad del sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");

  // Prevenir scroll del body cuando sidebar está abierto
  if (sidebar.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}

// Cerrar sidebar con ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (sidebar.classList.contains("active")) {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  }
});

// Contador del carrito
let cartCount = 0;
function updateCartCount() {
  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
  }
}

// Agregar al carrito
// Agregar al carrito
function addToCart() {
  // Si no está autenticado, redirigir a login
  const token = localStorage.getItem('token');
  console.log('index.addToCart called, token=', token);
  if (!token) {
    // Mostrar aviso en vez de redirigir
    try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (e) {}
    showClaimToast('Debes iniciar sesión');
    return;
  }

  cartCount++;
  updateCartCount();
}

// Funcionalidad de filtros del menú
document.addEventListener("DOMContentLoaded", function () {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const menuItems = document.querySelectorAll(".menu-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remover clase active de todos los botones
      filterBtns.forEach((b) => b.classList.remove("active"));
      // Agregar clase active al botón clickeado
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");

      menuItems.forEach((item) => {
        const category = item.getAttribute("data-category");

        if (filter === "all" || category === filter) {
          item.style.display = "block";
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
          }, 10);
        } else {
          item.style.opacity = "0";
          item.style.transform = "scale(0.8)";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });
});

// --- Funcionalidad: botón 'Reclamar Oferta' (copiar código y mostrar toast) ---
function setupClaimPromoButtons() {
  document.querySelectorAll('.btn-claim-promo').forEach((btn) => {
    btn.addEventListener('click', function () {
      const promo = btn.closest('.promo-content');
      let code = '';
      const span = promo && promo.querySelector('.promo-code span');
      if (span) code = span.textContent.trim();
      if (!code) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
          showClaimToast('Código copiado: ' + code);
        }).catch(() => {
          showClaimToast('Copiado (falló clipboard API): ' + code);
        });
      } else {
        // Fallback simple
        try {
          const textarea = document.createElement('textarea');
          textarea.value = code;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'absolute';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
          showClaimToast('Código copiado: ' + code);
        } catch (e) {
          alert('Copia manualmente el código: ' + code);
        }
      }
    });
  });
}

function showClaimToast(msg) {
  const t = document.createElement('div');
  t.className = 'claim-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  // small delay to allow transition
  setTimeout(() => t.classList.add('visible'), 20);
  setTimeout(() => {
    t.classList.remove('visible');
    setTimeout(() => t.remove(), 300);
  }, 2400);
}

document.addEventListener('DOMContentLoaded', function () {
  setupClaimPromoButtons();
});

/* --- Preview modal for menu items --- */
function ensurePreviewModal() {
  if (document.getElementById('menuPreviewOverlay')) return;

  const html = `
  <div id="menuPreviewOverlay" class="preview-modal-overlay">
    <div class="preview-modal" role="dialog" aria-modal="true">
      <button class="preview-close" aria-label="Cerrar">&times;</button>
      <div class="preview-image">
        <img src="" alt="preview" />
      </div>
      <div class="preview-body">
        <h4 class="preview-title"></h4>
        <p class="preview-desc"></p>
        <div class="preview-price"></div>
        <div class="preview-actions">
          <button class="btn btn-primary btn-preview-order">Ordenar</button>
          <button class="btn btn-outline-secondary btn-preview-add">Agregar al carrito</button>
        </div>
      </div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const overlay = document.getElementById('menuPreviewOverlay');
  // Close handlers
  overlay.querySelector('.preview-close').addEventListener('click', () => closePreview());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePreview();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePreview();
  });

  // Actions
  overlay.querySelector('.btn-preview-add').addEventListener('click', function () {
    // En la homepage siempre mostrar el modal indicando que no estás autenticado
    if (IS_HOMEPAGE) {
      try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (e) {}
      try {
        if (typeof openAuthRequiredModal === 'function') {
          openAuthRequiredModal('Si no estás autenticado');
        } else {
          showClaimToast('Si no estás autenticado');
        }
      } catch (err) {
        showClaimToast('Si no estás autenticado');
      }
      return;
    }

    addToCart();
    showClaimToast('Agregado al carrito');
    closePreview();
  });
  overlay.querySelector('.btn-preview-order').addEventListener('click', function () {
    // En la homepage siempre mostrar el modal indicando que no estás autenticado
    if (IS_HOMEPAGE) {
      try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (e) {}
      try {
        if (typeof openAuthRequiredModal === 'function') {
          openAuthRequiredModal('Si no estás autenticado');
        } else {
          showClaimToast('Si no estás autenticado');
        }
      } catch (err) {
        showClaimToast('Si no estás autenticado');
      }
      return;
    }

    // Add to cart and show a confirmation — keep user on the preview modal flow
    addToCart();
    showClaimToast('Pedido agregado. Ve al carrito para completar.');
    closePreview();
  });
}

function openPreviewFromCard(card) {
  ensurePreviewModal();
  const overlay = document.getElementById('menuPreviewOverlay');
  const img = card.querySelector('.menu-image img');
  const title = card.querySelector('.menu-content h4');
  const desc = card.querySelector('.menu-content p');
  const price = card.querySelector('.menu-footer .price');

  const previewImg = overlay.querySelector('.preview-image img');
  const previewTitle = overlay.querySelector('.preview-title');
  const previewDesc = overlay.querySelector('.preview-desc');
  const previewPrice = overlay.querySelector('.preview-price');

  previewImg.src = img ? img.src : '';
  previewImg.alt = title ? title.textContent.trim() : 'Producto';
  previewTitle.textContent = title ? title.textContent.trim() : '';
  previewDesc.textContent = desc ? desc.textContent.trim() : '';
  previewPrice.textContent = price ? price.textContent.trim() : '';

  // Store values on overlay dataset so action buttons can read them
  overlay.dataset.img = previewImg.src;
  overlay.dataset.title = previewTitle.textContent;
  overlay.dataset.desc = previewDesc.textContent;
  overlay.dataset.price = previewPrice.textContent;

  overlay.classList.add('active');
  // prevent body scroll while modal is open
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  const overlay = document.getElementById('menuPreviewOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function setupMenuPreviews() {
  // attach handlers to cards
  const cards = document.querySelectorAll('.menu-item .menu-card');
  cards.forEach((card) => {
    // clicking the image or card opens the preview modal unless the click was on an internal button
    card.addEventListener('click', function (e) {
      const targetBtn = e.target.closest('button');
      if (targetBtn && (targetBtn.classList.contains('btn-add-cart') || targetBtn.classList.contains('btn-claim-promo'))) {
        return; // allow button handlers to run
      }
      openPreviewFromCard(card);
    });
    // ensure add-to-cart button doesn't open the preview
    const addBtn = card.querySelector('.btn-add-cart');
    if (addBtn) {
      addBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        // En la homepage siempre mostrar el modal indicando que no estás autenticado
        if (IS_HOMEPAGE) {
          try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (err) {}
          try {
            if (typeof openAuthRequiredModal === 'function') {
              openAuthRequiredModal('Si no estás autenticado');
            } else {
              showClaimToast('Si no estás autenticado');
            }
          } catch (err) {
            showClaimToast('Si no estás autenticado');
          }
          return;
        }

        addToCart();
        showClaimToast('Agregado al carrito');
      });
    }
  });
}

// initialize previews when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  setupMenuPreviews();
  // also attach handlers to 'Ver Menú' buttons to show the auth-required modal on homepage
  try {
    document.querySelectorAll('.btn-view-restaurant').forEach((btn) => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (err) {}
        try {
          if (typeof openAuthRequiredModal === 'function') {
            openAuthRequiredModal('Si no estás autenticado');
          } else {
            showClaimToast('Si no estás autenticado');
          }
        } catch (err) {
          showClaimToast('Si no estás autenticado');
        }
      });
    });
  } catch (e) {
    // ignore if DOM not ready or function missing
  }
});

// --- Guard global para botones de order/add que no tengan handler explícito ---
function setupAuthClickGuards() {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('button, a');
    if (!btn) return;

    const text = (btn.textContent || '').trim();

    // Determinar si el botón pretende 'Ordenar' o 'Agregar al carrito'
    const isOrderOrAdd = btn.classList.contains('btn-preview-order') ||
                         btn.classList.contains('btn-preview-add') ||
                         btn.classList.contains('btn-add-cart') ||
                         /\bOrdenar\b/i.test(text) ||
                         /\bOrdenar Ahora\b/i.test(text) ||
                         /\bAgregar al carrito\b/i.test(text);

    if (!isOrderOrAdd) return;

    // Comportamiento especial para la homepage: siempre mostrar modal indicando que no estás autenticado
    try {
      if (IS_HOMEPAGE) {
        try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (err) {}
        e.preventDefault();
        e.stopPropagation();
        try {
          if (typeof openAuthRequiredModal === 'function') {
            openAuthRequiredModal('Si no estás autenticado');
          } else {
            showClaimToast('Si no estás autenticado');
          }
        } catch (err) {
          showClaimToast('Si no estás autenticado');
        }
        return;
      }

      // Fuera de homepage: comportamiento previo (mostrar toast si no hay token)
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (err) {}
          e.preventDefault();
          e.stopPropagation();
          showClaimToast('Debes iniciar sesión');
        }
      } catch (err) {
        console.warn('Error comprobando autenticación:', err);
      }
    } catch (err) {
      // Si hay error accediendo a localStorage, no bloquear la acción
      console.warn('Error en setupAuthClickGuards:', err);
    }
  }, true); // useCapture true to run before other handlers
}

// Inicializar el guard cuando corresponda
document.addEventListener('DOMContentLoaded', function () {
  setupAuthClickGuards();
});

// --- Opción B: bloqueo contundente de botones de compra si no hay sesión ---
function enforceAuthOnInteractiveButtons() {
  const selectors = [
    '.btn-add-cart',
    '.btn-preview-add',
    '.btn-preview-order',
    '.add-to-cart-btn',
    '#btn-add-cart',
    '#side-add',
    '.add-to-cart-btn',
    'button.add-to-cart-btn',
    '.btn.btn-primary', // cubrir botones como 'Ordenar Ahora' (filtrar por texto luego)
  ];

  function isTargetPurchaseButton(el) {
    if (!el) return false;
    for (const sel of selectors) {
      if (el.matches && el.matches(sel)) return true;
    }
    // también por texto exacto
    const txt = (el.textContent || '').trim();
    if (/\bOrdenar Ahora\b/i.test(txt) || /\bAgregar al carrito\b/i.test(txt) || /\bOrdenar\b/i.test(txt)) return true;
    return false;
  }

  // Remove previous observer/listener if any
  if (window.__authButtonObserver) {
    try { window.__authButtonObserver.disconnect(); } catch (e) {}
    window.__authButtonObserver = null;
  }

  // click capture handler
  if (!window.__authClickBlocker) {
    window.__authClickBlocker = function (e) {
      try {
        const token = localStorage.getItem('token');
        if (token) return; // tiene sesión, no bloquear

        const btn = e.target.closest && e.target.closest('button, a');
        if (!btn) return;
        if (!isTargetPurchaseButton(btn)) return;

        // Bloquear acción y mostrar aviso
        e.preventDefault();
        e.stopImmediatePropagation();
        try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (err) {}
        showClaimToast('Debes iniciar sesión');
      } catch (err) {
        console.error('authClickBlocker error', err);
      }
    };
    document.addEventListener('click', window.__authClickBlocker, true);
  }

  // Function to disable UI buttons visually and via disabled attr
  function applyDisableToButtons(root = document) {
    const token = localStorage.getItem('token');
    const nodes = root.querySelectorAll(selectors.join(','));
    nodes.forEach((btn) => {
      // Skip if not actually a button element
      if (!(btn instanceof HTMLButtonElement || btn.tagName === 'A' || btn.matches('button'))) return;

      if (!token) {
        try { btn.disabled = true; } catch (e) {}
        btn.classList.add('auth-blocked');
        // ensure aria-disabled for accessibility
        btn.setAttribute('aria-disabled', 'true');
      } else {
        try { btn.disabled = false; } catch (e) {}
        btn.classList.remove('auth-blocked');
        btn.removeAttribute('aria-disabled');
      }
    });
  }

  // Apply initially
  applyDisableToButtons(document);

  // Observe DOM mutations to re-apply when menu items are rendered dynamically
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length > 0) {
        applyDisableToButtons(m.target || document);
      }
    }
    // also reapply globally just in case
    applyDisableToButtons(document);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  window.__authButtonObserver = observer;
}

// Ejecutar enforcement en DOM ready
document.addEventListener('DOMContentLoaded', function () {
  enforceAuthOnInteractiveButtons();
});

// Restaurant buttons keep default behavior (no redirect added)
