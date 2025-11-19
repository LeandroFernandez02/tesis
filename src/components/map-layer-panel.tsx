import { useState } from 'react';
import { 
  Layers, 
  Map as MapIcon, 
  Mountain, 
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  Upload,
  Link as LinkIcon,
  Check,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface LayerCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  layers?: Layer[];
}

interface Layer {
  id: string;
  name: string;
  enabled: boolean;
}

interface MapLayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLayerChange?: (layerId: string, enabled: boolean) => void;
  onBaseMapChange?: (baseMapId: string) => void;
  onFileUpload?: (file: File) => void;
  currentBaseMap?: string;
}

export function MapLayerPanel({ 
  isOpen, 
  onClose, 
  onLayerChange, 
  onBaseMapChange, 
  onFileUpload, 
  currentBaseMap = 'satellite' 
}: MapLayerPanelProps) {
  const [activeTab, setActiveTab] = useState<'basemaps' | 'categories' | 'upload'>('basemaps');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const categories: LayerCategory[] = [
    {
      id: 'search-zones',
      title: 'Zonas de búsqueda',
      description: 'Áreas de operación, sectores asignados',
      icon: <MapIcon className="h-5 w-5" />,
      layers: [
        { id: 'current-zones', name: 'Zonas actuales', enabled: true },
        { id: 'historical-zones', name: 'Zonas históricas', enabled: false },
      ]
    },
    {
      id: 'landmarks',
      title: 'Puntos de referencia',
      description: 'Refugios, senderos, puntos de agua',
      icon: <Mountain className="h-5 w-5" />,
      layers: [
        { id: 'shelters', name: 'Refugios', enabled: true },
        { id: 'trails', name: 'Senderos', enabled: false },
        { id: 'water-sources', name: 'Fuentes de agua', enabled: false },
      ]
    },
    {
      id: 'emergency',
      title: 'Infraestructura de emergencia',
      description: 'Hospitales, estaciones de bomberos',
      icon: <FileText className="h-5 w-5" />,
      layers: [
        { id: 'hospitals', name: 'Hospitales', enabled: true },
        { id: 'fire-stations', name: 'Cuarteles de bomberos', enabled: true },
        { id: 'police-stations', name: 'Comisarías', enabled: false },
      ]
    },
  ];

  const baseMaps = [
    { 
      id: 'argenmap', 
      name: 'Argenmap', 
      thumbnail: '🗺️',
      description: 'Mapa base de Argentina'
    },
    { 
      id: 'topographic', 
      name: 'Argenmap topográfico', 
      thumbnail: '⛰️',
      description: 'Mapa con curvas de nivel'
    },
    { 
      id: 'satellite', 
      name: 'Imágenes satelitales Esri', 
      thumbnail: '🛰️',
      description: 'Vista satelital de alta resolución'
    },
  ];

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleBaseMapChange = (baseMapId: string) => {
    if (onBaseMapChange) {
      onBaseMapChange(baseMapId);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📤 handleFileUpload llamado');
    const file = event.target.files?.[0];
    console.log('📂 Archivo seleccionado:', file?.name, file?.type, file?.size);
    
    if (file && onFileUpload) {
      console.log('✅ Llamando a onFileUpload con archivo:', file.name);
      onFileUpload(file);
      
      // Resetear el input para permitir subir el mismo archivo de nuevo
      event.target.value = '';
    } else if (!file) {
      console.warn('⚠️ No se seleccionó ningún archivo');
    } else if (!onFileUpload) {
      console.error('❌ onFileUpload no está definido');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 z-[9999] rounded-lg"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute top-0 left-0 h-full w-[380px] bg-gray-950 border-r border-gray-800 z-[10000] flex flex-col shadow-2xl rounded-l-lg overflow-hidden animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 p-3 border-b border-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded backdrop-blur-sm">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-white font-semibold">Capas del Mapa</h2>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-gray-900 border-b border-gray-800">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveTab('basemaps')}
            className={`flex-1 h-8 text-xs ${
              activeTab === 'basemaps' 
                ? 'bg-red-600 text-white hover:bg-red-600' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <MapIcon className="h-3.5 w-3.5 mr-1.5" />
            Mapas base
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveTab('categories')}
            className={`flex-1 h-8 text-xs ${
              activeTab === 'categories' 
                ? 'bg-red-600 text-white hover:bg-red-600' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            Categorías
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 h-8 text-xs ${
              activeTab === 'upload' 
                ? 'bg-red-600 text-white hover:bg-red-600' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Cargar
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {/* Mapas Base */}
          {activeTab === 'basemaps' && (
            <div className="p-3 space-y-2">
              {baseMaps.map((baseMap) => (
                <div
                  key={baseMap.id}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    currentBaseMap === baseMap.id || (currentBaseMap === 'argenmap' && baseMap.id === 'argenmap')
                      ? 'border-green-500 bg-green-950/30'
                      : 'border-gray-800 hover:border-gray-700 bg-gray-900'
                  }`}
                  onClick={() => handleBaseMapChange(baseMap.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center text-2xl">
                      {baseMap.thumbnail}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate text-white">{baseMap.name}</h4>
                        {(currentBaseMap === baseMap.id || (currentBaseMap === 'argenmap' && baseMap.id === 'argenmap')) && (
                          <Badge className="bg-green-600 text-white border-green-500 text-xs py-0 h-5">
                            <Check className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {baseMap.description}
                      </p>
                    </div>

                    {/* Info button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 flex-shrink-0 text-gray-400 hover:text-red-400 hover:bg-gray-800"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Categorías de Capas */}
          {activeTab === 'categories' && (
            <div className="p-2">
              {categories.map((category) => (
                <div key={category.id} className="mb-2">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white p-3 rounded-lg flex items-start gap-3 transition-all"
                  >
                    <div className="mt-0.5">{category.icon}</div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-sm">{category.title}</h3>
                      <p className="text-xs text-white/80 mt-0.5">{category.description}</p>
                    </div>
                    {expandedCategories.has(category.id) ? (
                      <ChevronUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                  </button>

                  {/* Layers dentro de la categoría */}
                  {expandedCategories.has(category.id) && category.layers && (
                    <div className="mt-2 space-y-1 ml-2">
                      {category.layers.map((layer) => (
                        <div
                          key={layer.id}
                          className="bg-gray-900 border border-gray-800 rounded p-2.5 flex items-center gap-2"
                        >
                          <Switch
                            checked={layer.enabled}
                            onCheckedChange={(checked) => {
                              if (onLayerChange) {
                                onLayerChange(layer.id, checked);
                              }
                            }}
                          />
                          <span className="text-sm flex-1 text-white">{layer.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-800"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload de Capas */}
          {activeTab === 'upload' && (
            <div className="p-4">
              <div className="bg-gray-900 rounded-lg p-6 border-2 border-dashed border-gray-700">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-r from-red-900 to-red-800 p-4 rounded-full">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Agregar capas</h3>
                    <p className="text-xs text-gray-400">
                      Formatos: KML, GeoJSON, GPX, SHP (.zip), WKT (.txt), TopoJSON (.json)
                    </p>
                  </div>

                  <div className="pt-2">
                    <label htmlFor="file-upload">
                      <Button
                        asChild
                        className="bg-red-600 hover:bg-red-700 cursor-pointer"
                      >
                        <span>
                          <FileText className="h-4 w-4 mr-2" />
                          Abrir Archivo
                        </span>
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".kml,.geojson,.json,.gpx,.zip,.txt,.wkt"
                      onChange={handleFileUpload}
                    />
                  </div>

                  <Separator className="my-3 bg-gray-800" />

                  <div>
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Agregar desde URL
                    </Button>
                  </div>
                </div>
              </div>

              {/* Capas cargadas */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-white">Capas cargadas</h4>
                <div className="text-xs text-gray-400 text-center py-4 bg-gray-900 rounded border border-gray-800">
                  No hay capas cargadas
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2.5 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Dirección de Bomberos DUAR</span>
            
          </div>
        </div>
      </div>
    </>
  );
}
