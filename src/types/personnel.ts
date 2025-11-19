export interface Personnel {
  id: string;
  
  // Datos básicos requeridos (RF2.2)
  nombre: string;
  apellido: string;
  dni: string; // Campo obligatorio
  telefono: string;
  
  // Datos organizacionales
  organizacion: Organization;
  jerarquia: PersonnelRank; // Jerarquía en lugar de rango
  tipoAgente: AgentType; // Tipo de agente requerido
  numeroPlaca?: string;
  unidad?: string;
  
  // Datos médicos requeridos (RF2.2)
  grupoSanguineo: BloodType; // Campo obligatorio y tipado
  alergias: string; // Campo obligatorio, aunque sea vacío
  
  // Datos de contacto adicionales
  email?: string;
  telefonoEmergencia?: string;
  contactoEmergencia?: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  
  // Datos operacionales
  especialidad: PersonnelSpecialty[];
  certificaciones: Certification[];
  estado: PersonnelStatus;
  disponible: boolean;
  
  // Datos de servicio
  fechaIngreso: string;
  experienciaAnios: number;
  experienciaSAR?: number;
  turno: Shift;
  
  // Ubicación y asignación
  ubicacionActual?: string;
  coordenadasActuales?: { lat: number; lng: number };
  equipoAsignado?: string;
  
  // Otros datos
  foto?: string;
  ultimaCapacitacion?: string;
  nivelClearance: ClearanceLevel;
  observaciones?: string;
}

// Tipos de agente según RF2.2
export type AgentType = 
  | 'bombero'
  | 'policia'
  | 'bombero_voluntario'
  | 'baqueano'
  | 'defensa_civil'
  | 'cruz_roja'
  | 'rescatista'
  | 'especialista_k9'
  | 'paramedico'
  | 'externo'
  | 'otro';

// Grupos sanguíneos tipados
export type BloodType = 
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

export type PersonnelRank = 
  | 'Comandante General'
  | 'Comandante'
  | 'Capitán'
  | 'Teniente'
  | 'Sargento'
  | 'Cabo'
  | 'Bombero Especialista'
  | 'Bombero'
  | 'Aspirante'
  | 'Comisario'
  | 'Inspector'
  | 'Subinspector'
  | 'Oficial'
  | 'Suboficial'
  | 'Agente'
  | 'Director'
  | 'Coordinador'
  | 'Especialista SAR'
  | 'Técnico'
  | 'Voluntario Especialista'
  | 'Voluntario'
  | 'Jefe de Dotación'; // Agregado para RF2.1

export type PersonnelSpecialty = 
  | 'Búsqueda y Rescate'
  | 'Rastreo y Seguimiento'
  | 'K9 - Perros de Búsqueda'
  | 'Rescate en Montaña'
  | 'Rescate en Alturas'
  | 'Rescate Acuático'
  | 'Rescate Urbano'
  | 'Rescate Vehicular'
  | 'Navegación GPS'
  | 'Cartografía y Topografía'
  | 'Comunicaciones'
  | 'Emergencias Médicas'
  | 'Paramedico'
  | 'Investigación Criminal'
  | 'Análisis de Evidencias'
  | 'Coordinación Operativa'
  | 'Logística de Campo'
  | 'Primeros Auxilios'
  | 'Supervivencia'
  | 'Manejo de Drones'
  | 'Fotografía Forense'
  | 'Instructor SAR';

export type PersonnelStatus = 
  | 'Activo'
  | 'En Servicio'
  | 'Fuera de Servicio'
  | 'Relevo' // Requerido por RF2.4
  | 'De Licencia'
  | 'Capacitación'
  | 'Suspendido'
  | 'Inactivo';

export type Shift = 
  | 'Mañana'
  | 'Tarde'  
  | 'Noche'
  | '24 Horas'
  | 'Libre';

export interface Certification {
  id: string;
  nombre: string;
  entidadCertificadora: string;
  fechaObtencion: string;
  fechaVencimiento?: string;
  vigente: boolean;
  nivel?: 'Básico' | 'Intermedio' | 'Avanzado' | 'Instructor';
}

