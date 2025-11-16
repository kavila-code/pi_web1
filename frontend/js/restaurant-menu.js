// DomiTuluá - Restaurant Menu JavaScript
// Version: 2024-11-14 v2

let currentRestaurant = null;
let allProducts = [];
let selectedProduct = null;
let modalQuantity = 1;
let restaurantId = null;

// Normaliza la ruta del logo para coincidir con el mount de Express (/imagenes)
function normalizeLogo(path) {
  if (!path) return '';
  return path.replace(/^\/IMAGENES\/RESTAURANTES\//i, '/imagenes/restaurantes/');
}


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
  console.log('[restaurant-menu] DOM cargado, iniciando...');
  
  // Cargar restaurante
  loadRestaurant().catch(err => {
    console.error('[restaurant-menu] Error en loadRestaurant:', err);
  });
  
  // Actualizar badge del carrito (si la función existe)
  if (typeof updateCartBadge === 'function') {
    try {
      updateCartBadge();
    } catch (err) {
      console.warn('[restaurant-menu] Error al actualizar cart badge:', err);
    }
  }

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
  const container = document.getElementById("productsContainer");
  
  try {
    console.log('[restaurant-menu] Cargando restaurante id=', restaurantId);
    
    // Usar ruta relativa para evitar problemas de timeout
    const resp = await fetch(`/api/v1/restaurants/${restaurantId}`);
    
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }
    
    const data = await resp.json();
    console.log('[restaurant-menu] Respuesta recibida, ok:', data.ok);

    if (data && data.ok && data.data) {
      const r = data.data;
      console.log('[restaurant-menu] Restaurante:', r.name);
      
      // Normalizar datos del restaurante
      currentRestaurant = {
        id: r.id,
        name: r.name,
        description: r.description || '',
        logo_url: normalizeLogo(r.logo_url || ''),
        delivery_fee: r.delivery_cost || r.delivery_fee || 0,
        delivery_time: `${r.delivery_time_min || 30}-${r.delivery_time_max || 45} min`,
        minimum_order: r.minimum_order || 0,
        rating: r.avg_rating || r.rating || 0,
        delivery_time_min: r.delivery_time_min,
        delivery_time_max: r.delivery_time_max
      };

      console.log('[restaurant-menu] Datos normalizados, renderizando header...');
      renderRestaurantHeader();
      
      // Normalizar productos
      allProducts = Array.isArray(r.products) ? r.products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: parseFloat(p.price) || 0,
        category: p.category || 'Sin categoría',
        image_url: p.image_url || (typeof window.guessFoodImage === 'function' ? window.guessFoodImage(p.name) : null),
        is_available: p.is_available !== false,
        is_vegetarian: p.is_vegetarian || false,
        is_vegan: p.is_vegan || false
      })) : [];

      console.log('[restaurant-menu] Productos cargados:', allProducts.length);
      populateCategoriesFromProducts();
      renderProducts();
      console.log('[restaurant-menu] Carga completa');
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error) {
    console.error("[restaurant-menu] Error:", error);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-exclamation-circle text-danger" style="font-size: 3rem;"></i>
          <p class="mt-3 text-danger fw-bold">Error al cargar el restaurante</p>
          <p class="text-muted">${error.message}</p>
          <a href="/public/restaurants.html" class="btn btn-primary mt-3">Volver a Restaurantes</a>
        </div>
      `;
    }
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

  if (logoElement) {
    logoElement.src = currentRestaurant.logo_url || "/imagenes/restaurantes/placeholder.png";
    logoElement.onerror = () => { logoElement.src = "/imagenes/restaurantes/placeholder.png"; };
  }
  if (nameElement) nameElement.textContent = currentRestaurant.name;
  if (descriptionElement) descriptionElement.textContent = currentRestaurant.description || "";
  if (ratingElement) ratingElement.textContent = currentRestaurant.rating || "0";
  if (timeElement) timeElement.textContent = currentRestaurant.delivery_time || (currentRestaurant.delivery_time_min && currentRestaurant.delivery_time_max ? `${currentRestaurant.delivery_time_min}-${currentRestaurant.delivery_time_max} min` : "30-45 min");
  const feeVal = (currentRestaurant.delivery_fee != null ? currentRestaurant.delivery_fee : (currentRestaurant.delivery_cost != null ? currentRestaurant.delivery_cost : 0));
  if (feeElement) feeElement.textContent = Number(feeVal).toLocaleString();
  
  document.title = `${currentRestaurant.name} - DomiTulua`;
}

// Cargar productos
async function loadProducts() {
  // Ya no se usa: productos vienen en /restaurants/:id
  return;
}

// Cargar categorías
async function loadCategories() {
  // Ya no se usa (categorías derivadas localmente)
  return;
}

// Crear navegación de categorías desde los productos ya cargados
function populateCategoriesFromProducts() {
  const container = document.getElementById("categoriesMenu");
  if (!container) return;
  const categories = Array.from(new Set(allProducts.map(p => p.category))).sort();
  container.innerHTML = `
    <a href="#all" class="category-link active" onclick="scrollToCategory(event, 'all')">
      <i class="bi bi-grid"></i> Todos
    </a>
  `;
  categories.forEach(cat => {
    const link = document.createElement('a');
    link.href = `#${cat}`;
    link.className = 'category-link';
    link.textContent = cat;
    link.onclick = (e) => scrollToCategory(e, cat);
    container.appendChild(link);
  });
  const categoryNav = document.getElementById('categoryNav');
  if (categoryNav && categories.length) categoryNav.style.display = 'block';
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

  const entries = Object.entries(byCategory);
  if (entries.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-exclamation-circle" style="font-size: 3rem; color: #ddd;"></i>
        <p class="mt-3 text-muted">Este restaurante aún no tiene productos disponibles</p>
      </div>
    `;
    return;
  }

  container.innerHTML = entries
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
                                  <img src="${product.image_url || '/imagenes/comida/default.jpg'}" 
                                    class="product-image" alt="${product.name}"
                                    data-candidates='${typeof window.guessFoodImageCandidates === 'function' ? JSON.stringify(window.guessFoodImageCandidates(product.name)) : '[]'}'
                                    data-idx="0"
                                    onerror="window.tryNextFoodImage && window.tryNextFoodImage(this)">
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
      restaurant_name: currentRestaurant.name,
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
      restaurant_name: currentRestaurant.name,
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
      restaurant_name: currentRestaurant.name
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
      restaurant_name: currentRestaurant.name,
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
