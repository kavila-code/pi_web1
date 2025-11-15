/**
 * Script de prueba para verificar el endpoint de métricas M/M/c
 * 
 * Uso:
 * 1. Asegurarse de que el servidor esté corriendo
 * 2. Tener un token de administrador
 * 3. Ejecutar: node test-queue-metrics.js
 */

const token = process.env.ADMIN_TOKEN || 'TU_TOKEN_AQUI';

async function testQueueMetrics() {
  try {
    console.log('🧪 Probando endpoint de métricas M/M/c...\n');

    const response = await fetch('http://localhost:3000/api/v1/admin/dashboard/queue-metrics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error('❌ Error en la respuesta');
      const errorText = await response.text();
      console.error(errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ Respuesta exitosa:\n');
    console.log(JSON.stringify(data, null, 2));

    if (data.ok && data.metrics) {
      console.log('\n📊 MÉTRICAS DEL SISTEMA M/M/c:');
      console.log('================================');
      console.log(`λ (Lambda):           ${data.metrics.lambda} pedidos/min`);
      console.log(`μ (Mu):              ${data.metrics.mu} entregas/min por repartidor`);
      console.log(`c (Servidores):      ${data.metrics.c} repartidores activos`);
      console.log(`ρ (Rho):             ${(data.metrics.rho * 100).toFixed(2)}% utilización`);
      console.log(`Lq:                  ${data.metrics.Lq.toFixed(2)} pedidos en cola`);
      console.log(`Wq:                  ${data.metrics.Wq.toFixed(2)} minutos de espera`);
      console.log(`Tiempo avg entrega:  ${data.metrics.avgDeliveryTime.toFixed(2)} minutos`);
      console.log('================================\n');

      // Evaluación del sistema
      console.log('🔍 EVALUACIÓN DEL SISTEMA:');
      console.log('================================');
      
      const rho = data.metrics.rho;
      if (rho < 0.7) {
        console.log('✅ Factor de utilización: ÓPTIMO');
      } else if (rho < 0.9) {
        console.log('⚠️  Factor de utilización: MODERADO');
      } else if (rho < 1) {
        console.log('🔴 Factor de utilización: ALTO - Cerca de saturación');
      } else {
        console.log('💀 Factor de utilización: SATURADO - Sistema colapsado');
      }

      const lq = data.metrics.Lq;
      if (lq < 2) {
        console.log('✅ Cola: EXCELENTE');
      } else if (lq < 5) {
        console.log('⚠️  Cola: ACEPTABLE');
      } else {
        console.log('🔴 Cola: CRÍTICO - Considerar más repartidores');
      }

      const wq = data.metrics.Wq;
      if (wq < 5) {
        console.log('✅ Tiempo de espera: RÁPIDO');
      } else if (wq < 10) {
        console.log('⚠️  Tiempo de espera: NORMAL');
      } else {
        console.log('🔴 Tiempo de espera: LENTO - Requiere atención');
      }
      console.log('================================\n');
    }

  } catch (error) {
    console.error('❌ Error al hacer la petición:', error.message);
  }
}

// Ejecutar prueba
testQueueMetrics();
