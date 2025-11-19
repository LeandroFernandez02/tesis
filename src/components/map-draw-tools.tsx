import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { 
  Square, 
  Circle, 
  Minus,
  Edit3,
  Trash2,
  MapPin,
  Type,
  Ruler,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  Target,
  Navigation,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface DrawToolsProps {
  onShapeCreated?: (shape: any) => void;
  onMeasurement?: (measurement: { distance?: number; area?: number }) => void;
  className?: string;
}

// Función auxiliar para calcular área de polígono (fallback)
function calculatePolygonArea(latlngs: any[]): number {
  // Cálculo aproximado usando la fórmula del área del polígono en coordenadas geográficas
  // Esta es una aproximación simple, no tan precisa como el cálculo geodésico
  if (latlngs.length < 3) return 0;
  
  let area = 0;
  const earthRadius = 6371000; // Radio de la Tierra en metros
  
  for (let i = 0; i < latlngs.length; i++) {
    const j = (i + 1) % latlngs.length;
    const lat1 = latlngs[i].lat * Math.PI / 180;
    const lat2 = latlngs[j].lat * Math.PI / 180;
    const lng1 = latlngs[i].lng * Math.PI / 180;
    const lng2 = latlngs[j].lng * Math.PI / 180;
    
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  
  area = Math.abs(area * earthRadius * earthRadius / 2);
  return area;
}

export function MapDrawTools({ onShapeCreated, onMeasurement, className }: DrawToolsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [drawnShapes, setDrawnShapes] = useState<any[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<{distance?: number; area?: number} | null>(null);
  const [mapCenter] = useState({ lat: -31.4201, lng: -64.1888 }); // Córdoba, Argentina
  const [mapLayer, setMapLayer] = useState<'argenmap' | 'satellite' | 'topographic'>('satellite');

  // Inicializar mapa con Leaflet
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    let isMounted = true;

    const initializeMap = async () => {
      try {
        if (!isMounted || !mapRef.current) return;

        // Importar Leaflet
        const L = await import('leaflet');
        
        if (!isMounted || !mapRef.current) return;

        // CSS de Leaflet
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }

        // CSS de Leaflet.draw
        if (!document.querySelector('link[href*="leaflet.draw.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }

        // Configurar iconos
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current, {
          dragging: true,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: false,
          keyboard: true,
          touchZoom: true,
        }).setView([mapCenter.lat, mapCenter.lng], 13);

        // Remover clases de cursor por defecto
        const container = map.getContainer();
        container.classList.remove('leaflet-grab');
        container.classList.remove('leaflet-dragging');

        // Capas del IGN Argentina
        const argenmapLayer = L.tileLayer.wms('https://wms.ign.gob.ar/geoserver/gwc/service/wms', {
          layers: 'caratula',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          attribution: '© IGN Argentina',
          maxZoom: 20,
        });

        // ESRI World Imagery - Satélite gratuito
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
          maxZoom: 19,
        });

        const topographicLayer = L.tileLayer.wms('https://wms.ign.gob.ar/geoserver/gwc/service/wms', {
          layers: 'mapabase_topo',
          format: 'image/png',
          transparent: false,
          version: '1.1.1',
          attribution: '© IGN Argentina',
          maxZoom: 20,
        });

        satelliteLayer.addTo(map);

        (map as any).layers = {
          argenmap: argenmapLayer,
          satellite: satelliteLayer,
          topographic: topographicLayer
        };

        // Importar Leaflet.draw dinámicamente desde CDN
        if (!(window as any).L || !(window as any).L.Control || !(window as any).L.Control.Draw) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js';
            script.crossOrigin = 'anonymous';
            script.onload = () => {
              // Esperar un poco más para asegurar que todo esté cargado
              setTimeout(resolve, 100);
            };
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Verificar que L.Draw esté disponible
        if (!(window as any).L.Draw || !(window as any).L.Control.Draw) {
          console.error('Leaflet.draw no se cargó correctamente');
          return;
        }

        const LDraw = (window as any).L.Draw;
        const LControl = (window as any).L.Control;

        // FeatureGroup para almacenar formas dibujadas
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        drawnItemsRef.current = drawnItems;

        // Configurar controles de dibujo
        const drawControl = new LControl.Draw({
          position: 'topright',
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: true,
              drawError: {
                color: '#e1e1e1',
                message: '<strong>Error:</strong> Las líneas no pueden cruzarse!'
              },
              shapeOptions: {
                color: '#dc2626',
                weight: 3,
                fillOpacity: 0.3
              }
            },
            polyline: {
              shapeOptions: {
                color: '#2563eb',
                weight: 3
              }
            },
            rectangle: {
              shapeOptions: {
                color: '#f59e0b',
                weight: 3,
                fillOpacity: 0.3
              }
            },
            circle: {
              shapeOptions: {
                color: '#10b981',
                weight: 3,
                fillOpacity: 0.3
              }
            },
            marker: true,
            circlemarker: false
          },
          edit: {
            featureGroup: drawnItems,
            remove: true,
            edit: true
          }
        });

        map.addControl(drawControl);

        console.log('🗺️ Mapa inicializado correctamente');
        console.log('📍 Eventos Leaflet.Draw disponibles:', LDraw.Event);

        // Variable para rastrear el estado de dibujo
        let isDrawing = false;

        // Función auxiliar para activar modo dibujo
        const enableDrawMode = () => {
          if (isDrawing) return;
          isDrawing = true;
          
          const container = map.getContainer();
          container.style.setProperty('cursor', 'crosshair', 'important');
          container.classList.add('leaflet-crosshair');
          document.body.classList.add('leaflet-drawing');
          
          // Solo deshabilitar el dragging, mantener todo lo demás
          if (map.dragging.enabled()) {
            map.dragging.disable();
          }
          
          console.log('✏️ MODO DIBUJO ACTIVADO - Arrastre deshabilitado');
        };

        // Función auxiliar para desactivar modo dibujo
        const disableDrawMode = () => {
          if (!isDrawing) return;
          isDrawing = false;
          
          const container = map.getContainer();
          container.style.removeProperty('cursor');
          container.classList.remove('leaflet-crosshair');
          document.body.classList.remove('leaflet-drawing');
          
          // Rehabilitar dragging
          if (!map.dragging.enabled()) {
            map.dragging.enable();
          }
          
          console.log('✅ MODO DIBUJO DESACTIVADO - Arrastre habilitado');
        };

        // Event handlers principales de Leaflet.Draw
        map.on(LDraw.Event.DRAWSTART, (e: any) => {
          console.log('🎨 Evento DRAWSTART disparado', e);
          enableDrawMode();
        });

        map.on(LDraw.Event.DRAWSTOP, (e: any) => {
          console.log('🛑 Evento DRAWSTOP disparado', e);
          disableDrawMode();
        });

        map.on(LDraw.Event.DRAWVERTEX, (e: any) => {
          console.log('📌 Evento DRAWVERTEX (punto agregado)', e);
        });

        // Observador de mutaciones para capturar cuando aparecen los botones de acción
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                // Detectar cuando aparece el menú de acciones (Finish, Cancel)
                if (node.classList.contains('leaflet-draw-actions')) {
                  console.log('🎯 Menú de acciones detectado - modo dibujo activo');
                  enableDrawMode();
                }
              }
            });
            
            mutation.removedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                // Detectar cuando desaparece el menú de acciones
                if (node.classList.contains('leaflet-draw-actions')) {
                  console.log('🏁 Menú de acciones removido - desactivando modo dibujo');
                  disableDrawMode();
                }
              }
            });
          });
        });

        // Observar cambios en el contenedor del mapa
        observer.observe(mapRef.current, {
          childList: true,
          subtree: true
        });

        // Agregar listeners a los botones de la toolbar cuando estén disponibles
        const attachButtonListeners = () => {
          const toolbar = document.querySelector('.leaflet-draw-toolbar');
          if (toolbar) {
            console.log('🔧 Toolbar encontrada, agregando listeners');
            
            toolbar.addEventListener('click', (e) => {
              const target = e.target as HTMLElement;
              console.log('🖱️ Click en toolbar:', target.className);
              
              // Pequeño delay para permitir que Leaflet.Draw procese el click primero
              setTimeout(() => {
                // Verificar si hay un tooltip activo (indica que está en modo dibujo)
                const tooltip = document.querySelector('.leaflet-draw-tooltip');
                if (tooltip) {
                  console.log('💡 Tooltip detectado - activando modo dibujo');
                  enableDrawMode();
                }
              }, 100);
            });
          }
        };

        // Intentar adjuntar listeners varias veces por si acaso
        setTimeout(attachButtonListeners, 100);
        setTimeout(attachButtonListeners, 500);
        setTimeout(attachButtonListeners, 1000);

        // Event handlers para dibujo
        map.on(LDraw.Event.CREATED, (e: any) => {
          const layer = e.layer;
          const type = e.layerType;
          
          drawnItems.addLayer(layer);

          // Calcular área o distancia
          let measurement: { distance?: number; area?: number } = {};
          
          if (type === 'polygon' || type === 'rectangle') {
            // Calcular área usando el método de Leaflet.draw
            let area = 0;
            if ((window as any).L.GeometryUtil && (window as any).L.GeometryUtil.geodesicArea) {
              area = (window as any).L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            } else {
              // Fallback: cálculo aproximado del área
              const latlngs = layer.getLatLngs()[0];
              area = calculatePolygonArea(latlngs);
            }
            measurement.area = area / 10000; // Convertir a hectáreas
            setCurrentMeasurement(measurement);
            
            // Agregar popup con área
            layer.bindPopup(`Área: ${measurement.area.toFixed(2)} hectáreas`);
          } else if (type === 'polyline') {
            const latlngs = layer.getLatLngs();
            let distance = 0;
            for (let i = 1; i < latlngs.length; i++) {
              distance += latlngs[i-1].distanceTo(latlngs[i]);
            }
            measurement.distance = distance / 1000; // Convertir a km
            setCurrentMeasurement(measurement);
            
            // Agregar popup con distancia
            layer.bindPopup(`Distancia: ${measurement.distance.toFixed(2)} km`);
          } else if (type === 'circle') {
            const radius = layer.getRadius();
            const area = Math.PI * radius * radius / 10000; // hectáreas
            measurement.area = area;
            setCurrentMeasurement(measurement);
            
            layer.bindPopup(`Radio: ${(radius/1000).toFixed(2)} km<br>Área: ${area.toFixed(2)} ha`);
          }

          // Guardar forma
          const shapeData = {
            type,
            data: layer.toGeoJSON(),
            measurement,
            id: `shape-${Date.now()}`
          };
          
          setDrawnShapes(prev => [...prev, shapeData]);
          
          if (onShapeCreated) {
            onShapeCreated(shapeData);
          }
          
          if (onMeasurement && (measurement.area || measurement.distance)) {
            onMeasurement(measurement);
          }
        });

        map.on(LDraw.Event.EDITED, (e: any) => {
          const layers = e.layers;
          layers.eachLayer((layer: any) => {
            // Actualizar mediciones
            console.log('Forma editada:', layer.toGeoJSON());
          });
        });

        map.on(LDraw.Event.DELETED, (e: any) => {
          const layers = e.layers;
          layers.eachLayer((layer: any) => {
            // Remover de la lista
            console.log('Forma eliminada:', layer.toGeoJSON());
          });
          
          // Actualizar lista de formas
          const remainingLayers: any[] = [];
          drawnItems.eachLayer((layer: any) => {
            remainingLayers.push(layer);
          });
          setDrawnShapes(remainingLayers);
        });

        leafletMapRef.current = map;
        setMapLoaded(true);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    const timer = setTimeout(() => {
      if (isMounted) {
        initializeMap();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  const changeMapLayer = async (layer: 'argenmap' | 'satellite' | 'topographic') => {
    if (!leafletMapRef.current || !mapLoaded) return;
    
    const map = leafletMapRef.current;
    const layers = (map as any).layers;
    
    Object.values(layers).forEach((l: any) => {
      if (map.hasLayer(l)) {
        map.removeLayer(l);
      }
    });
    
    layers[layer].addTo(map);
    setMapLayer(layer);
  };

  const clearAllShapes = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      setDrawnShapes([]);
      setCurrentMeasurement(null);
    }
  };

  const exportShapes = () => {
    if (drawnShapes.length === 0) {
      alert('No hay formas para exportar');
      return;
    }

    const geojson = {
      type: 'FeatureCollection',
      features: drawnShapes.map(shape => shape.data)
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zonas-rastrillaje-${new Date().toISOString().split('T')[0]}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getUserLocation = () => {
    if ("geolocation" in navigator && leafletMapRef.current) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const L = await import('leaflet');
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          leafletMapRef.current.setView([location.lat, location.lng], 15);
          
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div class="relative">
                <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div class="absolute inset-0 w-4 h-4 rounded-full animate-pulse bg-blue-400 opacity-75"></div>
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          
          if ((leafletMapRef.current as any).userMarker) {
            leafletMapRef.current.removeLayer((leafletMapRef.current as any).userMarker);
          }
          
          const userMarker = L.marker([location.lat, location.lng], { icon: userIcon })
            .addTo(leafletMapRef.current)
            .bindPopup('<div class="text-center p-2"><strong>Tu ubicación actual</strong></div>');
          
          (leafletMapRef.current as any).userMarker = userMarker;
        },
        (error) => {
          console.info('ℹ️ Ubicación: No se pudo obtener la ubicación actual.');
        }
      );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con controles */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-red-600" />
          <h3>Herramientas de Dibujo SAR - IGN Argentina</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1">
            <Button 
              variant={mapLayer === 'argenmap' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => changeMapLayer('argenmap')}
            >
              <Layers className="h-4 w-4 mr-1" />
              ArgenMap
            </Button>
            <Button 
              variant={mapLayer === 'satellite' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => changeMapLayer('satellite')}
            >
              Satélite
            </Button>
            <Button 
              variant={mapLayer === 'topographic' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => changeMapLayer('topographic')}
            >
              Topográfico
            </Button>
          </div>
        </div>
      </div>

      {/* Información de medición */}
      {currentMeasurement && (
        <Alert>
          <Ruler className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                {currentMeasurement.area && (
                  <span><strong>Área:</strong> {currentMeasurement.area.toFixed(2)} hectáreas</span>
                )}
                {currentMeasurement.distance && (
                  <span><strong>Distancia:</strong> {currentMeasurement.distance.toFixed(2)} km</span>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Panel de herramientas lateral */}
        <Card className="lg:col-span-1 p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-red-600" />
            Herramientas de Dibujo
          </h4>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              Usa el panel del mapa o estos atajos:
            </p>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <Square className="h-4 w-4 text-red-600" />
                <span>Polígono - Área de rastrillaje</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <Square className="h-4 w-4 text-orange-600" />
                <span>Rectángulo - Zona rectangular</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <Circle className="h-4 w-4 text-green-600" />
                <span>Círculo - Radio de búsqueda</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <Minus className="h-4 w-4 text-blue-600" />
                <span>Línea - Ruta o camino</span>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <MapPin className="h-4 w-4 text-purple-600" />
                <span>Marcador - Punto de interés</span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={getUserLocation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Mi Ubicación
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={exportShapes}
                disabled={drawnShapes.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar GeoJSON
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-destructive"
                onClick={clearAllShapes}
                disabled={drawnShapes.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Todo
              </Button>
            </div>

            <Separator className="my-3" />

            <div className="text-xs text-muted-foreground">
              <p className="mb-2"><strong>Formas dibujadas:</strong></p>
              {drawnShapes.length === 0 ? (
                <p className="text-center py-2">Sin formas</p>
              ) : (
                <div className="space-y-1">
                  {drawnShapes.map((shape, index) => (
                    <div key={shape.id} className="flex items-center justify-between p-1 bg-muted rounded text-xs">
                      <span>{shape.type}</span>
                      {shape.measurement?.area && (
                        <Badge variant="outline" className="text-xs">
                          {shape.measurement.area.toFixed(1)} ha
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Badge variant="outline" className="w-full mt-2 justify-center">
                Total: {drawnShapes.length}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Mapa principal */}
        <Card className="lg:col-span-3 h-[600px] p-0 relative overflow-hidden">
          <div 
            ref={mapRef}
            className="w-full h-full rounded-lg relative overflow-hidden"
          >
            {!mapLoaded && (
              <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center z-10">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Cargando herramientas de dibujo IGN...</p>
                </div>
              </div>
            )}
          </div>

          {/* Instrucciones */}
          {mapLoaded && drawnShapes.length === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-none">
              <Alert className="pointer-events-auto shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Usa las herramientas de la barra superior derecha para:</p>
                  <ul className="text-sm space-y-1 ml-4 list-disc">
                    <li>Dibujar polígonos de áreas de rastrillaje</li>
                    <li>Trazar rutas y caminos</li>
                    <li>Marcar puntos de interés</li>
                    <li>Medir distancias y áreas</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
