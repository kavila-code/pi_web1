// DomiTuluá - Restaurant Menu JavaScript

let restaurant = null;
let allProducts = [];
let selectedProduct = null;
let modalQuantity = 1;
let restaurantId = null;


// Obtener ID del restaurante desde la URL (no forzamos login aquí para permitir
// ver menús públicamente; la acción de agregar al carrito seguirá requiriendo auth).
const urlParams = new URLSearchParams(window.location.search);
restaurantId = urlParams.get("id");

if (!restaurantId) {
  alert("Restaurante no especificado");
  window.location.href = "/public/restaurants.html";
}

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadRestaurant();
  updateCartBadge();

  // Event listeners
  const searchProducts = document.getElementById("searchProducts");
  const filterVegetarian = document.getElementById("filterVegetarian");
  const filterVegan = document.getElementById("filterVegan");

  if (searchProducts) searchProducts.addEventListener("input", filterProducts);
  if (filterVegetarian) filterVegetarian.addEventListener("change", filterProducts);
  if (filterVegan) filterVegan.addEventListener("change", filterProducts);
});

// Cargar datos del restaurante
async function loadRestaurant() {
  try {
    // Intentar primero una petición pública (sin token). Algunos backends
    // permiten lectura pública de restaurantes. Si falla o responde 401/403,
    // intentamos authenticatedFetch cuando haya token.
    let data = null;
    try {
      const resp = await fetch(`http://localhost:3000/api/v1/restaurants/${restaurantId}`);
      data = await resp.json();
    } catch (err) {
      console.debug('Petición pública al restaurante falló:', err);
      data = null;
    }

    // Si la petición pública no devolvió datos válidos, y hay token, intentar con authenticatedFetch
    if ((!data || !data.ok) && getToken()) {
      try {
        data = await authenticatedFetch(`http://localhost:3000/api/v1/restaurants/${restaurantId}`);
      } catch (err) {
        console.debug('authenticatedFetch fallo:', err);
        data = null;
      }
    }

    if (data && data.ok) {
      restaurant = data.data;
      renderRestaurantHeader();
      loadProducts();
      return;
    }

    // Si llegamos aquí, la API no devolvió el restaurante. Intentar fallback local
    console.warn('API no devolvió restaurante, intentando fallback local');
    const localSource = window._CURRENT_RESTAURANTS || (typeof getAllRestaurants === 'function' ? getAllRestaurants() : []);
    const found = Array.isArray(localSource) ? localSource.find(r => String(r.id) === String(restaurantId)) : null;
    if (found) {
      // Mapear campos del fallback a la estructura esperada por la UI
      restaurant = {
        id: found.id,
        name: found.name || found.title || `Restaurante ${found.id}`,
        description: found.category || found.description || '',
        rating: found.rating || 0,
        delivery_time: (found.deliveryTimeMin ? `${found.deliveryTimeMin}-${found.deliveryTimeMin + 15} min` : found.delivery_time) || '30-45 min',
        delivery_fee: found.deliveryFee || found.delivery_fee || 0,
        logo_url: found.image || found.logo_url || ''
      };

      renderRestaurantHeader();
      // No tenemos un listado de productos locales aquí; mostrar mensaje vacío
      const container = document.getElementById('productsContainer');
      if (container) {
        container.innerHTML = `
          <div class="text-center py-5">
            <i class="bi bi-exclamation-circle" style="font-size: 3rem; color: #ddd;"></i>
            <p class="mt-3 text-muted">No hay productos disponibles para este restaurante (modo offline)</p>
          </div>
        `;
      }
      return;
    }

    alert('Error al cargar el restaurante');
    window.location.href = '/public/restaurants.html';
  } catch (error) {
    console.error("Error:", error);
    // Intentar fallback local también en caso de excepción
    const localSource = window._CURRENT_RESTAURANTS || (typeof getAllRestaurants === 'function' ? getAllRestaurants() : []);
    const found = Array.isArray(localSource) ? localSource.find(r => String(r.id) === String(restaurantId)) : null;
    if (found) {
      restaurant = {
        id: found.id,
        name: found.name || found.title || `Restaurante ${found.id}`,
        description: found.category || found.description || '',
        rating: found.rating || 0,
        delivery_time: (found.deliveryTimeMin ? `${found.deliveryTimeMin}-${found.deliveryTimeMin + 15} min` : found.delivery_time) || '30-45 min',
        delivery_fee: found.deliveryFee || found.delivery_fee || 0,
        logo_url: found.image || found.logo_url || ''
      };
      renderRestaurantHeader();
      const container = document.getElementById('productsContainer');
      if (container) {
        container.innerHTML = `
          <div class="text-center py-5">
            <i class="bi bi-exclamation-circle" style="font-size: 3rem; color: #ddd;"></i>
            <p class="mt-3 text-muted">No hay productos disponibles para este restaurante (modo offline)</p>
          </div>
        `;
      }
      return;
    }

    alert('Error al cargar el restaurante');
    window.location.href = '/public/restaurants.html';
  }
}

