import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { CheckCircle, AlertTriangle, UserPlus, Shield, Users, Edit, Trash2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PersonnelRegistrationFormProps {
  accessCode: string;
  incidentTitle?: string;
  onSubmit: (data: PersonnelFormData) => Promise<void>;
  embedded?: boolean; // Cuando está en modal, oculta resumen y lista de agentes
  onComplete?: () => void; // Callback opcional cuando se completa el registro en modo embedded
}

export interface PersonnelFormData {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  institucion: string;
  rol: string;
  sexo: 'masculino' | 'femenino';
  alergias: string;
  grupoSanguineo: string;
  estado?: 'activo' | 'inactivo';
}

interface Agent extends PersonnelFormData {
  tempId: string;
}

const ESPECIALIDADES = [
  'Caminante',
  'Dron',
  'Canes',
  'Paramédico',
  'Conductor'
];

const INSTITUCIONES = [
  'G.E.R - Cruz del Eje',
  'C.E.R - San Alberto',
  'C.E.P Punilla',
  'G.E.R.S - San Javier',
  'G.E.R.S - Calamuchita',
  'G.E.R.S - Rio Cuarto',
  'G.E.R.S - San Justo',
  'G.E.R.S - Santa Maria',
  'G.E.S - Capital',
  'B.B.R - Capital',
  'BRIMAP - Capital'
];

const GRUPOS_SANGUINEOS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Desconocido'
];

const ALERGIAS_COMUNES = [
  'Ninguna',
  'Penicilina',
  'Aspirina',
  'Ibuprofeno',
  'Látex',
  'Mariscos',
  'Frutos secos',
  'Polen',
  'Picaduras de insectos',
  'Otra'
];

const emptyFormData: Omit<PersonnelFormData, 'institucion'> = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  rol: '',
  sexo: 'masculino',
  alergias: '',
  grupoSanguineo: ''
};

