import { useState } from 'react';
import {
  Layers,
  MapPin,
  Square,
  Navigation,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { GPXTrace } from '../types/search-zones';
import { Team } from '../types/personnel';

interface LayerVisibility {
  polygons: boolean;
  pois: boolean;
  puntoZero: boolean;
}

interface MapLayerManagementProps {
  isOpen: boolean;
  onClose: () => void;
  layerVisibility: LayerVisibility;
  onLayerVisibilityChange: (layer: keyof LayerVisibility, visible: boolean) => void;
  gpxTraces: GPXTrace[];
  teams: Team[];
  onGPXTraceVisibilityChange: (traceId: string, visible: boolean) => void;
  onGPXTraceDelete: (traceId: string) => void;
}

export function MapLayerManagement({
  isOpen,
  onClose,
  layerVisibility,
  onLayerVisibilityChange,
  gpxTraces,
  teams,
  onGPXTraceVisibilityChange,
  onGPXTraceDelete,
}: MapLayerManagementProps) {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  // Agrupar trazas GPX por equipo
  const tracesByTeam = gpxTraces.reduce((acc, trace) => {
    if (!acc[trace.teamId]) {
      acc[trace.teamId] = [];
    }
    acc[trace.teamId].push(trace);
    return acc;
  }, {} as Record<string, GPXTrace[]>);

  return (
    <div className="absolute top-4 left-4 w-[340px] bg-gray-950 border-2 border-gray-800 rounded-lg shadow-2xl z-[1000] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 p-3 border-b border-red-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded backdrop-blur-sm">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-white font-semibold">Gestión de Capas</h2>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 p-0 text-white hover:bg-white/10"
          >
            ✕
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-[600px]">
        <div className="p-3 space-y-3">
          {/* Capas Básicas */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Capas del Mapa
            </h3>

            {/* Polígonos */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
              <Square className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-sm flex-1 text-white">Polígonos</span>
              <Switch
                checked={layerVisibility.polygons}
                onCheckedChange={(checked) =>
                  onLayerVisibilityChange('polygons', checked)
                }
              />
            </div>

            {/* POIs (Puntos de Interés) */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
              <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-sm flex-1 text-white">Puntos de Interés (POIs)</span>
              <Switch
                checked={layerVisibility.pois}
                onCheckedChange={(checked) =>
                  onLayerVisibilityChange('pois', checked)
                }
              />
            </div>

            {/* Punto Cero */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
              <Navigation className="h-4 w-4 text-yellow-500 shrink-0" />
              <span className="text-sm flex-1 text-white">Punto Cero</span>
              <Switch
                checked={layerVisibility.puntoZero}
                onCheckedChange={(checked) =>
                  onLayerVisibilityChange('puntoZero', checked)
                }
              />
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Trazados GPX */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Trazados GPX
              </h3>
              <Badge variant="outline" className="text-xs">
                {gpxTraces.length}
              </Badge>
            </div>

            {gpxTraces.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                <Layers className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No hay trazados GPX cargados
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Carga trazados desde los grupos desplegados
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {teams
                  .filter((team) => tracesByTeam[team.id] && tracesByTeam[team.id].length > 0)
                  .map((team) => {
                    const teamTraces = tracesByTeam[team.id];
                    const isExpanded = expandedTeams.has(team.id);
                    const visibleCount = teamTraces.filter((t) => t.visible).length;

                    return (
                      <div key={team.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                        {/* Header del equipo */}
                        <button
                          onClick={() => toggleTeam(team.id)}
                          className="w-full p-3 flex items-center gap-2 hover:bg-gray-800 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                          )}
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: teamTraces[0]?.color || '#ef4444',
                            }}
                          />
                          <span className="text-sm font-medium text-white flex-1 text-left truncate">
                            {team.nombre}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {visibleCount}/{teamTraces.length}
                          </Badge>
                        </button>

                        {/* Lista de trazas del equipo */}
                        {isExpanded && (
                          <div className="border-t border-gray-800 bg-gray-950/50">
                            {teamTraces.map((trace) => (
                              <div
                                key={trace.id}
                                className="px-3 py-2 flex items-center gap-2 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 last:border-b-0"
                              >
                                <div
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: trace.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white truncate">
                                    {trace.label}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(trace.uploadedAt).toLocaleString('es-AR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      onGPXTraceVisibilityChange(trace.id, !trace.visible)
                                    }
                                    className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                                    title={trace.visible ? 'Ocultar' : 'Mostrar'}
                                  >
                                    {trace.visible ? (
                                      <Eye className="h-3.5 w-3.5" />
                                    ) : (
                                      <EyeOff className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `¿Eliminar el trazado "${trace.label}"?`
                                        )
                                      ) {
                                        onGPXTraceDelete(trace.id);
                                      }
                                    }}
                                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2.5 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center justify-center text-xs text-gray-500">
          Gestión de Capas GIS
        </div>
      </div>
    </div>
  );
}
