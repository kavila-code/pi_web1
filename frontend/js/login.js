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

        // Si existe una intención guardada (después de intentar añadir/ordenar sin login),
        // redirigimos allí primero y limpiamos la key.
        try {
          const redirect = sessionStorage.getItem('afterLoginRedirect');
          if (redirect) {
            sessionStorage.removeItem('afterLoginRedirect');
            window.location.href = redirect;
            return;
          }
        } catch (e) {
          // Si sessionStorage no está disponible por algún motivo, continuar con el flujo normal
          console.warn('No se pudo leer sessionStorage.afterLoginRedirect:', e);
        }

        // Redirigir siempre al User Dashboard (usar URL absoluta solicitada)
        try {
          window.location.href = 'http://localhost:3000/user-dashboard';
        } catch (e) {
          // Fallback relativo
          window.location.href = '/user-dashboard';
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
        // Guardar token y usuario recibido y redirigir al dashboard de usuario
        try {
          if (result.token) {
            localStorage.setItem('token', result.token);
          }
          if (result.user) {
            localStorage.setItem('user', JSON.stringify(result.user));
          }
        } catch (e) {
          console.warn('No se pudo guardar token/user en localStorage:', e);
        }

        try {
          window.location.href = 'http://localhost:3000/user-dashboard';
        } catch (e) {
          window.location.href = '/user-dashboard';
        }
      } else {
        alert("Error: " + result.msg);
      }
    } catch (error) {
      console.error("Error de registro:", error);
      alert("Error de conexión");
    }
  });
}
