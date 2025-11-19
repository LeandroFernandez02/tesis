import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator,
  BreadcrumbPage 
} from "./ui/breadcrumb";
import { Home, ChevronRight } from "lucide-react";

interface FirefighterBreadcrumbsProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function FirefighterBreadcrumbs({ activeView, onNavigate }: FirefighterBreadcrumbsProps) {
  const getViewPath = (view: string) => {
    const paths = {
      selector: [], // La gestión de incidentes es la página principal, no necesita breadcrumb
      dashboard: [{ label: 'Incidente Activo', value: 'dashboard' }],
      personnel: [{ label: 'Incidente Activo', value: 'dashboard' }, { label: 'Personal Asignado', value: 'personnel' }],
      map: [{ label: 'Incidente Activo', value: 'dashboard' }, { label: 'Mapa del Incidente', value: 'map' }],
      files: [{ label: 'Incidente Activo', value: 'dashboard' }, { label: 'Archivos y Evidencias', value: 'files' }],
      timeline: [{ label: 'Incidente Activo', value: 'dashboard' }, { label: 'Timeline de Eventos', value: 'timeline' }],
      gps: [{ label: 'Incidente Activo', value: 'dashboard' }, { label: 'GPS y Navegación', value: 'gps' }],
      'search-zones': [{ label: 'Incidente Activo', value: 'dashboard' }, { label: 'Zonas de Búsqueda', value: 'search-zones' }],
      'qr-access': [{ label: 'Incidente Activo', value: 'dashboard' }, { label: 'Acceso QR', value: 'qr-access' }],
      notifications: [{ label: 'Incidente Activo', value: 'dashboard' }, { label: 'Notificaciones', value: 'notifications' }],
      logs: [{ label: 'Incidente Activo', value: 'dashboard' }, { label: 'Logs y Auditoría', value: 'logs' }]
    };
    return paths[view as keyof typeof paths] || [];
  };

  const pathItems = getViewPath(activeView);

  // No mostrar breadcrumbs si no hay path (selector es la página principal)
  if (pathItems.length === 0) {
    return null;
  }

  return (
    <div className="px-6 py-2 border-b bg-muted/30">
      <Breadcrumb>
        <BreadcrumbList className="text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink 
              onClick={() => onNavigate('selector')} 
              className="flex items-center gap-1 cursor-pointer hover:text-red-600 transition-colors"
            >
              <Home className="h-3 w-3" />
              Gestión de Incidentes
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {pathItems.map((item, index) => (
            <div key={item.value} className="flex items-center gap-2">
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {index === pathItems.length - 1 ? (
                  <BreadcrumbPage className="font-medium text-red-600">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    onClick={() => onNavigate(item.value)} 
                    className="cursor-pointer hover:text-red-600 transition-colors"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}