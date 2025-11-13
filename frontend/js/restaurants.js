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
    console.log('Intentando cargar restaurantes desde API...');
    const data = await authenticatedFetch("http://localhost:3000/api/v1/restaurants");
    console.log('Respuesta de API:', data);

    // Si la API responde con datos, usarla como fuente de la verdad
    if (data && data.ok && Array.isArray(data.data) && data.data.length > 0) {
      console.log('Restaurantes cargados desde API:', data.data.length);
      allRestaurants = data.data;
    } else {
      console.log('API no devolvió datos válidos, usando tarjetas estáticas');
      // Si la API no responde o devuelve vacío, usar las tarjetas estáticas
      // que están en el HTML como fallback visual.
      if (containerEl) {
        const staticCards = Array.from(containerEl.querySelectorAll('.restaurant-card'));
        console.log('Tarjetas estáticas encontradas:', staticCards.length);
        if (staticCards.length > 0) {
          allRestaurants = staticCards.map((card, idx) => {
            const img = card.querySelector('img');
            const name = card.querySelector('.restaurant-content h4')?.textContent.trim() || `Restaurante ${idx + 1}`;
            const description = card.querySelector('.restaurant-description')?.textContent.trim() || '';
            const ratingText = card.querySelector('.restaurant-rating span')?.textContent.trim();
            const rating = ratingText ? parseFloat(ratingText) : null;
            const deliveryTimeText = card.querySelector('.delivery-time')?.textContent.trim() || '';
            // extraer números del tiempo (ej. "30-45 min")
            const delivery_time = deliveryTimeText.replace(/[^0-9\-]/g, '') || '';
            const deliveryFeeText = card.querySelector('.delivery-cost')?.textContent.trim() || '';
            const feeMatch = deliveryFeeText.match(/[0-9\.,]+/);
            const delivery_fee = feeMatch ? parseInt(feeMatch[0].replace(/\./g, '').replace(/,/g, '')) : 0;
            const logo_url = img ? img.getAttribute('src') : '';
            // intentar tomar un id desde data-id si el HTML lo tiene, si no usar índice + 1
            const id = card.dataset.id ? card.dataset.id : idx + 1;

            return {
              id,
              name,
              description,
              rating,
              delivery_time,
              delivery_fee,
              logo_url,
            };
          });
          console.log('Restaurantes parseados desde tarjetas:', allRestaurants);
        } else {
          // No hay datos y no hay fallback estático: mostrar error
          showError('Error al cargar restaurantes');
        }
      } else {
        showError('Error al cargar restaurantes');
      }
    }

    filteredRestaurants = [...allRestaurants];
    console.log('Renderizando restaurantes, total:', filteredRestaurants.length);
    renderRestaurants();
  } catch (error) {
    console.error("Error:", error);
    // En caso de excepción, intentar usar el contenido estático ya presente
    if (containerEl) {
      const staticCards = Array.from(containerEl.querySelectorAll('.restaurant-card'));
      if (staticCards.length > 0) {
        allRestaurants = staticCards.map((card, idx) => {
          const img = card.querySelector('img');
          const name = card.querySelector('.restaurant-content h4')?.textContent.trim() || `Restaurante ${idx + 1}`;
          const description = card.querySelector('.restaurant-description')?.textContent.trim() || '';
          const ratingText = card.querySelector('.restaurant-rating span')?.textContent.trim();
          const rating = ratingText ? parseFloat(ratingText) : null;
          const deliveryTimeText = card.querySelector('.delivery-time')?.textContent.trim() || '';
          const delivery_time = deliveryTimeText.replace(/[^0-9\-]/g, '') || '';
          const deliveryFeeText = card.querySelector('.delivery-cost')?.textContent.trim() || '';
          const feeMatch = deliveryFeeText.match(/[0-9\.,]+/);
          const delivery_fee = feeMatch ? parseInt(feeMatch[0].replace(/\./g, '').replace(/,/g, '')) : 0;
          const logo_url = img ? img.getAttribute('src') : '';
          const id = card.dataset.id ? card.dataset.id : idx + 1;

          return {
            id,
            name,
            description,
            rating,
            delivery_time,
            delivery_fee,
            logo_url,
          };
        });

        filteredRestaurants = [...allRestaurants];
        renderRestaurants();
      } else {
        showError("Error de conexión");
      }
    } else {
      showError("Error de conexión");
    }
  } finally {
    if (loadingEl) loadingEl.style.display = "none";
  }
}

// Renderizar restaurantes
function renderRestaurants() {
  const container = document.getElementById("restaurantsContainer");
  if (!container) {
    console.error('No se encontró el contenedor restaurantsContainer');
    return;
  }

  console.log('Renderizando restaurantes, cantidad:', filteredRestaurants.length);

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
      (restaurant) => {
        const imageUrl = restaurant.logo_url || restaurant.image_url || "https://via.placeholder.com/400x250";
        console.log('Renderizando restaurante:', restaurant.name, 'imagen:', imageUrl);
        return `
        <div class="col-md-6 col-lg-4">
          <div class="card restaurant-card" onclick="goToMenu(${restaurant.id})">
            <div class="position-relative">
              <img src="${imageUrl}" 
                   class="card-img-top" alt="${restaurant.name}"
                   onerror="this.src='https://via.placeholder.com/400x250?text=Sin+Imagen'">
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
        `;
      }
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
