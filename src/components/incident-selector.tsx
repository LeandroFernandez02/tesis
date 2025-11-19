import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Incident, IncidentStatus, IncidentPriority, IncidentCategory, IncidentStats } from "../types/incident";
import { IncidentAnalytics } from "./incident-analytics";
import { 
  Search, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Users, 
  FileText,
  Calendar,
  Filter,
  SortAsc,
  List,
  Timer,
  Edit,
  CalendarDays,
  Trash2
} from "lucide-react";
import { format, startOfDay, endOfDay, subDays, subWeeks, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner@2.0.3";

interface IncidentSelectorProps {
  incidents: Incident[];
  stats: IncidentStats;
  onSelectIncident: (incident: Incident) => void;
  onCreateNew: () => void;
  onEditIncident: (incident: Incident) => void;
}

const priorityColors = {
  baja: 'bg-green-100 text-green-800 border-green-200',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  alta: 'bg-orange-100 text-orange-800 border-orange-200',
  critica: 'bg-red-100 text-red-800 border-red-200'
};

const statusColors = {
  activo: 'bg-red-100 text-red-800 border-red-200',
  inactivo: 'bg-orange-100 text-orange-800 border-orange-200',
  finalizado: 'bg-green-100 text-green-800 border-green-200'
};

const statusLabels = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  finalizado: 'Finalizado'
};

const priorityLabels = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica'
};

const categoryLabels = {
  persona_desaparecida: 'Persona Desaparecida',
  busqueda_urbana: 'Búsqueda Urbana',
  busqueda_rural: 'Búsqueda Rural',
  busqueda_montana: 'Búsqueda Montaña',
  busqueda_acuatica: 'Búsqueda Acuática',
  rescate_tecnico: 'Rescate Técnico',
  accidente_aereo: 'Accidente Aéreo',
  desastre_natural: 'Desastre Natural',
  emergencia_medica: 'Emergencia Médica',
  caso_criminal: 'Caso Criminal'
};

type DateFilter = 'todos' | 'hoy' | 'ultima_semana' | 'ultimo_mes' | 'ultimos_3_meses';

