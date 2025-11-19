import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { Badge } from "./ui/badge";
import { WeatherWidget } from "./weather-widget";
import { Activity, Clock, Users, MapPin, Navigation, Files, Shield } from "lucide-react";

interface FirefighterHeaderProps {
  activeView: string;
  loading: boolean;
  hasIncidents: boolean;
  hasError: boolean;
}

export function FirefighterHeader({ 
  activeView, 
  loading, 
  hasIncidents, 
  hasError 
}: FirefighterHeaderProps) {
  const getViewTitle = (view: string) => {
    switch (view) {
      case 'selector': return 'Gestión de incidentes';
      case 'dashboard': return 'Resumen del Incidente';
      case 'incidents': return 'Gestión de Incidentes';
      case 'map': return 'Mapa';
      case 'personnel': return 'Personal';
      case 'weather': return 'Clima';
      case 'reports': return 'Reportes';
      case 'gps': return 'GPS y Navegación';
      case 'files': return 'Archivos y Evidencias';
      case 'timeline': return 'Timeline de Eventos';
      case 'notifications': return 'Notificaciones';
      case 'logs': return 'Logs y Auditoría';
      case 'stats': return 'Análisis y Estadísticas';
      default: return 'Centro de Comando DUAR';
    }
  };

  const getViewDescription = (view: string) => {
    switch (view) {
      case 'selector': return 'Panel principal - Gestión y monitoreo de todos los incidentes';
      case 'dashboard': return 'Panel principal del incidente seleccionado';
      case 'incidents': return 'Gestión de personas desaparecidas';
      case 'map': return 'Visualización geográfica y zonas de búsqueda';
      case 'personnel': return 'Gestión del personal asignado al incidente';
      case 'weather': return 'Condiciones meteorológicas y pronósticos';
      case 'reports': return 'Archivos, timeline y logs del incidente';
      case 'gps': return 'Sistema de navegación y seguimiento GPS';
      case 'files': return 'Archivos, documentos y evidencias del incidente';
      case 'timeline': return 'Cronología de eventos del incidente';
      case 'notifications': return 'Notificaciones y alertas del incidente';
      case 'logs': return 'Logs de auditoría del incidente';
      case 'stats': return 'Reportes estadísticos y análisis de operaciones SAR';
      default: return 'Panel principal - Gestión y monitoreo de todos los incidentes SAR';
    }
  };

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'dashboard': return <Activity className="h-5 w-5 text-red-600" />;
      case 'incidents': return <div className="relative"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse absolute -top-1 -right-1"></div><Activity className="h-5 w-5 text-orange-600" /></div>;
      case 'map': return <MapPin className="h-5 w-5 text-blue-600" />;
      case 'personnel': return <div className="p-1 bg-blue-100 rounded"><Users className="h-3 w-3 text-blue-600" /></div>;
      case 'gps': return <Navigation className="h-5 w-5 text-green-600" />;
      case 'files': return <div className="p-1 bg-purple-100 rounded"><Files className="h-3 w-3 text-purple-600" /></div>;
      case 'timeline': return <Clock className="h-5 w-5 text-purple-600" />;
      case 'logs': return <div className="p-1 bg-orange-100 rounded"><Shield className="h-3 w-3 text-orange-600" /></div>;
      case 'stats': return <div className="flex items-center gap-1"><div className="w-1 h-4 bg-blue-500 rounded"></div><div className="w-1 h-2 bg-green-500 rounded"></div><div className="w-1 h-3 bg-red-500 rounded"></div></div>;
      default: return <Activity className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="border-b bg-gradient-to-r from-card/95 to-card/80 backdrop-blur supports-[backdrop-filter]:from-card/60 supports-[backdrop-filter]:to-card/40 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              {getViewIcon(activeView)}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">
                  {getViewTitle(activeView)}
                </h1>
                {activeView === 'incidents' && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    OPERATIVO
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {activeView === 'selector' ? 'Gestión y monitoreo de incidentes' : getViewDescription(activeView)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Clima y hora */}
          <div className="hidden md:flex items-center gap-4 px-3 py-2 bg-muted/50 rounded-lg">
            <WeatherWidget />
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Botones de acción */}
        </div>
      </div>
    </div>
  );
}