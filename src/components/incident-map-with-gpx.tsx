/**
 * Ejemplo de integración de los componentes de asignación de polígonos y GPX
 * 
 * Este componente demuestra cómo usar:
 * - PolygonContextMenu (CU-20)
 * - GPXUploadModal (CU-21)
 * - MapLayerManagement (CU-22)
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Layers, MapPin } from 'lucide-react';
import { PolygonContextMenu } from './polygon-context-menu';
import { GPXUploadModal } from './gpx-upload-modal';
import { MapLayerManagement } from './map-layer-management';
import { Team } from '../types/personnel';
import { GPXTrace, SearchZone } from '../types/search-zones';
import { toast } from 'sonner@2.0.3';

interface IncidentMapWithGPXProps {
  teams: Team[];
  zones: SearchZone[];
  onAssignZoneToTeam: (zoneId: string, teamId: string) => void;
  onUnassignZone: (zoneId: string) => void;
  onUpdateZones: (zones: SearchZone[]) => void;
}

export function IncidentMapWithGPXExample({ 
  teams,
  zones,
  onAssignZoneToTeam,
  onUnassignZone,
  onUpdateZones,
}: IncidentMapWithGPXProps) {
  // ==================== ESTADOS ====================
  
  // Menú contextual de polígonos
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    polygonId: string;
    polygonName?: string;
    assignedTeamId?: string;
  } | null>(null);

  // Modal de carga GPX
  const [gpxModal, setGpxModal] = useState<{
    teamId: string;
    teamName: string;
  } | null>(null);

  // Panel de gestión de capas
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  // Visibilidad de capas
  const [layerVisibility, setLayerVisibility] = useState({
    polygons: true,
    pois: true,
    puntoZero: true,
  });

  // Trazas GPX cargadas
  const [gpxTraces, setGpxTraces] = useState<GPXTrace[]>([]);

  // ==================== HANDLERS ====================

  /**
   * CU-20: Manejo del clic derecho en polígonos
   */
  const handlePolygonRightClick = (e: React.MouseEvent, polygonId: string) => {
    e.preventDefault();
    
    const zone = zones.find(z => z.id === polygonId);
    if (!zone) return;

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      polygonId,
      polygonName: zone.name,
      assignedTeamId: zone.assignedTeamId,
    });
  };

  /**
   * CU-20: Asignar equipo a polígono
   */
  const handleAssignTeam = (polygonId: string, teamId: string) => {
    onAssignZoneToTeam(polygonId, teamId);
    
    const zone = zones.find(z => z.id === polygonId);
    const team = teams.find(t => t.id === teamId);
    
    if (zone && team) {
      toast.success(`Zona "${zone.name}" asignada a ${team.nombre}`);
    }
  };

  /**
   * CU-20: Quitar asignación de equipo
   */
  const handleUnassignTeam = (polygonId: string) => {
    onUnassignZone(polygonId);
    
    const zone = zones.find(z => z.id === polygonId);
    if (zone) {
      toast.success(`Asignación eliminada de "${zone.name}"`);
    }
  };

  /**
   * CU-21: Abrir modal de carga GPX desde un grupo
   */
  const handleLoadGPX = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setGpxModal({ teamId, teamName: team.nombre });
    }
  };

  /**
   * CU-21: Procesar y cargar archivo GPX
   */
  const handleGPXUpload = async (teamId: string, file: File, label: string) => {
    try {
      // Leer archivo
      const text = await file.text();
      
      // Parsear GPX (simplificado - en producción usar librería GPX)
      const parser = new DOMParser();
      const gpxDoc = parser.parseFromString(text, 'text/xml');
      
      // Validar que sea GPX válido
      if (gpxDoc.querySelector('parsererror')) {
        throw new Error('Archivo GPX inválido');
      }

      // Obtener información del equipo
      const team = teams.find(t => t.id === teamId);
      if (!team) throw new Error('Equipo no encontrado');

      // Generar color único para el equipo si no existe
      const existingTrace = gpxTraces.find(t => t.teamId === teamId);
      const teamColor = existingTrace?.color || generateTeamColor(teamId);

      // Crear nueva traza
      const newTrace: GPXTrace = {
        id: `gpx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        teamId,
        teamName: team.nombre,
        label,
        fileName: file.name,
        uploadedAt: new Date(),
        data: gpxDoc, // En producción, extraer coordenadas parseadas
        visible: true,
        color: teamColor,
      };

      // Agregar a la lista de trazas
      setGpxTraces(prev => [...prev, newTrace]);

      console.log('✅ Traza GPX cargada:', newTrace);
    } catch (error) {
      console.error('❌ Error al cargar GPX:', error);
      throw error;
    }
  };

  /**
   * CU-22: Cambiar visibilidad de capas
   */
  const handleLayerVisibilityChange = (
    layer: keyof typeof layerVisibility,
    visible: boolean
  ) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: visible,
    }));
    
    console.log(`🔄 Capa "${layer}" ${visible ? 'activada' : 'desactivada'}`);
  };

  /**
   * CU-22: Cambiar visibilidad de traza GPX individual
   */
  const handleGPXTraceVisibilityChange = (traceId: string, visible: boolean) => {
    setGpxTraces(prev =>
      prev.map(trace =>
        trace.id === traceId ? { ...trace, visible } : trace
      )
    );
    
    const trace = gpxTraces.find(t => t.id === traceId);
    if (trace) {
      console.log(`🔄 Traza "${trace.label}" ${visible ? 'mostrada' : 'oculta'}`);
    }
  };

  /**
   * CU-22: Eliminar traza GPX
   */
  const handleGPXTraceDelete = (traceId: string) => {
    const trace = gpxTraces.find(t => t.id === traceId);
    
    setGpxTraces(prev => prev.filter(t => t.id !== traceId));
    
    if (trace) {
      toast.success(`Traza "${trace.label}" eliminada`);
    }
  };

  // ==================== UTILIDADES ====================

  /**
   * Generar color único para un equipo basado en su ID
   */
  const generateTeamColor = (teamId: string): string => {
    const colors = [
      '#ef4444', // rojo
      '#3b82f6', // azul
      '#10b981', // verde
      '#f59e0b', // amarillo
      '#8b5cf6', // morado
      '#ec4899', // rosa
      '#06b6d4', // cyan
      '#f97316', // naranja
    ];
    
    // Usar hash simple del ID para seleccionar color
    let hash = 0;
    for (let i = 0; i < teamId.length; i++) {
      hash = teamId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // ==================== RENDER ====================

  return (
    <div className="relative w-full h-full">
      {/* Mapa (aquí iría tu componente de mapa real) */}
      <div className="w-full h-full bg-gray-900 relative">
        {/* Ejemplo de polígono clickeable */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/20 border-2 border-red-500 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-500/30"
          onContextMenu={(e) => handlePolygonRightClick(e, 'zone-1')}
        >
          <div className="text-white text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Zona de Búsqueda 1</p>
            <p className="text-xs text-gray-300 mt-1">
              Clic derecho para asignar grupo
            </p>
          </div>
        </div>

        {/* Botón de capas */}
        <div className="absolute top-4 right-4">
          <Button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            <Layers className="h-4 w-4" />
            Capas ({gpxTraces.length} GPX)
          </Button>
        </div>

        {/* Indicador de capas activas */}
        <div className="absolute bottom-4 left-4 bg-gray-950/90 border border-gray-800 rounded-lg p-3 text-white text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${layerVisibility.polygons ? 'bg-green-500' : 'bg-gray-600'}`} />
            <span>Polígonos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${layerVisibility.pois ? 'bg-green-500' : 'bg-gray-600'}`} />
            <span>POIs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${layerVisibility.puntoZero ? 'bg-green-500' : 'bg-gray-600'}`} />
            <span>Punto Cero</span>
          </div>
          {gpxTraces.filter(t => t.visible).length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-gray-700 mt-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{gpxTraces.filter(t => t.visible).length} trazas GPX activas</span>
            </div>
          )}
        </div>
      </div>

      {/* CU-20: Menú contextual de polígonos */}
      {contextMenu && (
        <PolygonContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          polygonId={contextMenu.polygonId}
          polygonName={contextMenu.polygonName}
          teams={teams}
          currentAssignedTeamId={contextMenu.assignedTeamId}
          onAssignTeam={handleAssignTeam}
          onUnassignTeam={handleUnassignTeam}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* CU-21: Modal de carga GPX */}
      {gpxModal && (
        <GPXUploadModal
          isOpen={true}
          onClose={() => setGpxModal(null)}
          teamId={gpxModal.teamId}
          teamName={gpxModal.teamName}
          teams={teams}
          onUpload={handleGPXUpload}
        />
      )}

      {/* CU-22: Panel de gestión de capas */}
      <MapLayerManagement
        isOpen={showLayerPanel}
        onClose={() => setShowLayerPanel(false)}
        layerVisibility={layerVisibility}
        onLayerVisibilityChange={handleLayerVisibilityChange}
        gpxTraces={gpxTraces}
        teams={teams}
        onGPXTraceVisibilityChange={handleGPXTraceVisibilityChange}
        onGPXTraceDelete={handleGPXTraceDelete}
      />

      {/* Instrucciones */}
      <div className="absolute bottom-4 right-4 max-w-sm bg-gray-950/90 border border-gray-800 rounded-lg p-4 text-white text-xs">
        <h4 className="font-semibold mb-2">Instrucciones:</h4>
        <ul className="space-y-1 list-disc list-inside text-gray-300">
          <li>Clic derecho en zona → Asignar grupo</li>
          <li>Botón Upload en grupo → Cargar GPX</li>
          <li>Botón Capas → Gestionar visibilidad</li>
        </ul>
      </div>
    </div>
  );
}
