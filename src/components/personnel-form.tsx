import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { 
  Personnel, 
  PersonnelRank, 
  PersonnelSpecialty, 
  PersonnelStatus, 
  Shift, 
  Certification 
} from "../types/personnel";
import { 
  User, 
  Phone, 
  Mail, 
  Shield, 
  Star, 
  Calendar as CalendarIcon,
  Plus,
  X,
  Award,
  Upload,
  Camera
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PersonnelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (personnel: Omit<Personnel, 'id'>) => Promise<void>;
  personnel?: Personnel;
  mode: 'create' | 'edit';
}

const RANKS: PersonnelRank[] = [
  'Comandante',
  'Capitán', 
  'Teniente',
  'Sargento',
  'Bombero Especialista',
  'Bombero',
  'Aspirante'
];

const SPECIALTIES: PersonnelSpecialty[] = [
  'Combate de Incendios',
  'Rescate Vehicular',
  'Rescate en Alturas', 
  'Materiales Peligrosos',
  'Emergencias Médicas',
  'Rescate Acuático',
  'Rescate Urbano',
  'Manejo de Equipos',
  'Instructor',
  'Paramedico'
];

const STATUSES: PersonnelStatus[] = [
  'Activo',
  'En Servicio',
  'Fuera de Servicio',
  'De Licencia',
  'Capacitación',
  'Suspendido'
];

const SHIFTS: Shift[] = [
  'Mañana',
  'Tarde',
  'Noche',
  '24 Horas',
  'Libre'
];

