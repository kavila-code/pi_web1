// Favorites functionality
let userFavoriteIds = [];
let _LAST_ADDED_FAVORITE_ID = null;

// Cargar IDs de favoritos del usuario
async function loadUserFavorites() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('/api/v1/favorites/ids', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      userFavoriteIds = data.data || [];
      updateFavoriteButtons();
      try {
        // Si existe un contenedor de favoritos en la página, renderizarlo
        if (document.querySelector('#favoritesGrid') && typeof renderFavoriteRestaurants === 'function') {
          renderFavoriteRestaurants('#favoritesGrid');
        }
      } catch (e) { console.warn('No se pudo renderizar favoritos aún:', e); }
    }
  } catch (error) {
    console.error('Error cargando favoritos:', error);
  }
}

// Toggle favorito
async function toggleFavorite(restaurantId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Debes iniciar sesión para agregar favoritos');
    window.location.href = '/login';
    return;
  }

  try {
    const response = await fetch('/api/v1/favorites/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ restaurantId: parseInt(restaurantId) })
    });

    const data = await response.json();

    if (response.ok) {
      // Actualizar lista local
      if (data.isFavorite) {
        if (!userFavoriteIds.includes(restaurantId)) {
          userFavoriteIds.push(restaurantId);
        }
        _LAST_ADDED_FAVORITE_ID = restaurantId;
      } else {
        userFavoriteIds = userFavoriteIds.filter(id => id !== restaurantId);
      }

      // Actualizar UI
      updateFavoriteButtons();
      // Re-renderizar la grilla de favoritos si existe
      try {
        if (document.querySelector('#favoritesGrid') && typeof renderFavoriteRestaurants === 'function') {
          renderFavoriteRestaurants('#favoritesGrid');
        }
      } catch (e) { console.warn('No se pudo actualizar la grilla de favoritos:', e); }
      
      // Mostrar mensaje
      showToast(data.message, 'success');
      // Si se marcó como favorito, llevar al usuario a la sección
      if (data.isFavorite) {
        try { scrollToFavorites(); } catch(e) {}
      }
    } else {
      throw new Error(data.message || 'Error al actualizar favorito');
    }
  } catch (error) {
    console.error('Error toggle favorito:', error);
    showToast('Error al actualizar favorito', 'error');
  }
}

// Actualizar botones de favoritos en la UI
function updateFavoriteButtons() {
  document.querySelectorAll('[data-restaurant-id]').forEach(element => {
    const restaurantId = parseInt(element.dataset.restaurantId);
    const icon = element.querySelector('i');
    
    if (userFavoriteIds.includes(restaurantId)) {
      icon.classList.remove('bi-heart');
      icon.classList.add('bi-heart-fill');
      element.classList.add('active');
    } else {
      icon.classList.remove('bi-heart-fill');
      icon.classList.add('bi-heart');
      element.classList.remove('active');
    }
  });
}

