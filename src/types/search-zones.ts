import { Team } from './personnel';

export interface SearchZone {
  id: string;
  name: string;
  description: string;
  polygon: { lat: number; lng: number }[];
  color: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'assigned' | 'active' | 'completed';
  assignedTeam?: Team;
  assignedTeamId?: string; // ID del equipo asignado
  area: number; // en metros cuadrados
  estimatedTime: number; // en horas
  createdAt: Date;
  updatedAt: Date;
}

export interface GPXTrace {
  id: string;
  teamId: string;
  teamName: string;
  label: string; // Etiqueta del trazado (ej: "Avance 10:30")
  fileName: string;
  uploadedAt: Date;
  data: any; // Datos del GPX parseado
  visible: boolean;
  color: string;
}

export interface SearchAreaPlan {
  id: string;
  name: string;
  description: string;
  incidentId?: string;
  zones: SearchZone[];
  totalArea: number;
  totalEstimatedTime: number;
  assignedTeamsCount: number;
  completedZonesCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}