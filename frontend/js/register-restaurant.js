// DomiTuluá - Register Restaurant JavaScript

// Nombres de departamentos usados en el formulario (coinciden con las options del HTML)
const departamentoNombres = {
  '1': 'Valle del Cauca',
  '2': 'Cundinamarca',
  '3': 'Antioquia',
  '4': 'Caldas',
};

// Municipios por departamento (subset suficiente para el formulario)
const municipiosPorDepartamento = {
  '1': [ // Valle del Cauca
    { id: '175', nombre: 'Cali' },
    { id: '176', nombre: 'Palmira' },
    { id: '177', nombre: 'Buenaventura' },
    { id: '178', nombre: 'Tuluá' },
    { id: '179', nombre: 'Cartago' },
    { id: '180', nombre: 'Buga' },
  ],
  '2': [ // Cundinamarca
    { id: '79', nombre: 'Bogotá' },
    { id: '80', nombre: 'Soacha' },
    { id: '83', nombre: 'Zipaquirá' },
    { id: '84', nombre: 'Chía' },
    { id: '82', nombre: 'Fusagasugá' },
  ],
  '3': [ // Antioquia
    { id: '10', nombre: 'Envigado' },
    { id: '11', nombre: 'Rionegro' },
    { id: '12', nombre: 'Apartadó' },
    { id: '200', nombre: 'Medellín' },
  ],
  '4': [ // Caldas
    { id: '37', nombre: 'Manizales' },
    { id: '38', nombre: 'Chinchiná' },
    { id: '39', nombre: 'La Dorada' },
    { id: '40', nombre: 'Villamaría' },
  ],
};

// Poblar municipios según departamento seleccionado
document.addEventListener('DOMContentLoaded', function () {
  const depSelect = document.getElementById('departamento');
  const munSelect = document.getElementById('municipio');

  if (!depSelect || !munSelect) return;

  const renderMunicipios = (depId) => {
    munSelect.innerHTML = '';
    if (!depId || !municipiosPorDepartamento[depId]) {
      munSelect.disabled = true;
      munSelect.innerHTML = '<option value="">Seleccione un departamento primero</option>';
      return;
    }
    const opts = ['<option value="">Seleccione un municipio</option>'];
    municipiosPorDepartamento[depId].forEach((m) => {
      opts.push(`<option value="${m.nombre}">${m.nombre}</option>`);
    });
    munSelect.innerHTML = opts.join('');
    munSelect.disabled = false;
  };

  // Inicializar según valor actual (si el navegador mantiene estado)
  renderMunicipios(depSelect.value);

  depSelect.addEventListener('change', function () {
    renderMunicipios(this.value);
  });
});

// Envío del formulario (multipart con posible logo)
document.addEventListener('DOMContentLoaded', function () {
  const restaurantRegisterForm = document.getElementById('restaurantRegisterForm');
  if (!restaurantRegisterForm) return;
  const token = localStorage.getItem('token');
  if (!token) {
    try { sessionStorage.setItem('afterLoginRedirect', '/register-restaurant'); } catch (e) {}
    window.location.href = '/login';
    return;
  }

  restaurantRegisterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formMsg = document.getElementById('formMsg');
    formMsg.className = 'mt-2 small text-muted';
    formMsg.textContent = 'Enviando solicitud...';

    const data = new FormData(restaurantRegisterForm);
    const departamentoId = data.get('departamento');
    const departamentoNombre = departamentoNombres[departamentoId] || departamentoId || '';
    const notes = data.get('notes') || '';
    const composedDescription = `${notes}\nPropietario: ${data.get('owner') || ''}\nDepartamento: ${departamentoNombre}\nMunicipio: ${data.get('municipio') || ''}`;
    data.set('description', composedDescription);

    try {
      const res = await fetch('/api/v1/restaurants/apply', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
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
});

// Preparar mailto con datos del formulario
const form = document.getElementById('restaurantRegisterForm');
const mailto = document.getElementById('mailtoLink');

function updateMailto() {
  if (!form || !mailto) return;
  const data = new FormData(form);
  const subject = encodeURIComponent('Solicitud de registro de restaurante');
  const depId = data.get('departamento');
  const depNombre = depId ? (departamentoNombres[depId] || depId) : '';
  const munNombre = data.get('municipio') || '';
  const body = encodeURIComponent(
    `Nombre del Restaurante: ${data.get('name') || ''}\n` +
    `Propietario: ${data.get('owner') || ''}\n` +
    `Teléfono: ${data.get('phone') || ''}\n` +
    `Email: ${data.get('email') || ''}\n` +
    `Dirección: ${data.get('address') || ''}\n` +
    `Departamento: ${depNombre}\n` +
    `Municipio: ${munNombre}\n` +
    `Categoría: ${data.get('category') || ''}\n` +
    `Observaciones: ${data.get('notes') || ''}`
  );
  mailto.href = `mailto:registro@domitulua.com?subject=${subject}&body=${body}`;
}

if (form) {
  form.addEventListener('input', updateMailto);
  form.addEventListener('change', updateMailto);
}
