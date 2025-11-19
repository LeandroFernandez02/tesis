import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Upload, File, X, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Team } from '../types/personnel';

interface GPXUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string; // Ahora es opcional
  teamName?: string; // Ahora es opcional
  teams: Team[]; // Lista de equipos disponibles
  onUpload: (teamId: string, file: File, label: string) => Promise<void>;
}

export function GPXUploadModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  teams,
  onUpload,
}: GPXUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teamId || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Encontrar el equipo seleccionado
  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validar que sea un archivo GPX
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      toast.error('El archivo debe ser formato .gpx');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande (máximo 10MB)');
      return;
    }

    setFile(file);
    
    // Auto-generar etiqueta basada en la hora actual si está vacía
    if (!label) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setLabel(`Avance ${hours}:${minutes}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecciona un archivo GPX');
      return;
    }

    if (!selectedTeamId) {
      toast.error('Selecciona un grupo para asignar el GPX');
      return;
    }

    const finalLabel = label.trim() || `Trazado ${new Date().toLocaleTimeString()}`;

    setIsUploading(true);
    try {
      await onUpload(selectedTeamId, file, finalLabel);
      const selectedTeamName = teams.find(t => t.id === selectedTeamId)?.nombre || 'el grupo';
      toast.success(`Trazado GPX "${finalLabel}" cargado para ${selectedTeamName}`);
      handleClose();
    } catch (error) {
      console.error('Error al cargar GPX:', error);
      toast.error('Error al cargar el archivo GPX');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setLabel('');
    setSelectedTeamId(teamId || '');
    setIsDragging(false);
    onClose();
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Upload className="h-5 w-5 text-red-500" />
            Cargar Trazo GPX
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sube un archivo GPX con el recorrido o trazado del grupo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Selector de Grupo */}
          <div className="space-y-2">
            <Label htmlFor="team-select" className="text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-red-500" />
              Asignar GPX a Grupo
            </Label>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger 
                id="team-select"
                className="bg-gray-900 border-gray-800 text-white"
              >
                <SelectValue placeholder="Selecciona un grupo..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                {teams.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-gray-500">
                    No hay grupos disponibles
                  </div>
                ) : (
                  teams.map((team) => (
                    <SelectItem 
                      key={team.id} 
                      value={team.id}
                      className="text-white hover:bg-gray-800 focus:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-red-500" />
                        <span>{team.nombre}</span>
                        <span className="text-xs text-gray-500">
                          ({team.miembros.length} {team.miembros.length === 1 ? 'miembro' : 'miembros'})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedTeam && (
              <p className="text-xs text-gray-500">
                Grupo seleccionado: <span className="text-red-400 font-medium">{selectedTeam.nombre}</span> con {selectedTeam.miembros.length} {selectedTeam.miembros.length === 1 ? 'miembro' : 'miembros'}
              </p>
            )}
          </div>
          {/* Área de drag and drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
              isDragging
                ? 'border-red-500 bg-red-950/20'
                : file
                ? 'border-green-500 bg-green-950/20'
                : 'border-gray-700 bg-gray-900 hover:border-gray-600'
            }`}
          >
            {!file ? (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full ${
                    isDragging ? 'bg-red-600' : 'bg-gray-800'
                  }`}>
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-medium mb-2">
                  {isDragging ? 'Suelta el archivo aquí' : 'Arrastra y suelta un archivo GPX'}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  o haz clic para seleccionar
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Seleccionar Archivo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".gpx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-green-600">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <File className="h-4 w-4 text-green-500" />
                  <h3 className="text-white font-medium">{file.name}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  onClick={handleRemoveFile}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cambiar archivo
                </Button>
              </div>
            )}
          </div>

          {/* Campo de etiqueta */}
          <div className="space-y-2">
            <Label htmlFor="label" className="text-white">
              Etiqueta del Trazado (Opcional)
            </Label>
            <Input
              id="label"
              placeholder='Ej: "Avance 10:30", "Sector Norte", "Recorrido A"'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-500">
              Si no ingresas una etiqueta, se generará automáticamente
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isUploading}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || !selectedTeamId || isUploading}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Trazado
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
