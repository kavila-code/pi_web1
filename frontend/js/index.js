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
function addToCart() {
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
