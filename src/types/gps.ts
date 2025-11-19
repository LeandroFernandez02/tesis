export interface GPSPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  timestamp: number;
  heading?: number;
  speed?: number;
}

export interface OfflineMapTile {
  x: number;
  y: number;
  z: number;
  url: string;
  data?: ArrayBuffer;
  cached: boolean;
  timestamp: Date;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface OfflineMapArea {
  id: string;
  nombre: string;
  bounds: MapBounds;
  zoomLevels: number[];
  tiles: OfflineMapTile[];
  tamaño: number; // en MB
  fechaDescarga: Date;
  estado: 'descargando' | 'disponible' | 'error';
  progreso?: number;
}

export interface GPXParseResult {
  tracks: GPXTrack[];
  waypoints: GPXWaypoint[];
  metadata?: GPXMetadata;
  estadisticas: GPXStats;
}

export interface GPXTrack {
  nombre: string;
  descripcion?: string;
  puntos: GPSPosition[];
  segmentos: GPXTrackSegment[];
}

export interface GPXTrackSegment {
  puntos: GPSPosition[];
  distancia: number;
  duracion?: number;
  velocidadPromedio?: number;
  elevacionGanada?: number;
  elevacionPerdida?: number;
}

export interface GPXWaypoint {
  nombre: string;
  descripcion?: string;
  posicion: GPSPosition;
  tipo?: string;
  simbolo?: string;
}

export interface GPXMetadata {
  nombre?: string;
  descripcion?: string;
  autor?: string;
  fechaCreacion?: Date;
  software?: string;
  bounds?: MapBounds;
}

export interface GPXStats {
  totalPuntos: number;
  totalTracks: number;
  totalWaypoints: number;
  distanciaTotal: number;
  duracionTotal?: number;
  elevacionMinima?: number;
  elevacionMaxima?: number;
  velocidadMaxima?: number;
}

export interface GeofenceArea {
  id: string;
  nombre: string;
  tipo: 'circular' | 'poligonal';
  centro?: GPSPosition;
  radio?: number; // en metros
  poligono?: GPSPosition[];
  activa: boolean;
  alertas: GeofenceAlert[];
}

export interface GeofenceAlert {
  id: string;
  tipo: 'entrada' | 'salida' | 'permanencia';
  timestamp: Date;
  posicion: GPSPosition;
  persona?: string;
  equipo?: string;
}

export interface TrackingSession {
  id: string;
  nombre: string;
  inicioTimestamp: Date;
  finTimestamp?: Date;
  activa: boolean;
  posiciones: GPSPosition[];
  distanciaRecorrida: number;
  duracion: number;
  persona: string;
  equipo?: string;
  misionId?: string;
}

export interface CompassReading {
  magneticHeading: number;
  trueHeading?: number;
  accuracy: number;
  timestamp: Date;
}

export interface NavigationRoute {
  id: string;
  nombre: string;
  origen: GPSPosition;
  destino: GPSPosition;
  waypoints: GPSPosition[];
  distanciaTotal: number;
  duracionEstimada: number;
  instrucciones: RouteInstruction[];
  elevacionPerfil?: ElevationPoint[];
}

export interface RouteInstruction {
  distancia: number;
  duracion: number;
  texto: string;
  tipo: 'continuar' | 'girar_izquierda' | 'girar_derecha' | 'destino';
  coordenadas: GPSPosition;
}

export interface ElevationPoint {
  distancia: number;
  elevacion: number;
}

export interface OfflineGeocoding {
  consulta: string;
  resultados: GeocodingResult[];
  timestamp: Date;
}

export interface GeocodingResult {
  direccion: string;
  posicion: GPSPosition;
  relevancia: number;
  tipo: 'calle' | 'punto_interes' | 'ciudad' | 'region';
}