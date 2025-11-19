import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Map, 
  MapPin, 
  Download, 
  Upload, 
  Compass, 
  Navigation, 
  Route, 
  FileText,
  Satellite,
  Target,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { GPSPosition, OfflineMapArea, GPXParseResult, TrackingSession, NavigationRoute } from '../types/gps';

interface OfflineMapProps {
  searchAreas?: any[];
  personnel?: any[];
  incident?: any;
  onLocationUpdate?: (position: GPSPosition) => void;
  onGPXUpload?: (gpx: GPXParseResult) => void;
}

export function OfflineMap({ searchAreas = [], personnel = [], onLocationUpdate, onGPXUpload }: OfflineMapProps) {
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [offlineAreas, setOfflineAreas] = useState<OfflineMapArea[]>([]);
  const [gpxFiles, setGpxFiles] = useState<GPXParseResult[]>([]);
  const [activeSession, setActiveSession] = useState<TrackingSession | null>(null);
  const [mapMode, setMapMode] = useState<'satellite' | 'topographic' | 'street'>('satellite');
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watchId = useRef<number | null>(null);

  // Inicializar geolocalización
  useEffect(() => {
    if (isTracking && 'geolocation' in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      };

      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const gpsPos: GPSPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          };
          
          setCurrentPosition(gpsPos);
          setAccuracy(position.coords.accuracy);
          
          if (onLocationUpdate) {
            onLocationUpdate(gpsPos);
          }

          // Actualizar sesión de seguimiento activa
          if (activeSession) {
            updateTrackingSession(gpsPos);
          }
        },
        (error) => {
          // Manejo silencioso de errores de geolocalización
          if (error.code === error.PERMISSION_DENIED) {
            // Usuario denegó permisos - detener rastreo sin mostrar error
            setIsTracking(false);
            // Solo log informativo, no error
            console.info('ℹ️ GPS: Los permisos de ubicación no están habilitados. El sistema funcionará sin rastreo en tiempo real.');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            // GPS no disponible - continuar sin ubicación
            console.info('ℹ️ GPS: Señal GPS no disponible en este momento.');
          } else if (error.code === error.TIMEOUT) {
            // Timeout - solo log, no detener rastreo
            console.info('ℹ️ GPS: Tiempo de espera agotado, reintentando...');
          } else {
            // Otros errores
            console.info('ℹ️ GPS: No se pudo obtener la ubicación:', error.message || 'Error desconocido');
          }
        },
        options
      );
    }

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isTracking, activeSession, onLocationUpdate]);

  // Inicializar brújula
  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setCompassHeading(360 - event.alpha);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, []);

  const startTracking = () => {
    if ('geolocation' in navigator) {
      setIsTracking(true);
      // Crear nueva sesión de seguimiento
      const newSession: TrackingSession = {
        id: `session-${Date.now()}`,
        nombre: `Sesión ${new Date().toLocaleString()}`,
        inicioTimestamp: new Date(),
        activa: true,
        posiciones: [],
        distanciaRecorrida: 0,
        duracion: 0,
        persona: 'Usuario Actual'
      };
      setActiveSession(newSession);
    } else {
      alert('La geolocalización no está disponible en este dispositivo');
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        activa: false,
        finTimestamp: new Date()
      });
    }
  };

  const updateTrackingSession = (position: GPSPosition) => {
    if (!activeSession) return;

    const newPositions = [...activeSession.posiciones, position];
    let newDistance = activeSession.distanciaRecorrida;

    if (activeSession.posiciones.length > 0) {
      const lastPos = activeSession.posiciones[activeSession.posiciones.length - 1];
      newDistance += calculateDistance(lastPos, position);
    }

    setActiveSession({
      ...activeSession,
      posiciones: newPositions,
      distanciaRecorrida: newDistance,
      duracion: Date.now() - activeSession.inicioTimestamp.getTime()
    });
  };

  const calculateDistance = (pos1: GPSPosition, pos2: GPSPosition): number => {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleGPXUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const gpxData = parseGPX(content, file.name);
        setGpxFiles(prev => [...prev, gpxData]);
        if (onGPXUpload) {
          onGPXUpload(gpxData);
        }
      } catch (error) {
        console.error('Error al procesar GPX:', error);
        alert('Error al procesar el archivo GPX');
      }
    };
    reader.readAsText(file);
  };

  const parseGPX = (content: string, fileName: string): GPXParseResult => {
    // Implementación básica de parser GPX
    // En una implementación real, usarías una librería como gpx-parser-builder
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    const tracks = Array.from(xmlDoc.querySelectorAll('trk')).map(trk => {
      const name = trk.querySelector('name')?.textContent || 'Track sin nombre';
      const trkpts = Array.from(trk.querySelectorAll('trkpt'));
      
      const puntos: GPSPosition[] = trkpts.map(pt => ({
        latitude: parseFloat(pt.getAttribute('lat') || '0'),
        longitude: parseFloat(pt.getAttribute('lon') || '0'),
        altitude: parseFloat(pt.querySelector('ele')?.textContent || '0') || undefined,
        accuracy: 5, // Valor por defecto
        timestamp: new Date(pt.querySelector('time')?.textContent || Date.now()).getTime()
      }));

      return {
        nombre: name,
        puntos,
        segmentos: [{
          puntos,
          distancia: calculateTrackDistance(puntos)
        }]
      };
    });

    const waypoints = Array.from(xmlDoc.querySelectorAll('wpt')).map(wpt => ({
      nombre: wpt.querySelector('name')?.textContent || 'Waypoint',
      descripcion: wpt.querySelector('desc')?.textContent || undefined,
      posicion: {
        latitude: parseFloat(wpt.getAttribute('lat') || '0'),
        longitude: parseFloat(wpt.getAttribute('lon') || '0'),
        altitude: parseFloat(wpt.querySelector('ele')?.textContent || '0') || undefined,
        accuracy: 5,
        timestamp: Date.now()
      },
      tipo: wpt.querySelector('type')?.textContent || 'waypoint'
    }));

    const totalPuntos = tracks.reduce((sum, track) => sum + track.puntos.length, 0);
    const distanciaTotal = tracks.reduce((sum, track) => 
      sum + track.segmentos.reduce((segSum, seg) => segSum + seg.distancia, 0), 0
    );

    return {
      tracks,
      waypoints,
      metadata: {
        nombre: fileName,
        fechaCreacion: new Date()
      },
      estadisticas: {
        totalPuntos,
        totalTracks: tracks.length,
        totalWaypoints: waypoints.length,
        distanciaTotal
      }
    };
  };

  const calculateTrackDistance = (puntos: GPSPosition[]): number => {
    let distance = 0;
    for (let i = 1; i < puntos.length; i++) {
      distance += calculateDistance(puntos[i-1], puntos[i]);
    }
    return distance;
  };

  const downloadOfflineArea = (bounds: any) => {
    const newArea: OfflineMapArea = {
      id: `area-${Date.now()}`,
      nombre: `Área ${new Date().toLocaleString()}`,
      bounds,
      zoomLevels: [10, 11, 12, 13, 14, 15, 16],
      tiles: [],
      tamaño: 0,
      fechaDescarga: new Date(),
      estado: 'descargando',
      progreso: 0
    };
    
    setOfflineAreas(prev => [...prev, newArea]);
    
    // Simular descarga
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setOfflineAreas(prev => 
        prev.map(area => 
          area.id === newArea.id 
            ? { ...area, progreso: progress }
            : area
        )
      );
      
      if (progress >= 100) {
        clearInterval(interval);
        setOfflineAreas(prev => 
          prev.map(area => 
            area.id === newArea.id 
              ? { ...area, estado: 'disponible', tamaño: Math.random() * 100 }
              : area
          )
        );
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="h-6 w-6 text-red-600" />
            Sistema de Geolocalización DUAR
          </h1>
          <p className="text-muted-foreground">
            Navegación offline, tracking GPS y gestión de rutas para búsqueda y rescate
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isTracking ? "destructive" : "default"} 
            onClick={isTracking ? stopTracking : startTracking}
            className="bg-red-600 hover:bg-red-700"
          >
            <Target className="h-4 w-4 mr-2" />
            {isTracking ? 'Detener' : 'Iniciar'} GPS
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Subir GPX
          </Button>
        </div>
      </div>

      {/* Estado GPS actual */}
      {currentPosition && (
        <Alert>
          <Satellite className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Posición actual:</strong> {currentPosition.latitude.toFixed(6)}, {currentPosition.longitude.toFixed(6)}
                {currentPosition.altitude && (
                  <span className="ml-4"><strong>Altitud:</strong> {currentPosition.altitude.toFixed(1)}m</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={accuracy < 10 ? "default" : accuracy < 20 ? "secondary" : "destructive"}>
                  ±{accuracy.toFixed(1)}m
                </Badge>
                <div className="flex items-center gap-1">
                  <Compass className="h-4 w-4" />
                  <span>{compassHeading.toFixed(0)}°</span>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="gpx">Archivos GPX</TabsTrigger>
          <TabsTrigger value="offline">Mapas Offline</TabsTrigger>
          <TabsTrigger value="tracking">Seguimiento</TabsTrigger>
          <TabsTrigger value="navigation">Navegación</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Mapa Operacional
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={mapMode === 'satellite' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMapMode('satellite')}
                  >
                    Satélite
                  </Button>
                  <Button 
                    variant={mapMode === 'topographic' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMapMode('topographic')}
                  >
                    Topográfico
                  </Button>
                  <Button 
                    variant={mapMode === 'street' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setMapMode('street')}
                  >
                    Calles
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    Mapa interactivo - Modo {mapMode}
                  </p>
                  {currentPosition && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Mostrando posición actual: {currentPosition.latitude.toFixed(4)}, {currentPosition.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Controles del mapa */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{searchAreas.length} áreas de búsqueda</Badge>
                  <Badge variant="outline">{personnel.length} personal en campo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gpx" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Archivos GPX Cargados ({gpxFiles.length})
              </CardTitle>
              <CardDescription>
                Rutas y waypoints importados desde archivos GPX
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gpxFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-4">No hay archivos GPX cargados</p>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir primer archivo GPX
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {gpxFiles.map((gpx, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{gpx.metadata?.nombre || `GPX ${index + 1}`}</h4>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span>{gpx.estadisticas.totalTracks} tracks</span>
                              <span>{gpx.estadisticas.totalWaypoints} waypoints</span>
                              <span>{gpx.estadisticas.totalPuntos} puntos</span>
                              <span>{(gpx.estadisticas.distanciaTotal / 1000).toFixed(2)} km</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Ver en Mapa
                            </Button>
                            <Button variant="outline" size="sm">
                              Exportar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Mapas Offline ({offlineAreas.length})
              </CardTitle>
              <CardDescription>
                Descargar mapas para uso sin conexión a internet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={() => downloadOfflineArea({
                    north: 40.7589, south: 40.7489, 
                    east: -73.9741, west: -73.9841
                  })}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Área Actual
                </Button>
                
                {offlineAreas.map(area => (
                  <Card key={area.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{area.nombre}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{area.fechaDescarga.toLocaleDateString()}</span>
                            {area.tamaño > 0 && <span>{area.tamaño.toFixed(1)} MB</span>}
                            <Badge variant={
                              area.estado === 'disponible' ? 'default' :
                              area.estado === 'descargando' ? 'secondary' : 'destructive'
                            }>
                              {area.estado === 'disponible' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {area.estado === 'descargando' && <Clock className="h-3 w-3 mr-1" />}
                              {area.estado === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {area.estado}
                            </Badge>
                          </div>
                          {area.estado === 'descargando' && area.progreso !== undefined && (
                            <Progress value={area.progreso} className="mt-2" />
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Área
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Seguimiento GPS Activo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSession ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-medium text-lg">
                        {(activeSession.distanciaRecorrida / 1000).toFixed(2)} km
                      </div>
                      <div className="text-sm text-muted-foreground">Distancia</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-medium text-lg">
                        {Math.floor(activeSession.duracion / 60000)}:{((activeSession.duracion % 60000) / 1000).toFixed(0).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-muted-foreground">Tiempo</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-medium text-lg">{activeSession.posiciones.length}</div>
                      <div className="text-sm text-muted-foreground">Puntos</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-medium text-lg">
                        {activeSession.duracion > 0 
                          ? ((activeSession.distanciaRecorrida / 1000) / (activeSession.duracion / 3600000)).toFixed(1)
                          : '0.0'
                        } km/h
                      </div>
                      <div className="text-sm text-muted-foreground">Velocidad Prom.</div>
                    </div>
                  </div>
                  
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      Sesión activa: {activeSession.nombre} - {activeSession.persona}
                      <br />
                      Iniciada: {activeSession.inicioTimestamp.toLocaleString()}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Route className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-4">No hay seguimiento activo</p>
                  <Button onClick={startTracking}>
                    <Target className="h-4 w-4 mr-2" />
                    Iniciar Seguimiento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Sistema de Navegación
              </CardTitle>
              <CardDescription>
                Navegación por waypoints y rutas planificadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Navigation className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 mb-4">Funcionalidad de navegación en desarrollo</p>
                <p className="text-sm text-muted-foreground">
                  Incluirá navegación paso a paso, cálculo de rutas y alertas de proximidad
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Input oculto para archivos GPX */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gpx"
        onChange={handleGPXUpload}
        className="hidden"
      />
    </div>
  );
}