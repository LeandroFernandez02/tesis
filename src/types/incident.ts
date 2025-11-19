export type IncidentStatus = 'activo' | 'inactivo' | 'finalizado';
export type IncidentPriority = 'critico' | 'grave' | 'manejable';
export type IncidentCategory = 'persona' | 'objeto' | 'colaboracion_judicial';

// Tipos para las tablas de catálogo normalizadas
export interface EstadoIncidente {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden?: number;
  activo?: boolean;
}

export interface PrioridadIncidente {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  nivel: number;
  color?: string;
  tiempo_respuesta_minutos?: number;
  activo?: boolean;
}

export interface CategoriaIncidente {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  color?: string;
  requiere_evacuacion?: boolean;
  requiere_medicos?: boolean;
  activo?: boolean;
}

export interface Denunciante {
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  relacion?: string; // Relación con la persona desaparecida/objeto
}

export interface FiscalSolicitante {
  nombre: string;
  apellido: string;
  fiscalia: string;
  expediente: string;
  telefono?: string;
  email?: string;
}

export interface Incident {
  id: string;
  titulo: string;
  descripcion: string;
  estado: IncidentStatus;
  prioridad: IncidentPriority;
  categoria: IncidentCategory;
  
  // Datos del solicitante (RF1.1)
  denunciante?: Denunciante;
  fiscalSolicitante?: FiscalSolicitante;
  
  // Jefe de dotación asignado (RF2.1)
  jefeDotacion?: string; // ID del jefe de dotación
  
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaResolucion?: Date;
  // Punto 0 - Ubicación inicial del incidente (RF1.1)
  punto0: {
    lat: number;
    lng: number;
    direccion: string;
    zona?: string;
    fechaHora: Date; // Fecha y hora del punto 0
    bloqueado?: boolean; // Si está bloqueado para evitar movimientos accidentales
  };
  
  // Historial de Puntos 0 - Para trazabilidad y nuevas pistas
  historialPuntos0?: {
    id: string;
    lat: number;
    lng: number;
    direccion: string;
    zona?: string;
    fechaHora: Date;
    razon?: string; // Razón del nuevo punto (ej: "Nueva pista encontrada", "Testimonio adicional")
    bloqueado?: boolean;
  }[];
  
  // Ubicaciones adicionales durante la investigación
  ubicacionesAdicionales?: {
    lat: number;
    lng: number;
    direccion?: string;
    zona?: string;
    tipo: string; // 'punto_interes' | 'hallazgo' | 'area_busqueda'
    descripcion?: string;
    fechaHora: Date;
  }[];
  areasBusqueda?: SearchArea[];
  personaDesaparecida?: MissingPerson;
  coordenadas?: GPSCoordinate[];
  archivoGPX?: GPXFile;
  comentarios: IncidentComment[];
  // Recursos específicos del incidente
  personalAsignado?: string[]; // IDs del personal asignado
  equiposAsignados?: string[]; // IDs de los equipos/teams de personal
  archivosEvidencia?: IncidentFile[];
  timelineEventos?: TimelineEvent[];
  notificaciones?: IncidentNotification[];
  accesosQR?: QRAccess[];
  
  // Contador de tiempo para informes fiscales
  tiempoInicio?: Date; // Momento de inicio del incidente
  tiempoTranscurrido?: number; // Tiempo en milisegundos transcurrido
  pausado?: boolean; // Si el contador está pausado
  

}

// Tipos específicos para recursos del incidente
export interface IncidentFile {
  id: string;
  incidentId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  type: 'created' | 'assignment' | 'status_change' | 'comment' | 'file_upload' | 'location_update' | 'personnel_assigned' | 'team_assigned';
  timestamp: string;
  user: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  description: string;
  details?: {
    oldValue?: string;
    newValue?: string;
    comment?: string;
    fileId?: string;
    personnelId?: string;
    teamId?: string;
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface IncidentNotification {
  id: string;
  incidentId: string;
  type: 'critical' | 'status_change' | 'assignment' | 'file_upload' | 'comment' | 'personnel_update';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  targetUsers?: string[];
}

export interface QRAccess {
  id: string;
  incidentId: string;
  accessCode: string;
  qrCode: string;
  validUntil: Date;
  maxPersonnel?: number;
  registeredPersonnel: QRRegisteredPersonnel[];
  createdAt: Date;
  createdBy: string;
  active: boolean;
  allowedRoles?: string[];
}

export interface QRRegisteredPersonnel {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  institucion: string;
  rol: string;
  sexo: 'masculino' | 'femenino';
  alergias: string;
  grupoSanguineo: string;
  registeredAt: Date;
  estado?: 'activo' | 'inactivo'; // Estado del personal en el incidente
}

export interface MissingPerson {
  nombre: string;
  apellido: string;
  edad?: number;
  genero?: 'masculino' | 'femenino' | 'otro';
  descripcionFisica: string;
  ultimaVezVisto: {
    fecha: Date;
    ubicacion: string;
    coordenadas?: { lat: number; lng: number };
  };
  vestimenta?: string;
  condicionesMedicas?: string;
  medicamentos?: string;
  foto?: string;
  contactoFamiliar: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
}

export interface SearchArea {
  id: string;
  nombre: string;
  tipo: 'primaria' | 'secundaria' | 'ampliada';
  coordenadas: GPSCoordinate[];
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'sin_resultado';
  equipoAsignado?: string;
  prioridad: 'alta' | 'media' | 'baja';
  dificultad: 'facil' | 'moderada' | 'dificil' | 'extrema';
  terreno: string;
  observaciones?: string;
}

export interface GPSCoordinate {
  lat: number;
  lng: number;
  elevation?: number;
  timestamp?: Date;
  accuracy?: number;
}

export interface GPXFile {
  id: string;
  nombre: string;
  archivo: string; // Base64 o path
  fechaSubida: Date;
  puntos: number;
  tracks: GPXTrack[];
  waypoints: GPXWaypoint[];
}

export interface GPXTrack {
  nombre: string;
  puntos: GPSCoordinate[];
  distancia: number;
  duracion?: number;
}

export interface GPXWaypoint {
  nombre: string;
  coordenadas: GPSCoordinate;
  descripcion?: string;
  tipo: 'inicio' | 'punto_interes' | 'peligro' | 'refugio' | 'agua' | 'otro';
}



export interface IncidentComment {
  id: string;
  incidentId: string;
  autor: string;
  contenido: string;
  fecha: Date;
}

export interface IncidentStats {
  total: number;
  activos: number;
  inactivos: number;
  finalizados: number;
}