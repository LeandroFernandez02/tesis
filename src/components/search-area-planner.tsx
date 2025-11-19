import { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Map,
  Edit,
  Trash2,
  Users,
  MapPin,
  Target,
  Square,
  MousePointer,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { Team, Personnel } from '../types/personnel';

// Tipos para las zonas de búsqueda
interface SearchZone {
  id: string;
  name: string;
  description: string;
  polygon: { lat: number; lng: number }[];
  color: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'assigned' | 'active' | 'completed';
  assignedTeam?: Team;
  area: number; // en metros cuadrados
  estimatedTime: number; // en horas
  createdAt: Date;
  updatedAt: Date;
}

interface SearchAreaPlannerProps {
  teams: Team[];
  personnel: Personnel[];
  onZoneAssignment?: (zoneId: string, teamId: string | null) => void;
  onZoneUpdate?: (zone: SearchZone) => void;
}

// Componente para el elemento draggable del equipo
function DraggableTeam({ team, isAssigned }: { team: Team; isAssigned: boolean }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'team',
    item: { teamId: team.id, teamName: team.nombre },
    canDrag: !isAssigned,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`
        p-3 border rounded-lg cursor-move transition-all
        ${isDragging ? 'opacity-50 rotate-3 scale-95' : 'opacity-100'}
        ${isAssigned 
          ? 'bg-green-50 border-green-200 cursor-not-allowed' 
          : 'bg-background border-border hover:border-primary'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{team.nombre}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {team.miembros.length} miembros • {team.especialidad}
          </div>
        </div>
        {isAssigned && (
          <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
            Asignado
          </Badge>
        )}
      </div>
    </div>
  );
}

// Componente para zona de búsqueda con drop capability
function SearchZoneCard({ zone, teams, onAssignTeam, onEditZone, onDeleteZone }: {
  zone: SearchZone;
  teams: Team[];
  onAssignTeam: (zoneId: string, teamId: string | null) => void;
  onEditZone: (zone: SearchZone) => void;
  onDeleteZone: (zoneId: string) => void;
}) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'team',
    drop: (item: { teamId: string; teamName: string }) => {
      onAssignTeam(zone.id, item.teamId);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const getStatusIcon = () => {
    switch (zone.status) {
      case 'planned': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'assigned': return <User className="h-4 w-4 text-blue-600" />;
      case 'active': return <Target className="h-4 w-4 text-orange-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (zone.status) {
      case 'planned': return 'text-yellow-600';
      case 'assigned': return 'text-blue-600';
      case 'active': return 'text-orange-600';
      case 'completed': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = () => {
    switch (zone.priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      ref={drop}
      className={`
        p-4 border rounded-lg transition-all duration-200
        ${isOver && canDrop ? 'border-primary border-2 bg-primary/5' : 'border-border'}
        ${zone.assignedTeam ? 'bg-green-50 border-green-200' : 'bg-background'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Square className="h-4 w-4" style={{ color: zone.color }} />
            <h4 className="font-medium">{zone.name}</h4>
            <Badge variant="outline" className={getPriorityColor()}>
              {zone.priority.toUpperCase()}
            </Badge>
          </div>
          {zone.description && (
            <p className="text-sm text-muted-foreground">{zone.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditZone(zone)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteZone(zone.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Estado y estadísticas */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className={`flex items-center gap-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="capitalize">{zone.status}</span>
        </div>
        <div className="text-muted-foreground">
          {(zone.area / 10000).toFixed(1)} hectáreas
        </div>
        <div className="text-muted-foreground">
          ~{zone.estimatedTime}h estimadas
        </div>
      </div>

      {/* Equipo asignado o zona de drop */}
      {zone.assignedTeam ? (
        <div className="bg-green-100 border border-green-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">{zone.assignedTeam.nombre}</span>
              </div>
              <div className="text-sm text-green-600 mt-1">
                {zone.assignedTeam.miembros.length} miembros • {zone.assignedTeam.especialidad}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAssignTeam(zone.id, null)}
              className="text-green-600 hover:text-green-700"
            >
              Desasignar
            </Button>
          </div>
        </div>
      ) : (
        <div className={`
          border-2 border-dashed rounded-md p-4 text-center transition-all
          ${isOver && canDrop 
            ? 'border-primary bg-primary/10 text-primary' 
            : 'border-muted-foreground/30 text-muted-foreground'
          }
        `}>
          <Users className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {isOver && canDrop 
              ? 'Soltar equipo aquí' 
              : 'Arrastra un equipo aquí para asignar'
            }
          </p>
        </div>
      )}

      {/* Coordenadas del polígono */}
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          {zone.polygon.length} puntos del polígono
        </p>
      </div>
    </div>
  );
}

export function SearchAreaPlanner({ teams, personnel, onZoneAssignment, onZoneUpdate }: SearchAreaPlannerProps) {
  const [searchZones, setSearchZones] = useState<SearchZone[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<{ lat: number; lng: number }[]>([]);
  const [selectedTool, setSelectedTool] = useState<'pointer' | 'polygon'>('pointer');
  const [editingZone, setEditingZone] = useState<SearchZone | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newZoneData, setNewZoneData] = useState({
    name: '',
    description: '',
    priority: 'medium' as const,
    estimatedTime: 2
  });

  const mapRef = useRef<HTMLDivElement>(null);

  // Simular algunos polígonos de ejemplo
  useEffect(() => {
    const sampleZones: SearchZone[] = [
      {
        id: 'zone-1',
        name: 'Sector Norte - Bosque',
        description: 'Área boscosa con senderos principales. Terreno irregular.',
        polygon: [
          { lat: 40.7580, lng: -73.9855 },
          { lat: 40.7590, lng: -73.9855 },
          { lat: 40.7590, lng: -73.9845 },
          { lat: 40.7580, lng: -73.9845 }
        ],
        color: '#dc2626',
        priority: 'high',
        status: 'planned',
        area: 120000, // m²
        estimatedTime: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'zone-2',
        name: 'Sector Sur - Acantilado',
        description: 'Zona rocosa con riesgo de caídas. Requiere equipo especializado.',
        polygon: [
          { lat: 40.7570, lng: -73.9870 },
          { lat: 40.7575, lng: -73.9870 },
          { lat: 40.7575, lng: -73.9860 },
          { lat: 40.7570, lng: -73.9860 }
        ],
        color: '#f59e0b',
        priority: 'high',
        status: 'assigned',
        assignedTeam: teams[0],
        area: 80000,
        estimatedTime: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'zone-3',
        name: 'Sector Este - Campo Abierto',
        description: 'Terreno plano y abierto. Fácil acceso.',
        polygon: [
          { lat: 40.7565, lng: -73.9835 },
          { lat: 40.7575, lng: -73.9835 },
          { lat: 40.7575, lng: -73.9825 },
          { lat: 40.7565, lng: -73.9825 }
        ],
        color: '#059669',
        priority: 'medium',
        status: 'active',
        assignedTeam: teams[1],
        area: 150000,
        estimatedTime: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setSearchZones(sampleZones);
  }, [teams]);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || selectedTool !== 'polygon') return;

    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convertir coordenadas del clic a lat/lng (simulado)
    const lat = 40.7580 - ((y / rect.height) * 0.003);
    const lng = -73.9850 + ((x / rect.width) * 0.003);

    setCurrentPolygon(prev => [...prev, { lat, lng }]);
  };

  const startDrawing = () => {
    setIsDrawing(true);
    setSelectedTool('polygon');
    setCurrentPolygon([]);
  };

  const finishDrawing = () => {
    if (currentPolygon.length < 3) {
      alert('Un polígono debe tener al menos 3 puntos');
      return;
    }
    
    setIsDialogOpen(true);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentPolygon([]);
    setSelectedTool('pointer');
  };

  const saveNewZone = () => {
    if (!newZoneData.name.trim()) return;

    const newZone: SearchZone = {
      id: `zone-${Date.now()}`,
      name: newZoneData.name,
      description: newZoneData.description,
      polygon: currentPolygon,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      priority: newZoneData.priority,
      status: 'planned',
      area: calculatePolygonArea(currentPolygon),
      estimatedTime: newZoneData.estimatedTime,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSearchZones(prev => [...prev, newZone]);
    setIsDialogOpen(false);
    setIsDrawing(false);
    setCurrentPolygon([]);
    setSelectedTool('pointer');
    setNewZoneData({ name: '', description: '', priority: 'medium', estimatedTime: 2 });

    if (onZoneUpdate) {
      onZoneUpdate(newZone);
    }
  };

  const calculatePolygonArea = (polygon: { lat: number; lng: number }[]): number => {
    // Cálculo simplificado del área (en una implementación real usarías bibliotecas geoespaciales)
    return Math.random() * 200000 + 50000; // Simulado entre 5-25 hectáreas
  };

  const handleAssignTeam = (zoneId: string, teamId: string | null) => {
    setSearchZones(prev => prev.map(zone => {
      if (zone.id === zoneId) {
        const assignedTeam = teamId ? teams.find(t => t.id === teamId) : undefined;
        return {
          ...zone,
          assignedTeam,
          status: assignedTeam ? 'assigned' as const : 'planned' as const,
          updatedAt: new Date()
        };
      }
      return zone;
    }));

    if (onZoneAssignment) {
      onZoneAssignment(zoneId, teamId);
    }
  };

  const handleEditZone = (zone: SearchZone) => {
    setEditingZone(zone);
    setNewZoneData({
      name: zone.name,
      description: zone.description,
      priority: zone.priority,
      estimatedTime: zone.estimatedTime
    });
    setIsDialogOpen(true);
  };

  const handleDeleteZone = (zoneId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta zona de búsqueda?')) {
      setSearchZones(prev => prev.filter(zone => zone.id !== zoneId));
    }
  };

  const availableTeams = teams.filter(team => 
    !searchZones.some(zone => zone.assignedTeam?.id === team.id)
  );

  const assignedTeams = teams.filter(team => 
    searchZones.some(zone => zone.assignedTeam?.id === team.id)
  );

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Map className="h-6 w-6 text-red-600" />
              Planificador de Zonas de Búsqueda
            </h1>
            <p className="text-muted-foreground">
              Define sectores de rastreo y asigna equipos mediante drag & drop
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedTool === 'pointer' ? 'default' : 'outline'}
              onClick={() => setSelectedTool('pointer')}
              size="sm"
            >
              <MousePointer className="h-4 w-4 mr-2" />
              Seleccionar
            </Button>
            <Button
              variant={selectedTool === 'polygon' ? 'default' : 'outline'}
              onClick={startDrawing}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="h-4 w-4 mr-2" />
              Dibujar Zona
            </Button>
          </div>
        </div>

        {/* Estado del dibujo */}
        {isDrawing && (
          <Alert>
            <Square className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  Modo dibujo activo: Haz clic en el mapa para agregar puntos al polígono ({currentPolygon.length} puntos)
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={finishDrawing} disabled={currentPolygon.length < 3}>
                    <Save className="h-4 w-4 mr-2" />
                    Terminar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={cancelDrawing}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Mapa de Sectores SAR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapRef}
                  className={`
                    h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 
                    flex items-center justify-center relative overflow-hidden
                    ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}
                  `}
                  onClick={handleMapClick}
                >
                  {/* Simulación del mapa */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200">
                    {/* Polígonos existentes */}
                    {searchZones.map(zone => (
                      <div
                        key={zone.id}
                        className="absolute border-2 bg-opacity-20 rounded"
                        style={{
                          borderColor: zone.color,
                          backgroundColor: zone.color,
                          left: `${20 + (searchZones.indexOf(zone) * 25)}%`,
                          top: `${15 + (searchZones.indexOf(zone) * 20)}%`,
                          width: '20%',
                          height: '15%'
                        }}
                      >
                        <div className="absolute -top-6 left-0 text-xs font-medium px-2 py-1 bg-white rounded shadow">
                          {zone.name}
                        </div>
                      </div>
                    ))}
                    
                    {/* Polígono en construcción */}
                    {currentPolygon.length > 0 && (
                      <div className="absolute inset-0">
                        {currentPolygon.map((point, index) => (
                          <div
                            key={index}
                            className="absolute w-2 h-2 bg-red-600 rounded-full"
                            style={{
                              left: `${50 + index * 10}%`,
                              top: `${30 + index * 5}%`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative z-10 text-center">
                    <Map className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-2">
                      {isDrawing 
                        ? 'Haz clic para agregar puntos al polígono'
                        : 'Mapa interactivo con zonas de búsqueda'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchZones.length} zonas definidas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de equipos */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Equipos Disponibles
                </CardTitle>
                <CardDescription>
                  Arrastra los equipos a las zonas para asignarlos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableTeams.length > 0 ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-600">
                      Disponibles ({availableTeams.length})
                    </Label>
                    {availableTeams.map(team => (
                      <DraggableTeam key={team.id} team={team} isAssigned={false} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Todos los equipos están asignados</p>
                  </div>
                )}

                {assignedTeams.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-blue-600">
                        Asignados ({assignedTeams.length})
                      </Label>
                      {assignedTeams.map(team => (
                        <DraggableTeam key={team.id} team={team} isAssigned={true} />
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de zonas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Zonas de Búsqueda ({searchZones.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchZones.length === 0 ? (
              <div className="text-center py-8">
                <Square className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 mb-4">No hay zonas de búsqueda definidas</p>
                <Button onClick={startDrawing}>
                  <Square className="h-4 w-4 mr-2" />
                  Crear primera zona
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchZones.map(zone => (
                  <SearchZoneCard
                    key={zone.id}
                    zone={zone}
                    teams={teams}
                    onAssignTeam={handleAssignTeam}
                    onEditZone={handleEditZone}
                    onDeleteZone={handleDeleteZone}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para crear/editar zona */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingZone ? 'Editar Zona de Búsqueda' : 'Nueva Zona de Búsqueda'}
              </DialogTitle>
              <DialogDescription>
                Define los detalles de la zona para organizar las operaciones SAR.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="zone-name">Nombre de la Zona *</Label>
                <Input
                  id="zone-name"
                  placeholder="ej: Sector Norte - Bosque"
                  value={newZoneData.name}
                  onChange={(e) => setNewZoneData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="zone-description">Descripción</Label>
                <Textarea
                  id="zone-description"
                  placeholder="Descripción del terreno, riesgos, accesos..."
                  value={newZoneData.description}
                  onChange={(e) => setNewZoneData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zone-priority">Prioridad</Label>
                  <select
                    id="zone-priority"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={newZoneData.priority}
                    onChange={(e) => setNewZoneData(prev => ({ 
                      ...prev, 
                      priority: e.target.value as 'high' | 'medium' | 'low' 
                    }))}
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="zone-time">Tiempo Estimado (horas)</Label>
                  <Input
                    id="zone-time"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newZoneData.estimatedTime}
                    onChange={(e) => setNewZoneData(prev => ({ 
                      ...prev, 
                      estimatedTime: parseFloat(e.target.value) || 2 
                    }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveNewZone} disabled={!newZoneData.name.trim()}>
                <Save className="h-4 w-4 mr-2" />
                {editingZone ? 'Actualizar' : 'Crear'} Zona
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}