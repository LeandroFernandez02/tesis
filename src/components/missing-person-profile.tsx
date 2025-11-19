import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  Phone, 
  AlertCircle,
  Edit,
  Camera,
  FileText,
  Heart,
  Shirt,
  Eye,
  Info,
  Users,
  Navigation,
  Search,
  UserCheck
} from 'lucide-react';
import { MissingPerson } from '../types/incident';
import { unsplash_tool } from '../types/unsplash';

interface MissingPersonProfileProps {
  person: MissingPerson;
  onEdit?: () => void;
  onUpdatePhoto?: (photoUrl: string) => void;
  className?: string;
  compact?: boolean;
}

export function MissingPersonProfile({ 
  person, 
  onEdit, 
  onUpdatePhoto, 
  className,
  compact = false 
}: MissingPersonProfileProps) {
  const [activeTab, setActiveTab] = useState('general');

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getGenderColor = (genero?: string) => {
    switch (genero) {
      case 'masculino': return 'bg-blue-100 text-blue-800';
      case 'femenino': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (fecha: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - fecha.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else {
      return 'Hace menos de 1 hora';
    }
  };

  const getPriorityLevel = (horasDesaparecido: number) => {
    if (horasDesaparecido >= 72) return { level: 'critical', text: 'Crítico', color: 'bg-red-600' };
    if (horasDesaparecido >= 48) return { level: 'high', text: 'Alto', color: 'bg-orange-600' };
    if (horasDesaparecido >= 24) return { level: 'medium', text: 'Medio', color: 'bg-yellow-600' };
    return { level: 'low', text: 'Reciente', color: 'bg-blue-600' };
  };

  const horasDesaparecido = Math.floor(
    (new Date().getTime() - person.ultimaVezVisto.fecha.getTime()) / (1000 * 60 * 60)
  );
  const priority = getPriorityLevel(horasDesaparecido);

  if (compact) {
    return (
      <Card className={`border-l-4 border-l-red-500 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-red-200">
              <AvatarImage src={person.foto} alt={`${person.nombre} ${person.apellido}`} />
              <AvatarFallback className="bg-red-100 text-red-700 text-lg font-semibold">
                {getInitials(person.nombre, person.apellido)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{person.nombre} {person.apellido}</h3>
                {person.edad && <Badge variant="outline">{person.edad} años</Badge>}
                {person.genero && (
                  <Badge className={getGenderColor(person.genero)}>
                    {person.genero}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeAgo(person.ultimaVezVisto.fecha)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{person.ultimaVezVisto.ubicacion}</span>
                </div>
              </div>
              
              <Badge className={`${priority.color} text-white`}>
                {priority.text} - {horasDesaparecido}h desaparecido
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con foto y datos básicos */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-red-600" />
              <CardTitle>Persona Desaparecida</CardTitle>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Foto de perfil */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-red-200 shadow-lg">
                <AvatarImage src={person.foto} alt={`${person.nombre} ${person.apellido}`} />
                <AvatarFallback className="bg-red-100 text-red-700 text-3xl font-semibold">
                  {getInitials(person.nombre, person.apellido)}
                </AvatarFallback>
              </Avatar>
              {onUpdatePhoto && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white shadow-lg"
                  onClick={() => {
                    // Aquí podrías implementar la subida de foto
                    console.log('Cambiar foto');
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Información básica */}
            <div className="flex-1">
              <div className="space-y-4">
                {/* Nombre y datos principales */}
                <div>
                  <h2 className="text-2xl font-bold text-red-700 mb-2">
                    {person.nombre} {person.apellido}
                  </h2>
                  <div className="flex items-center gap-3 mb-3">
                    {person.edad && (
                      <Badge variant="outline" className="text-base">
                        <Calendar className="h-4 w-4 mr-1" />
                        {person.edad} años
                      </Badge>
                    )}
                    {person.genero && (
                      <Badge className={getGenderColor(person.genero)}>
                        <User className="h-4 w-4 mr-1" />
                        {person.genero}
                      </Badge>
                    )}
                    <Badge className={`${priority.color} text-white`}>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {priority.text}
                    </Badge>
                  </div>
                </div>

                {/* Última vez visto */}
                <Alert className="border-orange-200 bg-orange-50">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium text-orange-800">
                        Última vez visto: {formatTimeAgo(person.ultimaVezVisto.fecha)}
                      </div>
                      <div className="text-sm text-orange-700">
                        <strong>Fecha:</strong> {person.ultimaVezVisto.fecha.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-orange-700">
                        <MapPin className="h-4 w-4" />
                        <strong>Ubicación:</strong> {person.ultimaVezVisto.ubicacion}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Contacto familiar */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Contacto Familiar</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <div><strong>{person.contactoFamiliar.nombre}</strong></div>
                    <div>{person.contactoFamiliar.relacion}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      <a 
                        href={`tel:${person.contactoFamiliar.telefono}`}
                        className="font-medium hover:underline"
                      >
                        {person.contactoFamiliar.telefono}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información detallada en pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="descripcion">Descripción</TabsTrigger>
          <TabsTrigger value="medical">Médico</TabsTrigger>
          <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {person.descripcionFisica && (
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    Descripción Física
                  </h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                    {person.descripcionFisica}
                  </p>
                </div>
              )}

              {person.vestimenta && (
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Shirt className="h-4 w-4" />
                    Vestimenta
                  </h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                    {person.vestimenta}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="descripcion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Descripción Detallada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Edad</label>
                  <div className="mt-1 p-2 bg-muted rounded-md">
                    {person.edad || 'No especificada'} años
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Género</label>
                  <div className="mt-1">
                    <Badge className={getGenderColor(person.genero)}>
                      {person.genero || 'No especificado'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium">Descripción Física Completa</label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p>{person.descripcionFisica || 'No disponible'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Vestimenta al Desaparecer</label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p>{person.vestimenta || 'No especificada'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Información Médica
              </CardTitle>
              <CardDescription>
                Información médica relevante para la búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {person.condicionesMedicas ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Condiciones Médicas:</strong>
                    <p className="mt-1">{person.condicionesMedicas}</p>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-muted-foreground text-center p-4 bg-muted rounded-lg">
                  No se han reportado condiciones médicas específicas
                </div>
              )}

              {person.medicamentos ? (
                <div>
                  <h4 className="font-medium mb-2">Medicamentos</h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">{person.medicamentos}</p>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-center p-4 bg-muted rounded-lg">
                  No se han reportado medicamentos específicos
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ubicacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Información de Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-3">Última Ubicación Conocida</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {person.ultimaVezVisto.fecha.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-orange-700">
                    <Clock className="h-4 w-4" />
                    <span>
                      {person.ultimaVezVisto.fecha.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {formatTimeAgo(person.ultimaVezVisto.fecha)}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-orange-700">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <div>
                      <div className="font-medium">{person.ultimaVezVisto.ubicacion}</div>
                      {person.ultimaVezVisto.coordenadas && (
                        <div className="text-sm text-orange-600 mt-1">
                          Coordenadas: {person.ultimaVezVisto.coordenadas.lat.toFixed(6)}, {person.ultimaVezVisto.coordenadas.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapa placeholder */}
              <div className="h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Mapa de última ubicación conocida</p>
                  {person.ultimaVezVisto.coordenadas && (
                    <p className="text-sm text-gray-400 mt-1">
                      {person.ultimaVezVisto.coordenadas.lat.toFixed(4)}, {person.ultimaVezVisto.coordenadas.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}