export interface Team {
  id: string;
  nombre: string;
  tipo: TeamType;
  lider?: Personnel; // Opcional: un equipo puede no tener líder asignado
  miembros: Personnel[];
  vehiculo?: Vehicle;
  especialidad: PersonnelSpecialty[];
  estado: TeamStatus;
  turno: Shift;
  capacidadMaxima: number;
  equipamiento: Equipment[];
  ubicacionBase: string;
  incidenteAsignado?: string;
  fechaCreacion: string;
  observaciones?: string;
}

export type Organization = 
  | 'Bomberos'
  | 'Bomberos Voluntarios'
  | 'Policía Nacional'
  | 'Policía Local'
  | 'Defensa Civil'
  | 'Cruz Roja'
  | 'Guardia Nacional'
  | 'Ejército'
  | 'Marina'
  | 'Fuerza Aérea'
  | 'Rescate Montaña'
  | 'Protección Civil'
  | 'ONG Rescate'
  | 'Servicios Médicos'
  | 'Brigada K9'
  | 'Grupo Espeleología'
  | 'Rescate Acuático'
  | 'Otro';

export type ClearanceLevel = 
  | 'Público'
  | 'Restringido'
  | 'Confidencial'
  | 'Secreto'
  | 'Alto Secreto';

export type TeamType = 
  | 'Búsqueda Terrestre'
  | 'Búsqueda Acuática'
  | 'Búsqueda Aérea'
  | 'Rastreo K9'
  | 'Rescate Técnico'
  | 'Rescate Médico'
  | 'Investigación'
  | 'Comando y Control'
  | 'Apoyo Logístico'
  | 'Comunicaciones'
  | 'Análisis e Inteligencia';

export type TeamStatus = 
  | 'Disponible'
  | 'En Ruta'
  | 'En Escena'
  | 'Regresando'
  | 'Fuera de Servicio'
  | 'Mantenimiento';

export interface Vehicle {
  id: string;
  numero: string;
  tipo: VehicleType;
  marca: string;
  modelo: string;
  año: number;
  placas: string;
  estado: VehicleStatus;
  capacidadTripulacion: number;
  equipamiento: Equipment[];
  ubicacionActual: string;
  kilometraje: number;
  ultimoMantenimiento: string;
  proximoMantenimiento: string;
}

export type VehicleType = 
  | 'Autobomba'
  | 'Escalera'
  | 'Rescate'
  | 'Ambulancia'
  | 'Materiales Peligrosos'
  | 'Comando'
  | 'Apoyo'
  | 'Cisterna';

export type VehicleStatus = 
  | 'Disponible'
  | 'En Servicio'
  | 'Mantenimiento'
  | 'Fuera de Servicio'
  | 'En Reparación';

export interface Equipment {
  id: string;
  nombre: string;
  tipo: EquipmentType;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  estado: EquipmentStatus;
  fechaAdquisicion: string;
  ultimaInspeccion: string;
  proximaInspeccion: string;
  ubicacion: string;
  responsable?: string;
}

export type EquipmentType = 
  | 'Protección Personal'
  | 'Combate de Incendios'
  | 'Rescate'
  | 'Comunicaciones'
  | 'Médico'
  | 'Herramientas'
  | 'Respiración'
  | 'Detección';

export type EquipmentStatus = 
  | 'Operativo'
  | 'Mantenimiento'
  | 'Reparación'
  | 'Fuera de Servicio'
  | 'Reemplazo Requerido';

export interface ShiftSchedule {
  id: string;
  fecha: string;
  turno: Shift;
  equipos: Team[];
  personalAsignado: Personnel[];
  comandanteGuardia: Personnel;
  observaciones?: string;
  incidentesAtendidos: number;
  horasServicio: number;
}

export interface PersonnelAssignment {
  id: string;
  personalId: string;
  incidenteId: string;
  equipoId?: string;
  rol: string;
  fechaAsignacion: string;
  fechaLiberacion?: string;
  activo: boolean;
  observaciones?: string;
}