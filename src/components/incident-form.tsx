import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Incident, IncidentStatus, IncidentPriority, IncidentCategory, MissingPerson } from "../types/incident";
import { Loader2, User, MapPin, Calendar, Phone, Upload, AlertTriangle, Plus, Navigation, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface IncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incident: Omit<Incident, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'comentarios'>) => void;
  incident?: Incident;
  mode: 'create' | 'edit';
  technicians: string[];
}

export function IncidentForm({ isOpen, onClose, onSubmit, incident, mode, technicians }: IncidentFormProps) {
  // Estado inicial del formulario - se inicializa correctamente según el modo
  const getInitialFormData = () => {
    if (incident && mode === 'edit') {
      return {
        titulo: incident.titulo || '',
        descripcion: incident.descripcion || '',
        estado: incident.estado || 'activo' as IncidentStatus,
        prioridad: incident.prioridad || 'manejable' as IncidentPriority,
        categoria: incident.categoria || 'persona' as IncidentCategory,
        punto0: incident.punto0 || { 
          lat: 0, 
          lng: 0, 
          direccion: '', 
          zona: '',
          fechaHora: new Date()
        },
        denunciante: incident.denunciante || {
          nombre: '',
          apellido: '',
          dni: '',
          telefono: '',
          email: '',
          direccion: '',
          relacion: ''
        },
        fiscalSolicitante: incident.fiscalSolicitante || {
          nombre: '',
          apellido: '',
          fiscalia: '',
          expediente: '',
          telefono: '',
          email: ''
        },
        jefeDotacion: incident.jefeDotacion || '',
        personaDesaparecida: incident.personaDesaparecida || null
      };
    }
    
    // Valores por defecto para modo crear
    return {
      titulo: '',
      descripcion: '',
      estado: 'activo' as IncidentStatus,
      prioridad: 'manejable' as IncidentPriority,
      categoria: 'persona' as IncidentCategory,
      punto0: { 
        lat: 0, 
        lng: 0, 
        direccion: '', 
        zona: '',
        fechaHora: new Date()
      },
      denunciante: {
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        email: '',
        direccion: '',
        relacion: ''
      },
      fiscalSolicitante: {
        nombre: '',
        apellido: '',
        fiscalia: '',
        expediente: '',
        telefono: '',
        email: ''
      },
      jefeDotacion: '',
      personaDesaparecida: null
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationObtainedAutomatically, setLocationObtainedAutomatically] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const getInitialMissingPersonData = (): Partial<MissingPerson> => {
    if (incident && mode === 'edit' && incident.personaDesaparecida) {
      return {
        nombre: incident.personaDesaparecida.nombre || '',
        apellido: incident.personaDesaparecida.apellido || '',
        edad: incident.personaDesaparecida.edad,
        genero: incident.personaDesaparecida.genero,
        descripcionFisica: incident.personaDesaparecida.descripcionFisica || '',
        ultimaVezVisto: incident.personaDesaparecida.ultimaVezVisto || {
          fecha: new Date(),
          ubicacion: '',
          coordenadas: undefined
        },
        vestimenta: incident.personaDesaparecida.vestimenta || '',
        condicionesMedicas: incident.personaDesaparecida.condicionesMedicas || '',
        medicamentos: incident.personaDesaparecida.medicamentos || '',
        foto: incident.personaDesaparecida.foto || '',
        contactoFamiliar: incident.personaDesaparecida.contactoFamiliar || {
          nombre: '',
          telefono: '',
          relacion: ''
        }
      };
    }
    
    return {
      nombre: '',
      apellido: '',
      edad: undefined,
      genero: undefined,
      descripcionFisica: '',
      ultimaVezVisto: {
        fecha: new Date(),
        ubicacion: '',
        coordenadas: undefined
      },
      vestimenta: '',
      condicionesMedicas: '',
      medicamentos: '',
      foto: '',
      contactoFamiliar: {
        nombre: '',
        telefono: '',
        relacion: ''
      }
    };
  };
  
  const [missingPersonData, setMissingPersonData] = useState<Partial<MissingPerson>>(getInitialMissingPersonData());
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Efecto para cargar datos desde el servidor cuando se abre en modo edición
  useEffect(() => {
    const loadIncidentData = async () => {
      if (mode === 'edit' && incident?.id && isOpen) {
        setIsLoadingData(true);
        console.log('🔄 Cargando datos del incidente desde el servidor:', incident.id);
        
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-69ee164a/incidents/${incident.id}`,
            {
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('✅ Datos del incidente cargados:', data);

          // Actualizar formData con los datos del servidor
          setFormData({
            titulo: data.titulo || '',
            descripcion: data.descripcion || '',
            estado: data.estado || 'activo' as IncidentStatus,
            prioridad: data.prioridad || 'manejable' as IncidentPriority,
            categoria: data.categoria || 'persona' as IncidentCategory,
            punto0: data.punto0 ? {
              lat: parseFloat(data.punto0.lat) || 0,
              lng: parseFloat(data.punto0.lng) || 0,
              direccion: data.punto0.direccion || '',
              zona: data.punto0.zona || '',
              fechaHora: data.punto0.fechaHora ? new Date(data.punto0.fechaHora) : new Date()
            } : { 
              lat: 0, 
              lng: 0, 
              direccion: '', 
              zona: '',
              fechaHora: new Date()
            },
            denunciante: data.denunciante || {
              nombre: '',
              apellido: '',
              dni: '',
              telefono: '',
              email: '',
              direccion: '',
              relacion: ''
            },
            fiscalSolicitante: data.fiscalSolicitante || {
              nombre: '',
              apellido: '',
              fiscalia: '',
              expediente: '',
              telefono: '',
              email: ''
            },
            jefeDotacion: data.jefeDotacion || '',
            personaDesaparecida: data.personaDesaparecida || null
          });

          // Actualizar datos de persona desaparecida si existen
          if (data.personaDesaparecida) {
            setMissingPersonData({
              nombre: data.personaDesaparecida.nombre || '',
              apellido: data.personaDesaparecida.apellido || '',
              edad: data.personaDesaparecida.edad,
              genero: data.personaDesaparecida.genero,
              descripcionFisica: data.personaDesaparecida.descripcionFisica || '',
              ultimaVezVisto: data.personaDesaparecida.ultimaVezVisto ? {
                fecha: data.personaDesaparecida.ultimaVezVisto.fecha ? new Date(data.personaDesaparecida.ultimaVezVisto.fecha) : new Date(),
                ubicacion: data.personaDesaparecida.ultimaVezVisto.ubicacion || '',
                coordenadas: data.personaDesaparecida.ultimaVezVisto.coordenadas
              } : {
                fecha: new Date(),
                ubicacion: '',
                coordenadas: undefined
              },
              vestimenta: data.personaDesaparecida.vestimenta || '',
              condicionesMedicas: data.personaDesaparecida.condicionesMedicas || '',
              medicamentos: data.personaDesaparecida.medicamentos || '',
              foto: data.personaDesaparecida.foto || '',
              contactoFamiliar: data.personaDesaparecida.contactoFamiliar || {
                nombre: '',
                telefono: '',
                relacion: ''
              }
            });
          }
        } catch (error) {
          console.error('❌ Error cargando datos del incidente:', error);
          toast.error('Error al cargar los datos del incidente', {
            description: 'No se pudieron cargar los datos. Intenta nuevamente.',
          });
        } finally {
          setIsLoadingData(false);
        }
      } else if (mode === 'create') {
        // Resetear al modo crear
        setFormData(getInitialFormData());
        setMissingPersonData(getInitialMissingPersonData());
      }
    };

    loadIncidentData();
  }, [incident?.id, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validación del punto 0 (RF1.1) - SOLO CAMPOS GENERALES SON OBLIGATORIOS
      if (!formData.punto0.direccion || !formData.punto0.fechaHora) {
        toast.error('Campos obligatorios incompletos', {
          description: 'Por favor completa la dirección y fecha/hora del punto 0',
          duration: 4000,
        });
        setIsSubmitting(false);
        return;
      }

      // ELIMINADAS LAS VALIDACIONES DE SOLICITANTE Y DETALLES
      // Estos campos ahora son opcionales

      const submitData = {
        ...formData,
        personaDesaparecida: formData.categoria === 'persona' && missingPersonData.nombre ? missingPersonData as MissingPerson : undefined
      };
      
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al crear el incidente', {
        description: 'Por favor intenta nuevamente.',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      estado: 'activo',
      prioridad: 'manejable',
      categoria: 'persona',
      reportadoPor: '',
      asignadoA: '',
      fechaResolucion: undefined,
      ubicacion: { lat: 0, lng: 0, direccion: '', zona: '' },
      personaDesaparecida: null,
      // Resetear campos del punto 0
      punto0: { 
        lat: 0, 
        lng: 0, 
        direccion: '', 
        zona: '',
        fechaHora: new Date()
      },
      // Resetear campos del denunciante
      denunciante: {
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        email: '',
        direccion: '',
        relacion: ''
      },
      // Resetear campos del fiscal
      fiscalSolicitante: {
        nombre: '',
        apellido: '',
        fiscalia: '',
        expediente: '',
        telefono: '',
        email: ''
      },
      // Resetear jefe de dotación
      jefeDotacion: ''
    });
    setMissingPersonData({
      nombre: '',
      apellido: '',
      edad: undefined,
      genero: undefined,
      descripcionFisica: '',
      ultimaVezVisto: {
        fecha: new Date(),
        ubicacion: '',
        coordenadas: undefined
      },
      vestimenta: '',
      condicionesMedicas: '',
      medicamentos: '',
      foto: '',
      contactoFamiliar: {
        nombre: '',
        telefono: '',
        relacion: ''
      }
    });
    setActiveTab('general');
    onClose();
  };

  // Función para obtener ubicación actual
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('La geolocalización no está disponible en este navegador', {
        description: 'Tu navegador no soporta geolocalización. Ingresa las coordenadas manualmente.',
        duration: 5000,
      });
      return;
    }

    setIsGettingLocation(true);
    
    // Toast informativo mientras se obtiene la ubicación
    const loadingToast = toast.loading('Obteniendo tu ubicación...', {
      description: 'Si tu navegador solicita permiso, debes aceptarlo para continuar.',
      duration: 15000,
    });
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          punto0: {
            ...formData.punto0,
            lat: latitude,
            lng: longitude
          }
        });
        setIsGettingLocation(false);
        setLocationObtainedAutomatically(true);
        
        // Dismiss loading toast y mostrar éxito
        toast.dismiss(loadingToast);
        toast.success('¡Ubicación obtenida exitosamente!', {
          description: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
          duration: 4000,
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
      },
      (error) => {
        let title = 'Error al obtener la ubicación';
        let description = 'Ocurrió un error inesperado';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            title = 'Permiso denegado';
            description = 'Por favor, permite el acceso a la ubicación en tu navegador y vuelve a intentar.';
            break;
          case error.POSITION_UNAVAILABLE:
            title = 'Ubicación no disponible';
            description = 'Verifica que tengas el GPS activado o que estés en un lugar con buena señal.';
            break;
          case error.TIMEOUT:
            title = 'Tiempo de espera agotado';
            description = 'Intenta nuevamente. Asegúrate de tener buena señal GPS.';
            break;
        }
        
        toast.dismiss(loadingToast);
        toast.error(title, {
          description,
          duration: 6000,
          icon: <XCircle className="h-4 w-4" />,
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutos
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {mode === 'create' ? 'Crear Nuevo Incidente' : 'Editar Incidente'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Complete todos los datos del nuevo incidente de búsqueda y rescate.' 
              : 'Modifica los datos del incidente.'}
          </DialogDescription>
        </DialogHeader>

        {/* Mostrar spinner mientras se cargan los datos */}
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <span className="ml-3 text-gray-400">Cargando datos del incidente...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="solicitante">Solicitante</TabsTrigger>
                <TabsTrigger value="persona">Detalles</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Información General</CardTitle>
                    <CardDescription>Datos básicos del incidente</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título de la Operación *</Label>
                      <Input
                        id="titulo"
                        required
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        placeholder="ej: Búsqueda de Juan Pérez en Cerro Alto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción de la Situación *</Label>
                      <Textarea
                        id="descripcion"
                        required
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Describe la situación y circunstancias de la desaparición..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Estado de la Operación</Label>
                        <Select 
                          value={formData.estado} 
                          onValueChange={(value: IncidentStatus) => setFormData({ ...formData, estado: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[30000]">
                            <SelectItem value="activo">Activo</SelectItem>
                            <SelectItem value="inactivo">Inactivo</SelectItem>
                            <SelectItem value="finalizado">Finalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Prioridad</Label>
                        <Select 
                          value={formData.prioridad} 
                          onValueChange={(value: IncidentPriority) => setFormData({ ...formData, prioridad: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[30000]">
                            <SelectItem value="manejable">Manejable</SelectItem>
                            <SelectItem value="grave">Grave</SelectItem>
                            <SelectItem value="critico">Crítico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo de Incidente</Label>
                        <Select 
                          value={formData.categoria} 
                          onValueChange={(value: IncidentCategory) => setFormData({ ...formData, categoria: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[30000]">
                            <SelectItem value="persona">Persona</SelectItem>
                            <SelectItem value="objeto">Objeto</SelectItem>
                            <SelectItem value="colaboracion_judicial">Colaboración Judicial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Punto 0 - Ubicación inicial */}
                    <Separator />
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="direccionPunto0">Dirección del Punto 0 *</Label>
                        <Input
                          id="direccionPunto0"
                          required
                          value={formData.punto0.direccion}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            punto0: { 
                              ...formData.punto0, 
                              direccion: e.target.value 
                            }
                          })}
                          placeholder="ej: Calle 123, Córdoba, Argentina"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fechaHoraPunto0">Fecha y Hora del Punto 0 *</Label>
                        <Input
                          id="fechaHoraPunto0"
                          type="datetime-local"
                          required
                          value={formData.punto0.fechaHora ? new Date(formData.punto0.fechaHora.getTime() - formData.punto0.fechaHora.getTimezoneOffset() * 60000).toISOString().slice(0, -1) : ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            punto0: { 
                              ...formData.punto0, 
                              fechaHora: new Date(e.target.value)
                            } 
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Obtener Ubicación Actual</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGetCurrentLocation}
                          disabled={isGettingLocation}
                        >
                          {isGettingLocation ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Navigation className="h-4 w-4 mr-2" />
                          )}
                          {locationObtainedAutomatically ? 'Ubicación obtenida' : 'Obtener ubicación'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="solicitante" className="space-y-4">
                {/* Datos del solicitante según el tipo de incidente */}
                {formData.categoria === 'colaboracion_judicial' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Datos del Fiscal Solicitante
                      </CardTitle>
                      <CardDescription>Información del fiscal que solicita la colaboración judicial</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fiscalNombre">Nombre</Label>
                          <Input
                            id="fiscalNombre"
                            value={formData.fiscalSolicitante.nombre}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              fiscalSolicitante: { 
                                ...formData.fiscalSolicitante, 
                                nombre: e.target.value 
                              }
                            })}
                            placeholder="Nombre del fiscal"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fiscalApellido">Apellido</Label>
                          <Input
                            id="fiscalApellido"
                            value={formData.fiscalSolicitante.apellido}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              fiscalSolicitante: { 
                                ...formData.fiscalSolicitante, 
                                apellido: e.target.value 
                              }
                            })}
                            placeholder="Apellido del fiscal"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fiscalia">Fiscalía</Label>
                          <Input
                            id="fiscalia"
                            value={formData.fiscalSolicitante.fiscalia}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              fiscalSolicitante: { 
                                ...formData.fiscalSolicitante, 
                                fiscalia: e.target.value 
                              }
                            })}
                            placeholder="Nombre de la fiscalía"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expediente">Número de Expediente</Label>
                          <Input
                            id="expediente"
                            value={formData.fiscalSolicitante.expediente}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              fiscalSolicitante: { 
                                ...formData.fiscalSolicitante, 
                                expediente: e.target.value 
                              }
                            })}
                            placeholder="Número de expediente judicial"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fiscalTelefono">Teléfono</Label>
                          <Input
                            id="fiscalTelefono"
                            value={formData.fiscalSolicitante.telefono || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              fiscalSolicitante: { ...formData.fiscalSolicitante, telefono: e.target.value }
                            })}
                            placeholder="Teléfono del fiscal"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fiscalEmail">Email</Label>
                          <Input
                            id="fiscalEmail"
                            type="email"
                            value={formData.fiscalSolicitante.email || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              fiscalSolicitante: { ...formData.fiscalSolicitante, email: e.target.value }
                            })}
                            placeholder="Email del fiscal"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Datos del Denunciante
                      </CardTitle>
                      <CardDescription>Información de la persona que reporta el incidente</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="denuncianteNombre">Nombre</Label>
                          <Input
                            id="denuncianteNombre"
                            value={formData.denunciante.nombre}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              denunciante: { 
                                ...formData.denunciante, 
                                nombre: e.target.value 
                              }
                            })}
                            placeholder="Nombre del denunciante"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="denuncianteApellido">Apellido</Label>
                          <Input
                            id="denuncianteApellido"
                            value={formData.denunciante.apellido}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              denunciante: { 
                                ...formData.denunciante, 
                                apellido: e.target.value 
                              }
                            })}
                            placeholder="Apellido del denunciante"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="denuncianteDni">DNI</Label>
                          <Input
                            id="denuncianteDni"
                            value={formData.denunciante.dni || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              denunciante: { 
                                ...formData.denunciante, 
                                dni: e.target.value 
                              }
                            })}
                            placeholder="Documento de identidad"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="denuncianteTelefono">Teléfono</Label>
                          <Input
                            id="denuncianteTelefono"
                            value={formData.denunciante.telefono || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              denunciante: { 
                                ...formData.denunciante, 
                                telefono: e.target.value 
                              }
                            })}
                            placeholder="Teléfono de contacto"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="denuncianteEmail">Email</Label>
                          <Input
                            id="denuncianteEmail"
                            type="email"
                            value={formData.denunciante.email || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              denunciante: { 
                                ...formData.denunciante, 
                                email: e.target.value 
                              }
                            })}
                            placeholder="Email de contacto"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="denuncianteDireccion">Dirección</Label>
                          <Input
                            id="denuncianteDireccion"
                            value={formData.denunciante.direccion || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              denunciante: { 
                                ...formData.denunciante, 
                                direccion: e.target.value 
                              }
                            })}
                            placeholder="Dirección del denunciante"
                          />
                      </div>

                      {formData.categoria === 'persona' && (
                        <div className="space-y-2">
                          <Label htmlFor="denuncianteRelacion">Relación con la Persona</Label>
                          <Input
                            id="denuncianteRelacion"
                            value={formData.denunciante.relacion || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              denunciante: { 
                                ...formData.denunciante, 
                                relacion: e.target.value 
                              }
                            })}
                            placeholder="ej: Madre, Esposo, Amigo, etc."
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="persona" className="space-y-4">
                {formData.categoria === 'persona' ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Datos de la Persona Desaparecida
                      </CardTitle>
                      <CardDescription>Información detallada de la persona que se busca</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Datos básicos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre</Label>
                          <Input
                            id="nombre"
                            value={missingPersonData.nombre}
                            onChange={(e) => setMissingPersonData({ ...missingPersonData, nombre: e.target.value })}
                            placeholder="Nombre de pila"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apellido">Apellido</Label>
                          <Input
                            id="apellido"
                            value={missingPersonData.apellido}
                            onChange={(e) => setMissingPersonData({ ...missingPersonData, apellido: e.target.value })}
                            placeholder="Apellido"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edad">Edad</Label>
                          <Input
                            id="edad"
                            type="number"
                            value={missingPersonData.edad || ''}
                            onChange={(e) => setMissingPersonData({ ...missingPersonData, edad: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="Edad en años"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Género</Label>
                          <Select 
                            value={missingPersonData.genero} 
                            onValueChange={(value: 'masculino' | 'femenino' | 'otro') => setMissingPersonData({ ...missingPersonData, genero: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar género" />
                            </SelectTrigger>
                            <SelectContent className="z-[30000]">
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="femenino">Femenino</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foto">URL de Foto</Label>
                          <Input
                            id="foto"
                            value={missingPersonData.foto}
                            onChange={(e) => setMissingPersonData({ ...missingPersonData, foto: e.target.value })}
                            placeholder="URL de la fotografía"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Descripción física */}
                      <div className="space-y-2">
                        <Label htmlFor="descripcionFisica">Descripción Física</Label>
                        <Textarea
                          id="descripcionFisica"
                          value={missingPersonData.descripcionFisica}
                          onChange={(e) => setMissingPersonData({ ...missingPersonData, descripcionFisica: e.target.value })}
                          placeholder="Altura, peso, color de cabello, ojos, señas particulares..."
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vestimenta">Vestimenta</Label>
                        <Textarea
                          id="vestimenta"
                          value={missingPersonData.vestimenta || ''}
                          onChange={(e) => setMissingPersonData({ ...missingPersonData, vestimenta: e.target.value })}
                          placeholder="Descripción de la ropa que llevaba puesta..."
                          className="min-h-[60px]"
                        />
                      </div>

                      <Separator />

                      {/* Información médica */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Información Médica</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="condicionesMedicas">Condiciones Médicas</Label>
                            <Textarea
                              id="condicionesMedicas"
                              value={missingPersonData.condicionesMedicas || ''}
                              onChange={(e) => setMissingPersonData({ ...missingPersonData, condicionesMedicas: e.target.value })}
                              placeholder="Enfermedades, alergias, discapacidades..."
                              className="min-h-[60px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="medicamentos">Medicamentos</Label>
                            <Textarea
                              id="medicamentos"
                              value={missingPersonData.medicamentos || ''}
                              onChange={(e) => setMissingPersonData({ ...missingPersonData, medicamentos: e.target.value })}
                              placeholder="Medicamentos que toma regularmente..."
                              className="min-h-[60px]"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Última vez visto */}
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Última Vez Visto
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fechaUltimaVez">Fecha y Hora</Label>
                            <Input
                              id="fechaUltimaVez"
                              type="datetime-local"
                              value={missingPersonData.ultimaVezVisto?.fecha ? new Date(missingPersonData.ultimaVezVisto.fecha.getTime() - missingPersonData.ultimaVezVisto.fecha.getTimezoneOffset() * 60000).toISOString().slice(0, -1) : ''}
                              onChange={(e) => setMissingPersonData({ 
                                ...missingPersonData, 
                                ultimaVezVisto: { 
                                  ...missingPersonData.ultimaVezVisto!,
                                  fecha: new Date(e.target.value)
                                } 
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ubicacionUltimaVez">Ubicación</Label>
                            <Input
                              id="ubicacionUltimaVez"
                              value={missingPersonData.ultimaVezVisto?.ubicacion}
                              onChange={(e) => setMissingPersonData({ 
                                ...missingPersonData, 
                                ultimaVezVisto: { 
                                  ...missingPersonData.ultimaVezVisto!,
                                  ubicacion: e.target.value
                                } 
                              })}
                              placeholder="Dirección o lugar específico"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Contacto familiar */}
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contacto Familiar
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nombreContacto">Nombre del Contacto</Label>
                            <Input
                              id="nombreContacto"
                              value={missingPersonData.contactoFamiliar?.nombre}
                              onChange={(e) => setMissingPersonData({ 
                                ...missingPersonData, 
                                contactoFamiliar: { 
                                  ...missingPersonData.contactoFamiliar!,
                                  nombre: e.target.value
                                } 
                              })}
                              placeholder="Nombre completo"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefonoContacto">Teléfono</Label>
                            <Input
                              id="telefonoContacto"
                              value={missingPersonData.contactoFamiliar?.telefono}
                              onChange={(e) => setMissingPersonData({ 
                                ...missingPersonData, 
                                contactoFamiliar: { 
                                  ...missingPersonData.contactoFamiliar!,
                                  telefono: e.target.value
                                } 
                              })}
                              placeholder="Número de teléfono"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="relacionContacto">Relación</Label>
                            <Input
                              id="relacionContacto"
                              value={missingPersonData.contactoFamiliar?.relacion}
                              onChange={(e) => setMissingPersonData({ 
                                ...missingPersonData, 
                                contactoFamiliar: { 
                                  ...missingPersonData.contactoFamiliar!,
                                  relacion: e.target.value
                                } 
                              })}
                              placeholder="ej: Madre, Esposo, Hijo"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-medium text-gray-600 mb-2">Datos de Persona Desaparecida</h3>
                      <p className="text-sm text-gray-500">
                        Esta sección solo está disponible para operaciones de "Persona Desaparecida"
                      </p>
                      <Badge variant="outline" className="mt-3">
                        Tipo actual: {formData.categoria.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>




            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {mode === 'create' ? 'Crear Incidente' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}