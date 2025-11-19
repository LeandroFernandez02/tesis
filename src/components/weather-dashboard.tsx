import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Cloud, CloudRain, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface WeatherDashboardProps {
  incidentId?: string;
}

export function WeatherDashboard({ incidentId }: WeatherDashboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-red-600" />
          Condiciones Meteorológicas Actuales
        </CardTitle>
        <CardDescription>
          Vista de condiciones actuales del clima en desarrollo...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            El módulo de condiciones meteorológicas se encuentra en desarrollo.
            Próximamente estará disponible con datos en tiempo real de temperatura, humedad, viento, presión atmosférica y pronóstico extendido para planificación de operaciones.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
