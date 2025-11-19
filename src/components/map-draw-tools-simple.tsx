import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapLayerPanel } from './map-layer-panel';
import { MapLayerManagement } from './map-layer-management';
import { PolygonContextMenu } from './polygon-context-menu';
import { GPXUploadModal } from './gpx-upload-modal';
import { MapTeamsPanel } from './map-teams-panel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  Square, 
  Minus,
  MapPin,
  Download,
  Trash2,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  Circle,
  Type,
  Ruler,
  Move,
  Hand,
  Maximize2,
  Grid3x3,
  MousePointer2,
  CircleDot,
  Pencil,
  Settings,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Upload as UploadIcon,
  FileUp,
  CheckCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Team } from '../types/personnel';
import { GPXTrace } from '../types/search-zones';
import { toast } from 'sonner@2.0.3';

interface DrawToolsProps {
  onShapeCreated?: (shape: any) => void;
  onMeasurement?: (measurement: { distance?: number; area?: number }) => void;
  className?: string;
  teams?: Team[]; // Equipos disponibles para asignar a polígonos
  punto0?: { lat: number; lng: number; direccion?: string } | null; // Punto 0 inicial
  onPunto0Update?: (punto0: { lat: number; lng: number; direccion?: string }) => void; // Callback al actualizar punto 0
}

