import { useState } from 'react';
import { Users, Upload, ChevronDown, ChevronRight, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Team } from '../types/personnel';

interface MapTeamsPanelProps {
  teams: Team[];
  onLoadGPX: (teamId: string, teamName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function MapTeamsPanel({ teams, onLoadGPX, isOpen, onToggle }: MapTeamsPanelProps) {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  // Generar color único para cada equipo
  const generateTeamColor = (teamId: string) => {
    const colors = [
      '#ef4444', // red
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ];
    const hash = teamId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (!isOpen) {
    return (
      <div className="absolute top-4 left-4 z-[1000]">
        <Button
          onClick={onToggle}
          className="bg-gray-950 border-2 border-gray-800 hover:bg-gray-900 text-white shadow-2xl"
          size="sm"
        >
          <Users className="h-4 w-4 mr-2" />
          Grupos Desplegados ({teams.length})
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 w-[320px] bg-gray-950 border-2 border-gray-800 rounded-lg shadow-2xl z-[1000] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 p-3 border-b border-red-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded backdrop-blur-sm">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Grupos Desplegados</h2>
              <p className="text-xs text-red-100/80">
                {teams.length} {teams.length === 1 ? 'grupo activo' : 'grupos activos'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            className="h-7 w-7 p-0 text-white hover:bg-white/10"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Lista de grupos */}
      <ScrollArea className="max-h-[500px]">
        <div className="p-3 space-y-2">
          {teams.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <Users className="h-12 w-12 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">
                No hay grupos desplegados
              </p>
              <p className="text-xs text-gray-600">
                Crea grupos desde la sección "Grupos"
              </p>
            </div>
          ) : (
            teams.map((team) => {
              const isExpanded = expandedTeams.has(team.id);
              const teamColor = generateTeamColor(team.id);

              return (
                <Card key={team.id} className="bg-gray-900 border-gray-800 overflow-hidden">
                  {/* Header del grupo */}
                  <div className="p-3 space-y-3">
                    <div className="flex items-start gap-2">
                      {/* Color indicator */}
                      <div
                        className="w-1 h-full absolute left-0 top-0 bottom-0"
                        style={{ backgroundColor: teamColor }}
                      />
                      
                      <button
                        onClick={() => toggleTeamExpansion(team.id)}
                        className="flex items-center gap-2 flex-1 text-left group"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate group-hover:text-red-400 transition-colors">
                            {team.nombre}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ 
                                borderColor: teamColor,
                                color: teamColor,
                                backgroundColor: `${teamColor}15`
                              }}
                            >
                              {team.miembros.length} {team.miembros.length === 1 ? 'miembro' : 'miembros'}
                            </Badge>
                          </div>
                        </div>
                      </button>

                      {/* Botón de cargar GPX */}
                      <Button
                        onClick={() => onLoadGPX(team.id, team.nombre)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                        title="Cargar traza GPX para este grupo"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        GPX
                      </Button>
                    </div>

                    {/* Detalles expandidos */}
                    {isExpanded && team.miembros.length > 0 && (
                      <div className="pl-6 space-y-1.5 border-t border-gray-800 pt-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                          Integrantes
                        </p>
                        {team.miembros.map((miembro) => (
                          <div
                            key={miembro.id}
                            className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 rounded px-2 py-1.5"
                          >
                            <User className="h-3 w-3 text-gray-500 shrink-0" />
                            <span className="truncate">
                              {miembro.nombre} {miembro.apellido}
                            </span>
                            {miembro.especialidad && (
                              <Badge
                                variant="outline"
                                className="text-xs ml-auto shrink-0"
                              >
                                {miembro.especialidad}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer con instrucciones */}
      <div className="border-t border-gray-800 bg-gray-900/50 p-3">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Upload className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
          <p>
            Haz clic en <span className="text-red-400 font-medium">GPX</span> para cargar trazados de rastrillaje de cada grupo
          </p>
        </div>
      </div>
    </div>
  );
}
