// DomiTuluá - Login & Register JavaScript

// Alternar entre formularios
function showRegisterForm() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
}

function showLoginForm() {
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

// Alternar visibilidad de contraseña
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentElement.querySelector(".password-toggle i");

  if (input.type === "password") {
    input.type = "text";
    button.className = "bi bi-eye-slash";
  } else {
    input.type = "password";
    button.className = "bi bi-eye";
  }
}

// Validación de fortaleza de contraseña
document.addEventListener("DOMContentLoaded", function () {
  const registerPassword = document.getElementById("registerPassword");
  if (registerPassword) {
    registerPassword.addEventListener("input", function () {
      const password = this.value;
      if (password.length < 6) {
        this.setCustomValidity("La contraseña debe tener al menos 6 caracteres");
      } else {
        this.setCustomValidity("");
      }
    });
  }
});

// Manejar envío de formulario de login
const loginFormElement = document.getElementById("loginFormElement");
if (loginFormElement) {
  loginFormElement.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = {
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value,
    };

    try {
      const response = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.ok) {
        // Guardar token y datos del usuario
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        // Redireccionar según los roles
        const roles = result.user.roles || [];

        console.log("👤 Usuario:", result.user.email);
        console.log("🎭 Roles:", roles);

        // Prioridad: admin > delivery > user
        if (roles.includes("admin")) {
          console.log("✅ Redirigiendo a Admin Dashboard");
          window.location.href = "/admin-dashboard";
        } else if (roles.includes("delivery") || roles.includes("domiciliario")) {
          console.log("✅ Redirigiendo a Delivery Dashboard");
          window.location.href = "/delivery-dashboard";
        } else {
          console.log("✅ Redirigiendo a User Dashboard");
          window.location.href = "/user-dashboard";
        }
      } else {
        alert("Error: " + result.msg);
      }
    } catch (error) {
      console.error("Error de login:", error);
      alert("Error de conexión");
    }
  });
}

// Manejar envío de formulario de registro
const registerFormElement = document.getElementById("registerFormElement");
if (registerFormElement) {
  registerFormElement.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = {
      username: document.getElementById("username").value,
      email: document.getElementById("registerEmail").value,
      password: document.getElementById("registerPassword").value,
    };

    try {
      const response = await fetch("/api/v1/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.ok) {
        alert("¡Registro exitoso!");
        showLoginForm();
      } else {
        alert("Error: " + result.msg);
      }
    } catch (error) {
      console.error("Error de registro:", error);
      alert("Error de conexión");
    }
  });
}
