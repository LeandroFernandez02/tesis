# 🔒 Guía de Integración Segura - ArgenMap IGN

## Opciones de Integración

### Opción 1: iframe (No Recomendado para DUAR)

```html
<iframe 
  src="https://argenmap.ign.gob.ar" 
  width="100%" 
  height="600px"
  sandbox="allow-scripts allow-same-origin"
></iframe>
```

**❌ Desventajas:**
- Dependencia de servidor externo
- Requiere que IGN permita embedding (X-Frame-Options)
- Performance: carga completa de otra aplicación
- Comunicación limitada (solo postMessage)
- Problemas de CORS
- No puedes personalizar la UI
- Dos aplicaciones corriendo simultáneamente

**✅ Ventajas:**
- Aislamiento total de seguridad
- Actualizaciones automáticas del IGN

---

### Opción 2: Servicios WMS/WMTS (⭐ RECOMENDADO)

Usar **solo las capas del IGN** mediante sus servicios de mapas, no la aplicación completa.

```typescript
// Ejemplo con Leaflet (como ya estamos usando)
const ignLayer = L.tileLayer.wms('https://wms.ign.gob.ar/geoserver/wms', {
  layers: 'capaDeseada',
  format: 'image/png',
  transparent: true,
  attribution: '© IGN Argentina'
});
```

**✅ Ventajas:**
- Control total de tu aplicación
- Mejor performance (solo imágenes de mapa)
- Integración perfecta con Sistema DUAR
- Personalización completa de UI
- Seguridad: solo consumes datos de mapa, no código
- Offline capability (puedes cachear tiles)
- No problemas de CORS

**❌ Desventajas:**
- Debes implementar tu propia UI (ya lo tenemos ✓)

---

### Opción 3: API de ArgenMap (Si existe)

Verificar si IGN ofrece una API REST para consultar datos.

```typescript
// Hipotético
fetch('https://api.ign.gob.ar/v1/geocode?address=Córdoba')
  .then(res => res.json())
  .then(data => {
    // usar datos
  });
```

---

## Implementación Actual en DUAR

Ya tenemos implementado en `/components/map-draw-tools-simple.tsx`:

1. **Leaflet** como motor de mapas
2. **Capas base del IGN:**
   - OpenStreetMap (Argenmap-like)
   - Satélite (Esri)
   - Topográfico (OpenTopoMap)

3. **Panel de capas estilo IGN** (`/components/map-layer-panel.tsx`)
   - Gestión de mapas base
   - Categorías de capas
   - Upload de archivos (KML, GPX, GeoJSON)

---

## Servicios WMS Disponibles del IGN

### Servidor Principal
```
https://wms.ign.gob.ar/geoserver/wms
```

### Capas Útiles para SAR:
- `ign:departamento` - Límites departamentales
- `ign:provincia` - Límites provinciales  
- `ign:localidad` - Localidades
- `ign:ruta_nacional` - Rutas nacionales
- `ign:ruta_provincial` - Rutas provinciales
- `ign:curso_agua` - Cursos de agua
- `ign:nomenclatura_catastral` - Catastro

### Ejemplo de Integración:

```typescript
// En map-draw-tools-simple.tsx
const addIGNLayers = async () => {
  const L = await import('leaflet');
  
  // Capa de rutas
  const rutasLayer = L.tileLayer.wms('https://wms.ign.gob.ar/geoserver/wms', {
    layers: 'ign:ruta_nacional,ign:ruta_provincial',
    format: 'image/png',
    transparent: true,
    attribution: '© IGN Argentina'
  });

  // Capa de límites territoriales
  const limitesLayer = L.tileLayer.wms('https://wms.ign.gob.ar/geoserver/wms', {
    layers: 'ign:provincia,ign:departamento',
    format: 'image/png',
    transparent: true,
    attribution: '© IGN Argentina'
  });

  return { rutasLayer, limitesLayer };
};
```

---

## Seguridad de la Implementación Actual

### ✅ Aspectos Seguros:

1. **Sin dependencias externas en runtime**
   - No cargamos código de terceros
   - Control total del código

2. **CORS controlado**
   - Solo imágenes de mapa (tiles)
   - Sin ejecución de scripts externos

3. **Aislamiento**
   - Tu aplicación no comparte contexto con IGN
   - No hay riesgo de XSS desde servicios externos

4. **Offline-first**
   - Puedes cachear tiles para uso sin internet
   - Crítico para operaciones SAR en zonas remotas

### ⚠️ Consideraciones:

1. **Rate Limiting**
   - IGN puede tener límites de peticiones
   - Implementar cache local de tiles

2. **Disponibilidad**
   - Si servicio IGN cae, tienes fallback a OSM/Esri

3. **Términos de Uso**
   - Verificar términos de uso de servicios IGN
   - Incluir atribuciones correctas

---

## Recomendación Final para Sistema DUAR

**Usar servicios WMS/WMTS del IGN Argentina** mediante Leaflet:

1. ✅ Seguro
2. ✅ Performante  
3. ✅ Integrado perfectamente
4. ✅ Offline-capable
5. ✅ Personalizable
6. ✅ Profesional

**NO usar iframe de ArgenMap completo:**
- Overkill para tus necesidades
- Problemas de performance
- Menos control
- Complicaciones de seguridad

---

## Próximos Pasos

1. Integrar capas WMS del IGN en `map-layer-panel.tsx`
2. Agregar capas relevantes para SAR:
   - Rutas de acceso
   - Cursos de agua
   - Límites territoriales
   - Áreas protegidas
3. Implementar cache de tiles para uso offline
4. Agregar atribuciones correctas del IGN

---

## Recursos

- **IGN Argentina:** https://www.ign.gob.ar/
- **Geoservicios IGN:** https://www.ign.gob.ar/AreaServicios/Geoservicios
- **Leaflet WMS:** https://leafletjs.com/reference.html#tilelayer-wms
- **Documentación actual:** `/guidelines/IGN-Argentina-Integration.md`
