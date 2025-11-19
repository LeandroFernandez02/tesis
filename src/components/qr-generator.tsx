import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  QrCode,
  Download,
  Share,
  Copy,
  Link,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  description?: string;
}

// Componente simple para mostrar QR (en una implementación real usarías qrcode.js o similar)
function QRCodeDisplay({ value, size = 200, title, description }: QRCodeDisplayProps) {
  const qrDataUrl = `data:image/svg+xml;base64,${btoa(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <rect x="10" y="10" width="30" height="30" fill="black"/>
      <rect x="160" y="10" width="30" height="30" fill="black"/>
      <rect x="10" y="160" width="30" height="30" fill="black"/>
      <rect x="70" y="70" width="60" height="60" fill="black"/>
      <text x="${size/2}" y="${size-10}" text-anchor="middle" font-size="12" fill="black">${value.slice(-8)}</text>
    </svg>
  `)}`;

  return (
    <div className="text-center space-y-3">
      {title && <h4 className="font-medium">{title}</h4>}
      <div className="flex justify-center">
        <img 
          src={qrDataUrl} 
          alt={`QR Code: ${value}`}
          className="border rounded-lg"
          style={{ width: size, height: size }}
        />
      </div>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}

interface QRGeneratorProps {
  incidentId: string;
  incidentTitle: string;
  accessCode: string;
  validUntil: Date;
  registeredCount: number;
  maxPersonnel?: number;
  onClose?: () => void;
}

export function QRGenerator({ 
  incidentId, 
  incidentTitle, 
  accessCode, 
  validUntil, 
  registeredCount,
  maxPersonnel,
  onClose 
}: QRGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const qrUrl = `${window.location.origin}/incident-access/${accessCode}`;
  const timeRemaining = new Date(validUntil).getTime() - new Date().getTime();
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
  const isExpired = timeRemaining <= 0;
  const isNearExpiry = hoursRemaining < 2 && hoursRemaining > 0;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Acceso DUAR: ${incidentTitle}`,
          text: `Código de acceso para el incidente: ${incidentTitle}`,
          url: qrUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      copyToClipboard(qrUrl);
    }
  };

  const downloadQR = () => {
    // En una implementación real, generarías una imagen PNG/SVG del QR
    const element = document.createElement('a');
    const qrSvg = `
      <svg width="300" height="350" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="150" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="black">Sistema DUAR</text>
        <text x="150" y="45" text-anchor="middle" font-size="12" fill="gray">${incidentTitle}</text>
        
        <rect x="50" y="60" width="200" height="200" fill="white" stroke="black" stroke-width="2"/>
        <rect x="70" y="80" width="30" height="30" fill="black"/>
        <rect x="180" y="80" width="30" height="30" fill="black"/>
        <rect x="70" y="190" width="30" height="30" fill="black"/>
        <rect x="125" y="125" width="50" height="50" fill="black"/>
        
        <text x="150" y="285" text-anchor="middle" font-size="14" font-weight="bold" fill="black">Código: ${accessCode}</text>
        <text x="150" y="305" text-anchor="middle" font-size="10" fill="gray">Válido hasta: ${validUntil.toLocaleString()}</text>
        <text x="150" y="325" text-anchor="middle" font-size="10" fill="gray">${qrUrl}</text>
      </svg>
    `;
    
    const file = new Blob([qrSvg], { type: 'image/svg+xml' });
    element.href = URL.createObjectURL(file);
    element.download = `QR-${incidentTitle.replace(/[^a-zA-Z0-9]/g, '_')}-${accessCode}.svg`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <QrCode className="h-5 w-5 text-red-600" />
          Código QR de Acceso
        </CardTitle>
        <CardDescription>
          {incidentTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado del QR */}
        <div className="text-center">
          {isExpired ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Este código QR ha expirado
              </AlertDescription>
            </Alert>
          ) : isNearExpiry ? (
            <Alert className="border-orange-200 bg-orange-50 text-orange-700">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Expira en {hoursRemaining} horas
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Activo - {hoursRemaining} horas restantes
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* QR Code */}
        <QRCodeDisplay
          value={qrUrl}
          size={200}
          description="Escanea este código o comparte el enlace para permitir registro de personal"
        />

        {/* Información del código */}
        <div className="space-y-3">
          <div className="text-center">
            <Badge variant="outline" className="text-lg font-mono px-3 py-1">
              {accessCode}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              Código de acceso manual
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-medium text-lg">{registeredCount}</div>
              <div className="text-muted-foreground">Registrados</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-medium text-lg">
                {maxPersonnel ? `${maxPersonnel}` : '∞'}
              </div>
              <div className="text-muted-foreground">Máximo</div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Válido hasta: {validUntil.toLocaleString()}</p>
          </div>
        </div>

        {/* URL del enlace */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Enlace de acceso:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={qrUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-muted"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(qrUrl)}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={shareQR}
          >
            <Share className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={downloadQR}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </div>

        {/* Instrucciones */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Instrucciones:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Comparte este QR con el personal que debe registrarse</li>
            <li>También pueden usar el código {accessCode} manualmente</li>
            <li>El registro es automático al escanear o ingresar el código</li>
          </ul>
        </div>

        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full">
            Cerrar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Dialog wrapper para mostrar el QR
interface QRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentId: string;
  incidentTitle: string;
  accessCode: string;
  validUntil: Date;
  registeredCount: number;
  maxPersonnel?: number;
}

export function QRDialog({ 
  open, 
  onOpenChange, 
  incidentId, 
  incidentTitle, 
  accessCode, 
  validUntil, 
  registeredCount,
  maxPersonnel 
}: QRDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Código QR de Acceso</DialogTitle>
          <DialogDescription>
            Código QR para registro de personal en {incidentTitle}
          </DialogDescription>
        </DialogHeader>
        <QRGenerator
          incidentId={incidentId}
          incidentTitle={incidentTitle}
          accessCode={accessCode}
          validUntil={validUntil}
          registeredCount={registeredCount}
          maxPersonnel={maxPersonnel}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}