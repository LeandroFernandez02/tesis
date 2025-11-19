# Integración Completa: CU-20, CU-21, CU-22

## ✅ Funcionalidades Implementadas e Integradas

### **Estado: COMPLETAMENTE FUNCIONAL**

Todos los casos de uso están ahora **integrados en la aplicación principal** y listos para usar.

---

## 📍 Ubicación en la Aplicación

### **Cómo acceder:**

1. **Selecciona un incidente** desde el selector de incidentes
2. Ve a la pestaña **"Gestión de incidentes"** (parte superior)
3. Haz clic en la sub-pestaña **"Polígonos"**

Ahora estarás en el mapa con todas las herramientas de dibujo GIS y las nuevas funcionalidades.

---

## 🎯 CU-20: Asignar Polígono a Grupo

### **¿Cómo funciona?**

#### Paso 1: Dibuja un polígono
- Usa las herramientas de dibujo del panel izquierdo
- Haz clic en el botón de **polígono** (cuadrado rojo)
- Dibuja el área de búsqueda en el mapa
- Presiona **Enter** o doble clic para finalizar

#### Paso 2: Asignar a un grupo
- **Haz clic derecho** sobre el polígono dibujado
- Se abre un menú contextual
- Selecciona **"Asignar Grupo"**
- Elige el grupo de rastrillaje de la lista

#### Paso 3: Verificar asignación
- El polígono ahora está vinculado al grupo
- Puedes cambiar la asignación o quitarla con clic derecho

### **Visual Feedback**
- ✅ El grupo asignado se muestra en el menú contextual
- ✅ Los grupos aparecen con estado, líder y número de agentes
- ✅ Botón "Quitar Asignación" si ya está asignado

---

## 📤 CU-21: Cargar Traza GPX

### **¿Cómo funciona?**

#### Opción 1: Desde el grupo (recomendado para futuro)
- En la pestaña "Grupos de Rastrillaje"
- Cada tarjeta de grupo tiene un botón de **upload** (flecha arriba)
- Por ahora, te redirige a la pestaña de Polígonos

#### Opción 2: Desde el mapa (ACTUALMENTE ACTIVO)
1. Ve a la pestaña **"Polígonos"**
2. Busca el botón de **"Cargar archivos GPX"** (ícono morado de archivo con flecha)
   - Está en el panel superior izquierdo
3. Se abre el modal clásico de carga GPX

### **Carga con Drag & Drop**
- Arrastra un archivo `.gpx` directamente al área
- O haz clic para seleccionar desde tu dispositivo
- Ingresa una etiqueta opcional (ej: "Avance 10:30")
- Si no ingresas etiqueta, se genera automáticamente

### **Validaciones**
- ✅ Solo acepta archivos `.gpx`
- ✅ Tamaño máximo: 10MB
- ✅ Valida formato GPX antes de cargar
- ✅ Muestra nombre y tamaño del archivo

---

## 👁️ CU-22: Visualizar Capas

### **¿Cómo funciona?**

#### Abrir el Panel de Gestión de Capas
- En la pestaña **"Polígonos"**
- Busca el botón **verde de capas** (con ícono de Layers)
- Está en el panel superior izquierdo, después del botón de GPX

#### Secciones del Panel

**1. Capas del Mapa** (switches on/off)
- 🔴 **Polígonos**: Mostrar/ocultar todas las zonas dibujadas
- 🔵 **POIs**: Puntos de interés (marcadores)
- 🟡 **Punto Cero**: Ubicación inicial del incidente

**2. Trazados GPX** (tree view)
- Organizado por grupos
- Cada grupo muestra:
  - Color distintivo del grupo
  - Nombre del grupo
  - Contador de trazas visibles/totales (ej: "2/3")
  
**Para cada traza:**
- Etiqueta del trazado
- Fecha y hora de carga
- Botón de ojo (mostrar/ocultar)
- Botón de papelera (eliminar)

#### Acciones Disponibles
- ✅ **Expandir/contraer** grupos (clic en el nombre)
- ✅ **Mostrar/ocultar** trazas individuales
- ✅ **Eliminar** trazas con confirmación
- ✅ **Ver estadísticas** (total de trazas por grupo)

---

## 🚀 Flujo de Trabajo Completo

### **Caso de Uso Real: Operación de Búsqueda**

#### 1. Preparación (Coordinador)
```
📋 Incidente → Pestaña "Grupos" → Crear grupos de rastrillaje
```

