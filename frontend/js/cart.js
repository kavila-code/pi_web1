// Simple cart manager for previewing items in the navbar on user-inicio
(function () {
  const STORAGE_KEY = 'cart_items_v1';

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      console.error('Error leyendo carrito', e);
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderCartCount();
  }

  function addToCart(item) {
    const cart = readCart();
    const idx = cart.findIndex((c) => c.id === item.id);
    if (idx >= 0) {
      cart[idx].qty = (cart[idx].qty || 1) + (item.qty || 1);
    } else {
      cart.push(Object.assign({ qty: 1 }, item));
    }
    writeCart(cart);
    showCartPreview();
  }

  function removeFromCart(id) {
    let cart = readCart();
    cart = cart.filter((c) => String(c.id) !== String(id));
    writeCart(cart);
    renderCartPreview();
  }

  function updateQty(id, qty) {
    const cart = readCart();
    const idx = cart.findIndex((c) => c.id === id);
    if (idx >= 0) {
      cart[idx].qty = qty > 0 ? qty : 1;
      writeCart(cart);
      renderCartPreview();
    }
  }

  function calcTotal(cart) {
    return cart.reduce((s, it) => s + (Number(it.price || 0) * (it.qty || 1)), 0);
  }

  function formatCurrency(v) {
    try { return '$' + Number(v).toLocaleString('es-CO'); } catch(e){ return '$' + v; }
  }

  function renderCartCount() {
    const countEl = document.getElementById('cartCount');
    if (!countEl) return;
    const cart = readCart();
    const totalQty = cart.reduce((s, i) => s + (i.qty || 1), 0);
    countEl.textContent = totalQty;
    countEl.style.display = totalQty > 0 ? 'flex' : 'none';
  }

  function renderCartPreview() {
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    if (!container || !totalEl) return;
    const cart = readCart();
    container.innerHTML = '';
    if (!cart.length) {
      container.innerHTML = '<p class="text-muted">Tu carrito está vacío.</p>';
      totalEl.textContent = 'Total: $0';
      return;
    }

    cart.forEach((it) => {
      const row = document.createElement('div');
      row.className = 'd-flex align-items-center mb-2';
      row.innerHTML = `
        <div style="flex:1">
          <div class="fw-bold">${escapeHtml(it.name || 'Item')}</div>
          <div class="text-muted small">${it.qty} x ${formatCurrency(it.price || 0)}</div>
        </div>
        <div class="ms-2 text-end">
          <button class="btn btn-sm btn-outline-danger btn-remove" data-id="${it.id}">Eliminar</button>
        </div>
      `;
      container.appendChild(row);
    });

    totalEl.textContent = 'Total: ' + formatCurrency(calcTotal(cart));
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }

  function showCartPreview() {
    renderCartCount();
    renderCartPreview();
    const preview = document.getElementById('cartPreview');
    if (!preview) return;
    preview.style.display = 'block';
  }

  function hideCartPreview() {
    const preview = document.getElementById('cartPreview');
    if (!preview) return;
    preview.style.display = 'none';
  }

  function toggleCartPreview() {
    const preview = document.getElementById('cartPreview');
    if (!preview) return;
    if (preview.style.display === 'block') hideCartPreview(); else showCartPreview();
  }

  // Click outside to close
  document.addEventListener('click', function (ev) {
    const preview = document.getElementById('cartPreview');
    const btn = document.getElementById('cartButton');
    if (!preview || !btn) return;
    if (preview.style.display !== 'block') return;
    if (preview.contains(ev.target) || btn.contains(ev.target)) return;
    hideCartPreview();
  });

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('cartButton');
    if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); toggleCartPreview(); });

    // Delegate for remove buttons inside preview
    document.getElementById('cartPreview')?.addEventListener('click', function (e) {
      const rem = e.target.closest('.btn-remove');
      if (rem) {
        const id = rem.getAttribute('data-id');
        removeFromCart(id);
      }
    });

    renderCartCount();
    renderCartPreview();
    // expose api for other scripts
    window.cartAPI = {
      addToCart: addToCart,
      removeFromCart: removeFromCart,
      updateQty: updateQty,
      readCart: readCart
    };

    // Expose a small toast helper using Bootstrap Toasts
    function showToast(message, opts = {}) {
      try {
        const containerId = 'globalToastContainer';
        let container = document.getElementById(containerId);
        if (!container) {
          container = document.createElement('div');
          container.id = containerId;
          container.className = 'position-fixed top-0 end-0 p-3';
          container.style.zIndex = 10800;
          document.body.appendChild(container);
        }

        const toastId = 'toast-' + Date.now();
        const toastEl = document.createElement('div');
        toastEl.id = toastId;
        toastEl.className = 'toast align-items-center text-bg-primary border-0';
        toastEl.role = 'alert';
        toastEl.ariaLive = 'assertive';
        toastEl.ariaAtomic = 'true';
        toastEl.innerHTML = `
          <div class="d-flex">
            <div class="toast-body">${escapeHtml(message)}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
          </div>
        `;

        container.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl, { delay: opts.delay || 2500 });
        toast.show();
        // remove from DOM after hidden
        toastEl.addEventListener('hidden.bs.toast', () => { try { toastEl.remove(); } catch (e) {} });
        return toast;
      } catch (err) {
        console.warn('showToast error:', err);
      }
    }

    window.showToast = showToast;

    // Si hay una intención pendiente (usuario intentó ordenar antes de loguearse), procesarla ahora
    try {
      const pending = sessionStorage.getItem('pending_cart_item');
      if (pending) {
        const item = JSON.parse(pending);
        if (item) {
          addToCart(item);
        }
        sessionStorage.removeItem('pending_cart_item');
      }
    } catch (e) {
      console.warn('No se pudo procesar pending_cart_item:', e);
    }
  });

})();
// DomiTuluá - Shopping Cart JavaScript

