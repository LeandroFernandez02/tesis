import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { SidebarTrigger } from "./ui/sidebar";
import { Incident } from "../types/incident";
import { 
  User, 
  Calendar,
  Clock,
  Edit
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { WeatherWidget } from "./weather-widget";

interface IncidentContextHeaderProps {
  incident: Incident;
  onBackToSelector: () => void;
  onEditIncident: () => void;
  activeView: string;
}

const priorityColors = {
  baja: 'bg-green-100 text-green-800 border-green-200',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  alta: 'bg-orange-100 text-orange-800 border-orange-200',
  critica: 'bg-red-100 text-red-800 border-red-200'
};

const statusColors = {
  activo: 'bg-red-100 text-red-800 border-red-200',
  inactivo: 'bg-orange-100 text-orange-800 border-orange-200',
  finalizado: 'bg-green-100 text-green-800 border-green-200'
};

const statusLabels = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  finalizado: 'Finalizado'
};

const priorityLabels = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica'
};

const categoryLabels = {
  persona_desaparecida: 'Persona Desaparecida',
  busqueda_urbana: 'Búsqueda Urbana',
  busqueda_rural: 'Búsqueda Rural',
  busqueda_montana: 'Búsqueda Montaña',
  busqueda_acuatica: 'Búsqueda Acuática',
  rescate_tecnico: 'Rescate Técnico',
  accidente_aereo: 'Accidente Aéreo',
  desastre_natural: 'Desastre Natural',
  emergencia_medica: 'Emergencia Médica',
  caso_criminal: 'Caso Criminal'
};

export function IncidentContextHeader({ 
  incident, 
  onBackToSelector, 
  onEditIncident,
  activeView 
}: IncidentContextHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeElapsed = formatDistanceToNow(new Date(incident.fechaCreacion), { 
    addSuffix: false, 
    locale: es 
  });

  return (
    <div className="border-b bg-card">
      <div className="p-4">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
          {/* Columna izquierda: Botón de sidebar centrado verticalmente */}
          <div className="flex items-center">
            <SidebarTrigger className="-ml-1" />
          </div>

          {/* Columna central: Título y fechas */}
          <div className="space-y-2.5">
            {/* Título */}
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold">{incident.titulo}</h1>
              <Badge className={statusColors[incident.estado]}>
                {statusLabels[incident.estado]}
              </Badge>
            </div>

            {/* Barra de información compacta */}
            <div className="flex items-center gap-3 text-sm">
              {/* Fecha de inicio */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Inicio:</span>
                <span className="font-medium">
                  {format(new Date(incident.fechaCreacion), "dd/MM/yy, HH:mm", { locale: es })}
                </span>
              </div>

              <Separator orientation="vertical" className="h-3.5" />

              {/* Fecha de fin o estado activo */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Fin:</span>
                {incident.fechaFinalizacion ? (
                  <span className="font-medium">
                    {format(new Date(incident.fechaFinalizacion), "dd/MM/yy, HH:mm", { locale: es })}
                  </span>
                ) : (
                  <span className="font-medium text-[rgb(0,0,0)]">
                    ACTIVO
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha: Widget de clima y hora centrado verticalmente */}
          <div className="flex items-center gap-3 px-2.5 py-2 bg-muted/50 rounded-lg">
            <WeatherWidget />
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {format(currentTime, "HH:mm:ss")}
              </span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}