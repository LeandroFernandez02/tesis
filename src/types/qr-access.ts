import { Incident } from './incident';
import { Personnel } from './personnel';

export interface QRIncidentAccess {
  id: string;
  incidentId: string;
  incident: Incident;
  qrCode: string; // Base64 del QR o datos del QR
  accessCode: string; // Código único de 8 caracteres
  validUntil: Date;
  maxPersonnel?: number;
  registeredPersonnel: QRPersonnelEntry[];
  createdAt: Date;
  createdBy: string;
  active: boolean;
}

export interface QRPersonnelEntry {
  id: string;
  personnelId?: string;
  personnel?: Personnel;
  name: string;
  organization: string;
  role: string;
  phone?: string;
  registeredAt: Date;
  registeredBy: 'qr_scan' | 'manual_entry';
  notes?: string;
}

export interface QRConfig {
  validHours: number;
  maxPersonnel?: number;
  requireApproval: boolean;
}

export interface QRAccessStats {
  totalGenerated: number;
  activeAccesses: number;
  totalRegistrations: number;
  avgRegistrationsPerQR: number;
  mostUsedOrganization: string;
}