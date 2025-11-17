// DomiTuluá - Checkout JavaScript

let cart = [];
let restaurant = null;
let user = null;
let selectedPayment = "efectivo";

// Verificar autenticación
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "/login";
}

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadUserData();
  loadCart();
});

// Cargar datos del usuario
function loadUserData() {
  user = JSON.parse(localStorage.getItem("user") || "{}");

  // Pre-llenar formulario
  const fullNameInput = document.getElementById("fullName");
  if (user.username && fullNameInput) {
    fullNameInput.value = user.username;
  }
}

// Cargar carrito
function loadCart() {
  // Usar cart_items_v1 para compatibilidad
  const INT32_MAX = 2147483647;
  let rawCart = [];
  try {
    rawCart = JSON.parse(localStorage.getItem("cart_items_v1") || "[]");
    if (!Array.isArray(rawCart)) rawCart = [];
  } catch (_) { rawCart = []; }

  // Limpieza y normalización preventiva (eliminar/sanitizar IDs fuera de rango, cantidades inválidas, etc.)
  let mutated = false;
  const cleaned = [];
  for (const it of rawCart) {
    if (!it) { mutated = true; continue; }
    let pid = it.product_id || it.id;
    if (pid == null) { mutated = true; continue; }
    const num = Number(pid);
    if (!Number.isInteger(num) || num <= 0) { mutated = true; continue; }
    let finalPid = num;
    if (num > INT32_MAX) {
      // Si proviene de Date.now() (ms), intentar reducir a segundos
      const seconds = Math.floor(num / 1000);
      if (seconds > 0 && seconds <= INT32_MAX) {
        finalPid = seconds;
      } else {
        mutated = true; continue; // imposible sanear
      }
      mutated = true;
    }
    const qty = Number(it.qty || it.quantity || 1);
    if (!Number.isInteger(qty) || qty <= 0) { mutated = true; continue; }
    cleaned.push({
      product_id: finalPid,
      product_name: it.name || it.product_name || 'Item',
      product_price: Number(it.price || it.product_price || 0) || 0,
      product_image: it.image || it.product_image || '',
      quantity: qty,
      special_instructions: it.special_instructions || null,
      restaurant_id: it.restaurant_id || null,
      restaurant_name: it.restaurant_name || null
    });
  }

  if (mutated) {
    try { localStorage.setItem('cart_items_v1', JSON.stringify(cleaned.map(c => ({
      id: c.product_id,
      name: c.product_name,
      price: c.product_price,
      image: c.product_image,
      qty: c.quantity,
      special_instructions: c.special_instructions,
      restaurant_id: c.restaurant_id,
      restaurant_name: c.restaurant_name
    })))); } catch (_) {}
  }

  cart = cleaned;

  if (cart.length === 0) {
    alert("Tu carrito está vacío");
    window.location.href = "/public/restaurants.html";
    return;
  }

  loadRestaurantInfo();
  renderOrderSummary();
}

// Intentar resolver el restaurant_id a partir del primer producto si falta
async function resolveRestaurantFromFirstItem() {
  try {
    const first = cart[0];
    if (!first || !first.product_id) return false;
    // If product_id is obviously synthetic (e.g., generated with Date.now()), avoid querying the API
    const idNum = Number(first.product_id);
    if (!Number.isSafeInteger(idNum) || idNum > 2147483647) return false;
    const res = await fetch(`/api/v1/products/${first.product_id}`);
    const data = await res.json();
    if (!data || !data.ok || !data.data) return false;
    const prod = data.data;
    const resolvedRestaurantId = prod.restaurant_id;
    const resolvedRestaurantName = prod.restaurant_name || prod.restaurant?.name;
    if (!resolvedRestaurantId) return false;
    // Actualizar todos los items del carrito con el mismo restaurant_id
    cart = cart.map(it => ({ ...it, restaurant_id: resolvedRestaurantId, restaurant_name: it.restaurant_name || resolvedRestaurantName }));
    // Persistir también al storage para consistencia
    try {
      const rawCart = JSON.parse(localStorage.getItem("cart_items_v1") || "[]");
      const updated = rawCart.map((it, idx) => ({ ...it, restaurant_id: resolvedRestaurantId, restaurant_name: it.restaurant_name || resolvedRestaurantName }));
      localStorage.setItem("cart_items_v1", JSON.stringify(updated));
    } catch (_) {}
    // Cargar info del restaurante resuelto
    await loadRestaurantById(resolvedRestaurantId);
    return true;
  } catch (e) {
    console.error("No se pudo resolver restaurant desde producto:", e);
    return false;
  }
}

async function loadRestaurantById(restaurantId) {
  try {
    const response = await fetch(`http://localhost:3000/api/v1/restaurants/${restaurantId}`);
    const data = await response.json();
    if (data.ok) {
      restaurant = data.data;
      const restaurantNameElement = document.getElementById("restaurantName");
      if (restaurantNameElement) restaurantNameElement.textContent = restaurant.name;
    }
  } catch (error) {
    console.error("Error al cargar restaurante:", error);
  }
}