// Renderizar restaurantes favoritos en un contenedor
async function renderFavoriteRestaurants(containerSelector = '#favoritesGrid') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  try {
    container.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2">Cargando favoritos...</p></div>';

    const token = localStorage.getItem('token');
    let favs = [];
    // Intentar cargar lista enriquecida desde API
    if (token) {
      try {
        const res = await fetch('/api/v1/favorites', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const json = await res.json();
          const items = json.data || [];
          favs = items.map(it => ({
            id: it.restaurant_id,
            name: it.name,
            image: it.logo_url || '/frontend/placeholder-restaurant.svg',
            category: it.category || 'Varios',
            rating: parseFloat(it.avg_rating) || 0,
            reviews: parseInt(it.review_count) || 0,
            deliveryTime: `${it.delivery_time_min || 20}-${it.delivery_time_max || 45} min`,
            deliveryTimeMin: it.delivery_time_min || 20,
            deliveryFee: (it.delivery_cost === 0 || !it.delivery_cost) ? 'Gratis' : `$${parseFloat(it.delivery_cost).toLocaleString('es-CO')}`,
            created_at: it.created_at
          }));
          // Orden por fecha de favorito
          favs.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        }
      } catch (e) {
        console.warn('Fallo al cargar favoritos enriquecidos, usando IDs:', e);
      }
    }

    // Fallback a IDs si no hay datos enriquecidos
    if (!favs.length) {
      const all = (typeof getAllRestaurants === 'function') ? await getAllRestaurants() : [];
      favs = Array.isArray(userFavoriteIds) && userFavoriteIds.length > 0
        ? all.filter(r => userFavoriteIds.includes(r.id))
        : [];
    }

    container.innerHTML = '';
    if (!favs.length) {
      container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Aún no tienes restaurantes favoritos.</p><a class="btn btn-outline-primary mt-2" href="/public/restaurants.html"><i class="bi bi-shop"></i> Explorar restaurantes</a></div>';
      return;
    }

    // Construir tarjetas reutilizando el generador común
    const fragment = document.createDocumentFragment();
    const temp = document.createElement('div');
    favs.forEach(r => {
      if (typeof createRestaurantCardHTML === 'function') {
        temp.innerHTML = createRestaurantCardHTML(r);
      } else {
        // Fallback mínimo si no existe createRestaurantCardHTML
        temp.innerHTML = `
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="restaurant-card" onclick="location.href='/public/restaurant-menu.html?id=${r.id}'" style="cursor:pointer">
              <div class="restaurant-image">
                <img src="${r.image || '/frontend/placeholder-restaurant.svg'}" alt="${r.name}" onerror="this.src='/frontend/placeholder-restaurant.svg'" />
                <div class="favorite-toggle active" data-restaurant-id="${r.id}" onclick="event.stopPropagation();toggleFavorite(${r.id})">
                  <i class="bi bi-heart-fill"></i>
                </div>
              </div>
              <div class="restaurant-info">
                <h5>${r.name}</h5>
                <div class="restaurant-rating"><i class="bi bi-star-fill"></i><span>${r.rating || '4.5'}</span></div>
                <p class="restaurant-category">${r.category || 'Varios'}</p>
              </div>
            </div>
          </div>`;
      }
      Array.from(temp.children).forEach(node => fragment.appendChild(node));
    });
    container.appendChild(fragment);

    // Asegurar estado de corazones correcto
    updateFavoriteButtons();
    // Resaltar el último agregado
    if (_LAST_ADDED_FAVORITE_ID) {
      try {
        ensureFavoriteFlashStyles();
        const targetToggle = container.querySelector(`[data-restaurant-id="${_LAST_ADDED_FAVORITE_ID}"]`);
        if (targetToggle) {
          const card = targetToggle.closest('.restaurant-card');
          if (card) {
            card.classList.add('favorite-flash');
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => card.classList.remove('favorite-flash'), 1200);
          }
        }
      } catch (e) {}
      _LAST_ADDED_FAVORITE_ID = null;
    }
  } catch (e) {
    console.error('Error renderizando favoritos:', e);
    container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-danger">Error cargando favoritos</p></div>';
  }
}

function ensureFavoriteFlashStyles() {
  if (document.getElementById('favoriteFlashStyles')) return;
  const style = document.createElement('style');
  style.id = 'favoriteFlashStyles';
  style.textContent = `.favorite-flash { outline: 3px solid rgba(231,76,60,0.5); outline-offset: 2px; transition: outline 0.3s ease; }`;
  document.head.appendChild(style);
}

function scrollToFavorites() {
  const sec = document.getElementById('favoritos') || document.querySelector('#favoritesGrid');
  if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Inicializar favoritos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  if (token) {
    loadUserFavorites();
  }
  // Si hay contenedor de favoritos y aún no hay token, mostrar CTA
  if (document.querySelector('#favoritesGrid') && !token) {
    document.querySelector('#favoritesGrid').innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Inicia sesión para ver tus favoritos.</p><a class="btn btn-primary" href="/login">Iniciar sesión</a></div>';
  }
});

// Exponer funciones globalmente
window.toggleFavorite = toggleFavorite;
window.loadUserFavorites = loadUserFavorites;
window.renderFavoriteRestaurants = renderFavoriteRestaurants;
