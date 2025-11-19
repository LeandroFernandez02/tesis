# 🗺️ Guía Rápida - Módulo de Polígonos

## Herramientas Disponibles

### Panel Superior Izquierdo (Controles Generales)
1. **🗂️ Capas** - Cambia entre Mapa/Satélite/Topográfico
2. **🖱️ Seleccionar/Navegar** - Click para desactivar modo dibujo y navegar el mapa
3. **🧭 Mi Ubicación (GPS)** - Centra el mapa en tu ubicación actual usando GPS
4. **📁 Cargar GPX** - Importa archivos GPX con tracks, rutas y waypoints

### Panel Derecho (Controles Verticales)
1. **🔍 Zoom +/-** - Acercar y alejar el mapa
2. **✏️ Lápiz** - Menú de herramientas de dibujo (ver abajo)
3. **⚙️ Configuración** - Herramientas adicionales y opciones (ver abajo)
4. **🎯 Centrar en Formas** - Ajusta el zoom para ver todas las formas dibujadas

## Menú de Herramientas de Dibujo (✏️)

Click en el icono del lápiz para desplegar:

1. **⬜ Polígono**
   - Click para agregar puntos (mínimo 3)
   - Presiona **Enter** o click en "Terminar" para cerrar el polígono
   - Presiona **Ctrl+Z** o **Backspace** para deshacer último punto
   - Presiona **ESC** para cancelar
   - Muestra área en hectáreas

2. **◼️ Rectángulo**
   - Primer click: primera esquina
   - Segundo click: esquina opuesta
   - Calcula área automáticamente

3. **⭕ Círculo/Radio**
   - Primer click: define el centro
   - Segundo click: define el radio
   - Muestra radio en km y área en ha

4. **➖ Línea/Ruta**
   - Click para agregar puntos (mínimo 2)
   - Presiona **Enter** o click en "Terminar" para finalizar
   - Presiona **Ctrl+Z** o **Backspace** para deshacer último punto
   - Presiona **ESC** para cancelar
   - Muestra distancia total en km

5. **📍 Marcador (POI)**
   - Click en cualquier punto para colocar un marcador
   - Útil para puntos de interés

## Menú de Configuración (⚙️)

Click en el icono de tuerca para desplegar:

1. **📏 Medir Distancia**
   - Similar a línea pero dibuja línea punteada verde
   - Solo para mediciones temporales
   - No se guarda permanentemente

2. **💾 Exportar GeoJSON**
   - Descarga todas las formas dibujadas como archivo GeoJSON
   - Compatible con otros sistemas GIS

3. **🗑️ Limpiar Todo**
   - Elimina todas las formas del mapa
   - Acción irreversible

## Instrucciones de Uso

### Dibujar un Área de Rastrillaje (Polígono)
1. Click en botón **⬜ Polígono** (panel derecho)
2. Click en el mapa para agregar cada punto del área
3. Agrega mínimo 3 puntos
4. Click en **"Terminar"** para cerrar el polígono
5. El área aparecerá en hectáreas

### Crear Radio de Búsqueda (Círculo)
1. Click en botón **⭕ Círculo** (panel derecho)
2. Click en el centro del área de búsqueda
3. Click en el borde deseado para definir el radio
4. El sistema muestra radio en km y área en ha

### Medir Distancia entre Puntos
1. Click en botón **📏 Medir** (panel derecho)
2. Click en cada punto a medir
3. Click en **"Terminar"** cuando termines
4. La distancia aparece en km

### Usar Mi Ubicación (GPS)
1. Click en botón **🧭 Mi Ubicación** (panel superior izquierdo)
2. Permite acceso a la ubicación cuando el navegador lo solicite
3. El mapa se centra automáticamente en tu posición actual
4. Aparece un marcador azul pulsante mostrando tu ubicación
5. Útil para operaciones de campo y coordinar desde terreno

### Cambiar Tipo de Mapa
1. Click en botón **🗂️ Capas** (panel superior izquierdo)
2. Selecciona:
   - **Mapa (OSM)**: Mapa estándar con calles y referencias
   - **Satélite**: Imágenes satelitales de alta calidad
   - **Topográfico**: Mapa con curvas de nivel para terreno

### Cargar Archivos GPX
1. Click en botón **📁 Cargar GPX** (panel superior izquierdo)
2. Selecciona el archivo GPX desde tu dispositivo GPS o computadora
3. El sistema carga automáticamente:
   - **Tracks**: Se muestran como líneas en el mapa
   - **Rutas**: Se muestran como líneas en el mapa
   - **Waypoints**: Se muestran como marcadores
4. El mapa se centra automáticamente en el contenido cargado
5. Formatos soportados: GPX, KML, GeoJSON

### Exportar Datos
1. Dibuja todas las formas necesarias
2. Click en botón **💾 Exportar** (menú configuración)
3. Se descarga archivo GeoJSON con todas las formas
4. Útil para compartir con otros sistemas o backup

## Indicadores en Pantalla

- **Barra superior central**: Estado actual (ej: "Dibujando polígono - 3 puntos")
- **Barra inferior central**: Mediciones en tiempo real (área/distancia)
- **Esquina inferior derecha**: Contador de formas dibujadas
- **Esquina inferior izquierda**: Atribución del mapa

## Atajos de Teclado

Cuando estés dibujando (polígonos, líneas, mediciones):

- **ESC** - Cancelar el dibujo actual
- **Enter** - Terminar y guardar la forma actual (requiere mínimo de puntos)
- **Ctrl+Z** - Deshacer el último punto agregado
- **Backspace** - Deshacer el último punto agregado (alternativa)

💡 Los atajos de teclado aparecen en pantalla cuando estés dibujando.

## Tips Operacionales
- Pasa el mouse sobre cualquier botón para ver su descripción
- Para cancelar un dibujo en progreso, click en "Cancelar" o presiona **ESC**
- Las formas se guardan automáticamente al completarlas
- Puedes dibujar múltiples formas de diferentes tipos
- Los círculos son perfectos para radios de búsqueda desde último punto conocido
- Usa **Mi Ubicación** (GPS) para centrar el mapa en tu posición actual
- El botón **Centrar en Formas** ajusta el zoom para ver todas tus áreas dibujadas
- Importa archivos GPX desde dispositivos GPS para visualizar tracks previos
