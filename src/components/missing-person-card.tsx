import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  User, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle,
  Eye,
  Search
} from 'lucide-react';
import { MissingPerson } from '../types/incident';

interface MissingPersonCardProps {
  person: MissingPerson;
  incidentId: string;
  incidentTitle: string;
  onViewDetails?: () => void;
  className?: string;
}

export function MissingPersonCard({ 
  person, 
  incidentId, 
  incidentTitle, 
  onViewDetails, 
  className 
}: MissingPersonCardProps) {
  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const formatTimeAgo = (fecha: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - fecha.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else {
      return 'Menos de 1 hora';
    }
  };

  const getUrgencyLevel = (horasDesaparecido: number) => {
    if (horasDesaparecido >= 72) return { 
      level: 'critical', 
      text: 'Crítico', 
      color: 'bg-red-600 text-white',
      bgColor: 'bg-red-50 border-red-200' 
    };
    if (horasDesaparecido >= 48) return { 
      level: 'high', 
      text: 'Urgente', 
      color: 'bg-orange-600 text-white',
      bgColor: 'bg-orange-50 border-orange-200' 
    };
    if (horasDesaparecido >= 24) return { 
      level: 'medium', 
      text: 'Prioritario', 
      color: 'bg-yellow-600 text-white',
      bgColor: 'bg-yellow-50 border-yellow-200' 
    };
    return { 
      level: 'recent', 
      text: 'Reciente', 
      color: 'bg-blue-600 text-white',
      bgColor: 'bg-blue-50 border-blue-200' 
    };
  };

  const horasDesaparecido = Math.floor(
    (new Date().getTime() - person.ultimaVezVisto.fecha.getTime()) / (1000 * 60 * 60)
  );
  const urgency = getUrgencyLevel(horasDesaparecido);

  return (
    <Card className={`border-l-4 border-l-red-500 ${urgency.bgColor} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-red-600" />
            PERSONA DESAPARECIDA
          </CardTitle>
          <Badge className={urgency.color}>
            <AlertCircle className="h-3 w-3 mr-1" />
            {urgency.text}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información principal */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-red-200 shadow-sm">
            <AvatarImage src={person.foto} alt={`${person.nombre} ${person.apellido}`} />
            <AvatarFallback className="bg-red-100 text-red-700 text-lg font-semibold">
              {getInitials(person.nombre, person.apellido)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-red-800 mb-1">
              {person.nombre} {person.apellido}
            </h3>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              {person.edad && (
                <Badge variant="outline" className="text-xs">
                  {person.edad} años
                </Badge>
              )}
              {person.genero && (
                <Badge variant="outline" className="text-xs capitalize">
                  {person.genero}
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-orange-700">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Desaparecido hace {formatTimeAgo(person.ultimaVezVisto.fecha)}</span>
              </div>
              
              <div className="flex items-start gap-2 text-orange-700">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="truncate">{person.ultimaVezVisto.ubicacion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional en formato compacto */}
        <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg space-y-2">
          <div className="text-sm">
            <span className="font-medium text-gray-600">Descripción: </span>
            <span className="text-gray-800 line-clamp-2">
              {person.descripcionFisica.length > 80 
                ? `${person.descripcionFisica.substring(0, 80)}...`
                : person.descripcionFisica
              }
            </span>
          </div>
          
          {person.vestimenta && (
            <div className="text-sm">
              <span className="font-medium text-gray-600">Vestimenta: </span>
              <span className="text-gray-800 line-clamp-1">
                {person.vestimenta.length > 60 
                  ? `${person.vestimenta.substring(0, 60)}...`
                  : person.vestimenta
                }
              </span>
            </div>
          )}
        </div>

        {/* Contacto de emergencia */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-blue-600" />
            <div>
              <span className="font-medium text-blue-800">{person.contactoFamiliar.nombre}</span>
              <span className="text-gray-600 ml-1">({person.contactoFamiliar.relacion})</span>
            </div>
          </div>
          
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails} className="ml-2">
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalles
            </Button>
          )}
        </div>

        {/* ID de la operación */}
        <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
          <span className="font-medium">Operación:</span> #{incidentId} - {incidentTitle}
        </div>
      </CardContent>
    </Card>
  );
}