export function IncidentSelector({ incidents, stats, onSelectIncident, onCreateNew, onEditIncident }: IncidentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'todos'>('todos');
  const [dateFilter, setDateFilter] = useState<DateFilter>('todos');
  const [sortBy, setSortBy] = useState<'fecha' | 'estado'>('fecha');
  const [hiddenIncidents, setHiddenIncidents] = useState<Set<string>>(new Set());

  // Función para ocultar incidente visualmente
  const handleHideIncident = (incidentId: string, incidentName: string) => {
    setHiddenIncidents(prev => new Set(prev).add(incidentId));
    toast.success(`Incidente "${incidentName}" ocultado del listado`);
  };

  // Función para filtrar por fecha
  const matchesDateFilter = (incident: Incident): boolean => {
    if (dateFilter === 'todos') return true;
    
    const incidentDate = new Date(incident.fechaCreacion);
    const now = new Date();
    
    switch (dateFilter) {
      case 'hoy':
        return incidentDate >= startOfDay(now) && incidentDate <= endOfDay(now);
      case 'ultima_semana':
        return incidentDate >= subDays(now, 7);
      case 'ultimo_mes':
        return incidentDate >= subMonths(now, 1);
      case 'ultimos_3_meses':
        return incidentDate >= subMonths(now, 3);
      default:
        return true;
    }
  };

  const filteredAndSortedIncidents = incidents
    .filter(incident => {
      // Filtrar incidentes ocultos
      if (hiddenIncidents.has(incident.id)) return false;
      
      const matchesSearch = searchTerm === "" || 
                           incident.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || incident.estado === statusFilter;
      const matchesDate = matchesDateFilter(incident);
      
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'fecha':
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        case 'estado':
          return a.estado.localeCompare(b.estado);
        default:
          return 0;
      }
    });

  const getIncidentStats = (incident: Incident) => {
    // Contar personal asignado directamente
    const personalAsignadoCount = incident.personalAsignado?.length || 0;
    
    // Contar personal registrado vía QR
    const personalQRCount = (incident.accesosQR || [])
      .flatMap(qr => qr.registeredPersonnel || [])
      .length;
    
    // Total de personal es la suma de ambos
    const personalCount = personalAsignadoCount + personalQRCount;
    
    const equiposCount = incident.equiposAsignados?.length || 0;
    
    return { personalCount, equiposCount };
  };

  // Calcular tiempo transcurrido para cada incidente
  const getIncidentDuration = (incident: Incident) => {
    if (!incident.tiempoInicio) return 'Sin iniciar';
    
    const inicio = new Date(incident.tiempoInicio);
    const ahora = new Date();
    const tiempoBase = incident.tiempoTranscurrido || 0;
    
    let tiempoTotal;
    if (incident.pausado) {
      tiempoTotal = tiempoBase;
    } else {
      tiempoTotal = tiempoBase + (ahora.getTime() - inicio.getTime());
    }
    
    const horas = Math.floor(tiempoTotal / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoTotal % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas === 0) return `${minutos}m`;
    return `${horas}h ${minutos}m`;
  };

  return (
    <div className="space-y-4">
      {/* Gráficos Analíticos */}
      <IncidentAnalytics incidents={incidents} />

      {/* Botón Nuevo Incidente */}
      <div className="flex justify-end">

      </div>

      {/* Lista de incidentes con filtros integrados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Listado de Incidentes
              </CardTitle>
              <CardDescription>
                Listado con todos los incidentes registrados
              </CardDescription>
            </div>
            <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Nuevo Incidente
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros integrados */}
          <div className="border-b pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label>Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label>Estado</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label>Fecha</label>
                <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las fechas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las fechas</SelectItem>
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="ultima_semana">Última semana</SelectItem>
                    <SelectItem value="ultimo_mes">Último mes</SelectItem>
                    <SelectItem value="ultimos_3_meses">Últimos 3 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>


            </div>
            
            {/* Contador de resultados */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <SortAsc className="h-4 w-4" />
                Mostrando {filteredAndSortedIncidents.length} de {incidents.length} incidentes
              </div>
              
              {/* Botón limpiar filtros */}
              {(searchTerm || statusFilter !== 'todos' || dateFilter !== 'todos') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter('todos');
                    setDateFilter('todos');
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
          {/* Lista de incidentes */}
          <div className="space-y-3">
            {filteredAndSortedIncidents.map((incident) => {
              const stats = getIncidentStats(incident);
              const duration = getIncidentDuration(incident);
              
              return (
                <div 
                  key={incident.id}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group"
                  onClick={() => onSelectIncident(incident)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Indicador de prioridad */}
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      incident.prioridad === 'critica' ? 'bg-red-500 animate-pulse' :
                      incident.prioridad === 'alta' ? 'bg-orange-500' :
                      incident.prioridad === 'media' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />

                    {/* Información principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{incident.titulo}</h3>
                        <Badge className={statusColors[incident.estado]} variant="outline">
                          {statusLabels[incident.estado]}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {incident.ubicacion && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {incident.ubicacion.direccion || `${incident.ubicacion.lat}, ${incident.ubicacion.lng}`}
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(incident.fechaCreacion), "dd/MM/yyyy HH:mm", { locale: es })}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {duration}
                        </span>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{stats.personalCount}</div>
                        <div className="text-xs text-muted-foreground">Personal</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-medium text-purple-600">{stats.equiposCount}</div>
                        <div className="text-xs text-muted-foreground">Equipos</div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditIncident(incident);
                              }}
                              className={`h-8 w-8 p-0 ${
                                incident.prioridad === 'critica' 
                                  ? 'border-red-500/50 hover:border-red-500 hover:bg-red-50' 
                                  : ''
                              }`}
                            >
                              <Edit className={`h-4 w-4 ${
                                incident.prioridad === 'critica' ? 'text-red-600' : ''
                              }`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar incidente</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHideIncident(incident.id, incident.nombreIncidente);
                              }}
                              className="h-8 w-8 p-0 border-destructive/50 hover:border-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ocultar del listado</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(incident);
                        }}
                      >
                        Gestionar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estado vacío */}
      {filteredAndSortedIncidents.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3>No se encontraron incidentes</h3>
              <p className="text-muted-foreground">
                No hay incidentes que coincidan con los filtros seleccionados.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter('todos');
                  setDateFilter('todos');
                }}
              >
                Limpiar filtros
              </Button>
              <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Crear primer incidente
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}