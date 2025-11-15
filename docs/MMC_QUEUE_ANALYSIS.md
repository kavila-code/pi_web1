# 📊 Módulo de Análisis M/M/c - Teoría de Colas

## 🎯 Descripción

Este módulo implementa un análisis basado en el **modelo de teoría de colas M/M/c** para evaluar la eficiencia operacional del sistema de entregas de DomiTulua.

## 📐 Modelo M/M/c

El modelo M/M/c es un sistema de colas con las siguientes características:

- **M** (Markoviano): Llegadas siguen una distribución de Poisson
- **M** (Markoviano): Tiempos de servicio siguen una distribución exponencial  
- **c**: Número de servidores (repartidores) en paralelo

## 📊 Métricas Calculadas

### Parámetros del Sistema

1. **λ (Lambda)** - Tasa de llegada
   - Pedidos por minuto que llegan al sistema
   - Calculado desde pedidos de los últimos 7 días
   - Fórmula: `total_pedidos / minutos_transcurridos`

2. **μ (Mu)** - Tasa de servicio
   - Entregas por minuto por repartidor
   - Calculado desde el tiempo promedio entre "asignado" y "entregado"
   - Fórmula: `1 / tiempo_promedio_entrega`

3. **c** - Servidores
   - Número de repartidores activos en el sistema
   - Obtenido contando usuarios con rol "delivery"

### Métricas de Rendimiento

4. **ρ (Rho)** - Factor de Utilización
   - Indica qué tan ocupado está el sistema
   - Fórmula: `λ / (μ * c)`
   - Interpretación:
     - ρ < 0.7: **Óptimo** - Sistema con capacidad sobrada
     - 0.7 ≤ ρ < 0.9: **Moderado** - Sistema funcionando bien
     - 0.9 ≤ ρ < 1: **Alto** - Sistema cerca de saturación
     - ρ ≥ 1: **Saturado** - Sistema colapsado

5. **Lq** - Longitud de Cola
   - Número promedio de pedidos esperando ser asignados
   - Calculado usando fórmula de Erlang-C
   - Interpretación:
     - Lq < 2: **Excelente**
     - 2 ≤ Lq < 5: **Aceptable**
     - Lq ≥ 5: **Crítico** - Considerar más repartidores

6. **Wq** - Tiempo de Espera
   - Tiempo promedio (en minutos) que un pedido espera en cola
   - Fórmula: `Lq / λ`
   - Interpretación:
     - Wq < 5 min: **Rápido**
     - 5 ≤ Wq < 10 min: **Normal**
     - Wq ≥ 10 min: **Lento** - Requiere atención

## 🔌 Endpoints API

### GET `/api/v1/admin/dashboard/queue-metrics`

**Autenticación**: Requerida (Bearer Token)  
**Rol**: Admin

**Respuesta exitosa (200)**:
```json
{
  "ok": true,
  "metrics": {
    "lambda": 0.0125,
    "mu": 0.0333,
    "c": 5,
    "rho": 0.0750,
    "Lq": 0.02,
    "Wq": 1.60,
    "avgDeliveryTime": 30.00
  }
}
```

## 🎨 Interfaz de Usuario

El módulo se muestra en el dashboard de administración (`/admin-dashboard`) con:

- **3 tarjetas de parámetros** (λ, μ, c) con iconos distintivos
- **3 tarjetas de métricas** (ρ, Lq, Wq) con badges de estado
- **Indicadores de color** según los umbrales definidos
- **Botón de actualización** para refrescar datos en tiempo real

### Tarjetas KPI

Cada tarjeta muestra:
- Icono representativo
- Nombre de la métrica
- Valor calculado
- Descripción breve
- Badge de estado (para métricas de rendimiento)

## 📁 Archivos Modificados

1. **Backend**:
   - `controllers/admin.controller.js` - Función `getQueueMetrics()`
   - `routes/admin.route.js` - Ruta `/dashboard/queue-metrics`

2. **Frontend**:
   - `public/admin-dashboard.html` - Sección de análisis M/M/c
   - `frontend/js/admin-dashboard.js` - Función `loadQueueMetrics()`
   - `frontend/admin-dashboard.css` - Estilos para tarjetas KPI

## 🔧 Configuración

El análisis utiliza datos de los **últimos 7 días** por defecto. Esto se puede modificar en:

```javascript
// controllers/admin.controller.js
WHERE created_at >= NOW() - INTERVAL '7 days'
```

## 📈 Casos de Uso

### Escenario 1: Sistema con baja demanda
- λ = 0.01 pedidos/min (14.4 pedidos/día)
- μ = 0.033 entregas/min (30 min promedio)
- c = 5 repartidores
- **Resultado**: ρ = 0.06 (6%) → Sistema subutilizado

### Escenario 2: Sistema equilibrado
- λ = 0.12 pedidos/min (172.8 pedidos/día)
- μ = 0.033 entregas/min
- c = 5 repartidores
- **Resultado**: ρ = 0.73 (73%) → Utilización moderada

### Escenario 3: Sistema saturado
- λ = 0.18 pedidos/min (259.2 pedidos/día)
- μ = 0.033 entregas/min
- c = 5 repartidores
- **Resultado**: ρ = 1.09 (109%) → Sistema colapsado, se requieren más repartidores

## 🚀 Uso

1. Acceder al dashboard de administración: `http://localhost:3000/admin-dashboard`
2. La sección de análisis M/M/c se carga automáticamente
3. Hacer clic en "Actualizar" para refrescar las métricas
4. Revisar los badges de estado para identificar problemas
5. Tomar decisiones operativas basadas en las métricas

## 💡 Recomendaciones

- **ρ > 0.9**: Contratar más repartidores
- **Lq > 5**: Revisar proceso de asignación de pedidos
- **Wq > 10 min**: Optimizar rutas de entrega o aumentar capacidad

## 📚 Referencias

- Teoría de Colas: Modelo M/M/c
- Fórmula de Erlang-C para sistemas multiservidor
- Análisis de sistemas de entrega a domicilio

---

**Fecha de implementación**: Noviembre 2025  
**Versión**: 1.0
