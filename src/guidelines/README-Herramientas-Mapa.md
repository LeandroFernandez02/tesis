# 🗺️ Módulo de Mapa - Sistema DUAR

## Resumen Ejecutivo

El módulo de Mapa del Sistema DUAR integra las herramientas profesionales del Instituto Geográfico Nacional (IGN) de Argentina para planificación y ejecución de operaciones de búsqueda y rescate.

## Componentes Principales

### 1. 📍 **Mapa Operacional** (`IncidentMap`)
**Archivo:** `/components/incident-map.tsx`

**Funcionalidades:**
- Visualización de incidentes activos
- Marcadores con código de colores por prioridad
- Grupos desplegados en tiempo real
- Información detallada de cada incidente
- Navegación GPS

**Capas del IGN:**
- ArgenMap (vectorial)
- Satélite
- Topográfico
- Híbrido

---

### 2. ✏️ **Herramientas de Dibujo** (`MapDrawTools`) ⭐ NUEVO
**Archivo:** `/components/map-draw-tools.tsx`

**Funcionalidades:**
- **Polígonos:** Áreas de rastrillaje irregulares
- **Rectángulos:** Grillas de búsqueda sistemática
- **Círculos:** Radios de búsqueda desde punto conocido
- **Líneas:** Rutas de rastrillaje y acceso
- **Marcadores:** Puntos de interés (LKP, campamento base)

**Mediciones Automáticas:**
- ✅ Áreas en hectáreas (cálculo geodésico)
- ✅ Distancias en kilómetros
- ✅ Radio de círculos

**Exportación:**
- Formato GeoJSON estándar
- Compatible con GPS, Google Earth, QGIS

**Tecnología:**
- Leaflet.js v1.9.4
- Leaflet.draw v1.0.4
- IGN Argentina WMS/TMS

---

### 3. 📚 **Guía de Herramientas** (`MapToolsGuide`) ⭐ NUEVO
**Archivo:** `/components/map-tools-guide.tsx`

**Contenido:**
- Tutorial interactivo de cada herramienta
- Casos de uso SAR
- Buenas prácticas
- Flujo de trabajo recomendado
- Consejos operacionales

---

### 4. 🛰️ **GPS y Navegación** (`OfflineMap`)
**Archivo:** `/components/offline-map.tsx`

**Funcionalidades:**
- Tracking GPS en tiempo real
- Importar/exportar archivos GPX
- Descarga de mapas offline
- Brújula digital
- Estadísticas de recorrido

---

### 5. 🎯 **Zonas de Búsqueda** (`SearchAreaPlanner`)
**Archivo:** `/components/search-area-planner.tsx`

**Funcionalidades:**
- Asignación de equipos mediante drag & drop
- Gestión de sectores de rastrillaje
- Cálculo de áreas y tiempos
- Estados de zonas (planificado, asignado, activo, completado)

---

## Estructura de Navegación

```
Gestión de Incidentes
└── Seleccionar Incidente
    └── Mapa (Menú Lateral)
        ├── 📍 Mapa              → Vista general de incidentes
        ├── ✏️ Herramientas      → Dibujo de polígonos ⭐ NUEVO
        ├── 📚 Guía              → Tutorial y ayuda ⭐ NUEVO
        ├── 🛰️ GPS               → Navegación y tracking
        └── 🎯 Zonas             → Planificador de sectores
```

---

## Flujo de Trabajo Típico

### Caso: Persona Desaparecida en Sierras de Córdoba

#### Paso 1: Análisis Inicial
**Pestaña:** Mapa
```
1. Ver incidente activo en el mapa
2. Revisar ubicación aproximada
3. Consultar grupos desplegados
```

#### Paso 2: Planificación con Herramientas de Dibujo
**Pestaña:** Herramientas
```
1. Cambiar a capa "Topográfico"
2. Marcar último punto conocido (LKP)
3. Dibujar círculo de 5km de radio
4. Dividir en 4 polígonos (N, S, E, O)
5. Trazar rutas de acceso principales
6. Exportar como GeoJSON
```

**Resultado:**
- 4 sectores definidos
- Área total: ~78 hectáreas
- Rutas de acceso trazadas
- Archivo para distribución

#### Paso 3: Consultar Guía (si es necesario)
**Pestaña:** Guía
```
- Ver ejemplos de uso
- Revisar buenas prácticas
- Consultar atajos
```

#### Paso 4: Asignación de Equipos
**Pestaña:** Zonas
```
1. Importar polígonos dibujados (futuro)
2. Arrastrar equipos a sectores
3. Confirmar asignaciones
4. Ver estado en tiempo real
```

#### Paso 5: Navegación GPS
**Pestaña:** GPS
```
1. Cargar waypoints en dispositivos
2. Activar tracking de equipos
3. Monitorear progreso
4. Exportar tracks al finalizar
```

---

## Archivos Clave

