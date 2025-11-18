// Auto-refresco para la sección de Gestión de Pedidos del Admin Dashboard
// Se ejecuta cada 15 segundos solo cuando la sección está activa

(function() {
  let autoRefreshInterval = null;
  
  function startAutoRefresh() {
    if (autoRefreshInterval) return; // Ya está corriendo
    
    autoRefreshInterval = setInterval(() => {
      const ordersSection = document.getElementById('orders-section');
      const refreshBtn = document.getElementById('ordersRefresh');
      
      // Solo refrescar si la sección está activa y el botón existe
      if (ordersSection && ordersSection.classList.contains('active') && refreshBtn) {
        console.log('[Auto-refresh] Actualizando pedidos...');
        refreshBtn.click();
      }
    }, 15000); // 15 segundos
    
    console.log('[Auto-refresh] Iniciado para Gestión de Pedidos');
  }
  
  function stopAutoRefresh() {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
      console.log('[Auto-refresh] Detenido');
    }
  }
  
  // Observar cambios en la sección de pedidos para activar/desactivar auto-refresh
  function setupObserver() {
    const ordersSection = document.getElementById('orders-section');
    if (!ordersSection) {
      console.warn('[Auto-refresh] No se encontró #orders-section');
      return;
    }
    
    const observer = new MutationObserver(() => {
      if (ordersSection.classList.contains('active')) {
        startAutoRefresh();
      } else {
        stopAutoRefresh();
      }
    });
    
    observer.observe(ordersSection, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    // Si la sección ya está activa al cargar, iniciar auto-refresh
    if (ordersSection.classList.contains('active')) {
      startAutoRefresh();
    }
  }
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObserver);
  } else {
    setupObserver();
  }
  
  // Detener auto-refresh al salir de la página
  window.addEventListener('beforeunload', stopAutoRefresh);
})();
