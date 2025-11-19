import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Flame, 
  Truck, 
  Users, 
  Clock, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Shield,
  Siren,
  Timer,
  Target,
  Gauge,
  Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Incident } from '../types/incident';
import { MissingPersonCard } from './missing-person-card';
import { IncidentTimer } from './incident-timer';

interface FirefighterDashboardProps {
  incidents: Incident[];
  stats: any;
  selectedIncident?: Incident;
  onUpdateIncident?: (updates: Partial<Incident>) => void;
  className?: string;
}

export function FirefighterDashboard({ incidents, stats, selectedIncident, onUpdateIncident, className }: FirefighterDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  // Colores temáticos para bomberos
  const colors = {
    critical: '#dc2626',
    high: '#ea580c', 
    medium: '#d97706',
    low: '#16a34a',
    resolved: '#059669',
    inProgress: '#0284c7'
  };

  // Métricas avanzadas para bomberos
  const metrics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filterByTimeframe = (incident: Incident) => {
      const createdAt = new Date(incident.fechaCreacion);
      switch (selectedTimeframe) {
        case 'today': return createdAt >= today;
        case 'week': return createdAt >= weekAgo;
        case 'month': return createdAt >= monthAgo;
        default: return true;
      }
    };

    const filteredIncidents = incidents.filter(filterByTimeframe);

    const activeIncidents = incidents.filter(i => ['activo', 'inactivo'].includes(i.estado));
    const criticalIncidents = activeIncidents.filter(i => i.prioridad === 'Crítica');
    const emergencyIncidents = filteredIncidents.filter(i => ['Incendio', 'Emergencia Médica', 'Accidente'].includes(i.categoria));

    // Tiempo promedio de respuesta (simulado)
    const avgResponseTime = 8.5; // minutos
    const avgResolutionTime = 45.2; // minutos

    // Distribución por tipo de emergencia
    const emergencyTypes = [
      { name: 'Incendios', value: filteredIncidents.filter(i => i.categoria === 'Técnico').length, color: colors.critical },
      { name: 'Emergencias Médicas', value: filteredIncidents.filter(i => i.categoria === 'Red').length, color: colors.high },
      { name: 'Rescates', value: filteredIncidents.filter(i => i.categoria === 'Software').length, color: colors.medium },
      { name: 'Otros', value: filteredIncidents.filter(i => !['Técnico', 'Red', 'Software'].includes(i.categoria)).length, color: colors.low }
    ];

    // Tendencias por hora del día
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      incidents: Math.floor(Math.random() * 5) + (hour >= 8 && hour <= 20 ? 3 : 1)
    }));

    // Rendimiento del equipo
    const teamPerformance = [
      { name: 'Equipo Alpha', resolved: 45, pending: 8, efficiency: 85 },
      { name: 'Equipo Bravo', resolved: 38, pending: 12, efficiency: 76 },
      { name: 'Equipo Charlie', resolved: 52, pending: 6, efficiency: 90 },
      { name: 'Equipo Delta', resolved: 41, pending: 9, efficiency: 82 }
    ];

    return {
      totalIncidents: filteredIncidents.length,
      activeIncidents: activeIncidents.length,
      criticalIncidents: criticalIncidents.length,
      emergencyIncidents: emergencyIncidents.length,
      avgResponseTime,
      avgResolutionTime,
      emergencyTypes,
      hourlyData,
      teamPerformance,
      resolutionRate: Math.round((filteredIncidents.filter(i => i.estado === 'finalizado').length / filteredIncidents.length) * 100) || 0,
      criticalResponseTime: 4.2, // Tiempo promedio para incidentes críticos
      personnelAvailable: 12,
      personnelDeployed: 8
    };
  }, [incidents, selectedTimeframe]);

  const formatTimeframe = (timeframe: string) => {
    switch (timeframe) {
      case 'today': return 'Hoy';
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mes';
      default: return timeframe;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con selector de tiempo */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Target className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Centro de Comando SAR</h2>
              <p className="text-sm text-muted-foreground">
                Sistema de comando para operaciones de búsqueda y rescate
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              {(['today', 'week', 'month'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={selectedTimeframe === timeframe ? 'bg-red-600 text-white' : ''}
                >
                  {formatTimeframe(timeframe)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Emergencias Activas */}
        <Card className="p-6 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Emergencias Activas</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-red-600">{metrics.activeIncidents}</p>
                {metrics.criticalIncidents > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {metrics.criticalIncidents} Críticas
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <Siren className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>{metrics.criticalIncidents} requieren atención inmediata</span>
            </div>
          </div>
        </Card>

        {/* Tiempo de Respuesta */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tiempo Respuesta Promedio</p>
              <p className="text-3xl font-bold">{metrics.avgResponseTime}<span className="text-lg text-muted-foreground">min</span></p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Timer className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${metrics.avgResponseTime <= 10 ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-muted-foreground">
                {metrics.avgResponseTime <= 10 ? 'Excelente' : 'Regular'} (Meta: ≤10min)
              </span>
            </div>
            <Progress 
              value={(10 - metrics.avgResponseTime) * 10} 
              className="mt-2" 
            />
          </div>
        </Card>

        {/* Unidades Desplegadas */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unidades Desplegadas</p>
              <p className="text-3xl font-bold">{metrics.unitsDeployed}<span className="text-lg text-muted-foreground">/{metrics.unitsAvailable}</span></p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <Progress 
              value={(metrics.unitsDeployed / metrics.unitsAvailable) * 100} 
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {metrics.unitsAvailable - metrics.unitsDeployed} unidades disponibles
            </p>
          </div>
        </Card>

        {/* Tasa de Resolución */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasa de Resolución</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-green-600">{metrics.resolutionRate}%</p>
                {metrics.resolutionRate >= 80 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={metrics.resolutionRate} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Meta: ≥85%
            </p>
          </div>
        </Card>
      </div>

      {/* Timer del incidente seleccionado */}
      {selectedIncident && onUpdateIncident && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <IncidentTimer
              incident={selectedIncident}
              onUpdateIncident={onUpdateIncident}
            />
          </div>
          
          {/* Información del incidente seleccionado */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedIncident.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{selectedIncident.descripcion}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{selectedIncident.personalAsignado?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Personal</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">{selectedIncident.equiposAsignados?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Equipos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">{selectedIncident.archivosEvidencia?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Archivos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-600">{selectedIncident.timelineEventos?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Eventos</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Personas Desaparecidas Activas */}
      {incidents.some(inc => inc.personaDesaparecida && ['activo', 'inactivo'].includes(inc.estado)) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-bold text-red-700">Personas Desaparecidas Activas</h2>
            <Badge variant="destructive" className="animate-pulse">
              {incidents.filter(inc => inc.personaDesaparecida && ['activo', 'inactivo'].includes(inc.estado)).length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {incidents
              .filter(inc => inc.personaDesaparecida && ['activo', 'inactivo'].includes(inc.estado))
              .map(incident => (
                <MissingPersonCard
                  key={incident.id}
                  person={incident.personaDesaparecida!}
                  incidentId={incident.id}
                  incidentTitle={incident.titulo}
                  onViewDetails={() => {
                    // Aquí podrías abrir el modal de detalles o navegar
                    console.log('Ver detalles de:', incident.id);
                  }}
                />
              ))}
          </div>
        </div>
      )}

      {/* Panel de pestañas con análisis detallado */}
      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="operations">Operaciones</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="teams">Equipos</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución por tipo de emergencia */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tipos de Emergencias</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.emergencyTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {metrics.emergencyTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {metrics.emergencyTypes.map((type, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm">{type.name}: {type.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actividad por hora */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actividad por Hora</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="incidents" 
                      stroke={colors.critical} 
                      fill={colors.critical}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Métricas de rendimiento */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Métricas de Rendimiento</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tiempo Resp. Críticas</span>
                  <Badge variant="outline">{metrics.criticalResponseTime}min</Badge>
                </div>
                <Progress value={(5 - metrics.criticalResponseTime) * 20} />
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tiempo Resolución Prom.</span>
                  <Badge variant="outline">{metrics.avgResolutionTime}min</Badge>
                </div>
                <Progress value={(60 - metrics.avgResolutionTime) / 60 * 100} />
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Eficiencia Operacional</span>
                  <Badge variant="outline">87%</Badge>
                </div>
                <Progress value={87} />
              </div>
            </Card>

            {/* Comparativa semanal */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Tendencia de Emergencias</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { day: 'Lun', incidents: 12, resolved: 10 },
                    { day: 'Mar', incidents: 19, resolved: 16 },
                    { day: 'Mié', incidents: 8, resolved: 8 },
                    { day: 'Jue', incidents: 15, resolved: 13 },
                    { day: 'Vie', incidents: 22, resolved: 18 },
                    { day: 'Sáb', incidents: 25, resolved: 20 },
                    { day: 'Dom', incidents: 18, resolved: 15 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="incidents" stroke={colors.critical} name="Emergencias" />
                    <Line type="monotone" dataKey="resolved" stroke={colors.resolved} name="Resueltas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rendimiento de Equipos</h3>
            <div className="space-y-4">
              {metrics.teamPerformance.map((team, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <Users className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{team.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {team.resolved} resueltas, {team.pending} pendientes
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={team.efficiency >= 85 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}>
                      {team.efficiency}% eficiencia
                    </Badge>
                  </div>
                  <Progress value={team.efficiency} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Estado de vehículos */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold">Vehículos</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Autobombas</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">4/5 operativas</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ambulancias</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">3/3 operativas</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rescate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-sm">2/3 operativas</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Personal */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold">Personal</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">En servicio</span>
                  <Badge variant="outline" className="bg-green-50 text-green-800">
                    32/40
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Desplegados</span>
                  <Badge variant="outline">24</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Disponibles</span>
                  <Badge variant="outline" className="bg-green-50 text-green-800">
                    8
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Equipamiento */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold">Equipamiento</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Equipos respiración</span>
                  <Badge variant="outline" className="bg-green-50 text-green-800">
                    OK
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trajes protección</span>
                  <Badge variant="outline" className="bg-green-50 text-green-800">
                    OK
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Herramientas rescate</span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                    Revisión
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}