// Renderizar header del restaurante
function renderRestaurantHeader() {
  const logoElement = document.getElementById("restaurantLogo");
  const nameElement = document.getElementById("restaurantName");
  const descriptionElement = document.getElementById("restaurantDescription");
  const ratingElement = document.getElementById("restaurantRating");
  const timeElement = document.getElementById("restaurantTime");
  const feeElement = document.getElementById("restaurantFee");

  if (logoElement) logoElement.src = restaurant.logo_url || "https://via.placeholder.com/100";
  if (nameElement) nameElement.textContent = restaurant.name;
  if (descriptionElement) descriptionElement.textContent = restaurant.description || "";
  if (ratingElement) ratingElement.textContent = restaurant.rating || "0";
  if (timeElement) timeElement.textContent = restaurant.delivery_time || "30-45 min";
  if (feeElement) feeElement.textContent = (restaurant.delivery_fee || 0).toLocaleString();
  
  document.title = `${restaurant.name} - DomiTulua`;
}

// Cargar productos
async function loadProducts() {
  try {
    const data = await authenticatedFetch(`http://localhost:3000/api/v1/restaurants/${restaurantId}/products`);
    if (!data) return; // authenticatedFetch handled logout or error

    if (data.ok) {
      allProducts = data.data;
      loadCategories();
      renderProducts();
    } else {
      const container = document.getElementById("productsContainer");
      if (container) {
        container.innerHTML = `
          <div class="text-center py-5">
              <i class="bi bi-exclamation-circle" style="font-size: 3rem; color: #ddd;"></i>
              <p class="mt-3 text-muted">No hay productos disponibles</p>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Cargar categorías
async function loadCategories() {
  try {
  const data = await authenticatedFetch(`http://localhost:3000/api/v1/restaurants/${restaurantId}/products/categories`);
  if (!data) return;

  if (data.ok && data.data.length > 0) {
      const container = document.getElementById("categoriesMenu");
      if (!container) return;
      
      container.innerHTML = `
        <a href="#all" class="category-link active" onclick="scrollToCategory(event, 'all')">
            <i class="bi bi-grid"></i> Todos
        </a>
      `;

      data.data.forEach((cat) => {
        const link = document.createElement("a");
        link.href = `#${cat.category}`;
        link.className = "category-link";
        link.textContent = cat.category;
        link.onclick = (e) => scrollToCategory(e, cat.category);
        container.appendChild(link);
      });

      const categoryNav = document.getElementById("categoryNav");
      if (categoryNav) categoryNav.style.display = "block";
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Scroll a categoría
function scrollToCategory(e, category) {
  e.preventDefault();
  document.querySelectorAll(".category-link").forEach((link) => link.classList.remove("active"));
  e.target.classList.add("active");

  if (category === "all") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

// Renderizar productos
function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  // Agrupar por categoría
  const byCategory = allProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  container.innerHTML = Object.entries(byCategory)
    .map(
      ([category, products]) => `
        <div class="mb-5" id="category-${category}">
            <h4 class="fw-bold mb-4">${category}</h4>
            <div class="row g-4">
                ${products.map((product) => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card product-card border-0 shadow-sm ${!product.is_available ? "position-relative" : ""}" 
                             onclick="${product.is_available ? `openProductModal(${product.id})` : ""}">
                            <div class="position-relative">
                                <img src="${product.image_url || "https://via.placeholder.com/300x180?text=Producto"}" 
                                     class="product-image" alt="${product.name}">
                                ${product.is_vegetarian ? '<span class="product-badge badge-vegetarian"><i class="bi bi-leaf"></i> Vegetariano</span>' : ""}
                                ${product.is_vegan ? '<span class="product-badge badge-vegan"><i class="bi bi-flower1"></i> Vegano</span>' : ""}
                                ${!product.is_available ? '<div class="unavailable-overlay">No Disponible</div>' : ""}
                            </div>
                            <div class="card-body">
                                <h5 class="card-title fw-bold">${product.name}</h5>
                                <p class="text-muted small">${product.description || "Delicioso producto"}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="price-tag">$${product.price.toLocaleString()}</span>
                                    ${product.is_available ? `
                                        <button class="btn add-to-cart-btn" onclick="event.stopPropagation(); quickAddToCart(${product.id})">
                                            <i class="bi bi-plus-lg"></i>
                                        </button>
                                    ` : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
    `
    )
    .join("");
}

// Filtrar productos
function filterProducts() {
  const searchInput = document.getElementById("searchProducts");
  const vegetarianCheck = document.getElementById("filterVegetarian");
  const veganCheck = document.getElementById("filterVegan");

  const search = searchInput ? searchInput.value.toLowerCase() : "";
  const vegetarian = vegetarianCheck ? vegetarianCheck.checked : false;
  const vegan = veganCheck ? veganCheck.checked : false;

  let filtered = [...allProducts];

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
    );
  }

  if (vegetarian) {
    filtered = filtered.filter((p) => p.is_vegetarian);
  }

  if (vegan) {
    filtered = filtered.filter((p) => p.is_vegan);
  }

  allProducts = filtered;
  renderProducts();
}

// Abrir modal de producto
function openProductModal(productId) {
  selectedProduct = allProducts.find((p) => p.id === productId);
  if (!selectedProduct) return;

  modalQuantity = 1;

  const modalImage = document.getElementById("modalProductImage");
  const modalName = document.getElementById("modalProductName");
  const modalDescription = document.getElementById("modalProductDescription");
  const modalPrice = document.getElementById("modalProductPrice");
  const modalQty = document.getElementById("modalQuantity");
  const modalTotal = document.getElementById("modalTotalPrice");
  const specialInst = document.getElementById("specialInstructions");
  const modalBadges = document.getElementById("modalProductBadges");

  if (modalImage) modalImage.src = selectedProduct.image_url || "https://via.placeholder.com/300";
  if (modalName) modalName.textContent = selectedProduct.name;
  if (modalDescription) modalDescription.textContent = selectedProduct.description || "";
  if (modalPrice) modalPrice.textContent = selectedProduct.price.toLocaleString();
  if (modalQty) modalQty.textContent = "1";
  if (modalTotal) modalTotal.textContent = selectedProduct.price.toLocaleString();
  if (specialInst) specialInst.value = "";

  // Badges
  if (modalBadges) {
    const badges = [];
    if (selectedProduct.is_vegetarian) badges.push('<span class="badge bg-success">Vegetariano</span>');
    if (selectedProduct.is_vegan) badges.push('<span class="badge bg-success">Vegano</span>');
    modalBadges.innerHTML = badges.join(" ");
  }

  const modalElement = document.getElementById("productModal");
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
}

// Aumentar cantidad
function increaseQuantity() {
  modalQuantity++;
  updateModalPrice();
}

// Disminuir cantidad
function decreaseQuantity() {
  if (modalQuantity > 1) {
    modalQuantity--;
    updateModalPrice();
  }
}

// Actualizar precio en modal
function updateModalPrice() {
  const modalQty = document.getElementById("modalQuantity");
  const modalTotal = document.getElementById("modalTotalPrice");
  
  if (modalQty) modalQty.textContent = modalQuantity;
  if (modalTotal && selectedProduct) {
    const total = selectedProduct.price * modalQuantity;
    modalTotal.textContent = total.toLocaleString();
  }
}

// Agregar al carrito desde modal
function addToCart() {
  // Comprobar autenticación antes de permitir agregar
  const tokenCheck = localStorage.getItem('token');
  console.log('restaurant-menu.addToCart called, token=', tokenCheck);
  if (!tokenCheck) {
    try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (e) {}
    window.location.href = '/login';
    return;
  }

  // Si cart.js está cargado, usar su API
  if (window.cartAPI && window.cartAPI.addToCart) {
    const specialInst = document.getElementById("specialInstructions");
    const specialInstructions = specialInst ? specialInst.value.trim() : "";

    const cartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image_url,
      qty: modalQuantity,
      restaurant_id: restaurantId,
      restaurant_name: restaurant.name,
      special_instructions: specialInstructions || null
    };

    window.cartAPI.addToCart(cartItem);
    updateCartBadge();
    showToast(`${selectedProduct.name} agregado al carrito`);

    const modalElement = document.getElementById("productModal");
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) modalInstance.hide();
    }
    return;
  }

  // Fallback al comportamiento anterior
  const cart = JSON.parse(localStorage.getItem("cart_items_v1") || "[]");
  const specialInst = document.getElementById("specialInstructions");
  const specialInstructions = specialInst ? specialInst.value.trim() : "";

  // Verificar si el producto es del mismo restaurante
  if (cart.length > 0 && cart[0].restaurant_id !== restaurantId) {
    if (!confirm("Tu carrito tiene productos de otro restaurante. ¿Deseas vaciarlo y agregar este producto?")) {
      return;
    }
  if (!setCartSafe([])) return;
    cart.length = 0;
  }

  // Buscar si ya existe
  const existingIndex = cart.findIndex(
    (item) =>
      item.id === selectedProduct.id &&
      item.special_instructions === specialInstructions
  );

  if (existingIndex >= 0) {
    cart[existingIndex].qty += modalQuantity;
  } else {
    cart.push({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image_url,
      qty: modalQuantity,
      special_instructions: specialInstructions || null,
      restaurant_id: restaurantId,
      restaurant_name: restaurant.name,
    });
  }

  if (!setCartSafe(cart)) return;
  updateCartBadge();
  showToast(`${selectedProduct.name} agregado al carrito`);

  const modalElement = document.getElementById("productModal");
  if (modalElement) {
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
  }
}

