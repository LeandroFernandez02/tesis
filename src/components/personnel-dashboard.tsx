import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Clock, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  Truck,
  Activity
} from "lucide-react";
import { Personnel, Team, PersonnelStatus, PersonnelRank, TeamStatus } from "../types/personnel";

interface PersonnelDashboardProps {
  personnel: Personnel[];
  teams: Team[];
  availablePersonnel?: Personnel[]; // Personal disponible para asignar
  availableTeams?: Team[]; // Equipos disponibles para asignar
  onCreatePersonnel: () => void;
  onCreateTeam: () => void;
  onEditPersonnel: (person: Personnel) => void;
  onEditTeam: (team: Team) => void;
  onAssignPersonnel?: (personnelIds: string[]) => void; // Asignar personal al incidente
  onRemovePersonnel?: (personnelId: string) => void; // Remover personal del incidente
  incidentMode?: boolean; // Si está en modo de incidente específico
}

export function PersonnelDashboard({ 
  personnel, 
  teams, 
  availablePersonnel = [],
  availableTeams = [],
  onCreatePersonnel, 
  onCreateTeam, 
  onEditPersonnel, 
  onEditTeam,
  onAssignPersonnel,
  onRemovePersonnel,
  incidentMode = false
}: PersonnelDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Estadísticas del personal
  const totalPersonnel = personnel.length;
  const activePersonnel = personnel.filter(p => p.estado === 'Activo' || p.estado === 'En Servicio').length;
  const availablePersonnelCount = personnel.filter(p => p.disponible).length;
  const onDutyPersonnel = personnel.filter(p => p.estado === 'En Servicio').length;

  // Estadísticas de equipos
  const totalTeams = teams.length;
  const availableTeamsCount = teams.filter(t => t.estado === 'Disponible').length;
  const activeTeams = teams.filter(t => t.estado === 'En Escena' || t.estado === 'En Ruta').length;

  const getStatusColor = (status: PersonnelStatus | TeamStatus) => {
    const colors = {
      'Activo': 'bg-green-100 text-green-800 border-green-200',
      'En Servicio': 'bg-blue-100 text-blue-800 border-blue-200',
      'Fuera de Servicio': 'bg-gray-100 text-gray-800 border-gray-200',
      'De Licencia': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Capacitación': 'bg-purple-100 text-purple-800 border-purple-200',
      'Suspendido': 'bg-red-100 text-red-800 border-red-200',
      'Disponible': 'bg-green-100 text-green-800 border-green-200',
      'En Ruta': 'bg-orange-100 text-orange-800 border-orange-200',
      'En Escena': 'bg-red-100 text-red-800 border-red-200',
      'Regresando': 'bg-blue-100 text-blue-800 border-blue-200',
      'Mantenimiento': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRankIcon = (rank: PersonnelRank) => {
    if (rank === 'Comandante') return <Star className="h-4 w-4 text-yellow-600" />;
    if (rank === 'Capitán') return <Shield className="h-4 w-4 text-blue-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {incidentMode ? 'Personal Asignado al Incidente' : 'Gestión de Personal y Equipos'}
          </h1>
          <p className="text-muted-foreground">
            {incidentMode 
              ? 'Personal y equipos asignados específicamente a este incidente SAR'
              : 'Administración integral del personal de bomberos y formación de equipos'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {incidentMode && onAssignPersonnel && availablePersonnel.length > 0 && (
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Asignar Personal
            </Button>
          )}
          <Button variant="outline" onClick={onCreateTeam}>
            <Users className="h-4 w-4 mr-2" />
            {incidentMode ? 'Crear Equipo Específico' : 'Nuevo Equipo'}
          </Button>
          <Button onClick={onCreatePersonnel} className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Personal
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personal</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPersonnel}</div>
            <p className="text-xs text-muted-foreground">
              {activePersonnel} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Servicio</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onDutyPersonnel}</div>
            <p className="text-xs text-muted-foreground">
              {availablePersonnelCount} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipos Activos</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeTeams}</div>
            <p className="text-xs text-muted-foreground">
              de {totalTeams} equipos totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidad</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((availablePersonnelCount / totalPersonnel) * 100)}%</div>
            <Progress value={(availablePersonnelCount / totalPersonnel) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal con pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="personnel">Personal</TabsTrigger>
          <TabsTrigger value="teams">Equipos</TabsTrigger>
          <TabsTrigger value="schedules">Turnos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal por turno */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Personal por Turno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Mañana', 'Tarde', 'Noche', '24 Horas'].map((turno) => {
                    const count = personnel.filter(p => p.turno === turno).length;
                    const available = personnel.filter(p => p.turno === turno && p.disponible).length;
                    return (
                      <div key={turno} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{turno}</div>
                          <div className="text-sm text-muted-foreground">
                            {available} de {count} disponibles
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={count > 0 ? (available / count) * 100 : 0} 
                            className="w-20" 
                          />
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Equipos en operación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Estado de Equipos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teams.slice(0, 4).map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={team.lider.foto} />
                          <AvatarFallback>
                            {team.lider.nombre.charAt(0)}{team.lider.apellido.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{team.nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {team.miembros.length} miembros
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(team.estado)}>
                        {team.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas y notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Alertas del Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-800">Certificaciones Próximas a Vencer</div>
                    <div className="text-sm text-yellow-600">3 bomberos tienen certificaciones que vencen en los próximos 30 días</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-800">Cambio de Turno</div>
                    <div className="text-sm text-blue-600">El turno nocturno inicia en 2 horas</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="space-y-6">
          <PersonnelList personnel={personnel} onEdit={onEditPersonnel} />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <TeamsList teams={teams} onEdit={onEditTeam} />
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <ScheduleView personnel={personnel} teams={teams} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente para la lista de personal
function PersonnelList({ personnel, onEdit }: { personnel: Personnel[], onEdit: (person: Personnel) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3>Personal de Bomberos ({personnel.length})</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personnel.map((person) => (
          <Card key={person.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onEdit(person)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.foto} />
                  <AvatarFallback>
                    {person.nombre.charAt(0)}{person.apellido.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">
                      {person.nombre} {person.apellido}
                    </h4>
                    {getRankIcon(person.rango)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {person.rango} • #{person.numeroPlaca}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={`text-xs ${getStatusColor(person.estado)}`}>
                      {person.estado}
                    </Badge>
                    {person.disponible && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        Disponible
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {person.turno}
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {person.especialidad.length} esp.
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Componente para la lista de equipos
function TeamsList({ teams, onEdit }: { teams: Team[], onEdit: (team: Team) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3>Equipos Operativos ({teams.length})</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onEdit(team)}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{team.nombre}</h4>
                    <p className="text-sm text-muted-foreground">{team.tipo}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(team.estado)}>
                    {team.estado}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={team.lider.foto} />
                    <AvatarFallback>
                      {team.lider.nombre.charAt(0)}{team.lider.apellido.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {team.lider.nombre} {team.lider.apellido}
                    </div>
                    <div className="text-xs text-muted-foreground">Líder de Equipo</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {team.miembros.length}/{team.capacidadMaxima}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {team.turno}
                    </div>
                    {team.vehiculo && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3 text-muted-foreground" />
                        {team.vehiculo.numero}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{team.ubicacionBase}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Componente para la vista de horarios
function ScheduleView({ personnel, teams }: { personnel: Personnel[], teams: Team[] }) {
  return (
    <div className="space-y-4">
      <h3>Programación de Turnos</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['Mañana', 'Tarde', 'Noche'].map((turno) => (
          <Card key={turno}>
            <CardHeader>
              <CardTitle className="text-lg">{turno}</CardTitle>
              <CardDescription>
                {personnel.filter(p => p.turno === turno).length} bomberos asignados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personnel
                  .filter(p => p.turno === turno)
                  .slice(0, 6)
                  .map((person) => (
                    <div key={person.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={person.foto} />
                        <AvatarFallback className="text-xs">
                          {person.nombre.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">
                        {person.nombre} {person.apellido}
                      </span>
                      <Badge 
                        variant={person.disponible ? "default" : "secondary"} 
                        className="text-xs ml-auto"
                      >
                        {person.disponible ? 'Disp.' : 'N/D'}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}