// Función auxiliar para calcular área de polígono
function calculatePolygonArea(latlngs: any[]): number {
  if (latlngs.length < 3) return 0;
  
  let area = 0;
  const earthRadius = 6371000; // Radio de la Tierra en metros
  
  for (let i = 0; i < latlngs.length; i++) {
    const j = (i + 1) % latlngs.length;
    const lat1 = latlngs[i].lat * Math.PI / 180;
    const lat2 = latlngs[j].lat * Math.PI / 180;
    const lng1 = latlngs[i].lng * Math.PI / 180;
    const lng2 = latlngs[j].lng * Math.PI / 180;
    
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  
  area = Math.abs(area * earthRadius * earthRadius / 2);
  return area;
}

export function MapDrawTools({ onShapeCreated, onMeasurement, className, teams = [], punto0, onPunto0Update }: DrawToolsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'none' | 'polygon' | 'marker' | 'polyline' | 'circle' | 'rectangle' | 'text' | 'measure' | 'punto0'>('none');
  const drawingModeRef = useRef<'none' | 'polygon' | 'marker' | 'polyline' | 'circle' | 'rectangle' | 'text' | 'measure' | 'punto0'>('none');
  const punto0MarkerRef = useRef<any>(null); // Referencia al marcador de punto 0
  const [isPunto0Locked, setIsPunto0Locked] = useState(true); // Bloqueado por defecto
  const [currentPoints, setCurrentPoints] = useState<any[]>([]);
  const [drawnShapes, setDrawnShapes] = useState<any[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<{distance?: number; area?: number; radius?: number} | null>(null);
  const [mapCenter] = useState({ lat: -31.4201, lng: -64.1888 }); // Córdoba, Argentina
  const [mapLayer, setMapLayer] = useState<'argenmap' | 'satellite' | 'topographic'>('argenmap');
  const drawnLayersRef = useRef<any[]>([]);
  const tempMarkersRef = useRef<any[]>([]);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showDrawMenu, setShowDrawMenu] = useState(false);
  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false); // Cambiado a false por defecto
  const [circleCenter, setCircleCenter] = useState<any>(null);
  const circleCenterRef = useRef<any>(null);
  const [isDrawingCircle, setIsDrawingCircle] = useState(false);
  const tempCircleRef = useRef<any>(null);
  const gpxInputRef = useRef<HTMLInputElement>(null);
  const [showGPXModal, setShowGPXModal] = useState(false);
  const [gpxFiles, setGpxFiles] = useState<string[]>([]);
  
  // ===== NUEVOS ESTADOS PARA CU-20, CU-21, CU-22 =====
  // CU-20: Menú contextual de polígonos
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    polygonId: string;
    polygonName?: string;
    assignedTeamId?: string;
  } | null>(null);
  
  // CU-21: Modal de carga GPX
  const [gpxUploadModal, setGpxUploadModal] = useState<{
    teamId: string;
    teamName: string;
  } | null>(null);
  
  // CU-22: Gestión de capas
  const [showLayerManagement, setShowLayerManagement] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({
    polygons: true,
    pois: true,
    puntoZero: true,
  });
  const [gpxTraces, setGpxTraces] = useState<GPXTrace[]>([]);
  const gpxTracesRef = useRef<any[]>([]); // Referencias a las capas de Leaflet
  
  // Mapa de asignaciones de polígonos a equipos
  const [polygonAssignments, setPolygonAssignments] = useState<Record<string, string>>({});
  
  // Panel de grupos desplegados
  const [showTeamsPanel, setShowTeamsPanel] = useState(true);
  
  // ===== FUNCIONES AUXILIARES =====
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
    
    let hash = 0;
    for (let i = 0; i < teamId.length; i++) {
      hash = teamId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Inicializar mapa con Leaflet
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    let isMounted = true;

    const initializeMap = async () => {
      try {
        if (!isMounted || !mapRef.current) return;

        // Importar Leaflet
        const L = await import('leaflet');
        
        if (!isMounted || !mapRef.current) return;

        // CSS de Leaflet
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }

        // Configurar iconos
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current, {
          zoomControl: false // Desactivar controles default de zoom
        }).setView([mapCenter.lat, mapCenter.lng], 13);

        // Capas de mapas - usando OSM y alternativas confiables
        // OpenStreetMap - Capa base gratuita y confiable
        const argenmapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        });

        // ESRI World Imagery - Satélite gratuito
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri',
          maxZoom: 18,
        });

        // OpenTopoMap - Mapa topográfico gratuito
        const topographicLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenTopoMap contributors',
          maxZoom: 17,
        });

        argenmapLayer.addTo(map);

        (map as any).layers = {
          argenmap: argenmapLayer,
          satellite: satelliteLayer,
          topographic: topographicLayer
        };

        // Event handler para clicks en el mapa
        map.on('click', (e: any) => {
          console.log('🖱️ Click en el mapa detectado. Modo actual:', drawingModeRef.current);
          
          if (drawingModeRef.current === 'none') {
            console.log('⚠️ Modo none - ignorando click');
            return;
          }

          if (drawingModeRef.current === 'punto0') {
            console.log('📍 Colocando/actualizando Punto 0 en:', e.latlng);
            
            // Si ya existe un punto 0 bloqueado, mostrar advertencia
            if (punto0MarkerRef.current && isPunto0Locked) {
              toast.warning('El Punto 0 está bloqueado. Desbloquéalo desde el popup o crea un nuevo punto histórico.');
              drawingModeRef.current = 'none';
              setDrawingMode('none');
              map.dragging.enable();
              return;
            }
            
            // Eliminar marcador anterior si existe
            if (punto0MarkerRef.current) {
              map.removeLayer(punto0MarkerRef.current);
            }
            
            const createPunto0Marker = (latlng: any, isLocked: boolean) => {
              // Crear ícono personalizado para Punto 0
              const lockIcon = isLocked 
                ? '<svg width="12" height="12" fill="white" viewBox="0 0 24 24" style="position: absolute; top: 2px; right: 2px;"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>'
                : '';
              
              const punto0Icon = L.divIcon({
                className: 'custom-punto0-marker',
                html: `
                  <div style="
                    position: relative;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <div style="
                      width: 40px;
                      height: 40px;
                      background: ${isLocked ? '#b91c1c' : '#dc2626'};
                      border: 4px solid white;
                      border-radius: 50%;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    ">
                      <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      ${lockIcon}
                    </div>
                    <div style="
                      position: absolute;
                      top: -32px;
                      left: 50%;
                      transform: translateX(-50%);
                      background: ${isLocked ? '#b91c1c' : '#dc2626'};
                      color: white;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-weight: bold;
                      font-size: 12px;
                      white-space: nowrap;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">PUNTO 0 ${isLocked ? '🔒' : ''}</div>
                  </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
              });
              
              // Crear marcador - solo arrastrable si NO está bloqueado
              const marker = L.marker(latlng, {
                icon: punto0Icon,
                draggable: !isLocked,
                autoPan: false // Desactivado para evitar movimientos bruscos de la vista
              }).addTo(map);
              
              const updatePopupContent = (pos: any, locked: boolean) => {
                return `
                  <div style="min-width: 220px;">
                    <strong style="color: #dc2626; font-size: 14px;">🔴 PUNTO 0</strong>
                    <p style="margin: 8px 0 4px 0; font-size: 12px; font-weight: 500;">Última ubicación conocida</p>
                    <p style="margin: 4px 0; font-size: 11px; color: #666;">
                      Lat: ${pos.lat.toFixed(6)}<br/>
                      Lng: ${pos.lng.toFixed(6)}
                    </p>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 11px; font-weight: 500; color: #374151;">Estado:</span>
                        <span style="
                          display: inline-flex;
                          align-items: center;
                          gap: 4px;
                          padding: 2px 8px;
                          background: ${locked ? '#fef2f2' : '#dcfce7'};
                          color: ${locked ? '#991b1b' : '#166534'};
                          border-radius: 4px;
                          font-size: 10px;
                          font-weight: 600;
                        ">
                          ${locked ? '🔒 BLOQUEADO' : '🔓 DESBLOQUEADO'}
                        </span>
                      </div>
                      <button 
                        onclick="window.togglePunto0Lock()"
                        style="
                          width: 100%;
                          padding: 6px 12px;
                          background: ${locked ? '#3b82f6' : '#f59e0b'};
                          color: white;
                          border: none;
                          border-radius: 4px;
                          font-size: 11px;
                          font-weight: 600;
                          cursor: pointer;
                          transition: all 0.2s;
                        "
                        onmouseover="this.style.opacity='0.8'"
                        onmouseout="this.style.opacity='1'"
                      >
                        ${locked ? '🔓 Desbloquear Punto' : '🔒 Bloquear Punto'}
                      </button>
                      ${!locked ? `
                        <p style="margin-top: 8px; font-size: 9px; color: #6b7280; font-style: italic;">
                          💡 Arrastra el marcador para actualizar
                        </p>
                      ` : `
                        <p style="margin-top: 8px; font-size: 9px; color: #ef4444; font-weight: 500;">
                          ⚠️ Bloqueado para evitar cambios accidentales
                        </p>
                      `}
                    </div>
                  </div>
                `;
              };
              
              marker.bindPopup(updatePopupContent(latlng, isLocked), {
                maxWidth: 250
              }).openPopup();
              
              return marker;
            };
            
            // Función global para toggle lock
            (window as any).togglePunto0Lock = () => {
              const newLockState = !isPunto0Locked;
              setIsPunto0Locked(newLockState);
              
              if (punto0MarkerRef.current && leafletMapRef.current) {
                const currentPos = punto0MarkerRef.current.getLatLng();
                leafletMapRef.current.removeLayer(punto0MarkerRef.current);
                
                const newMarker = createPunto0Marker(currentPos, newLockState);
                punto0MarkerRef.current = newMarker;
                
                // Re-agregar evento de arrastre si está desbloqueado
                if (!newLockState) {
                  newMarker.on('dragend', (event: any) => {
                    const newPos = event.target.getLatLng();
                    console.log('📍 Punto 0 actualizado a:', newPos);
                    
                    if (onPunto0Update) {
                      onPunto0Update({
                        lat: newPos.lat,
                        lng: newPos.lng,
                        direccion: `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`
                      });
                    }
                    
                    toast.success('Punto 0 actualizado exitosamente');
                  });
                }
                
                toast.success(newLockState ? 'Punto 0 bloqueado' : 'Punto 0 desbloqueado');
              }
            };
            
            const marker = createPunto0Marker(e.latlng, isPunto0Locked);
            punto0MarkerRef.current = marker;
            
            // Callback de actualización inicial
            if (onPunto0Update) {
              onPunto0Update({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                direccion: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`
              });
            }
            
            // Manejar evento de arrastre solo si NO está bloqueado
            if (!isPunto0Locked) {
              marker.on('dragend', (event: any) => {
                const newPos = event.target.getLatLng();
                console.log('📍 Punto 0 actualizado a:', newPos);
                
                if (onPunto0Update) {
                  onPunto0Update({
                    lat: newPos.lat,
                    lng: newPos.lng,
                    direccion: `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`
                  });
                }
                
                toast.success('Punto 0 actualizado exitosamente');
              });
            }
            
            // Restaurar cursor y dragging
            const container = map.getContainer();
            container.style.cursor = '';
            container.classList.remove('drawing-active');
            map.dragging.enable();
            
            drawingModeRef.current = 'none';
            setDrawingMode('none');
            
            toast.success(isPunto0Locked 
              ? '🔒 Punto 0 marcado y bloqueado. Desbloquéalo desde el popup si necesitas moverlo.' 
              : 'Punto 0 marcado. Puedes arrastrarlo para actualizar su posición.');
            console.log('✅ Punto 0 creado exitosamente');
          } else if (drawingModeRef.current === 'marker') {
            console.log('📍 Creando marcador en:', e.latlng);
            
            // Crear marcador
            const marker = L.marker(e.latlng).addTo(map);
            marker.bindPopup('Punto de interés').openPopup();
            
            drawnLayersRef.current.push(marker);
            
            const shapeData = {
              type: 'marker',
              data: marker.toGeoJSON(),
              id: `shape-${Date.now()}`
            };
            
            setDrawnShapes(prev => [...prev, shapeData]);
            
            if (onShapeCreated) {
              onShapeCreated(shapeData);
            }
            
            // Restaurar cursor y dragging
            const container = map.getContainer();
            container.style.cursor = '';
            container.classList.remove('drawing-active');
            map.dragging.enable();
            
            drawingModeRef.current = 'none';
            setDrawingMode('none');
            
            console.log('✅ Marcador creado exitosamente');
          } else if (drawingModeRef.current === 'circle') {
            if (!circleCenterRef.current) {
              // Primer click: definir centro
              circleCenterRef.current = e.latlng;
              setCircleCenter(e.latlng);
              setIsDrawingCircle(true);
              
              console.log('🔵 Centro del círculo definido:', e.latlng);
              
              // Crear círculo temporal
              const tempCircle = L.circle(e.latlng, {
                radius: 100,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
                weight: 2
              }).addTo(map);
              
              tempCircleRef.current = tempCircle;
            } else {
              // Segundo click: definir radio y finalizar
              const radius = map.distance(circleCenterRef.current, e.latlng);
              
              console.log('🔵 Radio del círculo definido:', radius);
              
              if (tempCircleRef.current) {
                map.removeLayer(tempCircleRef.current);
              }
              
              const circle = L.circle(circleCenterRef.current, {
                radius: radius,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
                weight: 2
              }).addTo(map);
              
              const radiusKm = radius / 1000;
              const areaHa = (Math.PI * radius * radius) / 10000;
              
              circle.bindPopup(`Radio: ${radiusKm.toFixed(2)} km<br>Área: ${areaHa.toFixed(2)} ha`);
              
              drawnLayersRef.current.push(circle);
              
              const shapeData = {
                type: 'circle',
                data: circle.toGeoJSON(),
                measurement: { radius: radiusKm, area: areaHa },
                id: `shape-${Date.now()}`
              };
              
              setDrawnShapes(prev => [...prev, shapeData]);
              setCurrentMeasurement({ radius: radiusKm, area: areaHa });
              
              if (onShapeCreated) {
                onShapeCreated(shapeData);
              }
              
              circleCenterRef.current = null;
              setCircleCenter(null);
              setIsDrawingCircle(false);
              tempCircleRef.current = null;
              drawingModeRef.current = 'none';
              setDrawingMode('none');
              
              // Restaurar cursor
              const container = map.getContainer();
              container.style.cursor = '';
              container.classList.remove('drawing-active');
              map.dragging.enable();
            }
          } else if (drawingModeRef.current === 'rectangle') {
            // Agregar punto para rectángulo (necesita 2 puntos)
            const tempMarker = L.circleMarker(e.latlng, {
              radius: 5,
              color: '#dc2626',
              fillColor: '#dc2626',
              fillOpacity: 0.8
            }).addTo(map);
            
            tempMarkersRef.current.push(tempMarker);
            const newPoints = [...currentPoints, e.latlng];
            setCurrentPoints(newPoints);
            
            if (newPoints.length === 2) {
              // Crear rectángulo
              const bounds = L.latLngBounds(newPoints[0], newPoints[1]);
              const rectangle = L.rectangle(bounds, {
                color: '#dc2626',
                weight: 3,
                fillOpacity: 0.3
              }).addTo(map);
              
              // Calcular área
              const ne = bounds.getNorthEast();
              const sw = bounds.getSouthWest();
              const width = map.distance(
                [ne.lat, sw.lng],
                [ne.lat, ne.lng]
              );
              const height = map.distance(
                [sw.lat, sw.lng],
                [ne.lat, sw.lng]
              );
              const areaHa = (width * height) / 10000;
              
              rectangle.bindPopup(`Área: ${areaHa.toFixed(2)} ha`);
              setCurrentMeasurement({ area: areaHa });
              
              drawnLayersRef.current.push(rectangle);
              
              const shapeData = {
                type: 'rectangle',
                data: rectangle.toGeoJSON(),
                measurement: { area: areaHa },
                id: `shape-${Date.now()}`
              };
              
              setDrawnShapes(prev => [...prev, shapeData]);
              
              if (onShapeCreated) {
                onShapeCreated(shapeData);
              }
              
              // Limpiar
              tempMarkersRef.current.forEach(marker => map.removeLayer(marker));
              tempMarkersRef.current = [];
              setCurrentPoints([]);
              
              // Restaurar cursor
              const container = map.getContainer();
              container.style.cursor = '';
              container.classList.remove('drawing-active');
              map.dragging.enable();
              
              drawingModeRef.current = 'none';
              setDrawingMode('none');
            }
          } else if (drawingModeRef.current === 'polygon' || drawingModeRef.current === 'polyline' || drawingModeRef.current === 'measure') {
            // Agregar punto temporal
            const tempMarker = L.circleMarker(e.latlng, {
              radius: 5,
              color: drawingModeRef.current === 'measure' ? '#10b981' : '#dc2626',
              fillColor: drawingModeRef.current === 'measure' ? '#10b981' : '#dc2626',
              fillOpacity: 0.8
            }).addTo(map);
            
            tempMarkersRef.current.push(tempMarker);
            setCurrentPoints(prev => [...prev, e.latlng]);
          }
        });

        // Evento de movimiento del mouse para círculos
        map.on('mousemove', (e: any) => {
          if (isDrawingCircle && circleCenter && tempCircleRef.current) {
            const radius = map.distance(circleCenter, e.latlng);
            tempCircleRef.current.setRadius(radius);
          }
        });

        leafletMapRef.current = map;
        setMapLoaded(true);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    const timer = setTimeout(() => {
      if (isMounted) {
        initializeMap();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Invalidar tamaño del mapa cuando se hace visible (para tabs)
  useEffect(() => {
    if (!mapLoaded || !leafletMapRef.current || !mapRef.current) return;

    // Usar IntersectionObserver para detectar cuando el mapa se hace visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && leafletMapRef.current) {
            // El mapa se hizo visible, invalidar tamaño
            setTimeout(() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.invalidateSize();
              }
            }, 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(mapRef.current);

    return () => {
      observer.disconnect();
    };
  }, [mapLoaded]);

  // Cerrar menús cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-container]')) {
        setShowDrawMenu(false);
        setShowConfigMenu(false);
        setShowLayerMenu(false);
      }
    };

    if (showDrawMenu || showConfigMenu || showLayerMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDrawMenu, showConfigMenu, showLayerMenu]);

  // Atajos de teclado para mejorar UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC - Cancelar dibujo
      if (e.key === 'Escape' && drawingMode !== 'none') {
        cancelDrawing();
      }
      
      // Enter - Finalizar dibujo
      if (e.key === 'Enter' && drawingMode !== 'none') {
        if ((drawingMode === 'polygon' && currentPoints.length >= 3) ||
            ((drawingMode === 'polyline' || drawingMode === 'measure') && currentPoints.length >= 2)) {
          finishDrawing();
        }
      }
      
      // Ctrl+Z o Cmd+Z - Deshacer último punto
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && drawingMode !== 'none' && currentPoints.length > 0) {
        e.preventDefault();
        undoLastPoint();
      }
      
      // Backspace - Deshacer último punto (alternativa)
      if (e.key === 'Backspace' && drawingMode !== 'none' && currentPoints.length > 0) {
        e.preventDefault();
        undoLastPoint();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawingMode, currentPoints]);

  const startDrawing = async (mode: 'polygon' | 'marker' | 'polyline' | 'circle' | 'rectangle' | 'text' | 'measure') => {
    console.log('🎨 Iniciando modo de dibujo:', mode);
    
    // Actualizar tanto el estado como la ref
    setDrawingMode(mode);
    drawingModeRef.current = mode;
    
    setCurrentPoints([]);
    setCircleCenter(null);
    circleCenterRef.current = null;
    setIsDrawingCircle(false);
    setShowDrawMenu(false);
    setShowConfigMenu(false);
    
    // Limpiar marcadores temporales
    const L = await import('leaflet');
    tempMarkersRef.current.forEach(marker => {
      if (leafletMapRef.current) {
        leafletMapRef.current.removeLayer(marker);
      }
    });
    tempMarkersRef.current = [];
    
    if (tempCircleRef.current && leafletMapRef.current) {
      leafletMapRef.current.removeLayer(tempCircleRef.current);
      tempCircleRef.current = null;
    }

    // Cambiar cursor del mapa a crosshair y deshabilitar dragging
    if (leafletMapRef.current) {
      const container = leafletMapRef.current.getContainer();
      container.style.cursor = 'crosshair';
      container.classList.add('drawing-active');
      leafletMapRef.current.dragging.disable();
      console.log('✏️ Cursor cambiado a crosshair, dragging deshabilitado');
      console.log('📝 drawingModeRef.current ahora es:', drawingModeRef.current);
    }
  };

  const finishDrawing = async () => {
    if (currentPoints.length < 2) {
      return;
    }

    const L = await import('leaflet');
    let layer: any;
    let measurement: { distance?: number; area?: number } = {};

    if (drawingMode === 'polygon') {
      if (currentPoints.length < 3) {
        return;
      }
      
      layer = L.polygon(currentPoints, {
        color: '#dc2626',
        weight: 3,
        fillOpacity: 0.3
      }).addTo(leafletMapRef.current);
      
      const area = calculatePolygonArea(currentPoints);
      measurement.area = area / 10000; // Convertir a hectáreas
      
      layer.bindPopup(`Área: ${measurement.area.toFixed(2)} hectáreas`);
      setCurrentMeasurement(measurement);
      
      // ===== CU-20: Agregar event listener para clic derecho =====
      const polygonId = `polygon-${Date.now()}`;
      (layer as any)._polygonId = polygonId; // Guardar ID en el layer
      
      layer.on('contextmenu', (e: any) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        
        const { containerPoint } = e;
        const mapContainer = leafletMapRef.current.getContainer();
        const rect = mapContainer.getBoundingClientRect();
        
        setContextMenu({
          x: rect.left + containerPoint.x,
          y: rect.top + containerPoint.y,
          polygonId,
          polygonName: `Polígono ${drawnShapes.length + 1}`,
          assignedTeamId: polygonAssignments[polygonId],
        });
      });
    } else if (drawingMode === 'polyline' || drawingMode === 'measure') {
      layer = L.polyline(currentPoints, {
        color: drawingMode === 'measure' ? '#10b981' : '#2563eb',
        weight: 3,
        dashArray: drawingMode === 'measure' ? '5, 5' : undefined
      }).addTo(leafletMapRef.current);
      
      let distance = 0;
      for (let i = 1; i < currentPoints.length; i++) {
        distance += leafletMapRef.current.distance(currentPoints[i-1], currentPoints[i]);
      }
      measurement.distance = distance / 1000; // Convertir a km
      
      layer.bindPopup(`Distancia: ${measurement.distance.toFixed(2)} km`);
      setCurrentMeasurement(measurement);
    }

    if (layer) {
      drawnLayersRef.current.push(layer);
      
      const shapeData = {
        type: drawingMode,
        data: layer.toGeoJSON(),
        measurement,
        id: `shape-${Date.now()}`
      };
      
      setDrawnShapes(prev => [...prev, shapeData]);
      
      if (onShapeCreated) {
        onShapeCreated(shapeData);
      }
      
      if (onMeasurement && (measurement.area || measurement.distance)) {
        onMeasurement(measurement);
      }
    }

    // Limpiar marcadores temporales
    tempMarkersRef.current.forEach(marker => {
      if (leafletMapRef.current) {
        leafletMapRef.current.removeLayer(marker);
      }
    });
    tempMarkersRef.current = [];

    // Restaurar cursor y dragging
    if (leafletMapRef.current) {
      const container = leafletMapRef.current.getContainer();
      container.style.cursor = '';
      container.classList.remove('drawing-active');
      leafletMapRef.current.dragging.enable();
    }

    setDrawingMode('none');
    setCurrentPoints([]);
  };

  const cancelDrawing = () => {
    console.log('❌ Cancelando dibujo');
    
    // Limpiar marcadores temporales
    tempMarkersRef.current.forEach(marker => {
      if (leafletMapRef.current) {
        leafletMapRef.current.removeLayer(marker);
      }
    });
    tempMarkersRef.current = [];
    
    if (tempCircleRef.current && leafletMapRef.current) {
      leafletMapRef.current.removeLayer(tempCircleRef.current);
      tempCircleRef.current = null;
    }

    // Restaurar cursor normal y habilitar dragging
    if (leafletMapRef.current) {
      const container = leafletMapRef.current.getContainer();
      container.style.cursor = '';
      container.classList.remove('drawing-active');
      leafletMapRef.current.dragging.enable();
      console.log('✅ Cursor restaurado, dragging habilitado');
    }

    setDrawingMode('none');
    drawingModeRef.current = 'none';
    setCurrentPoints([]);
    setCircleCenter(null);
    circleCenterRef.current = null;
    setIsDrawingCircle(false);
  };

  const changeMapLayer = async (layer: 'argenmap' | 'satellite' | 'topographic') => {
    if (!leafletMapRef.current || !mapLoaded) return;
    
    const map = leafletMapRef.current;
    const layers = (map as any).layers;
    
    Object.values(layers).forEach((l: any) => {
      if (map.hasLayer(l)) {
        map.removeLayer(l);
      }
    });
    
    layers[layer].addTo(map);
    setMapLayer(layer);
    setShowLayerMenu(false);
  };

  const clearAllShapes = () => {
    drawnLayersRef.current.forEach(layer => {
      if (leafletMapRef.current) {
        leafletMapRef.current.removeLayer(layer);
      }
    });
    drawnLayersRef.current = [];
    setDrawnShapes([]);
    setCurrentMeasurement(null);
  };

  const exportShapes = () => {
    if (drawnShapes.length === 0) {
      return;
    }

    const geojson = {
      type: 'FeatureCollection',
      features: drawnShapes.map(shape => shape.data)
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zonas-rastrillaje-${new Date().toISOString().split('T')[0]}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getUserLocation = () => {
    if ("geolocation" in navigator && leafletMapRef.current) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const L = await import('leaflet');
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          leafletMapRef.current.setView([location.lat, location.lng], 15);
          
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div class="relative">
                <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div class="absolute inset-0 w-4 h-4 rounded-full animate-pulse bg-blue-400 opacity-75"></div>
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          
          if ((leafletMapRef.current as any).userMarker) {
            leafletMapRef.current.removeLayer((leafletMapRef.current as any).userMarker);
          }
          
          const userMarker = L.marker([location.lat, location.lng], { icon: userIcon })
            .addTo(leafletMapRef.current)
            .bindPopup('<div class="text-center p-2"><strong>Tu ubicación actual</strong></div>');
          
          (leafletMapRef.current as any).userMarker = userMarker;
        },
        (error) => {
          console.info('ℹ️ Ubicación: No se pudo obtener la ubicación actual.');
        }
      );
    }
  };
  
  // ===== useEffect para renderizar Punto 0 inicial =====
  useEffect(() => {
    if (!mapLoaded || !leafletMapRef.current || !punto0) return;
    
    const initializePunto0 = async () => {
      const L = await import('leaflet');
      const map = leafletMapRef.current;
      
      // Verificar si es la primera vez que se carga el punto 0
      const isFirstLoad = !punto0MarkerRef.current;
      
      // Eliminar marcador anterior si existe
      if (punto0MarkerRef.current) {
        map.removeLayer(punto0MarkerRef.current);
      }
      
      // Por defecto el punto está bloqueado
      setIsPunto0Locked(true);
      
      const createPunto0Marker = (latlng: { lat: number; lng: number }, isLocked: boolean) => {
        const lockIcon = isLocked 
          ? '<svg width="12" height="12" fill="white" viewBox="0 0 24 24" style="position: absolute; top: 2px; right: 2px;"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>'
          : '';
        
        const punto0Icon = L.divIcon({
          className: 'custom-punto0-marker',
          html: `
            <div style="
              position: relative;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 40px;
                height: 40px;
                background: ${isLocked ? '#b91c1c' : '#dc2626'};
                border: 4px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                ${lockIcon}
              </div>
              <div style="
                position: absolute;
                top: -32px;
                left: 50%;
                transform: translateX(-50%);
                background: ${isLocked ? '#b91c1c' : '#dc2626'};
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              ">PUNTO 0 ${isLocked ? '🔒' : ''}</div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });
        
        const marker = L.marker([latlng.lat, latlng.lng], {
          icon: punto0Icon,
          draggable: !isLocked,
          autoPan: false // Desactivado para evitar movimientos bruscos de la vista
        }).addTo(map);
        
        const updatePopupContent = (pos: { lat: number; lng: number }, locked: boolean) => {
          return `
            <div style="min-width: 220px;">
              <strong style="color: #dc2626; font-size: 14px;">🔴 PUNTO 0</strong>
              <p style="margin: 8px 0 4px 0; font-size: 12px; font-weight: 500;">Última ubicación conocida</p>
              ${punto0.direccion ? `<p style="margin: 4px 0; font-size: 11px; color: #666;">${punto0.direccion}</p>` : ''}
              <p style="margin: 4px 0; font-size: 11px; color: #666;">
                Lat: ${pos.lat.toFixed(6)}<br/>
                Lng: ${pos.lng.toFixed(6)}
              </p>
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 11px; font-weight: 500; color: #374151;">Estado:</span>
                  <span style="
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 8px;
                    background: ${locked ? '#fef2f2' : '#dcfce7'};
                    color: ${locked ? '#991b1b' : '#166534'};
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                  ">
                    ${locked ? '🔒 BLOQUEADO' : '🔓 DESBLOQUEADO'}
                  </span>
                </div>
                <button 
                  onclick="window.togglePunto0Lock()"
                  style="
                    width: 100%;
                    padding: 6px 12px;
                    background: ${locked ? '#3b82f6' : '#f59e0b'};
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                  "
                  onmouseover="this.style.opacity='0.8'"
                  onmouseout="this.style.opacity='1'"
                >
                  ${locked ? '🔓 Desbloquear Punto' : '🔒 Bloquear Punto'}
                </button>
                ${!locked ? `
                  <p style="margin-top: 8px; font-size: 9px; color: #6b7280; font-style: italic;">
                    💡 Arrastra el marcador para actualizar
                  </p>
                ` : `
                  <p style="margin-top: 8px; font-size: 9px; color: #ef4444; font-weight: 500;">
                    ⚠️ Bloqueado para evitar cambios accidentales
                  </p>
                `}
              </div>
            </div>
          `;
        };
        
        marker.bindPopup(updatePopupContent(latlng, isLocked), {
          maxWidth: 250
        });
        
        return marker;
      };
      
      // Función global para toggle lock
      (window as any).togglePunto0Lock = () => {
        const newLockState = !isPunto0Locked;
        setIsPunto0Locked(newLockState);
        
        if (punto0MarkerRef.current && leafletMapRef.current) {
          const currentPos = punto0MarkerRef.current.getLatLng();
          leafletMapRef.current.removeLayer(punto0MarkerRef.current);
          
          const newMarker = createPunto0Marker({ lat: currentPos.lat, lng: currentPos.lng }, newLockState);
          punto0MarkerRef.current = newMarker;
          
          // Re-agregar evento de arrastre si está desbloqueado
          if (!newLockState) {
            newMarker.on('dragend', (event: any) => {
              const newPos = event.target.getLatLng();
              console.log('📍 Punto 0 actualizado a:', newPos);
              
              if (onPunto0Update) {
                onPunto0Update({
                  lat: newPos.lat,
                  lng: newPos.lng,
                  direccion: `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`
                });
              }
              
              toast.success('Punto 0 actualizado exitosamente');
            });
          }
          
          toast.success(newLockState ? '🔒 Punto 0 bloqueado' : '🔓 Punto 0 desbloqueado');
        }
      };
      
      const marker = createPunto0Marker({ lat: punto0.lat, lng: punto0.lng }, true);
      punto0MarkerRef.current = marker;
      
      // SOLO centrar mapa en punto 0 la primera vez que se carga
      // NO hacer zoom en actualizaciones para mantener la vista del usuario
      if (isFirstLoad) {
        map.setView([punto0.lat, punto0.lng], 15);
      }
    };
    
    initializePunto0();
  }, [mapLoaded, punto0]);

  const zoomIn = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
    }
  };

  const undoLastPoint = () => {
    if (currentPoints.length === 0) return;
    
    // Eliminar último marcador temporal
    if (tempMarkersRef.current.length > 0) {
      const lastMarker = tempMarkersRef.current.pop();
      if (leafletMapRef.current && lastMarker) {
        leafletMapRef.current.removeLayer(lastMarker);
      }
    }
    
    // Eliminar último punto del array
    setCurrentPoints(prev => prev.slice(0, -1));
    
    console.log('↩️ Último punto eliminado. Puntos restantes:', currentPoints.length - 1);
  };

  const fitToAllShapes = () => {
    if (!leafletMapRef.current || drawnLayersRef.current.length === 0) return;
    
    const group = new (window as any).L.featureGroup(drawnLayersRef.current);
    const bounds = group.getBounds();
    
    if (bounds.isValid()) {
      leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const handleGPXUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !leafletMapRef.current) return;

    try {
      const text = await file.text();
      console.log('📁 Archivo GPX cargado:', file.name);
      
      const L = await import('leaflet');
      const map = leafletMapRef.current;
      
      // Parsear GPX
      const parser = new DOMParser();
      const gpxDoc = parser.parseFromString(text, 'text/xml');
      
      const parseError = gpxDoc.querySelector('parsererror');
      if (parseError) {
        console.error('❌ Error al parsear GPX:', parseError.textContent);
        alert('Error al parsear el archivo GPX');
        return;
      }
      
      const features: any[] = [];
      
      // Extraer waypoints
      const waypoints = gpxDoc.querySelectorAll('wpt');
      waypoints.forEach((wpt, index) => {
        const lat = Number(wpt.getAttribute('lat'));
        const lon = Number(wpt.getAttribute('lon'));
        const name = wpt.querySelector('name')?.textContent || `Waypoint ${index + 1}`;
        
        features.push({
          type: 'Feature',
          properties: { name },
          geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          }
        });
      });
      
      // Extraer tracks
      const tracks = gpxDoc.querySelectorAll('trk');
      tracks.forEach((track, index) => {
        const name = track.querySelector('name')?.textContent || `Track ${index + 1}`;
        const points: number[][] = [];
        
        track.querySelectorAll('trkpt').forEach(pt => {
          const lat = Number(pt.getAttribute('lat'));
          const lon = Number(pt.getAttribute('lon'));
          points.push([lon, lat]);
        });
        
        if (points.length > 0) {
          features.push({
            type: 'Feature',
            properties: { name },
            geometry: {
              type: 'LineString',
              coordinates: points
            }
          });
        }
      });
      
      // Extraer rutas
      const routes = gpxDoc.querySelectorAll('rte');
      routes.forEach((route, index) => {
        const name = route.querySelector('name')?.textContent || `Ruta ${index + 1}`;
        const points: number[][] = [];
        
        route.querySelectorAll('rtept').forEach(pt => {
          const lat = Number(pt.getAttribute('lat'));
          const lon = Number(pt.getAttribute('lon'));
          points.push([lon, lat]);
        });
        
        if (points.length > 0) {
          features.push({
            type: 'Feature',
            properties: { name },
            geometry: {
              type: 'LineString',
              coordinates: points
            }
          });
        }
      });
      
      const geojson = {
        type: 'FeatureCollection',
        features
      };
      
      console.log('✅ GPX convertido a GeoJSON:', features.length, 'features');
      
      // Agregar al mapa
      const layer = L.geoJSON(geojson, {
        style: {
          color: '#dc2626',
          weight: 3,
          fillOpacity: 0.3
        },
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng);
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties?.name) {
            layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
          }
        }
      }).addTo(map);
      
      drawnLayersRef.current.push(layer);
      
      // Centrar el mapa en las features cargadas
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
      
      console.log('✅ GPX cargado y mostrado en el mapa');
      
      // Agregar el archivo a la lista
      setGpxFiles(prev => [...prev, file.name]);
      
      // Cerrar el modal
      setShowGPXModal(false);
      
      alert(`Archivo GPX cargado exitosamente: ${features.length} elementos`);
      
    } catch (error) {
      console.error('❌ Error al cargar GPX:', error);
      alert('Error al cargar el archivo GPX');
    }
    
    // Limpiar el input para permitir cargar el mismo archivo nuevamente
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className={`relative w-full h-[calc(100vh-12rem)] ${className}`}>
        {/* Mapa principal - Ocupa toda la pantalla */}
        <div 
          ref={mapRef}
          className="w-full h-full rounded-lg relative overflow-hidden"
        >
          {!mapLoaded && (
            <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center z-10">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Cargando mapa IGN...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controles flotantes - Estilo IGN */}
        
        {/* Panel Superior Izquierdo - Controles Generales */}
        <div className="absolute top-4 left-4 z-[10000] flex gap-1 bg-gray-900 rounded-md shadow-xl p-1 border border-gray-700" data-menu-container>
          {/* Botón Capas del Mapa - Estilo IGN */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowLayerPanel(!showLayerPanel)}
                className={`p-2 h-9 w-9 hover:bg-gray-700 text-white ${showLayerPanel ? 'bg-gray-700' : ''}`}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Capas del Mapa</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setDrawingMode('none')}
                className={`p-2 h-9 w-9 hover:bg-gray-700 text-white ${drawingMode === 'none' ? 'bg-gray-700' : ''}`}
              >
                <MousePointer2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Seleccionar / Navegar</p>
            </TooltipContent>
          </Tooltip>

          <div className="h-7 w-px bg-gray-600 my-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={getUserLocation}
                className="p-2 h-9 w-9 hover:bg-blue-700 text-white"
              >
                <Navigation className="h-4 w-4 text-blue-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Mi ubicación (GPS)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  if (drawingMode === 'punto0') {
                    cancelDrawing();
                  } else {
                    startDrawing('punto0');
                  }
                }}
                className={`p-2 h-9 w-9 hover:bg-red-700 text-white ${drawingMode === 'punto0' ? 'bg-red-700' : ''}`}
              >
                <CircleDot className="h-4 w-4 text-red-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Marcar Punto 0 (Última ubicación)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowGPXModal(true)}
                className="p-2 h-9 w-9 hover:bg-purple-700 text-white"
              >
                <FileUp className="h-4 w-4 text-purple-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Cargar archivos GPX</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="h-7 w-px bg-gray-600 my-1"></div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowLayerManagement(!showLayerManagement)}
                className={`p-2 h-9 w-9 hover:bg-green-700 text-white ${showLayerManagement ? 'bg-green-700' : ''}`}
              >
                <Layers className="h-4 w-4 text-green-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Gestión de Capas (GPX, Polígonos)</p>
            </TooltipContent>
          </Tooltip>

        </div>

        {/* Panel Derecho - Controles (Vertical) */}
        <div className="absolute top-4 right-4 z-[10000] flex flex-col gap-1 bg-gray-900 rounded-md shadow-xl p-1 border border-gray-700" data-menu-container>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={zoomIn}
                className="p-2 h-9 w-9 hover:bg-gray-700 text-white"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Acercar zoom</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={zoomOut}
                className="p-2 h-9 w-9 hover:bg-gray-700 text-white"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Alejar zoom</p>
            </TooltipContent>
          </Tooltip>

          <div className="h-px bg-gray-600 my-1"></div>

          {/* Botón Lápiz - Herramientas de Dibujo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowDrawMenu(!showDrawMenu)}
                className={`p-2 h-9 w-9 hover:bg-blue-700 text-white ${showDrawMenu ? 'bg-blue-700' : ''}`}
              >
                <Pencil className="h-4 w-4 text-blue-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Herramientas de dibujo</p>
            </TooltipContent>
          </Tooltip>

          {/* Botón Configuración - Herramientas Adicionales */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowConfigMenu(!showConfigMenu)}
                className={`p-2 h-9 w-9 hover:bg-gray-700 text-white ${showConfigMenu ? 'bg-gray-700' : ''}`}
              >
                <Settings className="h-4 w-4 text-gray-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Configuración y herramientas</p>
            </TooltipContent>
          </Tooltip>

          <div className="h-px bg-gray-600 my-1"></div>

          {/* Botón Centrar en todas las formas */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={fitToAllShapes}
                disabled={drawnShapes.length === 0}
                className="p-2 h-9 w-9 hover:bg-gray-700 text-white disabled:opacity-30"
              >
                <Maximize2 className="h-4 w-4 text-orange-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Centrar en todas las formas</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Menu desplegable de herramientas de dibujo */}
        {showDrawMenu && (
          <div className="absolute top-4 right-16 z-[10000] bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden min-w-[220px]" data-menu-container>
            <button
              onClick={() => startDrawing('polygon')}
              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-red-900/40 flex items-center gap-3 text-white ${drawingMode === 'polygon' ? 'bg-red-900/60' : ''}`}
            >
              <Square className="h-4 w-4 text-red-400" />
              <span>Dibujar polígono</span>
            </button>
            <button
              onClick={() => startDrawing('rectangle')}
              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-red-900/40 flex items-center gap-3 text-white ${drawingMode === 'rectangle' ? 'bg-red-900/60' : ''}`}
            >
              <Maximize2 className="h-4 w-4 text-red-400" />
              <span>Dibujar rectángulo</span>
            </button>
            <button
              onClick={() => startDrawing('circle')}
              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-blue-900/40 flex items-center gap-3 text-white ${drawingMode === 'circle' ? 'bg-blue-900/60' : ''}`}
            >
              <Circle className="h-4 w-4 text-blue-400" />
              <span>Dibujar círculo / Radio</span>
            </button>
            <button
              onClick={() => startDrawing('polyline')}
              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-blue-900/40 flex items-center gap-3 text-white ${drawingMode === 'polyline' ? 'bg-blue-900/60' : ''}`}
            >
              <Minus className="h-4 w-4 text-blue-400" />
              <span>Dibujar línea / Ruta</span>
            </button>
            <button
              onClick={() => startDrawing('marker')}
              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-purple-900/40 flex items-center gap-3 text-white ${drawingMode === 'marker' ? 'bg-purple-900/60' : ''}`}
            >
              <MapPin className="h-4 w-4 text-purple-400" />
              <span>Colocar marcador</span>
            </button>
          </div>
        )}

        {/* Menu desplegable de configuración */}
        {showConfigMenu && (
          <div className="absolute top-4 right-16 z-[10000] bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden min-w-[220px]" data-menu-container>
            <button
              onClick={() => startDrawing('measure')}
              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-green-900/40 flex items-center gap-3 text-white ${drawingMode === 'measure' ? 'bg-green-900/60' : ''}`}
            >
              <Ruler className="h-4 w-4 text-green-400" />
              <span>Medir distancia</span>
            </button>
            <div className="h-px bg-gray-700"></div>
            <button
              onClick={exportShapes}
              disabled={drawnShapes.length === 0}
              className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-700 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed text-white"
            >
              <Download className="h-4 w-4" />
              <span>Exportar GeoJSON</span>
            </button>
            <button
              onClick={clearAllShapes}
              disabled={drawnShapes.length === 0}
              className="w-full px-4 py-2.5 text-sm text-left hover:bg-red-900/40 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed text-white"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
              <span>Limpiar todo</span>
            </button>
          </div>
        )}

        {/* Drawer/Sheet de Capas del Mapa - Estilo IGN */}
        {showLayerPanel && (
          <MapLayerPanel
            isOpen={showLayerPanel}
            onClose={() => setShowLayerPanel(false)}
            onLayerChange={(layerId, enabled) => {
              console.log('Layer changed:', layerId, enabled);
            }}
            onBaseMapChange={(baseMapId) => {
              if (baseMapId.includes('argenmap')) {
                changeMapLayer('argenmap');
              } else if (baseMapId.includes('satellite') || baseMapId.includes('esri')) {
                changeMapLayer('satellite');
              } else if (baseMapId.includes('topografico') || baseMapId.includes('topo')) {
                changeMapLayer('topographic');
              }
            }}
            onFileUpload={async (file) => {
              console.log('📁 Archivo recibido:', file.name, 'Tipo:', file.type, 'Tamaño:', file.size);
              
              if (!leafletMapRef.current) {
                console.error('❌ Mapa no inicializado');
                return;
              }

              try {
                const text = await file.text();
                console.log('📄 Contenido del archivo cargado, tamaño:', text.length, 'caracteres');
                console.log('📄 Primeros 200 caracteres:', text.substring(0, 200));
                
                const L = await import('leaflet');
                const map = leafletMapRef.current;
                
                // Detectar tipo de archivo
                const fileName = file.name.toLowerCase();
                let geojson: any = null;

                if (fileName.endsWith('.kml')) {
                  console.log('🗺️ Procesando archivo KML...');
                  
                  // Parsear KML a GeoJSON manualmente
                  const parser = new DOMParser();
                  const kmlDoc = parser.parseFromString(text, 'text/xml');
                  
                  // Verificar si hay errores de parsing
                  const parseError = kmlDoc.querySelector('parsererror');
                  if (parseError) {
                    console.error('❌ Error al parsear XML:', parseError.textContent);
                    throw new Error('Error al parsear archivo KML');
                  }
                  
                  console.log('✅ KML parseado correctamente');
                  
                  // Convertir KML a GeoJSON simple
                  const features: any[] = [];
                  
                  // Extraer Placemarks
                  const placemarks = kmlDoc.querySelectorAll('Placemark');
                  console.log('📍 Placemarks encontrados:', placemarks.length);
                  
                  placemarks.forEach((placemark, index) => {
                    const name = placemark.querySelector('name')?.textContent || `Feature ${index + 1}`;
                    const description = placemark.querySelector('description')?.textContent || '';
                    
                    // Extraer coordenadas
                    const coordinates = placemark.querySelector('coordinates')?.textContent?.trim();
                    
                    if (coordinates) {
                      // Dividir coordenadas (formato: lon,lat,alt lon,lat,alt)
                      const coordPairs = coordinates.split(/\s+/).filter(c => c.trim());
                      const coords = coordPairs.map(pair => {
                        const [lon, lat, alt] = pair.split(',').map(Number);
                        return [lon, lat]; // GeoJSON usa [lon, lat]
                      });
                      
                      console.log(`📍 ${name}: ${coords.length} coordenadas`);
                      
                      let geometry: any;
                      
                      // Determinar tipo de geometría
                      if (placemark.querySelector('Point')) {
                        geometry = {
                          type: 'Point',
                          coordinates: coords[0]
                        };
                      } else if (placemark.querySelector('LineString')) {
                        geometry = {
                          type: 'LineString',
                          coordinates: coords
                        };
                      } else if (placemark.querySelector('Polygon')) {
                        geometry = {
                          type: 'Polygon',
                          coordinates: [coords] // Exterior ring
                        };
                      }
                      
                      if (geometry) {
                        features.push({
                          type: 'Feature',
                          properties: { name, description },
                          geometry
                        });
                      }
                    }
                  });
                  
                  geojson = {
                    type: 'FeatureCollection',
                    features
                  };
                  
                  console.log('✅ KML convertido a GeoJSON:', features.length, 'features');
                  
                } else if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
                  console.log('🗺️ Procesando archivo GeoJSON...');
                  geojson = JSON.parse(text);
                  console.log('✅ GeoJSON parseado correctamente');
                  
                } else if (fileName.endsWith('.gpx')) {
                  console.log('🗺️ Procesando archivo GPX...');
                  
                  const parser = new DOMParser();
                  const gpxDoc = parser.parseFromString(text, 'text/xml');
                  
                  const parseError = gpxDoc.querySelector('parsererror');
                  if (parseError) {
                    console.error('❌ Error al parsear GPX:', parseError.textContent);
                    throw new Error('Error al parsear archivo GPX');
                  }
                  
                  const features: any[] = [];
                  
                  // Extraer waypoints
                  const waypoints = gpxDoc.querySelectorAll('wpt');
                  waypoints.forEach((wpt, index) => {
                    const lat = Number(wpt.getAttribute('lat'));
                    const lon = Number(wpt.getAttribute('lon'));
                    const name = wpt.querySelector('name')?.textContent || `Waypoint ${index + 1}`;
                    
                    features.push({
                      type: 'Feature',
                      properties: { name },
                      geometry: {
                        type: 'Point',
                        coordinates: [lon, lat]
                      }
                    });
                  });
                  
                  // Extraer tracks
                  const tracks = gpxDoc.querySelectorAll('trk');
                  tracks.forEach((track, index) => {
                    const name = track.querySelector('name')?.textContent || `Track ${index + 1}`;
                    const points: number[][] = [];
                    
                    track.querySelectorAll('trkpt').forEach(pt => {
                      const lat = Number(pt.getAttribute('lat'));
                      const lon = Number(pt.getAttribute('lon'));
                      points.push([lon, lat]);
                    });
                    
                    if (points.length > 0) {
                      features.push({
                        type: 'Feature',
                        properties: { name },
                        geometry: {
                          type: 'LineString',
                          coordinates: points
                        }
                      });
                    }
                  });
                  
                  geojson = {
                    type: 'FeatureCollection',
                    features
                  };
                  
                  console.log('✅ GPX convertido a GeoJSON:', features.length, 'features');
                  
                } else {
                  console.error('❌ Formato de archivo no soportado:', fileName);
                  throw new Error('Formato de archivo no soportado');
                }

                // Agregar GeoJSON al mapa
                if (geojson) {
                  console.log('🗺️ Agregando capa al mapa...');
                  
                  const layer = L.geoJSON(geojson, {
                    style: {
                      color: '#dc2626',
                      weight: 3,
                      fillOpacity: 0.3
                    },
                    pointToLayer: (feature, latlng) => {
                      return L.marker(latlng);
                    },
                    onEachFeature: (feature, layer) => {
                      if (feature.properties?.name || feature.properties?.description) {
                        const popupContent = `
                          ${feature.properties.name ? `<strong>${feature.properties.name}</strong>` : ''}
                          ${feature.properties.description ? `<br>${feature.properties.description}` : ''}
                        `;
                        layer.bindPopup(popupContent);
                      }
                    }
                  }).addTo(map);
                  
                  drawnLayersRef.current.push(layer);
                  
                  // Hacer zoom al área cargada
                  try {
                    const bounds = layer.getBounds();
                    if (bounds.isValid()) {
                      map.fitBounds(bounds, { padding: [50, 50] });
                      console.log('✅ Zoom ajustado a bounds:', bounds);
                    }
                  } catch (boundsError) {
                    console.warn('⚠️ No se pudo ajustar el zoom:', boundsError);
                  }
                  
                  console.log('✅ Archivo cargado exitosamente en el mapa');
                }
                
              } catch (error) {
                console.error('❌ Error al procesar archivo:', error);
                alert(`Error al cargar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              }
            }}
            currentBaseMap={mapLayer}
          />
        )}

        {/* Estado de Dibujo Activo */}
        {drawingMode !== 'none' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[10000] bg-gray-900 border border-gray-700 rounded-lg shadow-xl px-4 py-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${drawingMode === 'punto0' ? 'bg-red-600' : 'bg-red-500'}`}></div>
              <span className="text-sm text-white">
                {drawingMode === 'polygon' && 'Dibujando polígono'}
                {drawingMode === 'polyline' && 'Dibujando línea'}
                {drawingMode === 'circle' && (circleCenter ? 'Click para definir radio' : 'Click para definir centro')}
                {drawingMode === 'rectangle' && `Dibujando rectángulo ${currentPoints.length === 1 ? '- Click para segundo punto' : ''}`}
                {drawingMode === 'marker' && 'Click para colocar marcador'}
                {drawingMode === 'measure' && 'Midiendo distancia'}
                {drawingMode === 'punto0' && '🔴 Marcando PUNTO 0 - Haz clic en última ubicación conocida'}
                {(drawingMode === 'polygon' || drawingMode === 'polyline' || drawingMode === 'measure') && currentPoints.length > 0 && ` - ${currentPoints.length} puntos`}
              </span>
            </div>
            {currentPoints.length > 0 && (drawingMode === 'polygon' || drawingMode === 'polyline' || drawingMode === 'measure') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={undoLastPoint}
                    className="h-7 text-white hover:bg-gray-700"
                  >
                    ↩️ Deshacer
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ctrl+Z o Backspace</p>
                </TooltipContent>
              </Tooltip>
            )}
            {((drawingMode === 'polygon' && currentPoints.length >= 3) || 
              ((drawingMode === 'polyline' || drawingMode === 'measure') && currentPoints.length >= 2)) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    onClick={finishDrawing}
                    className="h-7 bg-red-600 hover:bg-red-700"
                  >
                    ✓ Terminar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Presiona Enter</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={cancelDrawing}
                  className="h-7 text-white hover:bg-gray-700"
                >
                  ✕ Cancelar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Presiona ESC</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Mediciones - Parte inferior central */}
        {currentMeasurement && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[10000] bg-gray-900 border border-gray-700 rounded-lg shadow-xl px-4 py-2">
            <div className="flex items-center gap-4">
              {currentMeasurement.area && (
                <Badge variant="outline" className="text-sm bg-green-900/40 text-green-300 border-green-600">
                  Área: {currentMeasurement.area.toFixed(2)} ha
                </Badge>
              )}
              {currentMeasurement.distance && (
                <Badge variant="outline" className="text-sm bg-blue-900/40 text-blue-300 border-blue-600">
                  Distancia: {currentMeasurement.distance.toFixed(2)} km
                </Badge>
              )}
              {currentMeasurement.radius && (
                <Badge variant="outline" className="text-sm bg-purple-900/40 text-purple-300 border-purple-600">
                  Radio: {currentMeasurement.radius.toFixed(2)} km
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Contador de formas - Derecha Inferior */}
        <div className="absolute bottom-4 right-4 z-[10000] flex flex-col gap-2 items-end">
          {drawnShapes.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl px-3 py-1.5">
              <Badge variant="outline" className="text-xs bg-blue-900/40 text-blue-300 border-blue-600">
                {drawnShapes.length} {drawnShapes.length === 1 ? 'forma' : 'formas'}
              </Badge>
            </div>
          )}
          
          {/* Ayuda de atajos de teclado */}
          {drawingMode !== 'none' && (
            <div className="bg-gray-900/95 border border-gray-700 rounded-lg shadow-xl px-3 py-2 text-xs text-gray-300">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs">ESC</kbd>
                  <span>Cancelar</span>
                </div>
                {(drawingMode === 'polygon' || drawingMode === 'polyline' || drawingMode === 'measure') && (
                  <>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs">Enter</kbd>
                      <span>Terminar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs">Ctrl+Z</kbd>
                      <span>Deshacer</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Atribución - Abajo a la izquierda pequeño */}
        <div className="absolute bottom-1 left-1 z-[500] text-xs text-gray-600 bg-white/80 px-1 rounded">
          {mapLayer === 'argenmap' ? '© OpenStreetMap' : mapLayer === 'satellite' ? '© Esri' : '© OpenTopoMap'}
        </div>

        {/* Input file oculto para GPX */}
        <input
          ref={gpxInputRef}
          type="file"
          accept=".gpx"
          onChange={handleGPXUpload}
          className="hidden"
        />
        
        {/* ===== CU-20: Menú contextual de polígonos ===== */}
        {contextMenu && (
          <PolygonContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            polygonId={contextMenu.polygonId}
            polygonName={contextMenu.polygonName}
            teams={teams}
            currentAssignedTeamId={contextMenu.assignedTeamId}
            onAssignTeam={(polygonId, teamId) => {
              setPolygonAssignments(prev => ({ ...prev, [polygonId]: teamId }));
              toast.success(`Polígono asignado a ${teams.find(t => t.id === teamId)?.nombre}`);
            }}
            onUnassignTeam={(polygonId) => {
              setPolygonAssignments(prev => {
                const newAssignments = { ...prev };
                delete newAssignments[polygonId];
                return newAssignments;
              });
              toast.success('Asignación eliminada');
            }}
            onClose={() => setContextMenu(null)}
          />
        )}
        
        {/* ===== CU-21: Modal de carga GPX ===== */}
        {gpxUploadModal && (
          <GPXUploadModal
            isOpen={true}
            onClose={() => setGpxUploadModal(null)}
            teamId={gpxUploadModal.teamId}
            teamName={gpxUploadModal.teamName}
            teams={teams}
            onUpload={async (teamId, file, label) => {
              try {
                // Leer y parsear GPX
                const text = await file.text();
                const L = await import('leaflet');
                const map = leafletMapRef.current;
                const parser = new DOMParser();
                const gpxDoc = parser.parseFromString(text, 'text/xml');
                
                if (gpxDoc.querySelector('parsererror')) {
                  throw new Error('Archivo GPX inválido');
                }
                
                // Obtener color del equipo
                const team = teams.find(t => t.id === teamId);
                if (!team) throw new Error('Equipo no encontrado');
                
                const teamColor = generateTeamColor(teamId);
                
                // Crear la traza
                const newTrace: GPXTrace = {
                  id: `gpx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  teamId,
                  teamName: team.nombre,
                  label,
                  fileName: file.name,
                  uploadedAt: new Date(),
                  data: gpxDoc,
                  visible: true,
                  color: teamColor,
                };
                
                // Procesar y agregar al mapa
                const features: any[] = [];
                
                // Extraer tracks
                const tracks = gpxDoc.querySelectorAll('trk');
                tracks.forEach((track) => {
                  const points: number[][] = [];
                  track.querySelectorAll('trkpt').forEach(pt => {
                    const lat = Number(pt.getAttribute('lat'));
                    const lon = Number(pt.getAttribute('lon'));
                    points.push([lon, lat]);
                  });
                  
                  if (points.length > 0) {
                    features.push({
                      type: 'Feature',
                      properties: { name: label },
                      geometry: {
                        type: 'LineString',
                        coordinates: points
                      }
                    });
                  }
                });
                
                const geojson = {
                  type: 'FeatureCollection',
                  features
                };
                
                // Agregar al mapa
                const layer = L.geoJSON(geojson, {
                  style: {
                    color: teamColor,
                    weight: 3,
                    opacity: 0.8,
                  },
                  onEachFeature: (feature, layer) => {
                    layer.bindPopup(`<strong>${label}</strong><br/>${team.nombre}`);
                  }
                }).addTo(map);
                
                gpxTracesRef.current.push({ id: newTrace.id, layer });
                setGpxTraces(prev => [...prev, newTrace]);
                
                // Opcional: centrar en la traza
                const bounds = layer.getBounds();
                if (bounds.isValid()) {
                  map.fitBounds(bounds, { padding: [50, 50] });
                }
                
                setGpxUploadModal(null);
              } catch (error) {
                console.error('Error al cargar GPX:', error);
                throw error;
              }
            }}
          />
        )}
        
        {/* ===== CU-22: Panel de gestión de capas ===== */}
        <MapLayerManagement
          isOpen={showLayerManagement}
          onClose={() => setShowLayerManagement(false)}
          layerVisibility={layerVisibility}
          onLayerVisibilityChange={(layer, visible) => {
            setLayerVisibility(prev => ({ ...prev, [layer]: visible }));
            
            // Aplicar cambios de visibilidad
            if (layer === 'polygons' && leafletMapRef.current) {
              drawnLayersRef.current.forEach(l => {
                if (l._latlngs) { // Es un polígono
                  if (visible) {
                    l.addTo(leafletMapRef.current);
                  } else {
                    leafletMapRef.current.removeLayer(l);
                  }
                }
              });
            }
          }}
          gpxTraces={gpxTraces}
          teams={teams}
          onGPXTraceVisibilityChange={(traceId, visible) => {
            setGpxTraces(prev =>
              prev.map(t => t.id === traceId ? { ...t, visible } : t)
            );
            
            // Actualizar visibilidad en el mapa
            const traceLayer = gpxTracesRef.current.find(t => t.id === traceId);
            if (traceLayer && leafletMapRef.current) {
              if (visible) {
                traceLayer.layer.addTo(leafletMapRef.current);
              } else {
                leafletMapRef.current.removeLayer(traceLayer.layer);
              }
            }
          }}
          onGPXTraceDelete={(traceId) => {
            // Eliminar del mapa
            const traceLayer = gpxTracesRef.current.find(t => t.id === traceId);
            if (traceLayer && leafletMapRef.current) {
              leafletMapRef.current.removeLayer(traceLayer.layer);
            }
            
            // Eliminar del estado
            setGpxTraces(prev => prev.filter(t => t.id !== traceId));
            gpxTracesRef.current = gpxTracesRef.current.filter(t => t.id !== traceId);
          }}
        />

        {/* Modal para cargar archivos GPX */}
        <Dialog open={showGPXModal} onOpenChange={setShowGPXModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-purple-600" />
                Cargar Archivo GPX
              </DialogTitle>
              <DialogDescription>
                Sube archivos GPX para visualizar tracks, rutas y waypoints en el mapa.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Área de carga */}
              <div 
                onClick={() => gpxInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <UploadIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-medium mb-1">Click para seleccionar archivo GPX</p>
                <p className="text-xs text-muted-foreground">
                  Soporta archivos .gpx con tracks, rutas y waypoints
                </p>
              </div>

              {/* Lista de archivos cargados */}
              {gpxFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Archivos cargados:</p>
                  <div className="space-y-1">
                    {gpxFiles.map((fileName, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="flex-1 truncate">{fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-blue-900 mb-1">ℹ️ Información</p>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• Los tracks se mostrarán como líneas en el mapa</li>
                  <li>• Los waypoints aparecerán como marcadores</li>
                  <li>• El mapa se centrará automáticamente en el contenido</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowGPXModal(false)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
