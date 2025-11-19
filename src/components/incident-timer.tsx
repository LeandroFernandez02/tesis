import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, Play, Pause, RotateCcw, FileText } from 'lucide-react';
import { Incident } from '../types/incident';

interface IncidentTimerProps {
  incident: Incident;
  onUpdateIncident: (updates: Partial<Incident>) => void;
  className?: string;
}

export function IncidentTimer({ incident, onUpdateIncident, className = '' }: IncidentTimerProps) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);

  // Calcular tiempo transcurrido
  useEffect(() => {
    const tiempoInicio = incident.tiempoInicio ? new Date(incident.tiempoInicio) : null;
    const tiempoBase = incident.tiempoTranscurrido || 0;
    
    if (tiempoInicio && !incident.pausado) {
      const ahora = new Date();
      const tiempoActual = tiempoBase + (ahora.getTime() - tiempoInicio.getTime());
      setCurrentTime(tiempoActual);
      setIsRunning(true);
    } else {
      setCurrentTime(tiempoBase);
      setIsRunning(false);
    }
  }, [incident.tiempoInicio, incident.tiempoTranscurrido, incident.pausado]);

  // Actualizar el contador cada segundo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !incident.pausado) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1000);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, incident.pausado]);

  // Formatear tiempo en HH:MM:SS
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Obtener color según el tiempo transcurrido
  const getTimeColor = (milliseconds: number) => {
    const hours = milliseconds / (1000 * 60 * 60);
    if (hours < 1) return 'text-green-600';
    if (hours < 4) return 'text-yellow-600';
    if (hours < 8) return 'text-orange-600';
    return 'text-red-600';
  };

  // Iniciar/reanudar contador
  const handleStart = () => {
    const ahora = new Date();
    if (!incident.tiempoInicio) {
      // Primer inicio
      onUpdateIncident({
        tiempoInicio: ahora,
        tiempoTranscurrido: 0,
        pausado: false
      });
    } else {
      // Reanudar
      onUpdateIncident({
        tiempoInicio: ahora,
        pausado: false
      });
    }
  };

  // Pausar contador
  const handlePause = () => {
    const tiempoInicio = incident.tiempoInicio ? new Date(incident.tiempoInicio) : new Date();
    const tiempoBase = incident.tiempoTranscurrido || 0;
    const ahora = new Date();
    const tiempoTotal = tiempoBase + (ahora.getTime() - tiempoInicio.getTime());
    
    onUpdateIncident({
      tiempoTranscurrido: tiempoTotal,
      pausado: true
    });
  };

  // Reiniciar contador
  const handleReset = () => {
    onUpdateIncident({
      tiempoInicio: undefined,
      tiempoTranscurrido: 0,
      pausado: false
    });
  };

  // Generar reporte de tiempo
  const handleGenerateReport = () => {
    const tiempoTotal = currentTime;
    const horas = Math.floor(tiempoTotal / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoTotal % (1000 * 60 * 60)) / (1000 * 60));
    
    const fechaInicio = incident.tiempoInicio ? new Date(incident.tiempoInicio) : new Date();
    const fechaFormateada = fechaInicio.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const reporte = `
REPORTE DE TIEMPO - INCIDENTE SAR
Jefatura de Bomberos de Córdoba

Incidente: ${incident.titulo}
ID: ${incident.id}
Categoría: ${incident.categoria}
Prioridad: ${incident.prioridad}

TIEMPO DE OPERACIÓN:
- Inicio: ${fechaFormateada}
- Tiempo total: ${horas}h ${minutos}m
- Estado actual: ${incident.estado}

Personal asignado: ${incident.personalAsignado?.length || 0} efectivos
Equipos desplegados: ${incident.equiposAsignados?.length || 0} equipos

Generado el: ${new Date().toLocaleDateString('es-AR', {
  day: '2-digit',
  month: '2-digit', 
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
    `.trim();

    // Crear blob y descargar
    const blob = new Blob([reporte], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-tiempo-${incident.id}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={`border-l-4 border-l-primary ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Contador de Tiempo
          {incident.pausado && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Pausado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display del tiempo */}
        <div className="text-center">
          <div className={`text-4xl font-mono font-bold ${getTimeColor(currentTime)}`}>
            {formatTime(currentTime)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {incident.tiempoInicio 
              ? `Iniciado: ${new Date(incident.tiempoInicio).toLocaleTimeString('es-AR')}`
              : 'No iniciado'
            }
          </p>
        </div>

        {/* Controles */}
        <div className="flex gap-2 justify-center">
          {!isRunning || incident.pausado ? (
            <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              {incident.tiempoInicio ? 'Reanudar' : 'Iniciar'}
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          )}
          
          <Button onClick={handleReset} variant="outline" className="text-orange-600 hover:text-orange-700">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        </div>

        {/* Generar reporte */}
        {currentTime > 0 && (
          <div className="pt-2 border-t">
            <Button 
              onClick={handleGenerateReport}
              variant="outline" 
              className="w-full text-primary hover:text-primary-foreground hover:bg-primary"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generar Reporte Fiscal
            </Button>
          </div>
        )}

        {/* Información adicional */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Estado:</span>
            <span className="capitalize">{incident.estado.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span>Prioridad:</span>
            <span className="capitalize">{incident.prioridad}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}