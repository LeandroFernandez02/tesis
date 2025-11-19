import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import {
  QrCode,
  Copy,
  Download,
  Share2,
  ExternalLink,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { Incident } from '../../types/incident';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner@2.0.3';
import { PersonnelRegistrationForm, PersonnelFormData } from './personnel-registration-form';

interface QRIncidentAccess {
  id: string;
  incidentId: string;
  qrCode: string;
  accessCode: string;
  validUntil: Date;
  maxPersonnel?: number;
  registeredPersonnel: QRPersonnelEntry[];
  createdAt: Date;
  createdBy: string;
  active: boolean;
}

interface QRPersonnelEntry {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  institucion: string;
  rol: string;
  sexo: 'masculino' | 'femenino';
  alergias: string;
  grupoSanguineo: string;
  registeredAt: Date;
}

interface QRIncidentAccessProps {
  incident: Incident;
  onGenerateQR: (config: QRConfig) => Promise<QRIncidentAccess>;
  onRegenerateQR: (oldQRId: string, config: QRConfig) => Promise<QRIncidentAccess>;
  qrAccesses: QRIncidentAccess[];
}

interface QRConfig {
  validHours: number;
  maxPersonnel?: number;
}

export function QRIncidentAccess({ 
  incident,
  onGenerateQR,
  onRegenerateQR,
  qrAccesses 
}: QRIncidentAccessProps) {
  const [loading, setLoading] = useState(false);
  const [currentQR, setCurrentQR] = useState<QRIncidentAccess | null>(null);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Obtener el QR activo del incidente (solo debería haber uno)
  useEffect(() => {
    const activeQR = qrAccesses.find(qr => qr.active && new Date(qr.validUntil) > new Date());
    setCurrentQR(activeQR || null);
  }, [qrAccesses]);

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      // Generar QR con configuración por defecto (válido por 365 días, sin límite de personal)
      const newQR = await onGenerateQR({
        validHours: 365 * 24, // 1 año
        maxPersonnel: undefined // Sin límite
      });
      setCurrentQR(newQR);
      toast.success('Código QR generado exitosamente');
    } catch (error) {
      console.error('Error generating QR:', error);
      toast.error('Error al generar código QR');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQR = async () => {
    if (!currentQR) return;
    
    setLoading(true);
    try {
      // Regenerar QR con la misma configuración
      const newQR = await onRegenerateQR(currentQR.id, {
        validHours: 365 * 24, // 1 año
        maxPersonnel: undefined // Sin límite
      });
      setCurrentQR(newQR);
      setShowRegenerateDialog(false);
      toast.success('Código QR regenerado exitosamente');
    } catch (error) {
      console.error('Error regenerating QR:', error);
      toast.error('Error al regenerar código QR');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Intentar usar la API moderna del portapapeles
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Copiado al portapapeles');
      } else {
        // Fallback: crear un elemento temporal para copiar
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast.success('Copiado al portapapeles');
        } catch (err) {
          // Si falla, mostrar el texto para copiarlo manualmente
          toast.info('Código: ' + text);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      // Si todo falla, mostrar el código para que el usuario lo copie manualmente
      toast.info('Código: ' + text, {
        duration: 5000,
        description: 'Selecciona y copia el código manualmente'
      });
    }
  };

  const generateRegistrationUrl = (accessCode: string) => {
    return `${window.location.origin}/registro-personal/${accessCode}`;
  };

  const downloadQR = (accessCode: string) => {
    const canvas = document.getElementById(`qr-${accessCode}`) as HTMLCanvasElement;
    if (!canvas) return;

    const svg = canvas.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR-${incident.titulo}-${accessCode}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('QR descargado');
  };

  const shareQR = async (accessCode: string) => {
    const url = generateRegistrationUrl(accessCode);
    
    // Verificar si la API de compartir está disponible y permitida
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: 'Registro de Personal - Sistema DUAR',
          text: `Regístrate en el incidente: ${incident.titulo}`,
          url: url
        });
        return;
      } catch (err) {
        // Si el usuario cancela (AbortError), no hacer nada
        if ((err as Error).name === 'AbortError') {
          return;
        }
        // Si hay otro error, intentar copiar al portapapeles
      }
    }
    
    // Fallback: copiar al portapapeles
    await copyToClipboard(url);
  };

  const handlePersonnelRegistration = async (data: PersonnelFormData) => {
    if (!currentQR) return;

    try {
      // Agregar el nuevo registro al personal del QR actual
      const newEntry = {
        id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        registeredAt: new Date()
      };

      // Actualizar el estado local del QR con el nuevo personal
      // NOTA: Esta actualización solo afecta el estado local del componente
      // En una implementación completa con página dedicada, esto debería
      // también actualizar el incidente en el backend/estado global
      setCurrentQR(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          registeredPersonnel: [...prev.registeredPersonnel, newEntry]
        };
      });

      // No cerrar el modal aquí porque puede ser líder o agente
      // El formulario maneja su propio flujo de múltiples registros
      
      // El toast se muestra desde el formulario mismo
      
      console.log('Personal registrado (modal temporal):', data);
    } catch (error) {
      console.error('Error registering personnel:', error);
      toast.error('Error al registrar personal');
      throw error;
    }
  };

  // Si no hay QR generado, mostrar opción para generar
  if (!currentQR) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-red-600" />
            Acceso QR
          </h1>
          <p className="text-muted-foreground">
            Genera un código QR único para que el personal se registre en este incidente
          </p>
        </div>

        {/* Card de generación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Generar Código QR</CardTitle>
              <CardDescription>
                Crea el código QR único para este incidente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4>Incidente: {incident.titulo}</h4>
                <p className="text-sm text-muted-foreground">
                  {incident.ubicacion?.direccion || incident.punto0?.direccion || 'Sin ubicación'}
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Importante:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Solo se puede generar un código QR por incidente</li>
                      <li>El código será válido durante 1 año</li>
                      <li>No hay límite de personal que puede registrarse</li>
                      <li>El QR estará disponible permanentemente en esta página</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleGenerateQR}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                {loading ? 'Generando...' : 'Generar Código QR'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Se genera el código QR</p>
                    <p className="text-sm text-muted-foreground">
                      Un código único que identifica este incidente
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">El personal escanea el QR</p>
                    <p className="text-sm text-muted-foreground">
                      Con cualquier smartphone o tablet
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Completan el formulario</p>
                    <p className="text-sm text-muted-foreground">
                      Nombre, DNI, institución, rol, datos médicos, etc.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Registro automático</p>
                    <p className="text-sm text-muted-foreground">
                      Quedan registrados en el sistema inmediatamente
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Si hay QR generado, mostrarlo de forma prominente
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2">
          <QrCode className="h-6 w-6 text-red-600" />
          Acceso QR
        </h1>
        <p className="text-muted-foreground">
          Código QR activo para registro de personal en este incidente
        </p>
      </div>

      {/* Badge de estado y acciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            QR Activo
          </Badge>
          <span className="text-sm text-muted-foreground">
            {currentQR.registeredPersonnel.length} persona(s) registrada(s)
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRegenerateDialog(true)}
          className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Regenerar QR
        </Button>
      </div>

      {/* QR Principal */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Código QR del Incidente</span>
            <Badge variant="outline" className="text-lg tracking-wider">
              {currentQR.accessCode}
            </Badge>
          </CardTitle>
          <CardDescription>
            Escanea este código o comparte el enlace para registrar personal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div 
                id={`qr-${currentQR.accessCode}`} 
                className="bg-white p-8 rounded-xl shadow-lg border-4 border-red-600"
              >
                <QRCodeSVG
                  key={currentQR.accessCode}
                  value={generateRegistrationUrl(currentQR.accessCode)}
                  size={280}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Código de Acceso</p>
                <p className="text-2xl tracking-widest select-all">
                  {currentQR.accessCode}
                </p>
              </div>
            </div>

            {/* Información y acciones */}
            <div className="space-y-6">
              {/* Información del incidente */}
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Incidente</Label>
                  <p className="text-lg">{incident.titulo}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Ubicación</Label>
                  <p className="text-sm">
                    {incident.ubicacion?.direccion || incident.punto0?.direccion || 'Sin ubicación'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Personal Registrado</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-5 w-5 text-red-600" />
                      <span className="text-xl">{currentQR.registeredPersonnel.length}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Válido hasta</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="text-sm">
                        {new Date(currentQR.validUntil).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* URL de registro */}
              <div className="space-y-2">
                <Label>URL de Registro</Label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                    {generateRegistrationUrl(currentQR.accessCode)}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(generateRegistrationUrl(currentQR.accessCode))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Acciones */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => downloadQR(currentQR.accessCode)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar QR
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareQR(currentQR.accessCode)}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>

                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(currentQR.accessCode)}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Código
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.open(generateRegistrationUrl(currentQR.accessCode), '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Formulario
                </Button>
              </div>

              {/* Información adicional */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Este código QR es único para este incidente y permanecerá activo. 
                  Cualquier persona que lo escanee podrá registrarse en el sistema.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación para regenerar QR */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              ¿Regenerar Código QR?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Esta acción generará un nuevo código QR para este incidente. El código anterior dejará de funcionar inmediatamente.
                </p>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Información importante:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>El código QR actual ({currentQR?.accessCode}) será desactivado</li>
                    <li>Se generará un nuevo código QR único</li>
                    <li>Los {currentQR?.registeredPersonnel.length || 0} registros existentes se mantendrán</li>
                    <li>Deberás compartir el nuevo código con el personal</li>
                  </ul>
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Usa esta función solo si el código QR actual tiene problemas o ha sido comprometido.
                  </AlertDescription>
                </Alert>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerateQR}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? 'Regenerando...' : 'Regenerar QR'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Formulario de Registro */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-0 gap-0 overflow-hidden">
          <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-red-600" />
                Formulario de Registro de Personal
              </DialogTitle>
              <DialogDescription>
                Registrar personal para el incidente: <strong>{incident.titulo}</strong>
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(95vh-5rem)] modal-hidden-scroll">
            <div className="p-4">
              {currentQR && (
                <PersonnelRegistrationForm
                  accessCode={currentQR.accessCode}
                  incidentTitle={incident.titulo}
                  onSubmit={handlePersonnelRegistration}
                  embedded={true}
                  onComplete={() => setShowRegistrationModal(false)}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm font-medium ${className || ''}`}>{children}</div>;
}
