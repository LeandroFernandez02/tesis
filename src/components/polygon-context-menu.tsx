import { useState, useEffect } from 'react';
import { Target, MapPin, Info, X } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Team } from '../types/personnel';

interface PolygonContextMenuProps {
  x: number;
  y: number;
  polygonId: string;
  polygonName?: string;
  teams: Team[];
  currentAssignedTeamId?: string;
  onAssignTeam: (polygonId: string, teamId: string) => void;
  onUnassignTeam: (polygonId: string) => void;
  onClose: () => void;
}

export function PolygonContextMenu({
  x,
  y,
  polygonId,
  polygonName,
  teams,
  currentAssignedTeamId,
  onAssignTeam,
  onUnassignTeam,
  onClose,
}: PolygonContextMenuProps) {
  const [showTeamList, setShowTeamList] = useState(false);

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-polygon-menu]')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleAssignTeam = (teamId: string) => {
    onAssignTeam(polygonId, teamId);
    onClose();
  };

  const handleUnassign = () => {
    onUnassignTeam(polygonId);
    onClose();
  };

  // Calcular posición para que no se salga de la pantalla
  const menuWidth = showTeamList ? 320 : 240;
  const menuHeight = showTeamList ? 400 : 160;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 20);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 20);

  return (
    <div
      data-polygon-menu
      className="fixed bg-gray-950 border-2 border-red-600 rounded-lg shadow-2xl z-[10001] overflow-hidden"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        width: `${menuWidth}px`,
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 p-3 border-b border-red-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-white" />
          <h3 className="text-white text-sm font-semibold">
            {polygonName || 'Polígono'}
          </h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 p-0 text-white hover:bg-white/10"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {!showTeamList ? (
        // Menú principal
        <div className="p-2">
          {currentAssignedTeamId && (
            <div className="mb-2 p-2 bg-green-950/30 border border-green-700 rounded">
              <p className="text-xs text-green-400 mb-1">Grupo asignado:</p>
              <p className="text-sm text-white font-medium">
                {teams.find(t => t.id === currentAssignedTeamId)?.nombre || 'Desconocido'}
              </p>
            </div>
          )}

          <Button
            onClick={() => setShowTeamList(true)}
            className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700 text-white mb-2"
          >
            <Target className="h-4 w-4" />
            {currentAssignedTeamId ? 'Cambiar Grupo' : 'Asignar Grupo'}
          </Button>

          {currentAssignedTeamId && (
            <Button
              onClick={handleUnassign}
              variant="outline"
              className="w-full justify-start gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <X className="h-4 w-4" />
              Quitar Asignación
            </Button>
          )}

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800 mt-2"
          >
            <Info className="h-4 w-4" />
            Ver Detalles
          </Button>
        </div>
      ) : (
        // Lista de grupos
        <div className="flex flex-col h-[360px]">
          <div className="p-3 border-b border-gray-800">
            <Button
              onClick={() => setShowTeamList(false)}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
            >
              ← Volver
            </Button>
          </div>

          <ScrollArea className="flex-1 p-2">
            {teams.length > 0 ? (
              <div className="space-y-2">
                {teams.map((team) => {
                  const isAssigned = team.id === currentAssignedTeamId;
                  const totalMembers = (team.lider ? 1 : 0) + team.miembros.length;

                  return (
                    <button
                      key={team.id}
                      onClick={() => handleAssignTeam(team.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isAssigned
                          ? 'border-green-500 bg-green-950/30'
                          : 'border-gray-800 hover:border-red-600 bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-1">
                          <Target className="h-3 w-3 text-red-500" />
                          {team.nombre}
                        </h4>
                        {isAssigned && (
                          <Badge className="bg-green-600 text-white text-xs py-0 h-5">
                            Asignado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={team.estado === 'Disponible' ? 'outline' : 'secondary'}
                          className="text-xs"
                        >
                          {team.estado}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {totalMembers} {totalMembers === 1 ? 'agente' : 'agentes'}
                        </Badge>
                      </div>

                      {team.lider && (
                        <p className="text-xs text-gray-400 mt-2">
                          Líder: {team.lider.nombre} {team.lider.apellido}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  No hay grupos disponibles
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
