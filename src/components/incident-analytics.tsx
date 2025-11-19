import { useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip
} from "recharts";
import { Incident } from "../types/incident";
import { TrendingUp, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { format, subDays, startOfDay, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

interface IncidentAnalyticsProps {
  incidents: Incident[];
}

export function IncidentAnalytics({ incidents }: IncidentAnalyticsProps) {
  // KPIs principales
  const incidentesActivos = useMemo(() => {
    return incidents.filter(i => i.estado === 'activo').length;
  }, [incidents]);

  const totalPersonalDesplegado = useMemo(() => {
    return incidents.reduce((sum, incident) => {
      return sum + (incident.personalAsignado?.length || 0);
    }, 0);
  }, [incidents]);

  const incidentesInactivos = useMemo(() => {
    return incidents.filter(i => i.estado === 'inactivo').length;
  }, [incidents]);

  const incidentesFinalizados = useMemo(() => {
    return incidents.filter(i => i.estado === 'finalizado').length;
  }, [incidents]);

  // Datos para gráfico de tendencia (últimos 7 días)
  const trendData = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 6);
    
    const dailyData = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayIncidents = incidents.filter(incident => {
        const incidentDate = new Date(incident.fechaCreacion);
        return isWithinInterval(incidentDate, { start: dayStart, end: dayEnd });
      });
      
      dailyData.push({
        fecha: format(date, "dd/MM", { locale: es }),
        total: dayIncidents.length
      });
    }
    
    return dailyData;
  }, [incidents]);

  // Tiempo promedio de resolución
  const tiempoPromedio = useMemo(() => {
    const resolvedIncidents = incidents.filter(i => i.estado === 'finalizado');
    if (resolvedIncidents.length === 0) return 0;
    
    const totalTime = resolvedIncidents.reduce((sum, incident) => {
      return sum + (incident.tiempoTranscurrido || 0);
    }, 0);
    
    return Math.round(totalTime / resolvedIncidents.length / (1000 * 60 * 60)); // en horas
  }, [incidents]);

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Personal Desplegado */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalPersonalDesplegado}</p>
                <p className="text-sm text-muted-foreground">Personal Desplegado</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        {/* Incidentes Activos */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{incidentesActivos}</p>
                <p className="text-sm text-muted-foreground">Incidentes Activos</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Inactivos */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{incidentesInactivos}</p>
                <p className="text-sm text-muted-foreground">Incidentes Inactivos</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Finalizados */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{incidentesFinalizados}</p>
                <p className="text-sm text-muted-foreground">Incidentes Finalizados</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Gráficos Principales Compactos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Incidentes (7 días) */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="flex items-center gap-2 font-medium">
                <TrendingUp className="h-4 w-4" />
                Tendencia de Incidentes (7 días)
              </h3>
              <p className="text-sm text-muted-foreground">Total Incidentes</p>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={trendData}>
                <XAxis 
                  dataKey="fecha" 
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Personal Desplegado por Organización */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="flex items-center gap-2 font-medium">
                <Users className="h-4 w-4" />
                Personal Desplegado por Organización
              </h3>
              <p className="text-sm text-muted-foreground">Distribución de recursos humanos activos</p>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={[
                { name: 'Bomberos', personal: Math.floor(totalPersonalDesplegado * 0.4) },
                { name: 'Policía', personal: Math.floor(totalPersonalDesplegado * 0.3) },
                { name: 'Def. Civil', personal: Math.floor(totalPersonalDesplegado * 0.2) },
                { name: 'Otros', personal: Math.floor(totalPersonalDesplegado * 0.1) }
              ]}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="personal" 
                  fill="hsl(var(--primary))" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}