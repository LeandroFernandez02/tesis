
import { 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar
} from "./ui/sidebar";

import bomberosLogo from 'figma:asset/71b6fee7fff6fabc9349c054b0ad949698a2dffe.png';
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  BarChart3, 
  AlertTriangle, 
  Map, 
  Files, 
  History, 
  Flame,
  Shield,
  Activity,
  Users,
  HelpCircle,
  LogOut,
  Siren,
  Cloud,
  FileText,
  User
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "./auth/auth-wrapper";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface FirefighterSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  selectedIncident?: any; // Incidente seleccionado
  onBackToSelector?: () => void; // Función para volver al selector
  incidentsCount: number;
  filesCount: number;
  timelineCount: number;
}

export function FirefighterSidebar({ 
  activeView, 
  onViewChange, 
  selectedIncident,
  onBackToSelector,
  incidentsCount,
  filesCount,
  timelineCount
}: FirefighterSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { user, logout } = useAuth();
  
  // Sin secciones expandibles - navegación directa

  // Opciones para el panel principal (sin incidente seleccionado)
  const globalMenuItems = [
    { 
      id: 'selector', 
      label: 'Panel Principal', 
      icon: AlertTriangle, 
      badge: incidentsCount,
      description: 'Dashboard de incidentes'
    }
  ];

  // Menú principal para incidentes (solo cuando hay incidente seleccionado)
  // Navegación directa sin submenús desplegables
  const incidentMenuItems = selectedIncident ? [
    { 
      id: 'personnel', 
      label: 'Personal', 
      icon: Users, 
      badge: selectedIncident?.personalAsignado?.length || 0,
      description: 'Gestión de personal del incidente'
    },
    { 
      id: 'map', 
      label: 'Mapa', 
      icon: Map, 
      badge: selectedIncident?.areasBusqueda?.length || 0,
      description: 'Vista geográfica y zonas de búsqueda'
    },
    { 
      id: 'weather', 
      label: 'Clima', 
      icon: Cloud, 
      badge: null,
      description: 'Condiciones meteorológicas'
    },
    { 
      id: 'reports', 
      label: 'Reportes', 
      icon: FileText, 
      badge: filesCount + timelineCount,
      description: 'Archivos, timeline y logs'
    }
  ] : [];







  const renderMenuItem = (item: any, isActive: boolean) => (
    <SidebarMenuItem key={item.id} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center">
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => onViewChange(item.id)}
        tooltip={item.label}
        className="group-data-[collapsible=icon]:!w-8 group-data-[collapsible=icon]:!h-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!min-w-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center"
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
        {item.badge && item.badge > 0 && (
          <Badge 
            variant="secondary" 
            className="ml-auto group-data-[collapsible=icon]:hidden bg-red-100 text-red-700 border-red-200"
          >
            {item.badge}
          </Badge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <>
      <SidebarHeader className="border-b border-border p-[2px]">
        <div 
          className={`${selectedIncident ? 'cursor-pointer hover:bg-sidebar-accent/50 transition-colors rounded-lg' : ''} ${isCollapsed ? 'flex flex-col items-center gap-2 py-4 px-2' : 'flex items-center gap-3 p-4'}`}
          onClick={selectedIncident ? onBackToSelector : undefined}
          role={selectedIncident ? 'button' : undefined}
          tabIndex={selectedIncident ? 0 : undefined}
          onKeyDown={selectedIncident ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onBackToSelector?.();
            }
          } : undefined}
        >
          <div className="flex-shrink-0">
            <img 
              src={bomberosLogo} 
              alt="Logo Bomberos Córdoba" 
              className={isCollapsed ? "h-12 w-12 object-contain" : "h-14 w-14 object-contain"}
            />
          </div>
          {isCollapsed ? (
            <h1 className="font-bold text-sm text-center text-[13px]">DUAR</h1>
          ) : (
            <div className="flex-1">
              <h1 className="font-bold text-sm text-[14px]">Direccion de Bomberos DUAR</h1>
              <p className="text-xs text-muted-foreground">Software de Gestión de Búsqueda y Rastreo</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-red-600 font-semibold flex items-center gap-2">
            <Siren className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">
              {selectedIncident ? 'INCIDENTE ACTIVO' : 'OPERACIONES DUAR'}
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {!selectedIncident ? (
                // Vista del panel principal - solo opciones básicas
                <>
                  {globalMenuItems.map((item) => renderMenuItem(item, activeView === item.id))}
                </>
              ) : (
                // Vista de incidente activo - navegación directa
                <>
                  {incidentMenuItems.map((item) => renderMenuItem(item, activeView === item.id))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border">
        <TooltipProvider>
          {/* Controles de la interfaz */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-1' : 'gap-2'}`}>
            <ThemeToggle />
          </div>

          {/* Usuario y logout */}
          {!isCollapsed && user && (
            <div className="pt-2 mt-2 border-t border-border space-y-2">
              <div className="px-2">
                <p className="text-xs font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
              </div>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Ayuda
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => logout()}
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Salir
                </Button>
              </div>
            </div>
          )}

          {/* Usuario colapsado */}
          {isCollapsed && user && (
            <div className="space-y-1 flex flex-col items-center pt-2 mt-2 border-t border-border">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Ayuda</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:text-destructive"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Cerrar sesión</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </TooltipProvider>
      </SidebarFooter>
    </>
  );
}