### Componentes
```
/components/
  ├── incident-map.tsx           # Mapa principal con IGN
  ├── incident-map-ign.tsx       # Versión optimizada IGN
  ├── map-draw-tools.tsx         # ⭐ Herramientas de dibujo
  ├── map-tools-guide.tsx        # ⭐ Guía interactiva
  ├── offline-map.tsx            # GPS y navegación
  ├── search-area-planner.tsx    # Planificador de zonas
  └── map-incident-details.tsx   # Detalles de incidentes
```

### Documentación
```
/guidelines/
  ├── IGN-Argentina-Integration.md        # Integración IGN
  ├── Herramientas-Dibujo-IGN.md         # ⭐ Guía completa de dibujo
  └── README-Herramientas-Mapa.md        # ⭐ Este archivo
```

### Tipos
```
/types/
  ├── search-zones.ts           # Tipos para zonas de búsqueda
  └── gps.ts                    # Tipos GPS y navegación
```

---

## Tecnologías Utilizadas

### Mapas
- **Leaflet.js** v1.9.4 - Motor de mapas interactivos
- **Leaflet.draw** v1.0.4 - Herramientas de dibujo profesionales
- **IGN Argentina WMS** - Servicio oficial de mapas
- **IGN Argentina TMS** - Tiles de mapas

### Frameworks
- **React** - Interfaz de usuario
- **TypeScript** - Tipado fuerte
- **Tailwind CSS** - Estilos

### Librerías Auxiliares
- **react-dnd** - Drag and drop para asignación de equipos
- **Lucide React** - Iconos

---

## Servicios del IGN Argentina

### URLs Oficiales

#### WMS (Web Map Service)
```
Base URL: https://wms.ign.gob.ar/geoserver/gwc/service/wms

Capas disponibles:
- caratula          → Mapa base ArgenMap
- mapabase_topo     → Mapa topográfico
- referencias       → Etiquetas y referencias
- hidrografia       → Ríos y lagos
- departamento      → Límites departamentales
- provincia         → Límites provinciales
```

#### TMS (Tile Map Service)
```
Base URL: https://wms.ign.gob.ar/geoserver/gwc/service/tms/

Formato: argenmap@EPSG:3857@png/{z}/{x}/{-y}.png
```

### Documentación Oficial
- **Web IGN:** https://www.ign.gob.ar/
- **Servicios Web:** https://www.ign.gob.ar/NuestrasActividades/Geodesia/ServiciosSatelitales
- **Visor Mapa:** https://mapa.ign.gob.ar/

---

## Instalación de Dependencias

### Leaflet
```html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<!-- JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

### Leaflet.draw
```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css" />

