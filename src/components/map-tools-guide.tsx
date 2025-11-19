import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Square, 
  Circle, 
  Minus,
  MapPin,
  Edit3,
  Trash2,
  Save,
  Ruler,
  Info,
  Target,
  Layers,
  Navigation
} from 'lucide-react';

export function MapToolsGuide() {
  const tools = [
    {
      icon: Square,
      name: 'Polígono',
      color: 'text-red-600 bg-red-50',
      description: 'Dibuja áreas irregulares de rastrillaje',
      usage: 'Haz clic para agregar vértices. Doble clic o clic en el primer punto para cerrar.',
      measurement: 'Calcula área en hectáreas',
      examples: ['Sectores de búsqueda', 'Zonas de rastrillaje', 'Áreas de interés']
    },
    {
      icon: Square,
      name: 'Rectángulo',
      color: 'text-orange-600 bg-orange-50',
      description: 'Crea zonas rectangulares',
      usage: 'Haz clic y arrastra para definir el rectángulo.',
      measurement: 'Calcula área en hectáreas',
      examples: ['Grillas de búsqueda', 'Sectores uniformes', 'Cuadrantes']
    },
    {
      icon: Circle,
      name: 'Círculo',
      color: 'text-green-600 bg-green-50',
      description: 'Define radio de búsqueda circular',
      usage: 'Haz clic en el centro y arrastra para definir el radio.',
      measurement: 'Radio en km y área en hectáreas',
      examples: ['Búsqueda desde último punto conocido', 'Área de influencia', 'Radio de acción']
    },
    {
      icon: Minus,
      name: 'Línea',
      color: 'text-blue-600 bg-blue-50',
      description: 'Traza rutas y caminos',
      usage: 'Haz clic para agregar puntos. Doble clic para terminar.',
      measurement: 'Distancia total en kilómetros',
      examples: ['Rutas de rastrillaje', 'Senderos', 'Caminos de acceso']
    },
    {
      icon: MapPin,
      name: 'Marcador',
      color: 'text-purple-600 bg-purple-50',
      description: 'Marca puntos de interés',
      usage: 'Haz clic en la ubicación deseada.',
      measurement: 'Coordenadas GPS',
      examples: ['Último punto conocido', 'Campamento base', 'Puntos de reunión']
    }
  ];

  const editTools = [
    {
      icon: Edit3,
      name: 'Editar',
      description: 'Modifica polígonos existentes moviendo vértices'
    },
    {
      icon: Trash2,
      name: 'Eliminar',
      description: 'Borra formas individuales o todas a la vez'
    },
    {
      icon: Save,
      name: 'Guardar',
      description: 'Exporta tus trazados como GeoJSON'
    }
  ];

  const mapLayers = [
    {
      name: 'ArgenMap',
      description: 'Mapa vectorial con rutas, ciudades y límites provinciales',
      usage: 'Planificación general y orientación inicial',
      icon: Layers
    },
    {
      name: 'Satélite',
      description: 'Imágenes satelitales de alta resolución',
      usage: 'Reconocimiento de terreno y vegetación',
      icon: Target
    },
    {
      name: 'Topográfico',
      description: 'Mapa con curvas de nivel y relieve',
      usage: 'Operaciones en montañas y zonas con desnivel',
      icon: Navigation
    }
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Guía de Herramientas de Dibujo SAR</strong>
          <p className="text-sm mt-1">
            Estas herramientas te permiten planificar operaciones de búsqueda y rescate
            directamente sobre mapas oficiales del IGN Argentina con mediciones precisas.
          </p>
        </AlertDescription>
      </Alert>

      {/* Herramientas de dibujo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="h-5 w-5 text-red-600" />
            Herramientas de Dibujo
          </CardTitle>
          <CardDescription>
            Selecciona una herramienta del panel superior derecho del mapa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool, index) => (
              <div key={index} className={`p-4 rounded-lg border ${tool.color} bg-opacity-10`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${tool.color}`}>
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{tool.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong>Uso:</strong> {tool.usage}
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="h-3 w-3" />
                        <strong>Medición:</strong> {tool.measurement}
                      </div>
                      <div>
                        <strong>Ejemplos:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tool.examples.map((example, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Herramientas de edición */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            Herramientas de Edición
          </CardTitle>
          <CardDescription>
            Modifica y gestiona las formas dibujadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {editTools.map((tool, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <tool.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Capas de mapa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-600" />
            Capas de Mapa Base (IGN Argentina)
          </CardTitle>
          <CardDescription>
            Cambia la visualización del mapa según tus necesidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mapLayers.map((layer, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <layer.icon className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">{layer.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {layer.description}
                </p>
                <div className="text-xs">
                  <strong>Ideal para:</strong> {layer.usage}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consejos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Consejos para Operaciones SAR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Buenas Prácticas</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Usa capa topográfica en zonas montañosas</li>
                <li>• Sectores de 10-30 hectáreas son ideales</li>
                <li>• Exporta regularmente tus trazados</li>
                <li>• Nombra los sectores de forma clara</li>
                <li>• Considera tiempo de rastrillaje: 2-4h por sector</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">⚠️ Consideraciones</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Requiere conexión a Internet</li>
                <li>• Las áreas se miden en hectáreas</li>
                <li>• Las distancias en kilómetros</li>
                <li>• Verifica mediciones con GPS en campo</li>
                <li>• Ten backup en papel de los sectores</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flujo de trabajo */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Flujo de Trabajo Recomendado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </span>
              <div>
                <strong>Reconocimiento:</strong> Cambia a capa Satélite o Topográfica para analizar el terreno
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </span>
              <div>
                <strong>Punto inicial:</strong> Marca con un Marcador el último punto conocido de la persona
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </span>
              <div>
                <strong>División en sectores:</strong> Usa Polígonos para dividir el área en sectores de rastrillaje
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                4
              </span>
              <div>
                <strong>Rutas de acceso:</strong> Traza con Líneas los caminos y senderos de acceso
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                5
              </span>
              <div>
                <strong>Exportación:</strong> Descarga como GeoJSON y distribuye a los equipos
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
