import { useState } from 'react';
import { Clock, User, MessageSquare, Edit, CheckCircle, AlertTriangle, FileText, Camera, MapPin } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

export interface TimelineEvent {
  id: string;
  type: 'created' | 'status_change' | 'priority_change' | 'assignment' | 'comment' | 'file_upload' | 'location_update';
  timestamp: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  description: string;
  details?: {
    oldValue?: string;
    newValue?: string;
    comment?: string;
    fileName?: string;
    fileType?: string;
    location?: string;
  };
  priority?: 'high' | 'medium' | 'low';
}

interface IncidentTimelineProps {
  incidentId: string;
  events: TimelineEvent[];
  onAddComment?: (comment: string) => Promise<void>;
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  className?: string;
}

export function IncidentTimeline({ 
  incidentId, 
  events, 
  onAddComment,
  currentUser,
  className 
}: IncidentTimelineProps) {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const handleAddComment = async () => {
    if (!newComment.trim() || !onAddComment) return;

    setIsAddingComment(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'status_change': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'priority_change': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'assignment': return <User className="h-4 w-4 text-blue-600" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-gray-600" />;
      case 'file_upload': return <Camera className="h-4 w-4 text-purple-600" />;
      case 'location_update': return <MapPin className="h-4 w-4 text-teal-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'created': return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'status_change': return 'border-green-200 bg-green-50 dark:bg-green-950/20';
      case 'priority_change': return 'border-orange-200 bg-orange-50 dark:bg-orange-950/20';
      case 'assignment': return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20';
      case 'comment': return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20';
      case 'file_upload': return 'border-purple-200 bg-purple-50 dark:bg-purple-950/20';
      case 'location_update': return 'border-teal-200 bg-teal-50 dark:bg-teal-950/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Hace un momento';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minutos`;
    if (diffMinutes < 1440) return `Hace ${Math.floor(diffMinutes / 60)} horas`;
    
    const days = Math.floor(diffMinutes / 1440);
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTitle = (event: TimelineEvent) => {
    switch (event.type) {
      case 'created': return 'Incidente creado';
      case 'status_change': return 'Estado actualizado';
      case 'priority_change': return 'Prioridad modificada';
      case 'assignment': return 'Técnico asignado';
      case 'comment': return 'Comentario agregado';
      case 'file_upload': return 'Archivo subido';
      case 'location_update': return 'Ubicación actualizada';
      default: return 'Actividad';
    }
  };

  const getPriorityBadgeColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            <h3>Timeline del Incidente</h3>
          </div>
          <Badge variant="outline">
            {events.length} eventos
          </Badge>
        </div>

        {/* Formulario para agregar comentario */}
        {onAddComment && currentUser && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <div className="h-full w-full bg-red-600 text-white flex items-center justify-center text-sm font-medium">
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.role}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Textarea
                placeholder="Agregar un comentario al incidente..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isAddingComment}
                  size="sm"
                >
                  {isAddingComment ? 'Agregando...' : 'Agregar Comentario'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline de eventos */}
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay actividad registrada</p>
              <p className="text-sm">Los eventos del incidente aparecerán aquí</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {sortedEvents.map((event, index) => (
                  <div key={event.id} className="relative">
                    {/* Línea de conexión */}
                    {index < sortedEvents.length - 1 && (
                      <div className="absolute left-6 top-12 w-px h-8 bg-border" />
                    )}

                    <div className={`flex gap-4 p-4 rounded-lg border ${getEventColor(event.type)}`}>
                      {/* Icono del evento */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-current flex items-center justify-center">
                          {getEventIcon(event.type)}
                        </div>
                      </div>

                      {/* Contenido del evento */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{getEventTitle(event)}</h4>
                              {event.priority && (
                                <Badge 
                                  variant="outline"
                                  className={`text-xs ${getPriorityBadgeColor(event.priority)}`}
                                >
                                  {event.priority === 'high' ? 'Alta' : 
                                   event.priority === 'medium' ? 'Media' : 'Baja'}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>

                            {/* Detalles adicionales */}
                            {event.details && (
                              <div className="space-y-2">
                                {event.details.oldValue && event.details.newValue && (
                                  <div className="text-xs">
                                    <span className="text-muted-foreground">Cambió de </span>
                                    <Badge variant="outline" className="text-xs mr-2">
                                      {event.details.oldValue}
                                    </Badge>
                                    <span className="text-muted-foreground">a </span>
                                    <Badge variant="outline" className="text-xs">
                                      {event.details.newValue}
                                    </Badge>
                                  </div>
                                )}
                                
                                {event.details.comment && (
                                  <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                                    <MessageSquare className="h-4 w-4 inline mr-2 text-muted-foreground" />
                                    {event.details.comment}
                                  </div>
                                )}

                                {event.details.fileName && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{event.details.fileName}</span>
                                    {event.details.fileType && (
                                      <Badge variant="outline" className="text-xs">
                                        {event.details.fileType}
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {event.details.location && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{event.details.location}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground text-right">
                            {formatTimestamp(event.timestamp)}
                          </div>
                        </div>

                        {/* Información del usuario */}
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <div className="h-full w-full bg-red-600 text-white flex items-center justify-center text-xs font-medium">
                              {event.user.name.substring(0, 2).toUpperCase()}
                            </div>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {event.user.name} • {event.user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Estadísticas del timeline */}
        <Separator />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-600">
              {events.filter(e => e.type === 'comment').length}
            </p>
            <p className="text-xs text-muted-foreground">Comentarios</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {events.filter(e => e.type === 'status_change').length}
            </p>
            <p className="text-xs text-muted-foreground">Cambios Estado</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.type === 'assignment').length}
            </p>
            <p className="text-xs text-muted-foreground">Asignaciones</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {events.filter(e => e.type === 'file_upload').length}
            </p>
            <p className="text-xs text-muted-foreground">Archivos</p>
          </div>
        </div>
      </div>
    </Card>
  );
}