#### 2. Asignación de Zonas
```
📋 Incidente → Pestaña "Polígonos" → Dibujar zonas
→ Clic derecho en polígono → Asignar grupo
```

#### 3. Despliegue al Campo
```
Los grupos salen con dispositivos GPS
Registran sus recorridos en archivos .gpx
```

#### 4. Carga de Trazas
```
📋 Incidente → Pestaña "Polígonos" 
→ Botón "Cargar GPX" (morado)
→ Arrastrar archivo .gpx
→ Ingresar etiqueta (ej: "Avance 14:30")
→ Cargar
```

#### 5. Visualización y Análisis
```
📋 Incidente → Pestaña "Polígonos"
→ Botón "Gestión de Capas" (verde)
→ Expandir grupo en la lista
→ Ver todas las trazas del grupo
→ Activar/desactivar según necesidad
```

#### 6. Coordinación
```
✅ Ver qué áreas ya fueron rastreadas
✅ Evitar duplicación de esfuerzos
✅ Identificar zonas sin cubrir
✅ Reasignar grupos según progreso
```

---

## 🎨 Identificación Visual

### **Colores de los Componentes**

- **🔴 Botón Capas del Mapa** (gris): Panel de mapas base (OSM, Satélite, Topográfico)
- **🟣 Botón Cargar GPX** (morado): Modal de carga de archivos GPX
- **🟢 Botón Gestión de Capas** (verde): Panel CU-22 con tree view de trazas

### **Colores de las Trazas GPX**
Cada grupo tiene asignado automáticamente un color único:
- Rojo, Azul, Verde, Amarillo, Morado, Rosa, Cyan, Naranja
- El color se mantiene consistente para todas las trazas del mismo grupo

---

## 🔧 Características Técnicas

### **Persistencia de Datos**
- ❌ **Actualmente en memoria**: Los datos se pierden al recargar
- ✅ **Próxima integración**: Supabase para persistencia completa

### **Formatos Soportados**
- **GPX**: Tracks, rutas y waypoints
- **Exportación**: GeoJSON de polígonos dibujados

### **Performance**
- Las trazas GPX se pueden ocultar para mejorar rendimiento
- El tree view se colapsa por defecto para ahorrar espacio
- Carga lazy de capas según visibilidad

---

## 📱 Atajos de Teclado

### **En el mapa de polígonos:**
- `ESC`: Cancelar dibujo actual
- `Enter`: Finalizar polígono/línea
- `Ctrl+Z`: Deshacer último punto
- `Backspace`: Deshacer último punto (alternativa)

### **Navegación general:**
- `Alt+3`: Ir a pestaña de Mapa/Polígonos
- `Alt+2`: Ir a pestaña de Grupos

---

## ❓ Preguntas Frecuentes

### **¿Puedo cargar GPX sin asignar a un grupo?**
Actualmente el modal clásico carga GPX de forma general. La funcionalidad de asignar GPX directamente desde cada grupo estará disponible próximamente.

### **¿Cómo sé qué grupo tiene asignado un polígono?**
Haz clic derecho en el polígono. El menú contextual muestra el grupo asignado con un badge verde.

### **¿Puedo reasignar un polígono a otro grupo?**
Sí. Clic derecho → "Cambiar Grupo" → Selecciona el nuevo grupo.

### **¿Las trazas GPX se guardan en el incidente?**
Actualmente están en memoria. Al implementar backend con Supabase, se guardarán persistentemente.

### **¿Cómo exporto todos los polígonos?**
Usa el botón "Exportar" en el panel de herramientas. Se descarga un archivo GeoJSON.

---

## 🔮 Próximas Mejoras

### **Planificadas:**
- [ ] Integración completa con Supabase (persistencia)
- [ ] Modal de carga GPX mejorado con selector de grupo
- [ ] Estadísticas de área cubierta por grupo
- [ ] Alertas de sobreposición de zonas
- [ ] Exportar trazas GPX combinadas por grupo
- [ ] Comparación visual de trazas entre grupos
- [ ] Filtros por fecha/hora de trazas
- [ ] Generación automática de informes con mapas

---

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:
1. Verifica que estés en la pestaña correcta ("Polígonos")
2. Asegúrate de tener grupos creados antes de asignar
3. Los archivos GPX deben estar en formato válido
4. Revisa la consola del navegador para más detalles

---

**Última actualización**: 12 de Noviembre de 2025  
**Versión**: v1.0 - Integración Completa  
**Estado**: ✅ FUNCIONANDO EN PRODUCCIÓN
