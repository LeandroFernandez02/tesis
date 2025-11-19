import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Target, Flame, Layers, ZoomIn, ZoomOut, Maximize2, X, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Incident } from '../types/incident';
import { Team } from '../types/personnel';
import { MapIncidentDetails } from './map-incident-details';

interface IncidentMapProps {
  incidents: Incident[];
  teams?: Team[];
  onIncidentSelect?: (incident: Incident) => void;
  selectedIncident?: Incident | null;
  className?: string;
  centerOnIncident?: boolean;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  incident: Incident;
}

export function IncidentMapIGN({ incidents, teams = [], onIncidentSelect, selectedIncident, className, centerOnIncident = false }: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: -31.4201, lng: -64.1888 }); // Córdoba, Argentina default
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(12);
  const [mapLayer, setMapLayer] = useState<'argenmap' | 'satellite' | 'topographic' | 'hybrid'>('argenmap');
  const [showIncidentDetails, setShowIncidentDetails] = useState(false);

  // Simular ubicaciones para los incidentes en Córdoba, Argentina (en una app real usarías geocoding)
  const generateIncidentLocations = (incidents: Incident[]): MapMarker[] => {
    const baseLocations = [
      { lat: -31.4201, lng: -64.1888 }, // Centro de Córdoba
      { lat: -31.3683, lng: -64.1437 }, // Norte de Córdoba
      { lat: -31.4778, lng: -64.2445 }, // Villa Carlos Paz
      { lat: -31.3200, lng: -64.2990 }, // Sierras de Córdoba
      { lat: -31.5375, lng: -64.1838 }, // Sur de Córdoba
      { lat: -31.2490, lng: -64.2500 }, // La Cumbre
      { lat: -31.5658, lng: -64.4742 }, // Alta Gracia
      { lat: -31.2958, lng: -64.0914 }, // Río Ceballos
    ];

    return incidents.map((incident, index) => {
      const baseLocation = baseLocations[index % baseLocations.length];
      // Agregar pequeña variación aleatoria
      const lat = baseLocation.lat + (Math.random() - 0.5) * 0.02;
      const lng = baseLocation.lng + (Math.random() - 0.5) * 0.02;
      
      return {
        id: incident.id,
        lat,
        lng,
        incident
      };
    });
  };

  // Inicializar Leaflet map con capas del IGN Argentina
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 50; // Máximo 5 segundos de intentos

    const initializeMap = async () => {
      try {
        // Verificar que el componente siga montado
        if (!isMounted) return;

        // Verificar que el contenedor esté disponible
        if (!mapRef.current) {
          return;
        }

        // Verificar que el contenedor esté visible y tenga dimensiones
        if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
          retryCount++;
          if (retryCount < maxRetries) {
            setTimeout(() => {
              if (isMounted) {
                initializeMap();
              }
            }, 100);
            return;
          } else {
            return;
          }
        }

        // Suprimir temporalmente errores de CSS CORS
        const originalError = console.error;
        console.error = (...args) => {
          const message = args[0]?.toString() || '';
          if (message.includes('cssRules') || 
              message.includes('CSSStyleSheet') ||
              message.includes('stylesheet')) {
            return; // Suprimir error de CSS CORS
          }
          originalError.apply(console, args);
        };

        // Importar Leaflet dinámicamente
        const L = await import('leaflet');
        
        // Verificar nuevamente que el componente siga montado después del import
        if (!isMounted || !mapRef.current) {
          console.error = originalError;
          return;
        }
        
        // CSS de Leaflet con crossorigin (solo agregar si no existe)
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }

        // Restaurar console.error después de un pequeño delay
        setTimeout(() => {
          console.error = originalError;
        }, 1000);

        // Configurar iconos de Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Verificación final antes de crear el mapa
        if (!isMounted || !mapRef.current) {
          return;
        }
        
        const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], currentZoom);

        // Capas del IGN (Instituto Geográfico Nacional) Argentina
        // Documentación oficial: https://www.ign.gob.ar/NuestrasActividades/Geodesia/ServiciosSatelitales
        
        // ArgenMap - Mapa base vectorial oficial de Argentina
        const argenmapLayer = L.tileLayer.wms('https://wms.ign.gob.ar/geoserver/gwc/service/wms', {
          layers: 'caratula',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          attribution: '© <a href="https://www.ign.gob.ar/" target="_blank">IGN Argentina</a>',
          maxZoom: 20,
        });

        // Capa satelital de Argentina (usando IGN)
        const satelliteLayer = L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/argenmap@EPSG:3857@png/{z}/{x}/{-y}.png', {
          attribution: '© <a href="https://www.ign.gob.ar/" target="_blank">IGN Argentina</a>',
          maxZoom: 18,
          tms: true,
        });

        // Capa topográfica con curvas de nivel
        const topographicLayer = L.tileLayer.wms('https://wms.ign.gob.ar/geoserver/gwc/service/wms', {
          layers: 'mapabase_topo',
          format: 'image/png',
          transparent: false,
          version: '1.1.1',
          attribution: '© <a href="https://www.ign.gob.ar/" target="_blank">IGN Argentina</a>',
          maxZoom: 20,
        });

        // Capa híbrida (satélite + etiquetas)
        const hybridLayer = L.layerGroup([
          L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/argenmap@EPSG:3857@png/{z}/{x}/{-y}.png', {
            attribution: '© <a href="https://www.ign.gob.ar/" target="_blank">IGN Argentina</a>',
            maxZoom: 18,
            tms: true,
          }),
          L.tileLayer.wms('https://wms.ign.gob.ar/geoserver/gwc/service/wms', {
            layers: 'referencias',
            format: 'image/png',
            transparent: true,
            version: '1.1.1',
            maxZoom: 20,
          })
        ]);

        // Agregar capa inicial (ArgenMap)
        argenmapLayer.addTo(map);

        // Guardar las capas para cambio posterior
        (map as any).layers = {
          argenmap: argenmapLayer,
          satellite: satelliteLayer,
          topographic: topographicLayer,
          hybrid: hybridLayer
        };

        // Event listeners
        map.on('zoomend', () => {
          setCurrentZoom(map.getZoom());
        });

        map.on('moveend', () => {
          const center = map.getCenter();
          setMapCenter({ lat: center.lat, lng: center.lng });
        });

        leafletMapRef.current = map;
        setMapLoaded(true);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Pequeño delay para asegurar que el DOM esté listo
    const initTimer = setTimeout(() => {
      if (isMounted) {
        initializeMap();
      }
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Actualizar marcadores cuando cambien los incidentes
  useEffect(() => {
    if (!mapLoaded || !leafletMapRef.current) return;
    
    const newMarkers = generateIncidentLocations(incidents);
    setMarkers(newMarkers);
    
    const updateMapMarkers = async () => {
      const L = await import('leaflet');
      const map = leafletMapRef.current;
      
      // Limpiar marcadores existentes
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current.clear();

      // Agregar nuevos marcadores
      newMarkers.forEach(markerData => {
        const color = getPriorityColor(markerData.incident.prioridad);
        
        // Crear icono personalizado
        const customIcon = L.divIcon({
          className: 'custom-incident-marker',
          html: `
            <div class="relative">
              <div class="w-6 h-6 rounded-full border-2 ${color} shadow-lg flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-current"></div>
              </div>
              <div class="absolute inset-0 w-6 h-6 rounded-full animate-ping opacity-75 ${color.replace('border-', 'bg-').replace('bg-', 'bg-')}"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        });

        const marker = L.marker([markerData.lat, markerData.lng], { icon: customIcon })
          .addTo(map);

        // Popup con información del incidente
        const popupContent = `
          <div class="p-2 min-w-48">
            <h4 class="font-medium text-sm mb-2">${markerData.incident.titulo}</h4>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="inline-block px-2 py-1 text-xs rounded ${color} text-white">
                  ${markerData.incident.prioridad}
                </span>
                <span class="text-xs ${getStatusTextColor(markerData.incident.estado)}">
                  ${markerData.incident.estado}
                </span>
              </div>
              <p class="text-xs text-gray-600">${markerData.incident.ubicacion}</p>
              <p class="text-xs text-gray-500">${markerData.incident.descripcion.substring(0, 100)}...</p>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        
        marker.on('click', () => {
          onIncidentSelect?.(markerData.incident);
          setShowIncidentDetails(true);
        });

        markersRef.current.set(markerData.id, marker);
      });
    };

    updateMapMarkers();
  }, [incidents, mapLoaded]);

  // Actualizar selección de incidente
  useEffect(() => {
    if (!selectedIncident || !leafletMapRef.current) return;
    
    const marker = markersRef.current.get(selectedIncident.id);
    if (marker) {
      marker.openPopup();
      const markerData = markers.find(m => m.id === selectedIncident.id);
      if (markerData) {
        leafletMapRef.current.setView([markerData.lat, markerData.lng], Math.max(currentZoom, 15));
      }
    }
  }, [selectedIncident, markers]);

  // Invalidar tamaño del mapa cuando se hace visible (para tabs)
  useEffect(() => {
    if (!mapLoaded || !leafletMapRef.current || !mapRef.current) return;

    // Usar IntersectionObserver para detectar cuando el mapa se hace visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && leafletMapRef.current) {
            // El mapa se hizo visible, invalidar tamaño
            setTimeout(() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.invalidateSize();
              }
            }, 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(mapRef.current);

    return () => {
      observer.disconnect();
    };
  }, [mapLoaded]);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([location.lat, location.lng], 15);
            
            // Agregar marcador de ubicación del usuario
            const L = await import('leaflet');
            
            // Remover marcador anterior si existe
            if ((leafletMapRef.current as any).userMarker) {
              leafletMapRef.current.removeLayer((leafletMapRef.current as any).userMarker);
            }
            
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
            
            const userMarker = L.marker([location.lat, location.lng], { icon: userIcon })
              .addTo(leafletMapRef.current)
              .bindPopup('<div class="text-center p-2"><strong>Tu ubicación actual</strong></div>');
            
            (leafletMapRef.current as any).userMarker = userMarker;
          }
        },
        (error) => {
          // Manejo silencioso de errores de geolocalización
          if (error.code === error.PERMISSION_DENIED) {
            // Usuario denegó permisos - funcionalidad opcional, no es crítico
            console.info('ℹ️ Ubicación: Los permisos de ubicación no están habilitados. El mapa funcionará normalmente sin tu ubicación actual.');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            // GPS no disponible
            console.info('ℹ️ Ubicación: Señal GPS no disponible en este momento.');
          } else if (error.code === error.TIMEOUT) {
            // Timeout
            console.info('ℹ️ Ubicación: Tiempo de espera agotado al obtener tu ubicación.');
          } else {
            // Otros errores
            console.info('ℹ️ Ubicación: No se pudo obtener tu ubicación actual.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  };

  const changeMapLayer = async (layer: 'argenmap' | 'satellite' | 'topographic' | 'hybrid') => {
    if (!leafletMapRef.current || !mapLoaded) return;
    
    const map = leafletMapRef.current;
    const layers = (map as any).layers;
    
    // Remover capa actual
    Object.values(layers).forEach((l: any) => {
      if (map.hasLayer(l)) {
        map.removeLayer(l);
      }
    });
    
    // Agregar nueva capa
    layers[layer].addTo(map);
    setMapLayer(layer);
  };

  const zoomIn = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
    }
  };

  const toggleFullscreen = () => {
    if (mapRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapRef.current.requestFullscreen();
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Crítica': return 'bg-red-600 border-red-700';
      case 'Alta': return 'bg-orange-500 border-orange-600';
      case 'Media': return 'bg-yellow-500 border-yellow-600';
      case 'Baja': return 'bg-green-500 border-green-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'text-red-600';
      case 'Inactivo': return 'text-orange-600';
      case 'Finalizado': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };



  const focusOnIncident = (incident: Incident) => {
    const marker = markers.find(m => m.id === incident.id);
    if (marker && leafletMapRef.current) {
      leafletMapRef.current.setView([marker.lat, marker.lng], Math.max(currentZoom, 15));
      onIncidentSelect?.(incident);
      setShowIncidentDetails(true);
      
      // Abrir popup del marcador
      const leafletMarker = markersRef.current.get(incident.id);
      if (leafletMarker) {
        leafletMarker.openPopup();
      }
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controles del mapa */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-red-600" />
          <h3>Mapa Operacional SAR - IGN Argentina</h3>
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
            <Button 
              variant={mapLayer === 'hybrid' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => changeMapLayer('hybrid')}
            >
              Híbrido
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={getUserLocation}>
            <Navigation className="h-4 w-4 mr-2" />
            Mi Ubicación
          </Button>
          <Badge variant="outline">
            {markers.length} incidentes • Zoom: {currentZoom}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mapa principal */}
        <Card className="lg:col-span-2 h-[400px] p-0 relative overflow-hidden">
          <div 
            ref={mapRef}
            className="w-full h-full rounded-lg relative overflow-hidden"
          >
            {!mapLoaded && (
              <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center z-10">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Cargando mapa del IGN Argentina...</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Controles de zoom */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
            <Button size="sm" variant="secondary" onClick={zoomIn} className="p-2">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={zoomOut} className="p-2">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={toggleFullscreen} className="p-2">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Indicador de coordenadas */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 text-white px-2 py-1 rounded text-xs">
            {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
          </div>

          {/* Panel de detalles del incidente */}
          {showIncidentDetails && selectedIncident && (
            <div className="absolute top-4 left-4 z-[1000] max-w-sm">
              <MapIncidentDetails
                incident={selectedIncident}
                userLocation={userLocation}
                onClose={() => setShowIncidentDetails(false)}
                onNavigate={(incident) => {
                  // Aquí puedes integrar con Google Maps o Apple Maps
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.ubicacion}`;
                  window.open(url, '_blank');
                }}
              />
            </div>
          )}
        </Card>

        {/* Lista de grupos desplegados */}
        <Card className="h-[400px] p-4 overflow-hidden">
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-red-600" />
              <h4>Grupos Desplegados</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {teams.length} {teams.length === 1 ? 'grupo activo' : 'grupos activos'}
            </p>
          </div>
          
          <div className="space-y-1.5 h-[300px] overflow-y-auto">
            {teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No hay grupos creados</p>
                <p className="text-xs mt-1">Los grupos aparecerán aquí</p>
              </div>
            ) : (
              teams.map((team) => (
                <div
                  key={team.id}
                  className="p-2 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                        <p className="text-sm">{team.nombre}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          team.estado === 'Disponible' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                          team.estado === 'En Escena' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                          team.estado === 'En Ruta' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                          'bg-gray-500/10 text-gray-600 border-gray-500/20'
                        }`}
                      >
                        {team.estado}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Tipo: {team.tipo}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {team.lider && (
                          <span className="text-muted-foreground">
                            👤 {team.lider.nombre} {team.lider.apellido}
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {team.miembros.length} {team.miembros.length === 1 ? 'miembro' : 'miembros'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>


    </div>
  );
}
