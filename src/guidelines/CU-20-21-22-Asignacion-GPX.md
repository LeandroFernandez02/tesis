# Guía de Uso: Asignación de Polígonos y Trazas GPX

## Casos de Uso Implementados

Esta guía documenta la implementación de los casos de uso CU-20, CU-21 y CU-22 para la gestión de polígonos, trazas GPX y visualización de capas en el sistema DUAR.

---

## CU-20: Asignar Polígono a Grupo

### Descripción
Permite al Coordinador asignar zonas de búsqueda (polígonos dibujados en el mapa) a grupos específicos de rastrillaje.

### Funcionamiento

1. **Acceder al menú contextual**
   - El Coordinador hace **clic derecho** sobre un polígono dibujado en el mapa
   - Se abre un menú contextual con opciones

2. **Opciones disponibles**
   - **Asignar Grupo**: Abre una lista de grupos disponibles
   - **Cambiar Grupo**: Si el polígono ya tiene un grupo asignado
   - **Quitar Asignación**: Elimina la asignación actual del polígono
   - **Ver Detalles**: Muestra información detallada del polígono

3. **Asignar grupo**
   - Al hacer clic en "Asignar Grupo", se muestra una lista de todos los grupos desplegados
   - Para cada grupo se muestra:
     - Nombre del grupo
     - Estado (Disponible, En Ruta, etc.)
     - Número de agentes
     - Líder del grupo
     - Si ya está asignado a este polígono
   - Al seleccionar un grupo, el polígono queda asignado automáticamente

4. **Visual feedback**
   - Los polígonos asignados muestran un indicador visual
   - El grupo asignado se muestra en el menú contextual
   - Los grupos ya asignados aparecen marcados en la lista

### Componente
`/components/polygon-context-menu.tsx`

### Tipos actualizados
- `SearchZone` ahora incluye `assignedTeamId?: string`

---

## CU-21: Cargar Traza GPX

### Descripción
Permite cargar archivos GPX (trazas de recorridos GPS) asociados a grupos específicos para visualizar sus desplazamientos en el mapa.

### Funcionamiento

1. **Acceder desde el grupo**
   - En el panel "Grupos Desplegados", cada tarjeta de grupo tiene un botón de carga GPX (ícono de upload)
   - Al hacer clic, se abre el modal de carga

2. **Modal de carga GPX**
   - **Título**: "Cargar Trazo GPX para [Nombre del Grupo]"
   - **Área de drag-and-drop**:
     - Arrastra un archivo .gpx directamente
     - O haz clic en "Seleccionar Archivo"
   - **Campo de etiqueta** (opcional):
     - Permite nombrar el trazado (ej: "Avance 10:30", "Sector Norte")
     - Si no se ingresa, se genera automáticamente con la hora actual

3. **Validaciones**
   - Solo acepta archivos .gpx
   - Tamaño máximo: 10MB
   - Se muestra el nombre y tamaño del archivo seleccionado

4. **Confirmación**
   - Botón "Cargar Trazado" para confirmar
   - El archivo se procesa y se visualiza en el mapa
   - Se muestra un mensaje de éxito con la etiqueta asignada

### Características
- **Auto-etiquetado**: Si no se ingresa etiqueta, se genera "Avance HH:MM" automáticamente
- **Feedback visual**: Cambio de color del área cuando se arrastra un archivo
- **Validación en tiempo real**: Verifica formato y tamaño antes de cargar

### Componente
`/components/gpx-upload-modal.tsx`

### Ejemplo de uso
```tsx
<GPXUploadModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  teamId={selectedTeamId}
  teamName={selectedTeamName}
  onUpload={handleGPXUpload}
/>
```

---

## CU-22: Visualizar Capas

### Descripción
Panel de gestión de capas que permite controlar la visibilidad de diferentes elementos del mapa, incluyendo polígonos, POIs, Punto Cero y trazados GPX organizados por grupo.

### Funcionamiento

1. **Abrir panel de capas**
   - Botón "Capas" en la barra de herramientas del mapa
   - Panel flotante en la esquina derecha

2. **Capas del Mapa** (Sección superior)
   - **Polígonos**: Mostrar/ocultar todas las zonas de búsqueda dibujadas
   - **POIs (Puntos de Interés)**: Marcadores de puntos importantes
   - **Punto Cero**: Ubicación inicial del incidente
   - Cada capa tiene un switch para activar/desactivar

3. **Trazados GPX** (Sección inferior)
   - **Vista de árbol jerárquico** agrupado por equipos
   - Para cada equipo se muestra:
     - Nombre del grupo
     - Color de identificación
     - Contador de trazas visibles/totales (ej: "2/3")
   - **Expandir/contraer** grupos haciendo clic en el nombre

