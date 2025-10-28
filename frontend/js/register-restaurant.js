// DomiTuluá - Register Restaurant JavaScript

// Catálogo de departamentos y municipios
const departamentos = {
  1: "Valle del Cauca",
  2: "Cundinamarca",
  3: "Antioquia",
  4: "Caldas",
};

const municipiosPorDepartamento = {
  1: [
    { id: "1", nombre: "Cali" },
    { id: "2", nombre: "Palmira" },
    { id: "3", nombre: "Jamundí" },
    { id: "4", nombre: "Tuluá" },
    { id: "5", nombre: "Buenaventura" },
    { id: "6", nombre: "Candelaria" },
  ],
  2: [
    { id: "7", nombre: "Bogotá" },
    { id: "8", nombre: "Soacha" },
    { id: "9", nombre: "Chía" },
    { id: "10", nombre: "Zipaquirá" },
    { id: "11", nombre: "Facatativá" },
  ],
  3: [
    { id: "12", nombre: "Medellín" },
    { id: "13", nombre: "Bello" },
    { id: "14", nombre: "Itagüí" },
    { id: "15", nombre: "Envigado" },
    { id: "16", nombre: "Rionegro" },
  ],
  4: [
    { id: "17", nombre: "Manizales" },
    { id: "18", nombre: "Chinchiná" },
    { id: "19", nombre: "La Dorada" },
    { id: "20", nombre: "Villamaría" },
    { id: "21", nombre: "Anserma" },
  ],
};

// Poblar municipios según departamento
document.addEventListener("DOMContentLoaded", function () {
  const depSelect = document.getElementById("departamento");
  const munSelect = document.getElementById("municipio");

  if (depSelect && munSelect) {
    depSelect.addEventListener("change", function () {
      const depId = this.value;
      munSelect.innerHTML = '<option value="">Seleccione un municipio</option>';

      if (depId && municipiosPorDepartamento[depId]) {
        munSelect.disabled = false;
        municipiosPorDepartamento[depId].forEach((m) => {
          const opt = document.createElement("option");
          opt.value = m.nombre;
          opt.textContent = m.nombre;
          munSelect.appendChild(opt);
        });
      } else {
        munSelect.disabled = true;
        munSelect.innerHTML = '<option value="">Seleccione un departamento primero</option>';
      }
    });
  }
});

// Enviar formulario
const restaurantRegisterForm = document.getElementById("restaurantRegisterForm");
if (restaurantRegisterForm) {
  restaurantRegisterForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const formMsg = document.getElementById("formMsg");
    formMsg.className = "mt-2 small text-success";
    formMsg.textContent = "¡Gracias! Tu solicitud fue registrada. Nos contactaremos pronto.";
  });
}

// Preparar mailto con datos del formulario
const form = document.getElementById("restaurantRegisterForm");
const mailto = document.getElementById("mailtoLink");

function updateMailto() {
  if (!form || !mailto) return;
  
  const data = new FormData(form);
  const subject = encodeURIComponent("Solicitud de registro de restaurante");
  const depId = data.get("departamento");
  const depNombre = depId ? departamentos[depId] || depId : "";
  const munNombre = data.get("municipio") || "";
  const body = encodeURIComponent(
    `Nombre del Restaurante: ${data.get("name") || ""}\n` +
    `Propietario: ${data.get("owner") || ""}\n` +
    `Teléfono: ${data.get("phone") || ""}\n` +
    `Email: ${data.get("email") || ""}\n` +
    `Dirección: ${data.get("address") || ""}\n` +
    `Departamento: ${depNombre}\n` +
    `Municipio: ${munNombre}\n` +
    `Categoría: ${data.get("category") || ""}\n` +
    `Descripción: ${data.get("description") || ""}`
  );
  
  mailto.href = `mailto:registro@domitulua.com?subject=${subject}&body=${body}`;
}

if (form) {
  form.addEventListener("input", updateMailto);
  form.addEventListener("change", updateMailto);
}