let cart = [];
let restaurant = null;

// Verificar autenticación
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login";
}

// Cargar carrito al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
});

// Cargar carrito
function loadCart() {
  cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (cart.length === 0) {
    showEmptyCart();
  } else {
    loadRestaurantInfo();
    renderCart();
    calculateTotals();
  }
}

// Cargar información del restaurante
async function loadRestaurantInfo() {
  if (cart.length === 0) return;

  const restaurantId = cart[0].restaurant_id;

  try {
    const response = await fetch(`http://localhost:3000/api/v1/restaurants/${restaurantId}`);
    const data = await response.json();

    if (data.ok) {
      restaurant = data.data;
      const restaurantNameEl = document.getElementById("restaurantName");
      const restaurantInfoEl = document.getElementById("restaurantInfo");
      
      if (restaurantNameEl) restaurantNameEl.textContent = restaurant.name;
      if (restaurantInfoEl) restaurantInfoEl.style.display = "block";
    }
  } catch (error) {
    console.error("Error al cargar restaurante:", error);
  }
}

// Renderizar carrito
function renderCart() {
  const container = document.getElementById("cartItems");
  const emptyCart = document.getElementById("emptyCart");
  const summaryCard = document.getElementById("summaryCard");

  if (!container) return;

  if (cart.length === 0) {
    showEmptyCart();
    return;
  }

  if (emptyCart) emptyCart.style.display = "none";
  if (summaryCard) summaryCard.style.display = "block";

  container.innerHTML = cart
    .map(
      (item, index) => `
        <div class="cart-item">
            <div class="row align-items-center">
                <div class="col-md-2 mb-3 mb-md-0">
                    <img src="${item.product_image || "https://via.placeholder.com/100"}" 
                         class="cart-item-image" alt="${item.product_name}">
                </div>
                <div class="col-md-4 mb-3 mb-md-0">
                    <h5 class="fw-bold mb-1">${item.product_name}</h5>
                    <p class="text-muted mb-0">$${item.product_price.toLocaleString()} c/u</p>
                    ${item.special_instructions ? `
                        <p class="special-instructions mb-0">
                            <i class="bi bi-chat-left-text"></i> ${item.special_instructions}
                        </p>
                    ` : ""}
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                    <div class="quantity-controls">
                        <div class="quantity-btn" onclick="decreaseQuantity(${index})">
                            <i class="bi bi-dash"></i>
                        </div>
                        <span class="quantity-display">${item.quantity}</span>
                        <div class="quantity-btn" onclick="increaseQuantity(${index})">
                            <i class="bi bi-plus"></i>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 mb-3 mb-md-0 text-end">
                    <h5 class="fw-bold text-primary mb-0">
                        $${(item.product_price * item.quantity).toLocaleString()}
                    </h5>
                </div>
                <div class="col-md-1 text-end">
                    <i class="bi bi-trash fs-5 delete-btn" onclick="removeItem(${index})"></i>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  // Actualizar contador
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const itemsCountEl = document.getElementById("itemsCount");
  if (itemsCountEl) {
    itemsCountEl.textContent = `${totalItems} producto${totalItems !== 1 ? "s" : ""}`;
  }
}

// Aumentar cantidad
function increaseQuantity(index) {
  cart[index].quantity++;
  saveCart();
  renderCart();
  calculateTotals();
  showToast("Cantidad actualizada");
}

// Disminuir cantidad
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
    saveCart();
    renderCart();
    calculateTotals();
    showToast("Cantidad actualizada");
  } else {
    removeItem(index);
  }
}

// Eliminar item
function removeItem(index) {
  if (confirm("¿Deseas eliminar este producto del carrito?")) {
    const itemName = cart[index].product_name;
    cart.splice(index, 1);
    saveCart();
    renderCart();
    calculateTotals();
    showToast(`${itemName} eliminado del carrito`);

    if (cart.length === 0) {
      showEmptyCart();
    }
  }
}

// Vaciar carrito
function clearCart() {
  if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
    cart = [];
    saveCart();
    showEmptyCart();
    showToast("Carrito vaciado");
  }
}

// Calcular totales
function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const deliveryFee = restaurant?.delivery_fee || 3000;
  const tax = Math.round(subtotal * 0.19);
  const discount = 0;
  const total = subtotal + deliveryFee + tax - discount;

  // Actualizar UI
  const elements = {
    summaryItemsCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: subtotal.toLocaleString(),
    deliveryFee: deliveryFee.toLocaleString(),
    tax: tax.toLocaleString(),
    discount: discount.toLocaleString(),
    total: total.toLocaleString()
  };

  Object.keys(elements).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = elements[id];
  });

  // Verificar pedido mínimo
  const minimumOrder = restaurant?.minimum_order || 0;
  const warning = document.getElementById("minimumOrderWarning");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (minimumOrder > 0 && subtotal < minimumOrder) {
    if (warning) warning.style.display = "block";
    const minOrderEl = document.getElementById("minimumOrder");
    if (minOrderEl) minOrderEl.textContent = minimumOrder.toLocaleString();
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = '<i class="bi bi-exclamation-circle me-2"></i>Pedido mínimo no alcanzado';
    }
  } else {
    if (warning) warning.style.display = "none";
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Proceder al Pago';
    }
  }
}

// Guardar carrito
function saveCart() {
  // Usar setCartSafe para evitar guardar si no hay sesión
  setCartSafe(cart);
}

// Mostrar carrito vacío
function showEmptyCart() {
  const cartItems = document.getElementById("cartItems");
  const emptyCart = document.getElementById("emptyCart");
  const summaryCard = document.getElementById("summaryCard");
  const restaurantInfo = document.getElementById("restaurantInfo");
  const itemsCount = document.getElementById("itemsCount");

  if (cartItems) cartItems.innerHTML = "";
  if (emptyCart) emptyCart.style.display = "block";
  if (summaryCard) summaryCard.style.display = "none";
  if (restaurantInfo) restaurantInfo.style.display = "none";
  if (itemsCount) itemsCount.textContent = "0 productos";
}

// Ir al checkout
function goToCheckout() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const minimumOrder = restaurant?.minimum_order || 0;

  if (minimumOrder > 0 && subtotal < minimumOrder) {
    alert(`El pedido mínimo es de $${minimumOrder.toLocaleString()}`);
    return;
  }

  window.location.href = "/public/checkout.html";
}