4. **Gestión de trazas individuales**
   - Para cada traza dentro de un grupo:
     - Etiqueta del trazado
     - Fecha y hora de carga
     - Botón de visibilidad (ojo)
     - Botón de eliminar
   - Los trazados se muestran con el color del grupo

5. **Estadísticas**
   - Badge con el total de trazados GPX cargados
   - Contador de trazas visibles por grupo

### Características especiales
- **Agrupación automática**: Los trazados se organizan por grupo sin intervención del usuario
- **Colores distintivos**: Cada grupo tiene un color único para sus trazas
- **Gestión granular**: Control individual de visibilidad y eliminación
- **Estado vacío**: Mensaje informativo cuando no hay trazados

### Componente
`/components/map-layer-management.tsx`

### Tipos
```typescript
interface GPXTrace {
  id: string;
  teamId: string;
  teamName: string;
  label: string; // Etiqueta del trazado
  fileName: string;
  uploadedAt: Date;
  data: any; // Datos del GPX parseado
  visible: boolean;
  color: string;
}

interface LayerVisibility {
  polygons: boolean;
  pois: boolean;
  puntoZero: boolean;
}
```

---

## Integración en el Sistema

### En el componente de mapa principal

```tsx
import { PolygonContextMenu } from './components/polygon-context-menu';
import { GPXUploadModal } from './components/gpx-upload-modal';
import { MapLayerManagement } from './components/map-layer-management';

// Estados
const [contextMenu, setContextMenu] = useState<{
  x: number;
  y: number;
  polygonId: string;
} | null>(null);

const [gpxModal, setGpxModal] = useState<{
  teamId: string;
  teamName: string;
} | null>(null);

const [showLayerPanel, setShowLayerPanel] = useState(false);
const [layerVisibility, setLayerVisibility] = useState({
  polygons: true,
  pois: true,
  puntoZero: true,
});
const [gpxTraces, setGpxTraces] = useState<GPXTrace[]>([]);

// Handlers
const handlePolygonRightClick = (polygonId: string, x: number, y: number) => {
  setContextMenu({ x, y, polygonId });
};

const handleAssignTeam = (polygonId: string, teamId: string) => {
  // Lógica para asignar equipo al polígono
};

const handleLoadGPX = (teamId: string) => {
  const team = teams.find(t => t.id === teamId);
  if (team) {
    setGpxModal({ teamId, teamName: team.nombre });
  }
};

const handleGPXUpload = async (teamId: string, file: File, label: string) => {
  // Procesar archivo GPX y agregarlo a gpxTraces
};
```

### En el GroupManager

```tsx
<GroupManager
  personnel={personnel}
  teams={teams}
  onCreateTeam={handleCreateTeam}
  onUpdateTeam={handleUpdateTeam}
  onDeleteTeam={handleDeleteTeam}
  onLoadGPX={handleLoadGPX}  // ← Nueva prop
/>
```

---

## Flujo de Trabajo Completo

### Escenario típico de operación:

1. **Coordinador dibuja zonas de búsqueda** en el mapa
2. **Crea grupos** de rastrillaje con personal asignado
3. **Asigna polígonos a grupos** mediante clic derecho
4. **Los grupos salen al campo** y registran sus recorridos con GPS
5. **Se cargan las trazas GPX** asociadas a cada grupo
6. **Se visualizan en el mapa** con colores por grupo
7. **Se controla la visibilidad** mediante el panel de capas
8. **Se analizan los recorridos** para evitar duplicación de esfuerzos

---

## Notas Técnicas

### Manejo de eventos del mapa
- El menú contextual se cierra al hacer clic fuera o presionar ESC
- Las coordenadas del menú se ajustan automáticamente para no salir de pantalla

### Gestión de archivos GPX
- Los archivos se validan antes de cargarse
- Se mantienen en memoria asociados al grupo
- Se pueden eliminar individual o grupalmente

### Performance
- Los trazados GPX se pueden ocultar para mejorar rendimiento
- El tree view se colapsa por defecto para ahorrar espacio

### Persistencia
- Las asignaciones de polígonos a grupos deben guardarse en el estado del incidente
- Las trazas GPX se almacenan con metadata (fecha, hora, grupo, etiqueta)
- La visibilidad de capas es preferencia local del usuario

---

## Mejoras Futuras

- [ ] Exportar trazas GPX combinadas por grupo
- [ ] Estadísticas de distancia recorrida por grupo
- [ ] Alertas de sobreposición de áreas
- [ ] Historial de asignaciones de polígonos
- [ ] Filtros por fecha/hora de trazas
- [ ] Comparación de trazas entre grupos
- [ ] Generación automática de informes con mapas

---

**Última actualización**: 12 de Noviembre de 2025  
**Versión del sistema**: DUAR v1.0  
**Casos de uso**: CU-20, CU-21, CU-22