// Agregar rápido al carrito (sin modal)
function quickAddToCart(productId) {
  // Comprobar autenticación antes de permitir agregar
  const tokenCheck = localStorage.getItem('token');
  console.log('restaurant-menu.quickAddToCart called, token=', tokenCheck, 'productId=', productId);
  if (!tokenCheck) {
    try { sessionStorage.setItem('afterLoginRedirect', window.location.href); } catch (e) {}
    window.location.href = '/login';
    return;
  }
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  // Si cart.js está cargado, usar su API
  if (window.cartAPI && window.cartAPI.addToCart) {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      qty: 1,
      restaurant_id: restaurantId,
      restaurant_name: restaurant.name
    };

    window.cartAPI.addToCart(cartItem);
    updateCartBadge();
    showToast(`${product.name} agregado al carrito`);
    return;
  }

  // Fallback al comportamiento anterior
  const cart = JSON.parse(localStorage.getItem("cart_items_v1") || "[]");

  // Verificar restaurante
  if (cart.length > 0 && cart[0].restaurant_id !== restaurantId) {
    openProductModal(productId);
    return;
  }

  const existingIndex = cart.findIndex((item) => item.id === product.id);

  if (existingIndex >= 0) {
    cart[existingIndex].qty++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      qty: 1,
      restaurant_id: restaurantId,
      restaurant_name: restaurant.name,
    });
  }

  if (!setCartSafe(cart)) return;
  updateCartBadge();
  showToast(`${product.name} agregado al carrito`);
}

  const existingIndex = cart.findIndex(
    (item) => item.product_id === productId && !item.special_instructions
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image_url,
      quantity: 1,
      special_instructions: null,
      restaurant_id: restaurantId,
      restaurant_name: restaurant.name,
    });
  }

  if (!setCartSafe(cart)) return;
  updateCartBadge();
  showToast(`${product.name} agregado al carrito`);
}

// Actualizar badge del carrito
function updateCartBadge() {
  // Usar cart_items_v1 para compatibilidad con cart.js
  const cart = JSON.parse(localStorage.getItem("cart_items_v1") || "[]");
  const badge = document.getElementById("cartBadge");
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  if (badge) {
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  // También actualizar el contador en el navbar si existe
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Ir al carrito
function goToCart() {
  window.location.href = "/public/cart.html";
}

// Mostrar toast
function showToast(message) {
  const toastMessage = document.getElementById("toastMessage");
  const toastElement = document.getElementById("successToast");
  
  if (toastMessage) toastMessage.textContent = message;
  if (toastElement) {
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }
}
