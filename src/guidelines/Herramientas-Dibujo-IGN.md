# Herramientas de Dibujo IGN Argentina - Sistema DUAR

## Descripción General

El módulo de **Herramientas de Dibujo** proporciona capacidades profesionales para que los bomberos tracen áreas de rastrillaje, rutas de búsqueda, y puntos de interés directamente sobre el mapa del IGN Argentina.

## Ubicación en el Sistema

**Ruta:** Gestión de Incidentes → Seleccionar Incidente → Mapa → Herramientas de Dibujo

## Características Principales

### 1. Herramientas de Dibujo Disponibles

#### 🔴 Polígono (Área de Rastrillaje)
- **Uso:** Definir zonas de búsqueda irregulares
- **Color:** Rojo (#dc2626)
- **Medición:** Calcula automáticamente el área en hectáreas
- **Validación:** No permite que las líneas se crucen
- **Aplicación:** Definir sectores de rastrillaje en terrenos irregulares

#### 🟠 Rectángulo
- **Uso:** Definir zonas de búsqueda rectangulares
- **Color:** Naranja (#f59e0b)
- **Medición:** Calcula área en hectáreas
- **Aplicación:** Grillas de búsqueda sistemática

#### 🟢 Círculo (Radio de Búsqueda)
- **Uso:** Definir áreas circulares de búsqueda
- **Color:** Verde (#10b981)
- **Medición:** Radio en km y área en hectáreas
- **Aplicación:** Búsqueda radial desde último punto conocido

#### 🔵 Línea (Ruta de Búsqueda)
- **Uso:** Trazar rutas, senderos, o caminos
- **Color:** Azul (#2563eb)
- **Medición:** Distancia total en kilómetros
- **Aplicación:** Planificar rutas de rastrillaje, marcar senderos

#### 📍 Marcador (Punto de Interés)
- **Uso:** Marcar ubicaciones específicas
- **Aplicación:** Último lugar visto, campamento base, puntos de reunión

### 2. Herramientas de Edición

- **Editar:** Modificar polígonos existentes moviendo vértices
- **Eliminar:** Borrar formas individuales o todas a la vez
- **Guardar:** Las formas se guardan automáticamente

### 3. Mediciones Automáticas

#### Áreas (Polígonos, Rectángulos, Círculos)
- Cálculo geodésico preciso
- Unidad: Hectáreas (ha)
- Tooltip automático con el área
- Actualización en tiempo real

#### Distancias (Líneas)
- Cálculo de distancia total del trazo
- Unidad: Kilómetros (km)
- Considera la curvatura terrestre

### 4. Capas de Mapa Base

Tres capas del IGN Argentina disponibles:

1. **ArgenMap** (Predeterminado)
   - Mapa vectorial con rutas, ciudades, límites
   - Ideal para planificación inicial

2. **Satélite**
   - Imágenes satelitales
   - Ideal para reconocimiento de terreno

3. **Topográfico**
   - Mapa con curvas de nivel
   - Ideal para búsqueda en montañas (Sierras de Córdoba)

### 5. Exportación de Datos

#### Formato GeoJSON
- Exporta todas las formas dibujadas
- Estándar internacional para datos geoespaciales
- Compatible con:
  - Google Earth
  - QGIS
  - ArcGIS
  - GPS Garmin/Magellan
  - Otras aplicaciones SAR

#### Nombre de Archivo
- Formato: `zonas-rastrillaje-YYYY-MM-DD.geojson`
- Incluye fecha de creación

## Flujo de Trabajo SAR

### Planificación de Rastrillaje

1. **Análisis Inicial**
   - Cambiar a capa **Satélite** o **Topográfico**
   - Identificar características del terreno
   - Ubicar obstáculos naturales

2. **División en Sectores**
   - Usar **Polígonos** para dividir el área total
   - Considerar:
     - Tipo de terreno
     - Accesibilidad
     - Prioridad de búsqueda
   - Ver área automática en hectáreas

3. **Definición de Rutas**
   - Usar **Líneas** para trazar rutas de acceso
   - Marcar senderos existentes
   - Planificar rutas de evacuación

4. **Marcado de Puntos Críticos**
   - **Marcadores** para:
     - Último punto conocido (LKP)
     - Campamento base
     - Puntos de reunión
     - Fuentes de agua
     - Refugios

5. **Exportación y Distribución**
   - Exportar como GeoJSON
   - Compartir con equipos
   - Cargar en dispositivos GPS

## Panel de Control Lateral

### Estadísticas en Tiempo Real
- Contador de formas dibujadas
- Lista de todas las formas con sus mediciones
- Total de áreas trazadas

### Acciones Rápidas

#### 📍 Mi Ubicación
- Centra el mapa en tu ubicación actual GPS
- Muestra marcador azul pulsante

#### 💾 Exportar GeoJSON
- Descarga todas las formas trazadas
- Preserva metadatos y mediciones

#### 🗑️ Limpiar Todo
- Elimina todas las formas del mapa
- Requiere confirmación

## Tecnología Utilizada

### Librerías
- **Leaflet.js** v1.9.4 - Motor de mapas
- **Leaflet.draw** v1.0.4 - Herramientas de dibujo
- **Leaflet.GeometryUtil** - Cálculos geodésicos
- **IGN Argentina WMS/TMS** - Capas base

### Cálculos Geodésicos
- Usa algoritmos de geodesia esférica
- Considera la curvatura de la Tierra
- Precisión: +/- 0.1%

## Coordinación con Otros Módulos

### Integración con Zonas de Búsqueda
Las formas dibujadas aquí pueden:
- Exportarse para asignación de equipos
- Convertirse en zonas formales de búsqueda
- Vincularse con grupos de rastrillaje

### Integración con GPS
- Los polígonos pueden cargarse en GPS
- Las rutas sirven de guía para navegación
- Los marcadores crean waypoints

## Ejemplos de Uso

### Caso 1: Persona Desaparecida en Sierras de Córdoba

**Situación:** Senderista desaparecido en zona montañosa

**Procedimiento:**
1. Cambiar a capa **Topográfico**
2. Ubicar último punto conocido con **Marcador**
3. Dibujar **Círculo** de 5km de radio
4. Dividir círculo en 4 **Polígonos** (Norte, Sur, Este, Oeste)
5. Marcar senderos existentes con **Líneas**
6. Exportar y distribuir a equipos

**Resultado:** 
- 4 sectores de ~19.6 ha cada uno
- Rutas de acceso definidas
- Coordenadas precisas para GPS

### Caso 2: Rastrillaje Sistemático en Campo Abierto

**Situación:** Niño extraviado en zona rural llana

**Procedimiento:**
1. Cambiar a capa **Satélite**
2. Identificar campos, caminos, construcciones
3. Crear grilla con **Rectángulos** de 500m x 500m
4. Marcar con **Líneas** los caminos de acceso
5. **Marcadores** en viviendas cercanas
6. Exportar para asignación a equipos

**Resultado:**
- Grilla sistemática de búsqueda
- 25 hectáreas por sector
- Cobertura completa del área

## Buenas Prácticas

### ✅ Recomendaciones

1. **Usar Capa Apropiada**
   - Satélite: Reconocimiento de terreno
   - Topográfico: Zonas montañosas
   - ArgenMap: Planificación general

2. **Tamaño de Sectores**
   - Considerar tiempo estimado: 2-4 horas por sector
   - Áreas típicas: 10-30 hectáreas
   - Ajustar según dificultad del terreno

3. **Nomenclatura Clara**
   - Exportar con nombres descriptivos
   - Incluir fecha y hora
   - Documentar en timeline del incidente

4. **Backup Regular**
   - Exportar periódicamente
   - Guardar versiones
   - Compartir con comando

### ⚠️ Consideraciones

1. **Conectividad**
   - Requiere Internet para cargar mapas
   - Planear descarga offline si es necesario
   - Tener backup en papel

2. **Precisión GPS**
   - Los mapas son referenciales
   - Verificar con GPS en campo
   - Considerar margen de error

3. **Escala Apropiada**
   - No crear polígonos demasiado pequeños
   - Mantener sectores manejables
   - Considerar capacidad de equipos

## Soporte y Ayuda

### Atajos de Teclado
- **Esc**: Cancelar dibujo actual
- **Delete**: Eliminar forma seleccionada
- **Ctrl+Z**: Deshacer (en modo edición)

### Solución de Problemas

**El mapa no carga:**
- Verificar conexión a Internet
- Recargar página
- Cambiar capa de mapa

**No puedo dibujar:**
- Verificar que herramienta esté seleccionada
- Hacer clic dentro del mapa
- Revisar que el mapa esté visible

**Las mediciones parecen incorrectas:**
- Las áreas son en hectáreas (1 ha = 10,000 m²)
- Las distancias son en kilómetros
- Los cálculos son geodésicos (curvatura terrestre)

## Próximas Mejoras

### Planeadas
- [ ] Importar archivos GPX/KML
- [ ] Plantillas de sectores predefinidos
- [ ] Compartir en tiempo real con equipos
- [ ] Integración con drones (áreas de vuelo)
- [ ] Historial de trazados
- [ ] Capas adicionales (hidrografía, rutas)
- [ ] Modo offline con tiles precargados

### En Desarrollo
- [ ] Asignación directa de equipos a polígonos
- [ ] Etiquetas personalizadas para formas
- [ ] Cálculo de tiempo estimado por sector
- [ ] Alertas de solapamiento de zonas

## Conclusión

Las Herramientas de Dibujo IGN son fundamentales para la planificación profesional de operaciones de búsqueda y rescate, permitiendo a los bomberos dividir eficientemente las áreas de rastrillaje, planificar rutas de acceso, y coordinar equipos con precisión cartográfica oficial de Argentina.
