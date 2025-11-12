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
  cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (cart.length === 0) {
    alert("Tu carrito está vacío");
    window.location.href = "/public/restaurants.html";
    return;
  }

  loadRestaurantInfo();
  renderOrderSummary();
}

// Cargar información del restaurante
async function loadRestaurantInfo() {
  const restaurantId = cart[0].restaurant_id;

  // If no restaurant_id was recorded (e.g. homepage items), skip fetching
  if (!restaurantId) {
    restaurant = null;
    const restaurantNameElement = document.getElementById("restaurantName");
    if (restaurantNameElement) {
      restaurantNameElement.textContent = "Varios restaurantes";
    }
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/v1/restaurants/${restaurantId}`);
    const data = await response.json();

    if (data.ok) {
      restaurant = data.data;
      const restaurantNameElement = document.getElementById("restaurantName");
      if (restaurantNameElement) {
        restaurantNameElement.textContent = restaurant.name;
      }
    }
  } catch (error) {
    console.error("Error al cargar restaurante:", error);
  }
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
  const orderData = {
    restaurant_id: cart[0].restaurant_id,
    delivery_address: address,
    delivery_phone: phone,
    delivery_notes: notes || null,
    payment_method: selectedPayment,
    items: cart.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      special_instructions: item.special_instructions || null,
    })),
  };

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
      // Limpiar carrito
      localStorage.removeItem("cart");

      // Redirigir a confirmación
      localStorage.setItem("lastOrder", JSON.stringify(data.data));
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
