import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit, 
  Crown, 
  Search,
  AlertCircle,
  Plus,
  GripVertical,
  Target,
  Upload
} from "lucide-react";
import { Personnel, Team } from "../types/personnel";
import { TeamForm } from "./team-form";
import { toast } from "sonner@2.0.3";

interface GroupManagerProps {
  personnel: Personnel[];
  teams: Team[];
  onCreateTeam: (teamData: Omit<Team, 'id' | 'fechaCreacion'>) => Promise<void>;
  onUpdateTeam: (teamData: Omit<Team, 'id' | 'fechaCreacion'>) => Promise<void>;
  onUpdateTeamById?: (teamId: string, updates: Partial<Team>) => Promise<void>;
  onDeleteTeam?: (teamId: string) => Promise<void>;
  onLoadGPX?: (teamId: string) => void;
  incidentId?: string;
}

const DRAG_TYPES = {
  PERSONNEL: 'personnel',
  LEADER: 'leader',
};

// ============= COMPONENTE: Tarjeta de Personal Arrastrable =============
interface DraggablePersonnelProps {
  person: Personnel;
  isLeader?: boolean;
  onRemove?: () => void;
}

function DraggablePersonnel({ person, isLeader, onRemove }: DraggablePersonnelProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAG_TYPES.PERSONNEL,
    item: { person, isLeader: isLeader || false },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const initials = `${person.nombre?.charAt(0) || ''}${person.apellido?.charAt(0) || ''}`.toUpperCase();

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 p-2 rounded-lg border cursor-move transition-all ${
        isDragging ? 'opacity-50 border-primary' : 'border-border hover:border-primary/50 hover:bg-accent/50'
      }`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      <Avatar className="h-8 w-8">
        <AvatarFallback className={isLeader ? 'bg-amber-100 text-amber-700' : ''}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate flex items-center gap-1">
          {person.nombre} {person.apellido}
          {isLeader && <Crown className="h-3 w-3 text-amber-600 shrink-0" />}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {person.jerarquia || person.especialidad?.[0] || 'Sin especialidad'}
        </p>
      </div>
      {onRemove && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive shrink-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// ============= COMPONENTE: Tarjeta de Grupo =============
interface GroupCardProps {
  team: Team;
  onDrop: (teamId: string, person: Personnel, dropZone: 'leader' | 'members') => void;
  onRemove: (teamId: string, personId: string, isLeader: boolean) => void;
  onEdit: (team: Team) => void;
  onDelete?: (teamId: string) => void;
  onLoadGPX?: (teamId: string) => void;
}

function GroupCard({ team, onDrop, onRemove, onEdit, onDelete, onLoadGPX }: GroupCardProps) {
  // Drop zone para LÍDER
  const [{ isOverLeader }, dropLeader] = useDrop(() => ({
    accept: DRAG_TYPES.PERSONNEL,
    drop: (item: { person: Personnel }) => {
      onDrop(team.id, item.person, 'leader');
    },
    collect: (monitor) => ({
      isOverLeader: monitor.isOver(),
    }),
  }));

  // Drop zone para MIEMBROS
  const [{ isOverMembers }, dropMembers] = useDrop(() => ({
    accept: DRAG_TYPES.PERSONNEL,
    drop: (item: { person: Personnel }) => {
      onDrop(team.id, item.person, 'members');
    },
    collect: (monitor) => ({
      isOverMembers: monitor.isOver(),
    }),
  }));

  // ⚠️ FILTRAR OBJETOS INVÁLIDOS - Solo renderizar personal con ID válido
  const validLeader = team.lider && team.lider.id ? team.lider : undefined;
  const validMembers = team.miembros.filter(m => m && m.id && typeof m.id === 'string' && m.id.length > 0);
  const totalMembers = (validLeader ? 1 : 0) + validMembers.length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{team.nombre}</span>
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            {onLoadGPX && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onLoadGPX(team.id)}
                className="h-7 w-7 p-0 hover:bg-blue-500/10 hover:text-blue-500"
                title="Cargar traza GPX"
              >
                <Upload className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(team)}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(team.id)}
                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant={team.estado === 'Disponible' ? 'outline' : 'secondary'} className="text-xs">
            {team.estado}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {totalMembers} {totalMembers === 1 ? 'agente' : 'agentes'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ZONA DE LÍDER */}
        <div
          ref={dropLeader}
          className={`rounded-lg transition-all ${
            isOverLeader ? 'ring-2 ring-amber-500 bg-amber-50' : ''
          }`}
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Líder (1 máximo)
          </p>
          {validLeader ? (
            <DraggablePersonnel
              person={validLeader}
              isLeader={true}
              onRemove={() => onRemove(team.id, validLeader.id, true)}
            />
          ) : (
            <div className={`text-center py-4 border-2 border-dashed rounded-lg ${
              isOverLeader ? 'border-amber-500 bg-amber-50' : 'border-muted-foreground/20'
            }`}>
              <Crown className="h-5 w-5 text-muted-foreground/40 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Arrastra un líder aquí</p>
            </div>
          )}
        </div>

        <Separator />

        {/* ZONA DE MIEMBROS */}
        <div
          ref={dropMembers}
          className={`rounded-lg transition-all ${
            isOverMembers ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Miembros ({validMembers.length})
          </p>
          {validMembers.length > 0 ? (
            <ScrollArea className="max-h-48">
              <div className="space-y-2 pr-3">
                {validMembers.map((member) => (
                  <DraggablePersonnel
                    key={member.id}
                    person={member}
                    onRemove={() => onRemove(team.id, member.id, false)}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className={`text-center py-6 border-2 border-dashed rounded-lg ${
              isOverMembers ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
            }`}>
              <Users className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Arrastra personal aquí</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============= COMPONENTE PRINCIPAL =============
export function GroupManager({
  personnel,
  teams,
  onCreateTeam,
  onUpdateTeam,
  onUpdateTeamById,
  onDeleteTeam,
  onLoadGPX,
}: GroupManagerProps) {
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener personal sin asignar
  const getUnassignedPersonnel = () => {
    const assignedIds = new Set<string>();
    teams.forEach(team => {
      if (team.lider?.id) assignedIds.add(team.lider.id);
      team.miembros.forEach(m => assignedIds.add(m.id));
    });
    return personnel.filter(p => !assignedIds.has(p.id) && p.estado === 'Activo');
  };

  const unassignedPersonnel = getUnassignedPersonnel();

  const filteredUnassigned = unassignedPersonnel.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.jerarquia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============= LÓGICA PRINCIPAL: MANEJAR DROP =============
  const handleDrop = async (teamId: string, person: Personnel, dropZone: 'leader' | 'members') => {
    console.log('🎯 DROP: Persona ID:', person.id, 'Nombre:', person.nombre, 'Zona:', dropZone, 'Equipo:', teamId);
    
    if (!onUpdateTeamById) return;

    try {
      // PASO 1: Remover de OTROS equipos PRIMERO usando callbacks
      const otherTeams = teams.filter(t => t.id !== teamId);
      for (const t of otherTeams) {
        const wasLeader = t.lider?.id === person.id;
        const wasMember = t.miembros.some(m => m.id === person.id);

        if (wasLeader || wasMember) {
          console.log('🗑️ Removiendo de equipo:', t.nombre);
          await onUpdateTeamById(t.id, (currentTeam) => {
            const updates: Partial<Team> = {};
            if (currentTeam.lider?.id === person.id) {
              updates.lider = undefined;
            }
            if (currentTeam.miembros.some(m => m.id === person.id)) {
              updates.miembros = currentTeam.miembros.filter(m => m.id !== person.id);
            }
            return updates;
          });
        }
      }

      // PASO 2: Actualizar equipo DESTINO usando callback que recibe estado actual
      await onUpdateTeamById(teamId, (currentTeam) => {
        console.log('📋 Estado ACTUAL (desde callback):', {
          lider: currentTeam.lider ? `${currentTeam.lider.nombre} (${currentTeam.lider.id})` : 'ninguno',
          miembros: currentTeam.miembros.map(m => `${m.nombre} (${m.id})`)
        });

        const updates: Partial<Team> = {};

        if (dropZone === 'leader') {
          // ========== AGREGAR COMO LÍDER ==========
          if (currentTeam.lider?.id === person.id) {
            console.log('⚠️ Ya es el líder');
            toast.info(`${person.nombre} ${person.apellido} ya es el líder`);
            return {}; // Sin cambios
          }

          let newMiembros = [...currentTeam.miembros];

          // Si hay un líder previo, agregarlo a miembros
          if (currentTeam.lider) {
            if (!newMiembros.some(m => m.id === currentTeam.lider!.id)) {
              console.log('   Moviendo líder anterior a miembros');
              newMiembros.push(currentTeam.lider);
            }
          }

          // Remover la persona de miembros si estaba ahí
          newMiembros = newMiembros.filter(m => m.id !== person.id);

          updates.lider = person;
          updates.miembros = newMiembros;

        } else {
          // ========== AGREGAR COMO MIEMBRO ==========
          if (currentTeam.miembros.some(m => m.id === person.id)) {
            console.log('⚠️ Ya es miembro');
            toast.info(`${person.nombre} ${person.apellido} ya es miembro`);
            return {}; // Sin cambios
          }

          let newMiembros = [...currentTeam.miembros];
          
          // Si la persona era el líder, removerlo como líder
          if (currentTeam.lider?.id === person.id) {
            console.log('   Removiendo como líder');
            updates.lider = undefined;
          }

          // Agregar la persona a miembros
          newMiembros.push(person);
          updates.miembros = newMiembros;
        }

        console.log('✨ Actualizaciones calculadas:', {
          lider: updates.lider ? `${updates.lider.nombre} (${updates.lider.id})` : updates.lider === undefined ? 'undefined' : 'sin cambios',
          miembros: updates.miembros?.map(m => `${m.nombre} (${m.id})`) || 'sin cambios'
        });

        return updates;
      });

      console.log('✅ Drop completado');
      toast.success(`${person.nombre} ${person.apellido} asignado correctamente`);
    } catch (error) {
      console.error('❌ Error al asignar personal:', error);
      toast.error('Error al asignar personal al grupo');
    }
  };

  // ============= MANEJAR REMOCIÓN =============
  const handleRemove = async (teamId: string, personId: string, isLeader: boolean) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    try {
      const updates: Partial<Team> = {};

      if (isLeader) {
        updates.lider = undefined;
      } else {
        updates.miembros = team.miembros.filter(m => m.id !== personId);
      }

      if (onUpdateTeamById) {
        await onUpdateTeamById(teamId, updates);
      }

      toast.success('Personal removido del grupo');
    } catch (error) {
      console.error('Error al remover personal:', error);
      toast.error('Error al remover personal');
    }
  };

  // ============= MANEJAR ELIMINACIÓN DE GRUPO =============
  const handleDeleteTeam = async (teamId: string) => {
    if (!onDeleteTeam) return;
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    if (!confirm(`¿Eliminar el grupo "${team.nombre}"?`)) return;

    try {
      await onDeleteTeam(teamId);
      toast.success('Grupo eliminado');
    } catch (error) {
      toast.error('Error al eliminar grupo');
    }
  };

  // Drop zone para personal sin asignar
  const [{ isOverUnassigned }, dropUnassigned] = useDrop(() => ({
    accept: DRAG_TYPES.PERSONNEL,
    drop: (item: { person: Personnel }) => {
      handleRemove(
        teams.find(t => t.lider?.id === item.person.id || t.miembros.some(m => m.id === item.person.id))?.id || '',
        item.person.id,
        teams.find(t => t.lider?.id === item.person.id) !== undefined
      );
    },
    collect: (monitor) => ({
      isOverUnassigned: monitor.isOver(),
    }),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Gestión de Grupos de Rastrillaje
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Organiza el personal en grupos operativos con líder asignado
          </p>
        </div>
        <Button onClick={() => setIsTeamFormOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Crear Grupo
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Grupos</p>
                <p className="text-2xl font-semibold">{teams.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Asignados</p>
                <p className="text-2xl font-semibold">{personnel.length - unassignedPersonnel.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sin Asignar</p>
                <p className="text-2xl font-semibold">{unassignedPersonnel.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-semibold">
                  {teams.filter(t => t.estado !== 'Fuera de Servicio').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Personal sin asignar */}
        <div className="xl:col-span-2">
          <div
            ref={dropUnassigned}
            className={`rounded-lg transition-all ${
              isOverUnassigned ? 'ring-2 ring-amber-500' : ''
            }`}
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-amber-600" />
                  Personal Sin Asignar
                </CardTitle>
                <CardDescription>
                  {unassignedPersonnel.length} de {personnel.length} agentes disponibles
                </CardDescription>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar personal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-[600px]">
                  {filteredUnassigned.length > 0 ? (
                    <div className="space-y-2 pr-3">
                      {filteredUnassigned.map((person) => (
                        <DraggablePersonnel key={person.id} person={person} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'No se encontró personal' : 'Todo el personal está asignado'}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Grupos */}
        <div className="xl:col-span-3">
          <ScrollArea className="h-[660px]">
            {teams.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pr-3">
                {teams.map((team) => (
                  <GroupCard
                    key={team.id}
                    team={team}
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                    onEdit={setEditingTeam}
                    onDelete={onDeleteTeam ? handleDeleteTeam : undefined}
                    onLoadGPX={onLoadGPX}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12">
                  <div className="text-center">
                    <Target className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No hay grupos creados</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Crea tu primer grupo de rastrillaje
                    </p>
                    <Button onClick={() => setIsTeamFormOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Crear Primer Grupo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Formulario de grupo */}
      <TeamForm
        isOpen={isTeamFormOpen}
        onClose={() => {
          setIsTeamFormOpen(false);
          setEditingTeam(undefined);
        }}
        onSubmit={editingTeam ? onUpdateTeam : onCreateTeam}
        team={editingTeam}
        mode={editingTeam ? 'edit' : 'create'}
        availablePersonnel={personnel.filter(p => p.disponible && p.estado === 'Activo')}
        existingTeamsCount={teams.length}
      />
    </div>
  );
}
