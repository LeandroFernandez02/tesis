import { useState, useRef } from 'react';
import { Upload, File, Image, X, Download, Eye, Camera, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';

export interface IncidentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}

interface IncidentFilesProps {
  incidentId: string;
  files: IncidentFile[];
  onFileUpload: (files: File[], description?: string) => Promise<void>;
  onFileDelete: (fileId: string) => Promise<void>;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
}

export function IncidentFiles({ 
  incidentId, 
  files, 
  onFileUpload, 
  onFileDelete,
  maxFileSize = 10,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  className 
}: IncidentFilesProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<IncidentFile | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      handleFileUpload(selectedFiles);
    }
  };

  const handleFileUpload = async (filesToUpload: File[]) => {
    // Validar archivos
    const validFiles = filesToUpload.filter(file => {
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`El archivo ${file.name} es muy grande. Máximo ${maxFileSize}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onFileUpload(validFiles, description);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
        setDescription('');
      }, 1000);

    } catch (error) {
      console.error('Error uploading files:', error);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-green-600" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-600" />;
    } else {
      return <File className="h-4 w-4 text-blue-600" />;
    }
  };

  const isImage = (fileType: string) => fileType.startsWith('image/');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de subida */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-red-600" />
                Archivos del Incidente
              </h3>
              <p className="text-sm text-muted-foreground">
                Sube fotos, documentos y evidencias relacionadas con el incidente
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="h-4 w-4 mr-2" />
              Subir Archivos
            </Button>
          </div>

          {/* Zona de arrastre */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-red-400 bg-red-50 dark:bg-red-950/20' 
                : 'border-muted-foreground/25 hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-red-500 animate-pulse" />
                <p>Subiendo archivos...</p>
                <Progress value={uploadProgress} className="max-w-xs mx-auto" />
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p>Arrastra archivos aquí o haz clic para seleccionar</p>
                  <p className="text-sm text-muted-foreground">
                    Máximo {maxFileSize}MB por archivo. Formatos: JPG, PNG, PDF, DOC
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input de descripción */}
          {!uploading && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <input
                type="text"
                placeholder="Descripción de los archivos..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-input-background"
              />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </Card>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4>Archivos Subidos ({files.length})</h4>
              <Badge variant="outline">
                {files.reduce((total, file) => total + file.size, 0) > 1024 * 1024 
                  ? `${(files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB`
                  : `${(files.reduce((total, file) => total + file.size, 0) / 1024).toFixed(0)} KB`
                }
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-4 bg-card/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        {file.description && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {file.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Por: {file.uploadedBy}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {/* Botón de vista previa */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{file.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {isImage(file.type) ? (
                              <div className="flex justify-center">
                                <img 
                                  src={file.url} 
                                  alt={file.name}
                                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                />
                              </div>
                            ) : (
                              <div className="text-center p-8 bg-muted rounded-lg">
                                {getFileIcon(file.type)}
                                <p className="mt-2">Vista previa no disponible</p>
                                <p className="text-sm text-muted-foreground">
                                  Usa el botón de descarga para ver el archivo
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)} • Subido el {new Date(file.uploadedAt).toLocaleString()}
                              </div>
                              <Button asChild>
                                <a href={file.url} download={file.name}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Descargar
                                </a>
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Botón de descarga */}
                      <Button variant="ghost" size="sm" asChild>
                        <a href={file.url} download={file.name}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>

                      {/* Botón de eliminar */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFileDelete(file.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Mensaje cuando no hay archivos */}
      {files.length === 0 && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Aún no se han subido archivos para este incidente. 
            Las fotos y documentos ayudan a documentar mejor la situación.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}