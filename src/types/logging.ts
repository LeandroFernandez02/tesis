export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type LogCategory = 
  | 'auth'
  | 'incident'
  | 'personnel'
  | 'gps'
  | 'file'
  | 'system'
  | 'security'
  | 'api'
  | 'database'
  | 'backup';

export type ActionType = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'upload'
  | 'download'
  | 'export'
  | 'import'
  | 'backup'
  | 'restore'
  | 'config_change'
  | 'permission_change';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  action: ActionType;
  userId?: string;
  userName?: string;
  userRole?: string;
  message: string;
  details?: Record<string, any>;
  resourceId?: string;
  resourceType?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  errorCode?: string;
  duration?: number; // en milisegundos
  metadata?: Record<string, any>;
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  tipo: SecurityEventType;
  severidad: 'low' | 'medium' | 'high' | 'critical';
  usuario?: string;
  ipAddress: string;
  userAgent?: string;
  descripcion: string;
  detalles: Record<string, any>;
  bloqueado: boolean;
  investigado: boolean;
  resuelto: boolean;
  notas?: string;
}

export type SecurityEventType = 
  | 'failed_login'
  | 'unauthorized_access'
  | 'permission_escalation'
  | 'suspicious_activity'
  | 'data_breach_attempt'
  | 'malware_detected'
  | 'unusual_location'
  | 'multiple_sessions'
  | 'password_change'
  | 'account_locked'
  | 'session_hijack_attempt';

export interface AuditTrail {
  id: string;
  timestamp: Date;
  entityType: string;
  entityId: string;
  action: ActionType;
  userId: string;
  userName: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields: string[];
  reason?: string;
  approved?: boolean;
  approvedBy?: string;
  ipAddress: string;
}

export interface SystemHealth {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeUsers: number;
  activeSessions: number;
  errorRate: number;
  responseTime: number;
  status: 'healthy' | 'warning' | 'critical';
  components: ComponentHealth[];
}

export interface ComponentHealth {
  nombre: string;
  status: 'operational' | 'degraded' | 'outage';
  responseTime?: number;
  errorRate?: number;
  lastCheck: Date;
  message?: string;
}

export interface BackupInfo {
  id: string;
  timestamp: Date;
  tipo: 'full' | 'incremental' | 'differential';
  tamaño: number; // en bytes
  duracion: number; // en segundos
  estado: 'in_progress' | 'completed' | 'failed';
  ubicacion: string;
  checksum: string;
  tablas: string[];
  errorMessage?: string;
  createdBy: string;
}

export interface SessionInfo {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
  active: boolean;
  actions: number;
  permissions: string[];
}

export interface DataIntegrityCheck {
  id: string;
  timestamp: Date;
  tabla: string;
  registrosVerificados: number;
  erroresEncontrados: number;
  errores: DataIntegrityError[];
  duracion: number;
  estado: 'passed' | 'failed' | 'warnings';
}

export interface DataIntegrityError {
  tipo: 'missing_relation' | 'invalid_format' | 'constraint_violation' | 'duplicate' | 'orphaned';
  registro: string;
  campo?: string;
  valor?: any;
  descripcion: string;
  severidad: 'low' | 'medium' | 'high';
}