// Cargar información del restaurante
async function loadRestaurantInfo() {
  const restaurantId = cart[0].restaurant_id;

  if (!restaurantId) {
    // Intentar resolver a partir del primer producto del carrito
    const resolved = await resolveRestaurantFromFirstItem();
    if (!resolved) {
      const shouldClear = confirm("No se pudo determinar el restaurante del pedido. ¿Deseas vaciar el carrito y volver a los restaurantes?");
      if (shouldClear) {
        try { localStorage.removeItem('cart_items_v1'); } catch (_) {}
        window.location.href = "/public/restaurants.html";
      } else {
        window.location.href = "/public/cart.html";
      }
    }
    return;
  }

  await loadRestaurantById(restaurantId);
}

// Renderizar resumen del pedido
function renderOrderSummary() {
  const itemsContainer = document.getElementById("orderItems");
  if (!itemsContainer) return;

  itemsContainer.innerHTML = cart
    .map(
      (item) => `
        <div class="product-mini-item">
            <img src="${item.product_image || "https://via.placeholder.com/50"}" 
                 class="product-mini-image" alt="${item.product_name}">
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between">
                    <span class="fw-bold small">${item.product_name}</span>
                    <span class="fw-bold small">$${(item.product_price * item.quantity).toLocaleString()}</span>
                </div>
                <small class="text-muted">
                    ${item.quantity} x $${item.product_price.toLocaleString()}
                </small>
                ${item.special_instructions ? `
                    <small class="d-block text-muted fst-italic">
                        <i class="bi bi-chat-left-text"></i> ${item.special_instructions}
                    </small>
                ` : ""}
            </div>
        </div>
    `
    )
    .join("");

  calculateTotals();
}

// Calcular totales
function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const deliveryFee = restaurant?.delivery_fee || 3000;
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + deliveryFee + tax;

  const subtotalElement = document.getElementById("subtotal");
  const deliveryFeeElement = document.getElementById("deliveryFee");
  const taxElement = document.getElementById("tax");
  const totalElement = document.getElementById("total");

  if (subtotalElement) subtotalElement.textContent = subtotal.toLocaleString();
  if (deliveryFeeElement) deliveryFeeElement.textContent = deliveryFee.toLocaleString();
  if (taxElement) taxElement.textContent = tax.toLocaleString();
  if (totalElement) totalElement.textContent = total.toLocaleString();
}

// Seleccionar método de pago
function selectPayment(method) {
  selectedPayment = method;

  // Actualizar UI
  document.querySelectorAll(".payment-method").forEach((el) => {
    el.classList.remove("selected");
  });
  
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  }

  // Actualizar radio button
  document.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.checked = radio.value === method;
  });
}

// Confirmar pedido
async function placeOrder() {
  // Validar formulario
  const form = document.getElementById("checkoutForm");
  if (!form) return;
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const notes = document.getElementById("notes").value.trim();

  if (!fullName || !phone || !address) {
    alert("Por favor completa todos los campos requeridos");
    return;
  }

  // Validar teléfono
  if (phone.length < 10) {
    alert("Por favor ingresa un teléfono válido");
    return;
  }

  // Mostrar loading
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = "flex";
  }

  // Preparar datos del pedido
  // Sanitizar product_ids: eliminar/sustituir IDs fuera de rango INT32 para evitar errores en PostgreSQL
  const INT32_MAX = 2147483647;
  const sanitizedCart = cart.map(it => {
    let pid = it.product_id;
    if (pid == null) return it; // se manejará después si falta
    const num = Number(pid);
    if (!Number.isInteger(num) || num <= 0) {
      // invalid -> marcar como null para forzar validación backend
      return { ...it, product_id: null };
    }
    if (num > INT32_MAX) {
      // Reducir a segundos si viene de Date.now()
      const seconds = Math.floor(num / 1000);
      if (seconds > 0 && seconds <= INT32_MAX) {
        return { ...it, product_id: seconds };
      }
      return { ...it, product_id: null };
    }
    return it;
  });

  const orderData = {
    restaurant_id: cart[0]?.restaurant_id,
    delivery_address: address,
    delivery_phone: phone,
    delivery_notes: notes || null,
    payment_method: selectedPayment,
    items: sanitizedCart
      .filter(it => it.product_id && Number.isInteger(Number(it.product_id)) && Number(it.product_id) > 0)
      .map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        special_instructions: item.special_instructions || null,
      })),
  };

  if (!orderData.items.length) {
    alert("Tu carrito no tiene productos válidos. Por favor vuelve al menú y agrega productos desde la lista actualizada.");
    if (loadingOverlay) loadingOverlay.style.display = "none";
    return;
  }

  if (!orderData.restaurant_id) {
    alert("No se pudo identificar el restaurante del pedido. Regresa al carrito y vuelve a intentar.");
    if (loadingOverlay) loadingOverlay.style.display = "none";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (data.ok) {
      // Guardar orden
      localStorage.setItem("lastOrder", JSON.stringify(data.data));

      // Métodos no en línea: flujo actual
      localStorage.removeItem("cart_items_v1");
      localStorage.removeItem("cart");
      window.location.href = "/public/order-success.html";
    } else {
      throw new Error(data.message || "Error al crear el pedido");
    }
  } catch (error) {
    console.error("Error:", error);
    alert(`Error al crear el pedido: ${error.message}`);
    if (loadingOverlay) {
      loadingOverlay.style.display = "none";
    }
  }
}
