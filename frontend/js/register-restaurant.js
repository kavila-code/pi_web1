// DomiTuluá - Register Restaurant JavaScript

// Catálogo de departamentos y municipios
const departamentos = {
  1: "Amazonas",
  2: "Antioquia",
  3: "Arauca",
  4: "Atlántico",
  5: "Bolívar",
  6: "Boyacá",
  7: "Caldas",
  8: "Caquetá",
  9: "Casanare",
  10: "Cauca",
  11: "Cesar",
  12: "Chocó",
  13: "Córdoba",
  14: "Cundinamarca",
  15: "Guainía",
  16: "Guaviare",
  17: "Huila",
  18: "La Guajira",
  19: "Magdalena",
  20: "Meta",
  21: "Nariño",
  22: "Norte de Santander",
  23: "Putumayo",
  24: "Quindío",
  25: "Risaralda",
  26: "San Andrés y Providencia",
  27: "Santander",
  28: "Sucre",
  29: "Tolima",
  30: "Valle del Cauca",
  31: "Vaupés",
  32: "Vichada",

};

const municipiosPorDepartamento = {
  1: [
    { id: "1", nombre: "Leticia" },
    { id: "2", nombre: "Puerto Nariño" },
    { id: "3", nombre: "Tarapacá" },
    { id: "4", nombre: "La Chorrera" },
    { id: "5", nombre: "Puerto Arica" },
    { id: "6", nombre: "Mirití-Paraná" }
  ],
  2: [
    { id: "7", nombre: "Medellín" },
    { id: "8", nombre: "Bello" },
    { id: "9", nombre: "Itagüí" },
    { id: "10", nombre: "Envigado" },
    { id: "11", nombre: "Rionegro" },
    { id: "12", nombre: "Apartadó" }
  ],
  3: [
    { id: "13", nombre: "Arauca" },
    { id: "14", nombre: "Arauquita" },
    { id: "15", nombre: "Tame" },
    { id: "16", nombre: "Fortul" },
    { id: "17", nombre: "Saravena" },
    { id: "18", nombre: "Puerto Rondón" }
  ],
  4: [
    { id: "19", nombre: "Barranquilla" },
    { id: "20", nombre: "Soledad" },
    { id: "21", nombre: "Malambo" },
    { id: "22", nombre: "Sabanalarga" },
    { id: "23", nombre: "Galapa" },
    { id: "24", nombre: "Baranoa" }
  ],
  5: [
    { id: "25", nombre: "Cartagena" },
    { id: "26", nombre: "Turbaco" },
    { id: "27", nombre: "Magangué" },
    { id: "28", nombre: "El Carmen de Bolívar" },
    { id: "29", nombre: "Arjona" },
    { id: "30", nombre: "Santa Catalina" }
  ],
  6: [
    { id: "31", nombre: "Tunja" },
    { id: "32", nombre: "Duitama" },
    { id: "33", nombre: "Sogamoso" },
    { id: "34", nombre: "Chiquinquirá" },
    { id: "35", nombre: "Paipa" },
    { id: "36", nombre: "Tibasosa" }
  ],
  7: [
    { id: "37", nombre: "Manizales" },
    { id: "38", nombre: "Chinchiná" },
    { id: "39", nombre: "La Dorada" },
    { id: "40", nombre: "Villamaría" },
    { id: "41", nombre: "Neira" },
    { id: "42", nombre: "Anserma" }
  ],
  8: [
    { id: "43", nombre: "Florencia" },
    { id: "44", nombre: "Belén de los Andaquíes" },
    { id: "45", nombre: "La Montañita" },
    { id: "46", nombre: "Morelia" },
    { id: "47", nombre: "Puerto Rico" },
    { id: "48", nombre: "Valparaíso" }
  ],
  9: [
    { id: "49", nombre: "Yopal" },
    { id: "50", nombre: "Aguazul" },
    { id: "51", nombre: "Orocué" },
    { id: "52", nombre: "Sabanalarga (Casanare)" },
    { id: "53", nombre: "Chámeza" },
    { id: "54", nombre: "Tauramena" }
  ],
  10: [
    { id: "55", nombre: "Popayán" },
    { id: "56", nombre: "Santander de Quilichao" },
    { id: "57", nombre: "Puerto Tejada" },
    { id: "58", nombre: "Almaguer" },
    { id: "59", nombre: "Silvia" },
    { id: "60", nombre: "Patía" }
  ],
  11: [
    { id: "61", nombre: "Valledupar" },
    { id: "62", nombre: "Aguachica" },
    { id: "63", nombre: "Codazzi" },
    { id: "64", nombre: "El Copey" },
    { id: "65", nombre: "Bosconia" },
    { id: "66", nombre: "La Jagua de Ibirico" }
  ],
  12: [
    { id: "67", nombre: "Quibdó" },
    { id: "68", nombre: "Istmina" },
    { id: "69", nombre: "Tadó" },
    { id: "70", nombre: "Riosucio (Chocó)" },
    { id: "71", nombre: "Nuquí" },
    { id: "72", nombre: "Bojayá" }
  ],
  13: [
    { id: "73", nombre: "Montería" },
    { id: "74", nombre: "Cereté" },
    { id: "75", nombre: "Lorica" },
    { id: "76", nombre: "Sahagún" },
    { id: "77", nombre: "Montelíbano" },
    { id: "78", nombre: "Puerto Escondido" }
  ],
  14: [
    { id: "79", nombre: "Bogotá" },
    { id: "80", nombre: "Soacha" },
    { id: "81", nombre: "Facatativá" },
    { id: "82", nombre: "Fusagasugá" },
    { id: "83", nombre: "Zipaquirá" },
    { id: "84", nombre: "Chía" }
  ],
  15: [
    { id: "85", nombre: "Inírida" },
    { id: "86", nombre: "Barranco Minas" },
    { id: "87", nombre: "Cacahual" },
    { id: "88", nombre: "Mapiripana" },
    { id: "89", nombre: "San Felipe" },
    { id: "90", nombre: "Pana Pana" }
  ],
  16: [
    { id: "91", nombre: "San José del Guaviare" },
    { id: "92", nombre: "Calamar (Guaviare)" },
    { id: "93", nombre: "El Retorno" },
    { id: "94", nombre: "Miraflores (Guaviare)" },
    { id: "95", nombre: "La Macarena" },
    { id: "96", nombre: "Mapiripana (Guaviare)" }
  ],
  17: [
    { id: "97", nombre: "Neiva" },
    { id: "98", nombre: "Pitalito" },
    { id: "99", nombre: "Garzón" },
    { id: "100", nombre: "La plata" },
    { id: "101", nombre: "Tello" },
    { id: "102", nombre: "Campoalegre" }
  ],
  18: [
    { id: "103", nombre: "Riohacha" },
    { id: "104", nombre: "Maicao" },
    { id: "105", nombre: "Uribia" },
    { id: "106", nombre: "Dibulla" },
    { id: "107", nombre: "Manaure" },
    { id: "108", nombre: "Hatonuevo" }
  ],
  19: [
    { id: "109", nombre: "Santa Marta" },
    { id: "110", nombre: "Ciénaga" },
    { id: "111", nombre: "Fundación" },
    { id: "112", nombre: "El Banco" },
    { id: "113", nombre: "Aracataca" },
    { id: "114", nombre: "Sitionuevo" }
  ],
  20: [
    { id: "115", nombre: "Villavicencio" },
    { id: "116", nombre: "Acacías" },
    { id: "117", nombre: "Granada (Meta)" },
    { id: "118", nombre: "Puerto López" },
    { id: "119", nombre: "Mapiripán" },
    { id: "120", nombre: "Restrepo" }
  ],
  21: [
    { id: "121", nombre: "Pasto" },
    { id: "122", nombre: "Tumaco" },
    { id: "123", nombre: "Ipiales" },
    { id: "124", nombre: "Tuquerres" },
    { id: "125", nombre: "Tumlado" },
    { id: "126", nombre: "La Unión (Nariño)" }
  ],
  22: [
    { id: "127", nombre: "Cúcuta" },
    { id: "128", nombre: "Ocaña" },
    { id: "129", nombre: "Pamplona" },
    { id: "130", nombre: "Sardinata" },
    { id: "131", nombre: "Chinácota" },
    { id: "132", nombre: "Los Patios" }
  ],
  23: [
    { id: "133", nombre: "Mocoa" },
    { id: "134", nombre: "Puerto Asís" },
    { id: "135", nombre: "Valle del Guamuez" },
    { id: "136", nombre: "Puerto Caicedo" },
    { id: "137", nombre: "Colón (Putumayo)" },
    { id: "138", nombre: "Orito" }
  ],
  24: [
    { id: "139", nombre: "Armenia" },
    { id: "140", nombre: "Calarcá" },
    { id: "141", nombre: "Montenegro" },
    { id: "142", nombre: "Pereira (Quindío?)" },
    { id: "143", nombre: "La Tebaida" },
    { id: "144", nombre: "Quimbaya" }
  ],
  25: [
    { id: "145", nombre: "Pereira" },
    { id: "146", nombre: "Dosquebradas" },
    { id: "147", nombre: "La Virginia" },
    { id: "148", nombre: "Santuario" },
    { id: "149", nombre: "Marsella" },
    { id: "150", nombre: "Belén de Umbría" }
  ],
  26: [
    { id: "151", nombre: "San Andrés" },
    { id: "152", nombre: "Providencia" },
    { id: "153", nombre: "Santa Catalina" },
    { id: "154", nombre: "North End" },
    { id: "155", nombre: "Coveñas (?)" },
    { id: "156", nombre: "Saint George" }
  ],
  27: [
    { id: "157", nombre: "Bucaramanga" },
    { id: "158", nombre: "Floridablanca" },
    { id: "159", nombre: "Piedecuesta" },
    { id: "160", nombre: "Barrancabermeja" },
    { id: "161", nombre: "Girón" },
    { id: "162", nombre: "Socorro" }
  ],
  28: [
    { id: "163", nombre: "Sincelejo" },
    { id: "164", nombre: "Corozal" },
    { id: "165", nombre: "Tolú" },
    { id: "166", nombre: "Sampués" },
    { id: "167", nombre: "Colosó" },
    { id: "168", nombre: "Santiago de Tolú" }
  ],
  29: [
    { id: "169", nombre: "Ibagué" },
    { id: "170", nombre: "Espinal" },
    { id: "171", nombre: "Melgar" },
    { id: "172", nombre: "Honda" },
    { id: "173", nombre: "Lérida" },
    { id: "174", nombre: "Chaparral" }
  ],
  30: [
    { id: "175", nombre: "Cali" },
    { id: "176", nombre: "Palmira" },
    { id: "177", nombre: "Buenaventura" },
    { id: "178", nombre: "Tuluá" },
    { id: "179", nombre: "Cartago" },
    { id: "180", nombre: "Buga" }
  ],
  31: [
    { id: "181", nombre: "Mitú" },
    { id: "182", nombre: "Carurú" },
    { id: "183", nombre: "Taraira" },
    { id: "184", nombre: "Papunaua" },
    { id: "185", nombre: "Yavaraté" },
    { id: "186", nombre: "Uaupés" }
  ],
  32: [
    { id: "187", nombre: "Puerto Carreño" },
    { id: "188", nombre: "La Primavera" },
    { id: "189", nombre: "Santa Rosalía" },
    { id: "190", nombre: "Cumaribo" },
    { id: "191", nombre: "Manacacías" },
    { id: "192", nombre: "Puerto Colombia (Vichada)" }
  ]
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
  restaurantRegisterForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formMsg = document.getElementById("formMsg");
    formMsg.className = "mt-2 small text-muted";
    formMsg.textContent = "Enviando solicitud...";

    const data = new FormData(restaurantRegisterForm);
    const departamentoId = data.get('departamento');
    const departamentoNombre = departamentos[departamentoId] || departamentoId;

    const payload = {
      name: data.get('name'),
      address: data.get('address'),
      phone: data.get('phone'),
      email: data.get('email'),
      category: data.get('category'),
      description: (data.get('notes') || '') + `\nPropietario: ${data.get('owner') || ''}` + `\nDepartamento: ${departamentoNombre}` + `\nMunicipio: ${data.get('municipio') || ''}`
    };

    try {
      const res = await fetch('/api/v1/restaurants/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.ok) {
        formMsg.className = 'mt-2 small text-success';
        formMsg.textContent = '¡Gracias! Tu solicitud fue registrada. Nos contactaremos pronto.';
        restaurantRegisterForm.reset();
        const munSelect = document.getElementById('municipio');
        if (munSelect) { munSelect.disabled = true; munSelect.innerHTML = '<option value="">Seleccione un departamento primero</option>'; }
      } else {
        formMsg.className = 'mt-2 small text-danger';
        formMsg.textContent = json.message || 'Error enviando la solicitud';
      }
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      formMsg.className = 'mt-2 small text-danger';
      formMsg.textContent = 'Error de red. Intenta de nuevo más tarde.';
    }
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