<!-- JS -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"></script>
```

**Nota:** Estas dependencias se cargan dinámicamente en el componente.

---

## Funcionalidades Destacadas

### ✅ Implementadas

- [x] Integración completa con IGN Argentina
- [x] 4 capas de mapa (ArgenMap, Satélite, Topográfico, Híbrido)
- [x] Herramientas de dibujo profesionales (5 tipos)
- [x] Mediciones geodésicas precisas
- [x] Exportación GeoJSON
- [x] Guía interactiva de herramientas
- [x] Vista de incidentes en mapa
- [x] Tracking GPS
- [x] Planificador de zonas
- [x] Asignación de equipos

### 🚧 En Desarrollo

- [ ] Importación de archivos GPX/KML
- [ ] Mapas offline precargados
- [ ] Compartir polígonos en tiempo real
- [ ] Integración con drones
- [ ] Capas adicionales (hidrografía, rutas)
- [ ] Plantillas de sectores predefinidas
- [ ] Modo colaborativo multi-usuario

### 💡 Próximas Mejoras

- [ ] Asignación directa de equipos a polígonos dibujados
- [ ] Etiquetas personalizadas para formas
- [ ] Cálculo automático de tiempo por sector
- [ ] Alertas de solapamiento de zonas
- [ ] Historial de trazados por incidente
- [ ] Impresión de mapas con sectores
- [ ] Sincronización con dispositivos GPS

---

## Casos de Uso

### 1. Persona Desaparecida en Montaña
**Herramientas:** Polígono + Círculo + Marcador
```
✓ Marcar último punto conocido
✓ Círculo de 5km de radio inicial
✓ Dividir en sectores por dificultad de terreno
✓ Exportar para GPS de equipos
```

### 2. Rastrillaje en Campo Abierto
**Herramientas:** Rectángulo + Línea
```
✓ Grilla de 500m x 500m
✓ Sectores uniformes
✓ Rutas de acceso por caminos rurales
✓ Búsqueda sistemática
```

### 3. Búsqueda en Zona Urbana
**Herramientas:** Polígono + Marcador
```
✓ Delimitar barrios o manzanas
✓ Marcar edificios clave
✓ Rutas de evacuación
✓ Puntos de reunión
```

### 4. Operación Multi-Equipo
**Herramientas:** Polígono + Zonas
```
✓ División en sectores
✓ Asignación a equipos específicos
✓ Seguimiento de progreso
✓ Coordinación centralizada
```

---

## Soporte y Ayuda

### Atajos de Teclado
- **Esc** - Cancelar dibujo actual
- **Delete** - Eliminar forma seleccionada
- **Ctrl+Z** - Deshacer (en modo edición)

### Solución de Problemas Comunes

#### ❌ El mapa no carga
```
Solución:
1. Verificar conexión a Internet
2. Recargar la página (Ctrl+R)
3. Limpiar caché del navegador
4. Cambiar a otra capa de mapa
```

#### ❌ No puedo dibujar polígonos
```
Solución:
1. Verificar que la herramienta esté seleccionada (panel superior derecho)
2. Hacer clic dentro del área del mapa
3. Esperar a que el mapa esté completamente cargado
```

#### ❌ Las mediciones parecen incorrectas
```
Aclaración:
- Áreas se miden en HECTÁREAS (1 ha = 10,000 m²)
- Distancias en KILÓMETROS
- Los cálculos son geodésicos (consideran curvatura terrestre)
```

#### ❌ No puedo exportar
```
Solución:
1. Verificar que haya formas dibujadas
2. Permitir descargas en el navegador
3. Revisar bloqueo de pop-ups
```

### Contacto para Soporte Técnico
- **Sistema DUAR:** [contacto interno]
- **IGN Argentina:** https://www.ign.gob.ar/Contacto

---

## Mejores Prácticas

### Para Comandantes SAR

✅ **Hacer:**
- Usar capa topográfica en montañas
- Dividir en sectores de 10-30 ha
- Exportar regularmente
- Documentar en timeline
- Compartir con todos los equipos

❌ **Evitar:**
- Sectores demasiado grandes (>50 ha)
- No exportar backups
- Confiar solo en digital (tener papel)
- Solapar sectores sin coordinación

### Para Operadores de Campo

✅ **Hacer:**
- Verificar mediciones con GPS
- Marcar puntos de interés
- Actualizar estado de zonas
- Compartir hallazgos

❌ **Evitar:**
- Desviarse del sector asignado
- No reportar áreas completadas
- Asumir cobertura 100% sin verificar

---

## Seguridad y Privacidad

### Datos Sensibles
- ❗ Las coordenadas de incidentes son datos sensibles
- ❗ No compartir archivos fuera del sistema oficial
- ❗ Eliminar exportaciones al finalizar operación
- ❗ Respetar privacidad de personas involucradas

### Auditoría
- Todos los trazados se registran en logs del sistema
- Timeline del incidente documenta cambios
- Exportaciones quedan registradas

---

## Rendimiento

### Optimizaciones Implementadas
- ✅ Carga dinámica de librerías
- ✅ Supresión de errores CORS innecesarios
- ✅ Invalidación de tamaño de mapa al cambiar tabs
- ✅ Limpieza de recursos al desmontar

### Recomendaciones
- Usar Chrome o Firefox para mejor rendimiento
- Cerrar pestañas innecesarias
- Limpiar formas antiguas periódicamente
- No dibujar polígonos con >100 vértices

---

## Créditos

### Cartografía
**Instituto Geográfico Nacional (IGN) Argentina**
- Ministerio de Defensa de la República Argentina
- https://www.ign.gob.ar/

### Librerías Open Source
- Leaflet.js - BSD-2-Clause License
- Leaflet.draw - MIT License
- React - MIT License
- Tailwind CSS - MIT License

---

## Changelog

### v2.0.0 - 2025-11-02 ⭐ NUEVA VERSIÓN
**Agregado:**
- ✨ Herramientas de dibujo profesionales (Leaflet.draw)
- ✨ Guía interactiva de herramientas
- ✨ Mediciones geodésicas automáticas
- ✨ Exportación GeoJSON
- ✨ Panel de control lateral
- ✨ 5 tipos de herramientas de dibujo

**Mejorado:**
- 🚀 Integración completa con IGN Argentina
- 🚀 4 capas de mapa base
- 🚀 Interfaz optimizada para SAR
- 🚀 Documentación exhaustiva

### v1.0.0 - Anterior
- Mapa básico con OpenStreetMap
- Vista de incidentes
- GPS básico

---

## Conclusión

El módulo de Mapa del Sistema DUAR ahora incluye herramientas profesionales equivalentes a las del visor oficial del IGN Argentina, específicamente optimizadas para operaciones de búsqueda y rescate.

Los bomberos pueden planificar, dividir sectores, trazar rutas y coordinar equipos con precisión cartográfica oficial sobre el territorio argentino.

**La integración del IGN Argentina garantiza:**
- ✅ Cartografía oficial y actualizada
- ✅ Cobertura completa del país
- ✅ Servicio público y gratuito
- ✅ Compatibilidad con estándares internacionales

---

**Sistema DUAR - Software de Gestión de Búsqueda y Rastreo**  
*Desarrollado para operaciones SAR en Argentina*