export function PersonnelRegistrationForm({ 
  accessCode, 
  incidentTitle,
  onSubmit,
  embedded = false,
  onComplete
}: PersonnelRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'leader' | 'agents' | 'review'>('leader');
  
  // Datos del líder
  const [leaderData, setLeaderData] = useState<PersonnelFormData | null>(null);
  
  // Datos de agentes
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editingAgentIndex, setEditingAgentIndex] = useState<number | null>(null);
  
  // Formulario del líder
  const [leaderFormData, setLeaderFormData] = useState<PersonnelFormData>({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    institucion: '',
    rol: '',
    sexo: 'masculino',
    alergias: '',
    grupoSanguineo: ''
  });

  // Formulario de agente (sin institución porque la hereda del líder)
  const [agentFormData, setAgentFormData] = useState<Omit<PersonnelFormData, 'institucion'>>({
    ...emptyFormData
  });

  const updateLeaderField = (field: keyof PersonnelFormData, value: string) => {
    setLeaderFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const updateAgentField = (field: keyof Omit<PersonnelFormData, 'institucion'>, value: string) => {
    setAgentFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateLeaderForm = (): boolean => {
    if (!leaderFormData.nombre.trim() || !leaderFormData.apellido.trim()) {
      setError('Nombre y apellido son obligatorios');
      return false;
    }
    
    if (!leaderFormData.dni.trim()) {
      setError('DNI es obligatorio');
      return false;
    }
    
    if (!leaderFormData.telefono.trim()) {
      setError('Teléfono es obligatorio');
      return false;
    }
    
    if (!leaderFormData.institucion.trim()) {
      setError('Nombre de dotación o institución es obligatorio');
      return false;
    }
    
    if (!leaderFormData.rol) {
      setError('Debe seleccionar un rol');
      return false;
    }
    
    if (!leaderFormData.alergias) {
      setError('Debe seleccionar alergias');
      return false;
    }
    
    if (!leaderFormData.grupoSanguineo) {
      setError('Debe seleccionar grupo sanguíneo');
      return false;
    }

    return true;
  };

  const validateAgentForm = (): boolean => {
    if (!agentFormData.nombre.trim() || !agentFormData.apellido.trim()) {
      setError('Nombre y apellido son obligatorios');
      return false;
    }
    
    if (!agentFormData.dni.trim()) {
      setError('DNI es obligatorio');
      return false;
    }
    
    if (!agentFormData.telefono.trim()) {
      setError('Teléfono es obligatorio');
      return false;
    }
    
    if (!agentFormData.rol) {
      setError('Debe seleccionar un rol');
      return false;
    }
    
    if (!agentFormData.alergias) {
      setError('Debe seleccionar alergias');
      return false;
    }
    
    if (!agentFormData.grupoSanguineo) {
      setError('Debe seleccionar grupo sanguíneo');
      return false;
    }

    return true;
  };

  const handleLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLeaderForm()) return;

    setLeaderData(leaderFormData);
    setStep('agents');
    toast.success('Líder registrado. Ahora puede agregar agentes a su dotación.');
  };

  const handleAddAgent = () => {
    if (!validateAgentForm()) return;

    const newAgent: Agent = {
      ...agentFormData,
      institucion: leaderData!.institucion, // Hereda la institución del líder
      tempId: `agent-${Date.now()}`
    };

    if (editingAgentIndex !== null) {
      // Actualizar agente existente
      const updatedAgents = [...agents];
      updatedAgents[editingAgentIndex] = newAgent;
      setAgents(updatedAgents);
      toast.success('Agente actualizado');
      setEditingAgentIndex(null);
      
      // Resetear formulario
      setAgentFormData({ ...emptyFormData });
      setError(null);
      
      // Redirigir al paso de revisión
      setStep('review');
    } else {
      // Agregar nuevo agente
      setAgents(prev => [...prev, newAgent]);
      toast.success('Agente agregado');
      
      // Resetear formulario
      setAgentFormData({ ...emptyFormData });
      setError(null);
    }
  };

  const handleEditAgent = (index: number) => {
    const agent = agents[index];
    setAgentFormData({
      nombre: agent.nombre,
      apellido: agent.apellido,
      dni: agent.dni,
      telefono: agent.telefono,
      rol: agent.rol,
      sexo: agent.sexo,
      alergias: agent.alergias,
      grupoSanguineo: agent.grupoSanguineo
    });
    setEditingAgentIndex(index);
  };

  const handleDeleteAgent = (index: number) => {
    setAgents(prev => prev.filter((_, i) => i !== index));
    toast.success('Agente eliminado');
    if (editingAgentIndex === index) {
      setEditingAgentIndex(null);
      setAgentFormData({ ...emptyFormData });
    }
  };

  const handleCancelEdit = () => {
    setEditingAgentIndex(null);
    setAgentFormData({ ...emptyFormData });
    setError(null);
  };

  const handleBackToLeader = () => {
    setStep('leader');
    setAgents([]);
    setAgentFormData({ ...emptyFormData });
    setEditingAgentIndex(null);
    setError(null);
  };

  const handleFinalSubmit = async () => {
    if (!leaderData) return;

    setLoading(true);
    setError(null);

    try {
      // Enviar líder
      await onSubmit(leaderData);
      
      // Enviar agentes
      for (const agent of agents) {
        const agentData: PersonnelFormData = {
          nombre: agent.nombre,
          apellido: agent.apellido,
          dni: agent.dni,
          telefono: agent.telefono,
          institucion: agent.institucion,
          rol: agent.rol,
          sexo: agent.sexo,
          alergias: agent.alergias,
          grupoSanguineo: agent.grupoSanguineo
        };
        await onSubmit(agentData);
      }

      setSuccess(true);
      toast.success('Dotación completa registrada exitosamente');
      
      // Si está en modo embedded y hay callback, llamarlo después de un delay
      if (embedded && onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // PASO 3: Revisión y CRUD de todos los registros
  if (step === 'review') {
    type ReviewPerson = (Agent & { isLeader?: boolean });
    const allPersonnel: ReviewPerson[] = leaderData 
      ? [{ ...leaderData, tempId: 'leader', isLeader: true } as ReviewPerson, ...agents] 
      : [];

    return (
      <div className={embedded ? "" : "min-h-screen bg-background p-4"}>
        <div className={embedded ? "space-y-6" : "max-w-6xl mx-auto space-y-6"}>
          {/* Tabla de todos los registros */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Apellido</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPersonnel.map((person, index) => (
                      <TableRow key={person.tempId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {person.isLeader && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                Líder
                              </Badge>
                            )}
                            {person.nombre}
                          </div>
                        </TableCell>
                        <TableCell>{person.apellido}</TableCell>
                        <TableCell>{person.dni}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (person.isLeader) {
                                  setStep('leader');
                                } else {
                                  const agentIndex = agents.findIndex(a => a.tempId === person.tempId);
                                  if (agentIndex !== -1) {
                                    handleEditAgent(agentIndex);
                                    setStep('agents');
                                  }
                                }
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!person.isLeader && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const agentIndex = agents.findIndex(a => a.tempId === person.tempId);
                                  if (agentIndex !== -1) {
                                    handleDeleteAgent(agentIndex);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botones de navegación */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('agents')}
                  className="flex-1"
                  size="lg"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Paso Anterior
                </Button>
                
                <Button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {loading ? 'Finalizando...' : 'Finalizar'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Al finalizar, toda la dotación quedará registrada en el incidente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={embedded ? "" : "min-h-screen bg-background flex items-center justify-center p-4"}>
        <Card className="w-full max-w-md border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2>¡Registro Exitoso!</h2>
                <p className="text-muted-foreground">
                  La dotación completa ha sido registrada correctamente.
                </p>
                {incidentTitle && (
                  <p className="text-sm">
                    <strong>Incidente:</strong> {incidentTitle}
                  </p>
                )}
                <div className="pt-2">
                  <Badge variant="outline" className="text-lg">
                    {leaderData?.institucion}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total registrados: 1 líder + {agents.length} agente{agents.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Alert className="bg-green-100 border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {embedded 
                    ? 'Personal registrado exitosamente. El modal se cerrará automáticamente.'
                    : 'Por favor, preséntense con el coordinador del incidente para recibir instrucciones.'
                  }
                </AlertDescription>
              </Alert>
              
              {embedded && onComplete && (
                <Button
                  variant="outline"
                  onClick={onComplete}
                  className="w-full"
                >
                  Cerrar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PASO 1: Registro del líder
  if (step === 'leader') {
    return (
      <div className={embedded ? "" : "min-h-screen bg-background flex items-center justify-center p-4"}>
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-red-600" />
              Registro del Líder de Dotación
            </CardTitle>
            <CardDescription>
              {incidentTitle ? `Incidente: ${incidentTitle}` : 'Complete sus datos como líder de la dotación'}
            </CardDescription>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-sm">
                <span className="text-muted-foreground">Código de acceso:</span>
                <span className="tracking-wider">{accessCode}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLeaderSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Nombre de Dotación/Institución */}
              <div className="space-y-2">
                <Label htmlFor="institucion">Institución *</Label>
                <Select
                  value={leaderFormData.institucion}
                  onValueChange={(value) => updateLeaderField('institucion', value)}
                >
                  <SelectTrigger id="institucion">
                    <SelectValue placeholder="Seleccione institución" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUCIONES.map((institucion) => (
                      <SelectItem key={institucion} value={institucion}>
                        {institucion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Esta institución se aplicará a todos los agentes de su dotación
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Datos del Líder
                </h3>

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={leaderFormData.nombre}
                      onChange={(e) => updateLeaderField('nombre', e.target.value)}
                      placeholder="Ingrese su nombre"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={leaderFormData.apellido}
                      onChange={(e) => updateLeaderField('apellido', e.target.value)}
                      placeholder="Ingrese su apellido"
                      required
                    />
                  </div>
                </div>

                {/* DNI y Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI *</Label>
                    <Input
                      id="dni"
                      value={leaderFormData.dni}
                      onChange={(e) => updateLeaderField('dni', e.target.value)}
                      placeholder="Ingrese su DNI"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={leaderFormData.telefono}
                      onChange={(e) => updateLeaderField('telefono', e.target.value)}
                      placeholder="Ingrese su teléfono"
                      required
                    />
                  </div>
                </div>

                {/* Especialidad */}
                <div className="space-y-2">
                  <Label htmlFor="rol">Especialidad *</Label>
                  <Select
                    value={leaderFormData.rol}
                    onValueChange={(value) => updateLeaderField('rol', value)}
                  >
                    <SelectTrigger id="rol">
                      <SelectValue placeholder="Seleccione su especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESPECIALIDADES.map((especialidad) => (
                        <SelectItem key={especialidad} value={especialidad}>
                          {especialidad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sexo */}
                <div className="space-y-2">
                  <Label>Sexo *</Label>
                  <RadioGroup
                    value={leaderFormData.sexo}
                    onValueChange={(value) => updateLeaderField('sexo', value as 'masculino' | 'femenino')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="masculino-leader" />
                      <Label htmlFor="masculino-leader" className="cursor-pointer">
                        Masculino
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="femenino" id="femenino-leader" />
                      <Label htmlFor="femenino-leader" className="cursor-pointer">
                        Femenino
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Alergias y Grupo Sanguíneo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alergias">Alergias *</Label>
                    <Select
                      value={leaderFormData.alergias}
                      onValueChange={(value) => updateLeaderField('alergias', value)}
                    >
                      <SelectTrigger id="alergias">
                        <SelectValue placeholder="Seleccione alergias" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALERGIAS_COMUNES.map((alergia) => (
                          <SelectItem key={alergia} value={alergia}>
                            {alergia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grupoSanguineo">Grupo Sanguíneo *</Label>
                    <Select
                      value={leaderFormData.grupoSanguineo}
                      onValueChange={(value) => updateLeaderField('grupoSanguineo', value)}
                    >
                      <SelectTrigger id="grupoSanguineo">
                        <SelectValue placeholder="Seleccione grupo sanguíneo" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRUPOS_SANGUINEOS.map((grupo) => (
                          <SelectItem key={grupo} value={grupo}>
                            {grupo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Botón de continuar */}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Continuar al Registro de Agentes
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Una vez registrado, podrá agregar los agentes de su dotación
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PASO 2: Registro de agentes
  return (
    <div className={embedded ? "" : "min-h-screen bg-background p-4"}>
      <div className={embedded ? "space-y-6" : "max-w-6xl mx-auto space-y-6"}>
        {/* Header con info del líder */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Líder: {leaderData?.nombre} {leaderData?.apellido}
                </CardTitle>
                <CardDescription className="text-green-800">
                  Dotación: <strong>{leaderData?.institucion}</strong>
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToLeader}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Cambiar Líder
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className={embedded ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6"}>
          {/* Formulario de agente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-red-600" />
                {editingAgentIndex !== null ? 'Editar Agente' : 'Agregar Agente'}
              </CardTitle>
              <CardDescription>
                Complete los datos del agente (la dotación es: {leaderData?.institucion})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-nombre">Nombre *</Label>
                  <Input
                    id="agent-nombre"
                    value={agentFormData.nombre}
                    onChange={(e) => updateAgentField('nombre', e.target.value)}
                    placeholder="Nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-apellido">Apellido *</Label>
                  <Input
                    id="agent-apellido"
                    value={agentFormData.apellido}
                    onChange={(e) => updateAgentField('apellido', e.target.value)}
                    placeholder="Apellido"
                  />
                </div>
              </div>

              {/* DNI y Teléfono */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-dni">DNI *</Label>
                  <Input
                    id="agent-dni"
                    value={agentFormData.dni}
                    onChange={(e) => updateAgentField('dni', e.target.value)}
                    placeholder="DNI"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-telefono">Teléfono *</Label>
                  <Input
                    id="agent-telefono"
                    type="tel"
                    value={agentFormData.telefono}
                    onChange={(e) => updateAgentField('telefono', e.target.value)}
                    placeholder="Teléfono"
                  />
                </div>
              </div>

              {/* Especialidad */}
              <div className="space-y-2">
                <Label htmlFor="agent-rol">Especialidad *</Label>
                <Select
                  value={agentFormData.rol}
                  onValueChange={(value) => updateAgentField('rol', value)}
                >
                  <SelectTrigger id="agent-rol">
                    <SelectValue placeholder="Seleccione especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESPECIALIDADES.map((especialidad) => (
                      <SelectItem key={especialidad} value={especialidad}>
                        {especialidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sexo */}
              <div className="space-y-2">
                <Label>Sexo *</Label>
                <RadioGroup
                  value={agentFormData.sexo}
                  onValueChange={(value) => updateAgentField('sexo', value as 'masculino' | 'femenino')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="masculino" id="masculino-agent" />
                    <Label htmlFor="masculino-agent" className="cursor-pointer">
                      Masculino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="femenino" id="femenino-agent" />
                    <Label htmlFor="femenino-agent" className="cursor-pointer">
                      Femenino
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Alergias y Grupo Sanguíneo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-alergias">Alergias *</Label>
                  <Select
                    value={agentFormData.alergias}
                    onValueChange={(value) => updateAgentField('alergias', value)}
                  >
                    <SelectTrigger id="agent-alergias">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALERGIAS_COMUNES.map((alergia) => (
                        <SelectItem key={alergia} value={alergia}>
                          {alergia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-grupoSanguineo">Grupo Sang. *</Label>
                  <Select
                    value={agentFormData.grupoSanguineo}
                    onValueChange={(value) => updateAgentField('grupoSanguineo', value)}
                  >
                    <SelectTrigger id="agent-grupoSanguineo">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRUPOS_SANGUINEOS.map((grupo) => (
                        <SelectItem key={grupo} value={grupo}>
                          {grupo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                {editingAgentIndex !== null && (
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  onClick={handleAddAgent}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {editingAgentIndex !== null ? 'Actualizar Agente' : 'Agregar Agente'}
                </Button>
              </div>

              {/* Botón para ir a revisión en modo embedded */}
              {embedded && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => setStep('review')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Ver Todos los Registros ({1 + agents.length})
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Revise todos los datos antes de finalizar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de agentes - solo visible si NO está en modo embedded */}
          {!embedded && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  Agentes Registrados ({agents.length})
                </CardTitle>
                <CardDescription>
                  Lista de agentes de la dotación {leaderData?.institucion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No hay agentes agregados aún</p>
                    <p className="text-sm">Use el formulario para agregar agentes a su dotación</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>DNI</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agents.map((agent, index) => (
                          <TableRow key={agent.tempId}>
                            <TableCell>
                              <div>
                                <div>{agent.nombre} {agent.apellido}</div>
                                <div className="text-xs text-muted-foreground">
                                  {agent.sexo === 'masculino' ? 'M' : 'F'} • {agent.grupoSanguineo}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{agent.dni}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{agent.rol}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAgent(index)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAgent(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botón para ir a revisión - solo visible si NO está en modo embedded */}
        {!embedded && (
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3>Resumen Parcial</h3>
                    <p className="text-sm text-muted-foreground">
                      1 líder + {agents.length} agente{agents.length !== 1 ? 's' : ''} = {1 + agents.length} persona{(1 + agents.length) !== 1 ? 's' : ''} total
                    </p>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {leaderData?.institucion}
                  </Badge>
                </div>
                
                <Button
                  onClick={() => setStep('review')}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Ver Todos los Registros y Finalizar
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Revise todos los datos antes de completar el registro
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
