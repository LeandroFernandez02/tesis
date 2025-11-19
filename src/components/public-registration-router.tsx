import { useState, useEffect } from 'react';
import { PersonnelRegistrationForm, PersonnelFormData } from './auth/personnel-registration-form';
import { Incident } from '../types/incident';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Loader2, QrCode } from 'lucide-react';

interface PublicRegistrationRouterProps {
  incidents: Incident[];
  onRegisterPersonnel: (accessCode: string, data: PersonnelFormData) => Promise<Incident>;
  children: React.ReactNode;
}

export function PublicRegistrationRouter({ 
  incidents, 
  onRegisterPersonnel,
  children 
}: PublicRegistrationRouterProps) {
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Detectar si estamos en la ruta de registro público
    const path = window.location.pathname;
    const match = path.match(/\/registro-personal\/([A-Z0-9]{6,8})/i);
    
    if (match) {
      const code = match[1].toUpperCase();
      setAccessCode(code);
      setLoading(true);
      
      // Esperar un momento para que los incidentes se carguen
      const timer = setTimeout(() => {
        // Buscar el incidente asociado a este código
        const foundIncident = incidents.find(inc => {
          const qrAccesses = inc.accesosQR || [];
          return qrAccesses.some(qr => 
            qr.active && 
            qr.accessCode === code &&
            new Date(qr.validUntil) > new Date()
          );
        });
        
        if (foundIncident) {
          setIncident(foundIncident);
          setValidationError(null);
        } else if (incidents.length > 0) {
          // Si ya hay incidentes cargados pero no se encontró el código
          setValidationError('Código de acceso inválido o expirado');
        }
        
        setLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [incidents]);

  // Si estamos en la ruta de registro público
  if (accessCode) {
    // Mostrar loading mientras se busca el incidente
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <div className="space-y-2">
                  <h2>Validando código de acceso...</h2>
                  <p className="text-sm text-muted-foreground">
                    Código: {accessCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Si hay un error de validación
    if (validationError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error de Acceso
              </CardTitle>
              <CardDescription>
                No se pudo validar el código de acceso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Código ingresado: <strong>{accessCode}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Por favor, verifica que:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>El código QR sea correcto y actual</li>
                  <li>El código no haya expirado</li>
                  <li>El incidente esté activo</li>
                </ul>
              </div>

              <div className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Si el problema persiste, contacta al coordinador del incidente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Si se encontró el incidente, mostrar el formulario
    return (
      <PersonnelRegistrationForm
        accessCode={accessCode}
        incidentTitle={incident?.titulo}
        onSubmit={async (data) => {
          await onRegisterPersonnel(accessCode, data);
        }}
      />
    );
  }

  // Si no, mostrar la aplicación normal
  return <>{children}</>;
}