export function PersonnelForm({ isOpen, onClose, onSubmit, personnel, mode }: PersonnelFormProps) {
  const [formData, setFormData] = useState<Omit<Personnel, 'id'>>({
    numeroPlaca: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rango: 'Bombero',
    especialidad: [],
    certificaciones: [],
    fechaIngreso: new Date().toISOString().split('T')[0],
    estado: 'Activo',
    turno: 'Mañana',
    disponible: true,
    experienciaAnios: 0,
    observaciones: ''
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [newCertification, setNewCertification] = useState<Partial<Certification>>({});
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (personnel && mode === 'edit') {
      setFormData({
        numeroPlaca: personnel.numeroPlaca,
        nombre: personnel.nombre,
        apellido: personnel.apellido,
        email: personnel.email,
        telefono: personnel.telefono,
        rango: personnel.rango,
        especialidad: personnel.especialidad,
        certificaciones: personnel.certificaciones,
        foto: personnel.foto,
        fechaIngreso: personnel.fechaIngreso.split('T')[0],
        estado: personnel.estado,
        turno: personnel.turno,
        disponible: personnel.disponible,
        ubicacionActual: personnel.ubicacionActual,
        equipoAsignado: personnel.equipoAsignado,
        experienciaAnios: personnel.experienciaAnios,
        ultimaCapacitacion: personnel.ultimaCapacitacion,
        observaciones: personnel.observaciones
      });
    } else if (mode === 'create') {
      setFormData({
        numeroPlaca: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        rango: 'Bombero',
        especialidad: [],
        certificaciones: [],
        fechaIngreso: new Date().toISOString().split('T')[0],
        estado: 'Activo',
        turno: 'Mañana',
        disponible: true,
        experienciaAnios: 0,
        observaciones: ''
      });
    }
    setActiveTab('basic');
  }, [personnel, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        fechaIngreso: formData.fechaIngreso + 'T00:00:00.000Z'
      });
      onClose();
    } catch (error) {
      console.error('Error submitting personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyChange = (specialty: PersonnelSpecialty, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      especialidad: checked 
        ? [...prev.especialidad, specialty]
        : prev.especialidad.filter(s => s !== specialty)
    }));
  };

  const addCertification = () => {
    if (newCertification.nombre && newCertification.entidadCertificadora && newCertification.fechaObtencion) {
      const certification: Certification = {
        id: Date.now().toString(),
        nombre: newCertification.nombre,
        entidadCertificadora: newCertification.entidadCertificadora,
        fechaObtencion: newCertification.fechaObtencion,
        fechaVencimiento: newCertification.fechaVencimiento,
        vigente: true,
        nivel: newCertification.nivel
      };
      
      setFormData(prev => ({
        ...prev,
        certificaciones: [...prev.certificaciones, certification]
      }));
      
      setNewCertification({});
      setShowCertificationForm(false);
    }
  };

  const removeCertification = (certId: string) => {
    setFormData(prev => ({
      ...prev,
      certificaciones: prev.certificaciones.filter(c => c.id !== certId)
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          foto: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {mode === 'edit' ? 'Editar Personal' : 'Agregar Nuevo Personal'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Modifica la información del bombero'
              : 'Completa la información para registrar un nuevo miembro del personal'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Información Básica</TabsTrigger>
              <TabsTrigger value="professional">Información Profesional</TabsTrigger>
              <TabsTrigger value="certifications">Certificaciones</TabsTrigger>
              <TabsTrigger value="additional">Información Adicional</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Foto del perfil */}
                  <div className="space-y-4">
                    <Label>Fotografía</Label>
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={formData.foto} />
                        <AvatarFallback className="text-lg">
                          {formData.nombre.charAt(0)}{formData.apellido.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <label className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Subir Foto
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </Button>
                        <Button type="button" variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Tomar Foto
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Información personal */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="numeroPlaca">Número de Placa *</Label>
                        <Input
                          id="numeroPlaca"
                          value={formData.numeroPlaca}
                          onChange={(e) => setFormData(prev => ({...prev, numeroPlaca: e.target.value}))}
                          placeholder="Ej: BV001"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
                        <Input
                          id="fechaIngreso"
                          type="date"
                          value={formData.fechaIngreso}
                          onChange={(e) => setFormData(prev => ({...prev, fechaIngreso: e.target.value}))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData(prev => ({...prev, nombre: e.target.value}))}
                          placeholder="Nombre del bombero"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellido">Apellido *</Label>
                        <Input
                          id="apellido"
                          value={formData.apellido}
                          onChange={(e) => setFormData(prev => ({...prev, apellido: e.target.value}))}
                          placeholder="Apellido del bombero"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Correo Electrónico *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                          placeholder="correo@bomberos.gov"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefono">Teléfono *</Label>
                        <Input
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => setFormData(prev => ({...prev, telefono: e.target.value}))}
                          placeholder="+1 234 567 8900"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="professional" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rango">Rango</Label>
                      <Select value={formData.rango} onValueChange={(value: PersonnelRank) => 
                        setFormData(prev => ({...prev, rango: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RANKS.map(rank => (
                            <SelectItem key={rank} value={rank}>
                              <div className="flex items-center gap-2">
                                {rank === 'Comandante' && <Star className="h-4 w-4 text-yellow-600" />}
                                {rank === 'Capitán' && <Shield className="h-4 w-4 text-blue-600" />}
                                {rank}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select value={formData.estado} onValueChange={(value: PersonnelStatus) => 
                        setFormData(prev => ({...prev, estado: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="turno">Turno</Label>
                      <Select value={formData.turno} onValueChange={(value: Shift) => 
                        setFormData(prev => ({...prev, turno: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SHIFTS.map(shift => (
                            <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="experiencia">Años de Experiencia</Label>
                      <Input
                        id="experiencia"
                        type="number"
                        min="0"
                        value={formData.experienciaAnios}
                        onChange={(e) => setFormData(prev => ({...prev, experienciaAnios: parseInt(e.target.value) || 0}))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="disponible"
                        checked={formData.disponible}
                        onCheckedChange={(checked) => setFormData(prev => ({...prev, disponible: !!checked}))}
                      />
                      <Label htmlFor="disponible">Disponible para asignaciones</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Especialidades</Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                        {SPECIALTIES.map(specialty => (
                          <div key={specialty} className="flex items-center space-x-2">
                            <Checkbox
                              id={specialty}
                              checked={formData.especialidad.includes(specialty)}
                              onCheckedChange={(checked) => handleSpecialtyChange(specialty, !!checked)}
                            />
                            <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Especialidades Seleccionadas</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.especialidad.map(specialty => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer" 
                              onClick={() => handleSpecialtyChange(specialty, false)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="certifications" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Certificaciones Actuales</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCertificationForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Certificación
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.certificaciones.map(cert => (
                    <Card key={cert.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-yellow-600" />
                              <h4 className="font-medium">{cert.nombre}</h4>
                              {cert.vigente && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                  Vigente
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {cert.entidadCertificadora}
                            </p>
                            <div className="text-xs text-muted-foreground mt-2">
                              Obtenida: {format(new Date(cert.fechaObtencion), 'dd/MM/yyyy', { locale: es })}
                              {cert.fechaVencimiento && (
                                <span className="block">
                                  Vence: {format(new Date(cert.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}
                                </span>
                              )}
                            </div>
                            {cert.nivel && (
                              <Badge variant="outline" className="text-xs mt-2">
                                {cert.nivel}
                              </Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertification(cert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Formulario para nueva certificación */}
                {showCertificationForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Nueva Certificación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="certNombre">Nombre de la Certificación</Label>
                          <Input
                            id="certNombre"
                            value={newCertification.nombre || ''}
                            onChange={(e) => setNewCertification(prev => ({...prev, nombre: e.target.value}))}
                            placeholder="Ej: Rescate en Alturas Nivel I"
                          />
                        </div>
                        <div>
                          <Label htmlFor="entidad">Entidad Certificadora</Label>
                          <Input
                            id="entidad"
                            value={newCertification.entidadCertificadora || ''}
                            onChange={(e) => setNewCertification(prev => ({...prev, entidadCertificadora: e.target.value}))}
                            placeholder="Ej: Instituto Nacional de Bomberos"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="fechaObtencion">Fecha de Obtención</Label>
                          <Input
                            id="fechaObtencion"
                            type="date"
                            value={newCertification.fechaObtencion || ''}
                            onChange={(e) => setNewCertification(prev => ({...prev, fechaObtencion: e.target.value}))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="fechaVencimiento">Fecha de Vencimiento (Opcional)</Label>
                          <Input
                            id="fechaVencimiento"
                            type="date"
                            value={newCertification.fechaVencimiento || ''}
                            onChange={(e) => setNewCertification(prev => ({...prev, fechaVencimiento: e.target.value}))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="nivel">Nivel</Label>
                          <Select 
                            value={newCertification.nivel || ''} 
                            onValueChange={(value: 'Básico' | 'Intermedio' | 'Avanzado' | 'Instructor') => 
                              setNewCertification(prev => ({...prev, nivel: value}))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar nivel" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Básico">Básico</SelectItem>
                              <SelectItem value="Intermedio">Intermedio</SelectItem>
                              <SelectItem value="Avanzado">Avanzado</SelectItem>
                              <SelectItem value="Instructor">Instructor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="button" onClick={addCertification}>
                          Agregar
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowCertificationForm(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="additional" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ubicacionActual">Ubicación Actual</Label>
                      <Input
                        id="ubicacionActual"
                        value={formData.ubicacionActual || ''}
                        onChange={(e) => setFormData(prev => ({...prev, ubicacionActual: e.target.value}))}
                        placeholder="Ej: Estación Central"
                      />
                    </div>

                    <div>
                      <Label htmlFor="equipoAsignado">Equipo Asignado</Label>
                      <Input
                        id="equipoAsignado"
                        value={formData.equipoAsignado || ''}
                        onChange={(e) => setFormData(prev => ({...prev, equipoAsignado: e.target.value}))}
                        placeholder="Ej: Alpha Team"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ultimaCapacitacion">Última Capacitación</Label>
                      <Input
                        id="ultimaCapacitacion"
                        type="date"
                        value={formData.ultimaCapacitacion || ''}
                        onChange={(e) => setFormData(prev => ({...prev, ultimaCapacitacion: e.target.value}))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      value={formData.observaciones || ''}
                      onChange={(e) => setFormData(prev => ({...prev, observaciones: e.target.value}))}
                      placeholder="Información adicional, notas, comentarios especiales..."
                      rows={10}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? 'Guardando...' : (mode === 'edit' ? 'Actualizar' : 'Crear')} Personal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}