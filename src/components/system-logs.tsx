import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Eye, 
  Download, 
  Search, 
  Filter,
  RefreshCw,
  Lock,
  Unlock,
  UserCheck,
  FileText,
  Database,
  Server,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { LogEntry, SecurityEvent, AuditTrail, SystemHealth, BackupInfo, SessionInfo, LogLevel, LogCategory } from '../types/logging';

interface SystemLogsProps {
  onExportLogs?: (filters: any) => void;
}

export function SystemLogs({ onExportLogs }: SystemLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  
  // Filtros
  const [logLevelFilter, setLogLevelFilter] = useState<LogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSystemHealth, 30000); // Cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadInitialData = () => {
    // Datos de ejemplo para logs
    const sampleLogs: LogEntry[] = [
      {
        id: 'log-001',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        level: 'info',
        category: 'auth',
        action: 'login',
        userId: 'user-001',
        userName: 'Carlos Méndez',
        userRole: 'Comandante',
        message: 'Usuario autenticado exitosamente',
        ipAddress: '192.168.1.100',
        sessionId: 'session-001',
        success: true,
        duration: 234
      },
      {
        id: 'log-002',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        level: 'warn',
        category: 'security',
        action: 'login',
        message: 'Intento de login con credenciales incorrectas',
        ipAddress: '192.168.1.200',
        success: false,
        errorCode: 'AUTH_FAILED',
        duration: 1500
      },
      {
        id: 'log-003',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        level: 'info',
        category: 'incident',
        action: 'create',
        userId: 'user-002',
        userName: 'Ana García',
        userRole: 'Capitán',
        message: 'Nuevo incidente creado: Persona desaparecida en Sector Norte',
        resourceId: 'inc-001',
        resourceType: 'incident',
        ipAddress: '192.168.1.101',
        success: true,
        duration: 567
      },
      {
        id: 'log-004',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        level: 'error',
        category: 'gps',
        action: 'update',
        message: 'Error al actualizar coordenadas GPS',
        errorCode: 'GPS_TIMEOUT',
        success: false,
        duration: 5000
      }
    ];
    setLogs(sampleLogs);

    // Eventos de seguridad
    const sampleSecurityEvents: SecurityEvent[] = [
      {
        id: 'sec-001',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        tipo: 'failed_login',
        severidad: 'medium',
        ipAddress: '192.168.1.200',
        descripcion: 'Múltiples intentos fallidos de login desde la misma IP',
        detalles: { attempts: 3, username: 'admin', blocked: false },
        bloqueado: false,
        investigado: false,
        resuelto: false
      },
      {
        id: 'sec-002',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        tipo: 'unauthorized_access',
        severidad: 'high',
        usuario: 'user-003',
        ipAddress: '192.168.1.150',
        descripcion: 'Intento de acceso a información clasificada sin permisos',
        detalles: { resource: '/api/classified/personnel', method: 'GET' },
        bloqueado: true,
        investigado: true,
        resuelto: false
      }
    ];
    setSecurityEvents(sampleSecurityEvents);

    // Trail de auditoría
    const sampleAuditTrail: AuditTrail[] = [
      {
        id: 'audit-001',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        entityType: 'Personnel',
        entityId: 'pers-001',
        action: 'update',
        userId: 'user-001',
        userName: 'Carlos Méndez',
        oldValues: { estado: 'Activo', ubicacionActual: 'Estación Central' },
        newValues: { estado: 'En Servicio', ubicacionActual: 'Sector Norte' },
        changedFields: ['estado', 'ubicacionActual'],
        ipAddress: '192.168.1.100'
      }
    ];
    setAuditTrail(sampleAuditTrail);

    // Sesiones activas
    const sampleSessions: SessionInfo[] = [
      {
        id: 'session-001',
        userId: 'user-001',
        userName: 'Carlos Méndez',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        active: true,
        actions: 15,
        permissions: ['read_all', 'write_incident', 'manage_personnel']
      },
      {
        id: 'session-002',
        userId: 'user-002',
        userName: 'Ana García',
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 60 * 1000),
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        active: true,
        actions: 8,
        permissions: ['read_all', 'write_incident']
      }
    ];
    setActiveSessions(sampleSessions);

    // Información de backups
    const sampleBackups: BackupInfo[] = [
      {
        id: 'backup-001',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        tipo: 'full',
        tamaño: 1024 * 1024 * 150, // 150MB
        duracion: 180, // 3 minutos
        estado: 'completed',
        ubicacion: '/backups/full_2024_01_15.sql',
        checksum: 'a1b2c3d4e5f6',
        tablas: ['incidents', 'personnel', 'teams', 'logs'],
        createdBy: 'system'
      },
      {
        id: 'backup-002',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        tipo: 'incremental',
        tamaño: 1024 * 1024 * 25, // 25MB
        duracion: 45,
        estado: 'completed',
        ubicacion: '/backups/inc_2024_01_15_18h.sql',
        checksum: 'b2c3d4e5f6a1',
        tablas: ['incidents', 'logs'],
        createdBy: 'system'
      }
    ];
    setBackups(sampleBackups);

    loadSystemHealth();
  };

  const loadSystemHealth = () => {
    // Simular datos de salud del sistema
    const health: SystemHealth = {
      timestamp: new Date(),
      cpuUsage: Math.random() * 30 + 10, // 10-40%
      memoryUsage: Math.random() * 40 + 30, // 30-70%
      diskUsage: Math.random() * 20 + 60, // 60-80%
      networkLatency: Math.random() * 50 + 10, // 10-60ms
      activeUsers: activeSessions.length,
      activeSessions: activeSessions.length,
      errorRate: Math.random() * 2, // 0-2%
      responseTime: Math.random() * 200 + 100, // 100-300ms
      status: 'healthy',
      components: [
        { nombre: 'API Server', status: 'operational', responseTime: 150, lastCheck: new Date() },
        { nombre: 'Database', status: 'operational', responseTime: 45, lastCheck: new Date() },
        { nombre: 'GPS Service', status: 'operational', responseTime: 200, lastCheck: new Date() },
        { nombre: 'File Storage', status: 'operational', responseTime: 80, lastCheck: new Date() }
      ]
    };
    setSystemHealth(health);
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = logLevelFilter === 'all' || log.level === logLevelFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesLevel && matchesCategory && matchesSearch;
  });

  const getLogLevelColor = (level: LogLevel) => {
    const colors = {
      debug: 'bg-gray-100 text-gray-800',
      info: 'bg-blue-100 text-blue-800',
      warn: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      critical: 'bg-red-600 text-white'
    };
    return colors[level];
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-600 text-white'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            Sistema de Logs y Auditoría
          </h1>
          <p className="text-muted-foreground">
            Monitoreo, seguridad y auditoría del sistema SAR
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-actualizar
          </Button>
          <Button variant="outline" onClick={() => onExportLogs?.({})}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Logs
          </Button>
        </div>
      </div>

      {/* Estado del sistema */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Estado del Sistema
              <Badge variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU</span>
                  <span>{systemHealth.cpuUsage.toFixed(1)}%</span>
                </div>
                <Progress value={systemHealth.cpuUsage} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memoria</span>
                  <span>{systemHealth.memoryUsage.toFixed(1)}%</span>
                </div>
                <Progress value={systemHealth.memoryUsage} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Disco</span>
                  <span>{systemHealth.diskUsage.toFixed(1)}%</span>
                </div>
                <Progress value={systemHealth.diskUsage} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Latencia</span>
                  <span>{systemHealth.networkLatency.toFixed(0)}ms</span>
                </div>
                <Progress value={(systemHealth.networkLatency / 100) * 100} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{systemHealth.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Usuarios Activos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{systemHealth.errorRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Tasa de Errores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{systemHealth.responseTime.toFixed(0)}ms</div>
                <div className="text-sm text-muted-foreground">Tiempo Respuesta</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{systemHealth.components.length}</div>
                <div className="text-sm text-muted-foreground">Componentes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="logs">Logs del Sistema</TabsTrigger>
          <TabsTrigger value="security">Eventos de Seguridad</TabsTrigger>
          <TabsTrigger value="audit">Trail de Auditoría</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones Activas</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Logs del Sistema ({filteredLogs.length})</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar en logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={logLevelFilter} onValueChange={(value: LogLevel | 'all') => setLogLevelFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={(value: LogCategory | 'all') => setCategoryFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="auth">Autenticación</SelectItem>
                      <SelectItem value="incident">Incidentes</SelectItem>
                      <SelectItem value="personnel">Personal</SelectItem>
                      <SelectItem value="gps">GPS</SelectItem>
                      <SelectItem value="security">Seguridad</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className={getLogLevelColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{log.category}</Badge>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{log.message}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.timestamp.toLocaleString()} • {log.userName || 'Sistema'} • {log.ipAddress}
                        {log.duration && <span> • {log.duration}ms</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {log.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Eventos de Seguridad ({securityEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map(event => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(event.severidad)}>
                              {event.severidad.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{event.tipo.replace('_', ' ')}</Badge>
                            {event.bloqueado && (
                              <Badge variant="destructive">
                                <Lock className="h-3 w-3 mr-1" />
                                Bloqueado
                              </Badge>
                            )}
                          </div>
                          <div className="font-medium">{event.descripcion}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {event.timestamp.toLocaleString()} • IP: {event.ipAddress}
                            {event.usuario && <span> • Usuario: {event.usuario}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Investigar
                          </Button>
                          <Button variant="outline" size="sm">
                            Resolver
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Sesiones Activas ({activeSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map(session => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">{session.userName}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {session.userId} • IP: {session.ipAddress}
                            </div>
                          </div>
                          <Badge variant={session.active ? 'default' : 'secondary'}>
                            {session.active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            Inicio: {session.startTime.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Última actividad: {session.lastActivity.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.actions} acciones
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Terminar Sesión
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backups del Sistema ({backups.length})
                </CardTitle>
                <Button>
                  <Database className="h-4 w-4 mr-2" />
                  Crear Backup
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.map(backup => (
                  <Card key={backup.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <Badge variant={backup.tipo === 'full' ? 'default' : 'secondary'}>
                              {backup.tipo.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <div className="font-medium">
                              Backup {backup.timestamp.toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatFileSize(backup.tamaño)} • {backup.duracion}s • {backup.tablas.length} tablas
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={backup.estado === 'completed' ? 'default' : 'destructive'}>
                            {backup.estado === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {backup.estado === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                            {backup.estado}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                            <Button variant="outline" size="sm">
                              Restaurar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Métricas en Tiempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Gráficos de monitoreo en tiempo real
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      CPU, Memoria, Red, Respuestas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Componentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemHealth?.components.map(component => (
                    <div key={component.nombre} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{component.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {component.responseTime}ms
                        </div>
                      </div>
                      <Badge variant={
                        component.status === 'operational' ? 'default' :
                        component.status === 'degraded' ? 'secondary' : 'destructive'
                      }>
                        {component.status === 'operational' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {component.status === 'degraded' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {component.status === 'outage' && <XCircle className="h-3 w-3 mr-1" />}
                        {component.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}