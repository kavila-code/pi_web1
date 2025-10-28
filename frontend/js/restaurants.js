// DomiTuluá - Restaurants List JavaScript

let allRestaurants = [];
let filteredRestaurants = [];
let currentFilter = "all";
let currentSort = "rating";

// Verificar autenticación
if (!requireAuth()) {
  // requireAuth() ya redirige a login si no está autenticado
}

// Cargar restaurantes al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadRestaurants();
  setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
  const searchInput = document.getElementById("searchRestaurants");
  const sortSelect = document.getElementById("sortBy");
  
  if (searchInput) {
    searchInput.addEventListener("input", debounce(filterRestaurants, 300));
  }
  
  if (sortSelect) {
    sortSelect.addEventListener("change", sortRestaurants);
  }
}

// Cargar restaurantes
async function loadRestaurants() {
  const loadingEl = document.getElementById("loading");
  const containerEl = document.getElementById("restaurantsContainer");
  
  if (loadingEl) loadingEl.style.display = "block";

  try {
    const data = await authenticatedFetch("http://localhost:3000/api/v1/restaurants");

    if (data && data.ok) {
      allRestaurants = data.data;
      filteredRestaurants = [...allRestaurants];
      renderRestaurants();
    } else {
      showError("Error al cargar restaurantes");
    }
  } catch (error) {
    console.error("Error:", error);
    showError("Error de conexión");
  } finally {
    if (loadingEl) loadingEl.style.display = "none";
  }
}

// Renderizar restaurantes
function renderRestaurants() {
  const container = document.getElementById("restaurantsContainer");
  if (!container) return;

  if (filteredRestaurants.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search" style="font-size: 4rem; color: #ddd;"></i>
        <p class="mt-3 text-muted">No se encontraron restaurantes</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredRestaurants
    .map(
      (restaurant) => `
        <div class="col-md-6 col-lg-4">
          <div class="card restaurant-card" onclick="goToMenu(${restaurant.id})">
            <div class="position-relative">
              <img src="${restaurant.logo_url || "https://via.placeholder.com/400x250"}" 
                   class="card-img-top" alt="${restaurant.name}">
              ${restaurant.is_open ? '<span class="badge-open">Abierto</span>' : '<span class="badge-closed">Cerrado</span>'}
            </div>
            <div class="card-body">
              <h5 class="card-title">${restaurant.name}</h5>
              <p class="card-text text-muted">${restaurant.description || ""}</p>
              <div class="restaurant-info">
                <span><i class="bi bi-star-fill text-warning"></i> ${restaurant.rating || "N/A"}</span>
                <span><i class="bi bi-clock"></i> ${restaurant.delivery_time || "30-45"} min</span>
                <span><i class="bi bi-cash"></i> $${(restaurant.delivery_fee || 0).toLocaleString()}</span>
              </div>
              ${restaurant.minimum_order ? `<p class="text-muted small mt-2">Pedido mínimo: $${restaurant.minimum_order.toLocaleString()}</p>` : ""}
            </div>
          </div>
        </div>
    `
    )
    .join("");
}

// Filtrar restaurantes
function filterRestaurants() {
  const searchInput = document.getElementById("searchRestaurants");
  const search = searchInput ? searchInput.value.toLowerCase() : "";

  filteredRestaurants = allRestaurants.filter((r) => {
    const matchesSearch = !search || 
      r.name.toLowerCase().includes(search) ||
      r.description?.toLowerCase().includes(search);
    
    const matchesFilter = currentFilter === "all" ||
      (currentFilter === "open" && r.is_open) ||
      (currentFilter === "closed" && !r.is_open);

    return matchesSearch && matchesFilter;
  });

  sortRestaurants();
}

// Ordenar restaurantes
function sortRestaurants() {
  const sortSelect = document.getElementById("sortBy");
  currentSort = sortSelect ? sortSelect.value : "rating";

  filteredRestaurants.sort((a, b) => {
    switch (currentSort) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "delivery_time":
        return (parseInt(a.delivery_time) || 45) - (parseInt(b.delivery_time) || 45);
      case "delivery_fee":
        return (a.delivery_fee || 0) - (b.delivery_fee || 0);
      default:
        return 0;
    }
  });

  renderRestaurants();
}

// Cambiar filtro
function setFilter(filter) {
  currentFilter = filter;
  
  // Actualizar botones
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  filterRestaurants();
}

// Ir al menú del restaurante
function goToMenu(restaurantId) {
  window.location.href = `/public/restaurant-menu.html?id=${restaurantId}`;
}

// Mostrar error
function showError(message) {
  const container = document.getElementById("restaurantsContainer");
  if (container) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">${message}</div>
      </div>
    `;
  }
}
