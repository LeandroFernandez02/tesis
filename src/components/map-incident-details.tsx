import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Incident } from '../types/incident';
import { MapPin, Clock, User, AlertTriangle, Navigation2, Phone } from 'lucide-react';

interface MapIncidentDetailsProps {
  incident: Incident | null;
  userLocation?: { lat: number; lng: number } | null;
  onClose: () => void;
  onNavigate?: (incident: Incident) => void;
  className?: string;
}

export function MapIncidentDetails({ 
  incident, 
  userLocation, 
  onClose, 
  onNavigate,
  className 
}: MapIncidentDetailsProps) {
  if (!incident) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Crítica': return 'bg-red-600 text-white';
      case 'Alta': return 'bg-orange-500 text-white';
      case 'Media': return 'bg-yellow-500 text-white';
      case 'Baja': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'text-red-600 bg-red-50 border-red-200';
      case 'Inactivo': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Finalizado': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <Card className={`p-4 max-w-sm ${className}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-medium">Detalles del Incidente</h4>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Título y prioridad */}
        <div className="space-y-2">
          <h3 className="font-medium text-lg leading-tight">{incident.titulo}</h3>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(incident.prioridad)}>
              {incident.prioridad}
            </Badge>
            <Badge variant="outline" className={getStatusColor(incident.estado)}>
              {incident.estado}
            </Badge>
          </div>
        </div>

        {/* Información básica */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{incident.ubicacion}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(incident.fechaCreacion)}</span>
          </div>

          {incident.tecnicoAsignado && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{incident.tecnicoAsignado}</span>
            </div>
          )}

          {userLocation && (
            <div className="flex items-center gap-2">
              <Navigation2 className="h-4 w-4 text-muted-foreground" />
              <span>
                Distancia: {calculateDistance(
                  userLocation.lat, 
                  userLocation.lng, 
                  19.4326, // Coordenada simulada del incidente
                  -99.1332
                ).toFixed(1)} km
              </span>
            </div>
          )}
        </div>

        {/* Descripción */}
        <div className="space-y-1">
          <h5 className="font-medium text-sm">Descripción:</h5>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {incident.descripcion}
          </p>
        </div>

        {/* Categoría */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Categoría:</span>
          <Badge variant="secondary">{incident.categoria}</Badge>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          {onNavigate && (
            <Button 
              size="sm" 
              onClick={() => onNavigate(incident)}
              className="flex-1"
            >
              <Navigation2 className="h-4 w-4 mr-1" />
              Navegar
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Simular llamada de emergencia
              window.open(`tel:911`, '_self');
            }}
          >
            <Phone className="h-4 w-4 mr-1" />
            911
          </Button>
        </div>

        {/* Información adicional para SAR */}
        {incident.categoria === 'Persona Desaparecida' && (
          <div className="border-t pt-3 space-y-2">
            <h5 className="font-medium text-sm text-red-600">Info SAR:</h5>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Edad: No especificada</p>
              <p>• Última ubicación conocida: {incident.ubicacion}</p>
              <p>• Tiempo desaparecido: Calculando...</p>
              <p>• Equipos asignados: {incident.tecnicoAsignado || 'Pendiente'}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}