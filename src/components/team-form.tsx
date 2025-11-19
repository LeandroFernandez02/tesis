import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { 
  Team, 
  Personnel, 
  TeamStatus, 
  Shift,
  Vehicle,
  Equipment
} from "../types/personnel";
import { 
  Users
} from "lucide-react";

interface TeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (team: Omit<Team, 'id' | 'fechaCreacion'>) => Promise<void>;
  team?: Team;
  mode: 'create' | 'edit';
  availablePersonnel: Personnel[];
  availableVehicles?: Vehicle[];
  availableEquipment?: Equipment[];
  existingTeamsCount?: number;
}

// Estados simplificados para grupos de rastrillaje
const GROUP_STATUSES: TeamStatus[] = [
  'Disponible',
  'En Ruta',
  'En Escena'
];

// Turnos simplificados
const SHIFTS: Shift[] = [
  'Mañana',
  'Tarde',
  'Noche'
];

export function TeamForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  team, 
  mode, 
  availablePersonnel,
  availableVehicles = [],
  availableEquipment = [],
  existingTeamsCount = 0
}: TeamFormProps) {
  const [formData, setFormData] = useState<Omit<Team, 'id' | 'fechaCreacion'>>({
    nombre: '',
    tipo: 'Búsqueda Terrestre',
    lider: undefined,
    miembros: [],
    especialidad: [],
    estado: 'Disponible',
    turno: 'Mañana',
    capacidadMaxima: 999,
    equipamiento: [],
    ubicacionBase: '',
    observaciones: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (team && mode === 'edit') {
      setFormData({
        nombre: team.nombre,
        tipo: team.tipo,
        lider: team.lider,
        miembros: team.miembros,
        vehiculo: team.vehiculo,
        especialidad: team.especialidad,
        estado: team.estado,
        turno: team.turno,
        capacidadMaxima: 999,
        equipamiento: team.equipamiento,
        ubicacionBase: team.ubicacionBase,
        incidenteAsignado: team.incidenteAsignado,
        observaciones: team.observaciones
      });
    } else if (mode === 'create') {
      const nextGroupNumber = existingTeamsCount + 1;
      setFormData({
        nombre: `Grupo ${nextGroupNumber}`,
        tipo: 'Búsqueda Terrestre',
        lider: undefined,
        miembros: [],
        especialidad: [],
        estado: 'Disponible',
        turno: 'Mañana',
        capacidadMaxima: 999,
        equipamiento: [],
        ubicacionBase: '',
        observaciones: ''
      });
    }
  }, [team, mode, isOpen, existingTeamsCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('Debe ingresar un nombre para el grupo');
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting team:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header fijo */}
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 shrink-0" />
            <span className="truncate">{mode === 'edit' ? 'Editar Grupo' : 'Crear Nuevo Grupo'}</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === 'edit' 
              ? 'Modifica la información del grupo de rastrillaje'
              : 'Crea un nuevo grupo de rastrillaje. El personal se asignará mediante drag & drop'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Contenido del formulario */}
        <form id="team-form" onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 space-y-4">
          
          <div>
            <Label htmlFor="nombre">Nombre del Grupo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({...prev, nombre: e.target.value}))}
              placeholder="Ej: Grupo Alpha"
              required
              className="mt-1.5"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select 
              value={formData.estado} 
              onValueChange={(value: TeamStatus) => setFormData(prev => ({...prev, estado: value}))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GROUP_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="turno">Turno</Label>
            <Select 
              value={formData.turno} 
              onValueChange={(value: Shift) => setFormData(prev => ({...prev, turno: value}))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIFTS.map(shift => (
                  <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </form>

        {/* Footer fijo */}
        <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-muted/30 shrink-0 flex-row gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="team-form"
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? 'Guardando...' : (mode === 'edit' ? 'Actualizar' : 'Crear')} Grupo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
