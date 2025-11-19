# Integración del IGN Argentina en el Sistema DUAR

## ¿Qué es el IGN?

El **Instituto Geográfico Nacional (IGN)** es el organismo oficial de Argentina encargado de la cartografía nacional. Proporciona servicios de mapas públicos y gratuitos que son ideales para aplicaciones de emergencias, búsqueda y rescate.

## Servicios Integrados

El sistema DUAR ahora integra los siguientes servicios del IGN Argentina:

### 1. **ArgenMap** (Mapa Base)
- **URL**: `https://wms.ign.gob.ar/geoserver/gwc/service/wms`
- **Capa**: `caratula`
- **Descripción**: Mapa vectorial base oficial de Argentina con rutas, ciudades, límites administrativos
- **Formato**: WMS (Web Map Service)
- **Zoom máximo**: 20

### 2. **Satélite**
- **URL**: `https://wms.ign.gob.ar/geoserver/gwc/service/tms/`
- **Capa**: `argenmap@EPSG:3857@png`
- **Descripción**: Imágenes satelitales de Argentina
- **Formato**: TMS (Tile Map Service)
- **Zoom máximo**: 18

### 3. **Topográfico**
- **URL**: `https://wms.ign.gob.ar/geoserver/gwc/service/wms`
- **Capa**: `mapabase_topo`
- **Descripción**: Mapa topográfico con curvas de nivel, ideal para operaciones SAR en terrenos montañosos
- **Formato**: WMS
- **Zoom máximo**: 20

### 4. **Híbrido**
- **Descripción**: Combinación de imágenes satelitales con etiquetas y referencias del mapa vectorial
- **Formato**: Layer Group (combina TMS + WMS)
- **Capas**: `argenmap` + `referencias`

## Características Principales

### Ventajas para Operaciones SAR

1. **Cobertura Nacional**: Todo el territorio argentino está cubierto
2. **Datos Oficiales**: Información cartográfica oficial y actualizada
3. **Gratuito**: No requiere API keys ni pagos
4. **Alta Resolución**: Hasta zoom nivel 20 en mapas vectoriales
5. **Topografía**: Curvas de nivel esenciales para búsqueda en montañas
6. **Offline Capable**: Los tiles pueden descargarse para uso sin conexión

### Coordenadas por Defecto

El mapa está centrado en **Córdoba, Argentina**:
- Latitud: -31.4201
- Longitud: -64.1888
- Zoom inicial: 12

Incluye ubicaciones de ejemplo en:
- Centro de Córdoba
- Villa Carlos Paz
- Sierras de Córdoba
- La Cumbre
- Alta Gracia
- Río Ceballos

## Uso en el Sistema

### Componente Nuevo: `IncidentMapIGN`

Importación:
```typescript
import { IncidentMapIGN } from './components/incident-map-ign';
```

Uso:
```tsx
<IncidentMapIGN
  incidents={incidents}
  teams={teams}
  onIncidentSelect={handleSelectIncident}
  selectedIncident={selectedIncident}
/>
```

### Cambio de Capas

El usuario puede cambiar entre las 4 capas disponibles:
- **ArgenMap**: Mapa base vectorial
- **Satélite**: Imágenes satelitales
- **Topográfico**: Con curvas de nivel
- **Híbrido**: Satélite + etiquetas

## Tecnología Utilizada

- **Leaflet.js**: Librería de mapas JavaScript
- **Servicios WMS**: Web Map Service del IGN
- **Servicios TMS**: Tile Map Service del IGN
- **React Hooks**: Para gestión de estado y efectos

## Documentación Oficial del IGN

- **Sitio Web**: https://www.ign.gob.ar/
- **Servicios Web**: https://www.ign.gob.ar/NuestrasActividades/Geodesia/ServiciosSatelitales
- **Visor Online**: https://mapa.ign.gob.ar/

## Servicios WMS Disponibles

El IGN Argentina proporciona múltiples capas WMS que pueden agregarse:

### Capas Base
- `caratula`: Mapa base completo
- `mapabase_topo`: Mapa topográfico
- `referencias`: Etiquetas y referencias

### Capas Temáticas Adicionales (Futuro)
- `departamento`: Límites departamentales
- `provincia`: Límites provinciales
- `localidad`: Localidades
- `ruta`: Red vial
- `hidrografia`: Ríos y cuerpos de agua
- `relieve`: Sombreado de relieve

## Próximas Mejoras

1. **Descarga Offline**: Implementar descarga de tiles para uso sin conexión
2. **Capas Adicionales**: Agregar capas de hidrografía, rutas, relieve
3. **Marcadores Personalizados**: Iconos específicos para tipos de incidentes SAR
4. **Tracks GPX**: Visualización de rutas GPX sobre mapas del IGN
5. **Áreas de Búsqueda**: Dibujar polígonos de zonas de búsqueda sobre el mapa
6. **Heatmaps**: Mapa de calor de incidentes

## Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles (iOS, Android)
- ✅ Tablets
- ✅ Offline (con descarga previa de tiles)

## Limitaciones y Consideraciones

1. **Conexión a Internet**: Requiere conexión para cargar tiles (excepto si se pre-descargan)
2. **Velocidad**: Depende de la velocidad de conexión y servidores del IGN
3. **Cobertura**: Optimizado para territorio argentino
4. **Tasa de Uso**: Servicios públicos, respetar uso razonable

## Soporte

Para problemas técnicos con los servicios del IGN:
- Email IGN: https://www.ign.gob.ar/Contacto
- Documentación: https://www.ign.gob.ar/

## Ejemplo de Implementación

```typescript
// Código de ejemplo para agregar una capa WMS personalizada
const customLayer = L.tileLayer.wms('https://wms.ign.gob.ar/geoserver/gwc/service/wms', {
  layers: 'hidrografia',  // Capa de ríos y lagos
  format: 'image/png',
  transparent: true,
  version: '1.1.1',
  attribution: '© IGN Argentina',
  maxZoom: 20,
});

// Agregar al mapa
customLayer.addTo(map);
```

## Conclusión

La integración del IGN Argentina proporciona al Sistema DUAR cartografía oficial, precisa y actualizada, esencial para operaciones de búsqueda y rescate en todo el territorio argentino. Los mapas topográficos son especialmente valiosos para operaciones en las Sierras de Córdoba y otras regiones montañosas.
