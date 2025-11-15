# 🚀 Guía Rápida: Módulo M/M/c

## ⚡ Acceso Rápido

1. **Iniciar el servidor** (si no está corriendo):
   ```bash
   npm start
   ```

2. **Acceder al dashboard**:
   ```
   http://localhost:3000/admin-dashboard
   ```

3. **Iniciar sesión** con credenciales de administrador

4. La sección de análisis M/M/c aparece automáticamente en el Dashboard principal

## 📱 Uso del Módulo

### Visualización de Métricas

El módulo muestra **6 tarjetas KPI**:

#### Parámetros del Sistema (fondo gris claro)
- **λ (Lambda)**: Tasa de llegada de pedidos
- **μ (Mu)**: Tasa de servicio por repartidor  
- **c**: Número de repartidores activos

#### Métricas de Rendimiento (fondo blanco)
- **ρ (Rho)**: Factor de utilización con badge de estado
- **Lq**: Pedidos promedio en cola con badge de estado
- **Wq**: Tiempo promedio de espera con badge de estado

### Actualizar Datos

Haz clic en el botón **"🔄 Actualizar"** en la esquina superior derecha del módulo para refrescar las métricas.

## 🎨 Interpretación de Estados

### 🟢 Verde (Óptimo/Excelente/Rápido)
- Sistema funcionando perfectamente
- No se requieren acciones

### 🟡 Amarillo (Moderado/Aceptable/Normal)
- Sistema funcionando bien pero acercándose a límites
- Monitorear de cerca

### 🔴 Rojo (Alto/Crítico/Lento)
- Sistema cerca de saturación o con problemas
- **Acción requerida**: Considerar agregar más repartidores

### ⚫ Negro (Saturado)
- Sistema colapsado
- **Acción urgente**: Agregar repartidores inmediatamente

## 💡 Ejemplos de Decisiones

### Escenario 1: ρ = 45% (Verde)
- **Interpretación**: Sistema subutilizado
- **Acción**: Capacidad sobrada, sistema eficiente

### Escenario 2: ρ = 75% (Amarillo)
- **Interpretación**: Utilización moderada
- **Acción**: Monitorear tendencias, prepararse para picos

### Escenario 3: ρ = 95% (Rojo)
- **Interpretación**: Sistema cerca de saturación
- **Acción**: Contratar más repartidores urgentemente

### Escenario 4: Lq = 8 pedidos (Rojo)
- **Interpretación**: Muchos pedidos esperando
- **Acción**: Aumentar capacidad de entrega

### Escenario 5: Wq = 15 min (Rojo)
- **Interpretación**: Clientes esperando demasiado
- **Acción**: Optimizar asignación o agregar repartidores

## 🔧 Solución de Problemas

### El módulo no carga
1. Verificar que estés autenticado como administrador
2. Abrir consola del navegador (F12) y buscar errores
3. Verificar que el servidor esté corriendo

### Métricas muestran "-"
- Significa que no hay suficientes datos
- Esperar a que se generen más pedidos
- Verificar que hay pedidos en los últimos 7 días

### Valores parecen incorrectos
- Las métricas se calculan con datos de los últimos 7 días
- Si el negocio es nuevo, los valores pueden ser bajos
- A medida que se generen más pedidos, las métricas serán más precisas

## 📊 Fórmulas (Referencia Técnica)

```
λ = total_pedidos / minutos_transcurridos

μ = 1 / tiempo_promedio_entrega

ρ = λ / (μ × c)

Lq = (C × ρ) / (1 - ρ)  [donde C es la probabilidad de Erlang-C]

Wq = Lq / λ
```

## 🎯 Mejores Prácticas

1. **Revisar diariamente**: Monitorear las métricas cada mañana
2. **Horarios pico**: Prestar especial atención durante almuerzo y cena
3. **Fines de semana**: Tener repartidores adicionales disponibles
4. **Tendencias**: Observar cambios a lo largo del tiempo
5. **Decisiones basadas en datos**: No confiar solo en intuición

## 📞 Soporte

Si encuentras problemas o necesitas ayuda:
- Consulta la documentación completa: `docs/MMC_QUEUE_ANALYSIS.md`
- Revisa el resumen de implementación: `docs/MMC_IMPLEMENTATION_SUMMARY.md`
- Ejecuta el script de prueba: `node test-queue-metrics.js`

---

**¡El sistema está listo para usar!** 🎉
