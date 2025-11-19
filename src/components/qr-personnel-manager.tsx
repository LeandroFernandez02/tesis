import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Users,
  AlertTriangle,
  QrCode,
  UserCheck,
  X,
  Calendar,
  Building2,
  Briefcase,
  Filter
} from 'lucide-react';
import { QRAccess } from '../types/incident';
import { toast } from 'sonner@2.0.3';

export interface QRPersonnelData {
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
  estado?: 'activo' | 'inactivo';
}

interface QRPersonnelManagerProps {
  qrAccesses: QRAccess[];
  onAddPersonnel: (data: Omit<QRPersonnelData, 'id' | 'registeredAt'>) => Promise<void>;
  onUpdatePersonnel: (id: string, data: Omit<QRPersonnelData, 'id' | 'registeredAt'>) => Promise<void>;
  onDeletePersonnel: (id: string) => Promise<void>;
}

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

const ESPECIALIDADES = [
  'Caminante',
  'Dron',
  'Canes',
  'Paramédico',
  'Conductor'
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

export function QRPersonnelManager({
  qrAccesses,
  onAddPersonnel,
  onUpdatePersonnel,
  onDeletePersonnel
}: QRPersonnelManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [institutionFilter, setInstitutionFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<QRPersonnelData | null>(null);
  const [deletingPersonnel, setDeletingPersonnel] = useState<QRPersonnelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomInstitution, setShowCustomInstitution] = useState(false);
  const [customInstitution, setCustomInstitution] = useState('');
  
  const [formData, setFormData] = useState<Omit<QRPersonnelData, 'id' | 'registeredAt'>>({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    institucion: '',
    rol: '',
    sexo: 'masculino',
    alergias: '',
    grupoSanguineo: '',
    estado: 'activo'
  });

  // Obtener todos los agentes registrados mediante QR
  const allPersonnel: QRPersonnelData[] = qrAccesses.flatMap(qr => 
    qr.registeredPersonnel.map(p => ({
      id: p.id,
      nombre: p.nombre || '',
      apellido: p.apellido || '',
      dni: p.dni || '',
      telefono: p.telefono || '',
      institucion: p.institucion || '',
      rol: p.rol || '',
      sexo: p.sexo || 'masculino',
      alergias: p.alergias || '',
      grupoSanguineo: p.grupoSanguineo || '',
      registeredAt: p.registeredAt,
      estado: p.estado || 'activo'
    }))
  );

  // Calcular estadísticas de personal
  const activePersonnel = allPersonnel.filter(p => p.estado === 'activo').length;
  const inactivePersonnel = allPersonnel.filter(p => p.estado === 'inactivo').length;

  // Obtener instituciones únicas registradas via QR
  const registeredInstitutions = Array.from(
    new Set(allPersonnel.map(p => p.institucion).filter(inst => inst.trim() !== ''))
  ).sort();

  // Obtener especialidades únicas
  const registeredSpecialties = Array.from(
    new Set(allPersonnel.map(p => p.rol).filter(rol => rol.trim() !== ''))
  ).sort();

  // Función auxiliar para filtrar por fecha
  const filterByDate = (person: QRPersonnelData) => {
    if (dateFilter === 'all') return true;
    
    const registeredDate = new Date(person.registeredAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return registeredDate >= today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return registeredDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return registeredDate >= monthAgo;
      default:
        return true;
    }
  };

  // Filtrar personal por búsqueda y todos los filtros
  const filteredPersonnel = allPersonnel.filter(person => {
    // Filtro de búsqueda por texto
    const search = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || (
      person.nombre.toLowerCase().includes(search) ||
      person.apellido.toLowerCase().includes(search) ||
      person.dni.toLowerCase().includes(search) ||
      person.institucion.toLowerCase().includes(search) ||
      person.rol.toLowerCase().includes(search)
    );

    // Filtro por institución
    const matchesInstitution = institutionFilter === 'all' || person.institucion === institutionFilter;

    // Filtro por especialidad
    const matchesSpecialty = specialtyFilter === 'all' || person.rol === specialtyFilter;

    // Filtro por estado
    const matchesStatus = statusFilter === 'all' || person.estado === statusFilter;

    // Filtro por fecha
    const matchesDate = filterByDate(person);

    return matchesSearch && matchesInstitution && matchesSpecialty && matchesStatus && matchesDate;
  });

  // Función para resetear todos los filtros
  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setInstitutionFilter('all');
    setSpecialtyFilter('all');
    setStatusFilter('all');
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      dni: '',
      telefono: '',
      institucion: '',
      rol: '',
      sexo: 'masculino',
      alergias: '',
      grupoSanguineo: '',
      estado: 'activo'
    });
    setError(null);
    setEditingPersonnel(null);
    setShowCustomInstitution(false);
    setCustomInstitution('');
  };

  const handleOpenDialog = (person?: QRPersonnelData) => {
    if (person) {
      setEditingPersonnel(person);
      
      // Verificar si la institución existe en las registradas
      const institutionExists = registeredInstitutions.includes(person.institucion);
      
      setFormData({
        nombre: person.nombre,
        apellido: person.apellido,
        dni: person.dni,
        telefono: person.telefono,
        institucion: person.institucion,
        rol: person.rol,
        sexo: person.sexo,
        alergias: person.alergias,
        grupoSanguineo: person.grupoSanguineo,
        estado: person.estado || 'activo'
      });
      
      // Si la institución no está en la lista, mostrar campo personalizado
      if (!institutionExists && person.institucion) {
        setShowCustomInstitution(true);
        setCustomInstitution(person.institucion);
      }
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('Nombre y apellido son obligatorios');
      return false;
    }
    
    if (!formData.dni.trim()) {
      setError('DNI es obligatorio');
      return false;
    }
    
    if (!formData.telefono.trim()) {
      setError('Teléfono es obligatorio');
      return false;
    }
    
    if (!formData.institucion) {
      setError('Debe seleccionar una institución');
      return false;
    }
    
    if (!formData.rol) {
      setError('Debe seleccionar un rol');
      return false;
    }
    
    if (!formData.alergias) {
      setError('Debe seleccionar alergias');
      return false;
    }
    
    if (!formData.grupoSanguineo) {
      setError('Debe seleccionar grupo sanguíneo');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (editingPersonnel) {
        await onUpdatePersonnel(editingPersonnel.id, formData);
        toast.success('Personal actualizado exitosamente');
      } else {
        await onAddPersonnel(formData);
        toast.success('Personal agregado exitosamente');
      }
      handleCloseDialog();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (person: QRPersonnelData) => {
    setDeletingPersonnel(person);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPersonnel) return;

    setLoading(true);
    try {
      await onDeletePersonnel(deletingPersonnel.id);
      toast.success('Personal eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingPersonnel(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    // Si el campo es institución y se selecciona "Otra...", mostrar campo personalizado
    if (field === 'institucion' && value === '__custom__') {
      setShowCustomInstitution(true);
      setFormData(prev => ({ ...prev, [field]: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (field === 'institucion') {
        setShowCustomInstitution(false);
        setCustomInstitution('');
      }
    }
    setError(null);
  };

  const handleCustomInstitutionChange = (value: string) => {
    setCustomInstitution(value);
    setFormData(prev => ({ ...prev, institucion: value }));
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="h-6 w-6 text-red-600" />
            Personal Asignado
          </h1>
          <p className="text-muted-foreground">
            Gestión completa de personal registrado en el incidente
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-red-600 hover:bg-red-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Agregar Personal
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Personal en el Incidente</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{allPersonnel.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Personal Activo</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{activePersonnel}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Personal Inactivo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{inactivePersonnel}</div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Registrado con Filtros Integrados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Personal Registrado
              </CardTitle>
              <CardDescription>
                Lista completa de personal asignado al incidente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros integrados */}
          <div className="border-b pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Búsqueda */}
              <div className="space-y-2">
                <label>Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nombre, DNI, institución..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <label>Fecha</label>
                <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Institución */}
              <div className="space-y-2">
                <label>Institución</label>
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {registeredInstitutions.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Especialidad */}
              <div className="space-y-2">
                <label>Especialidad</label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {ESPECIALIDADES.map((esp) => (
                      <SelectItem key={esp} value={esp}>
                        {esp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <label>Estado</label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contador de resultados y botón limpiar filtros */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Mostrando {filteredPersonnel.length} de {allPersonnel.length} registros
              </div>

              {/* Botón limpiar filtros */}
              {(searchTerm || dateFilter !== 'all' || institutionFilter !== 'all' || specialtyFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Tabla de Personal */}
          {filteredPersonnel.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {searchTerm ? (
                <p>No se encontraron resultados para "{searchTerm}"</p>
              ) : (
                <>
                  <p className="mb-2">No hay personal registrado aún</p>
                  <p className="text-sm">Agrega personal manualmente o genera un código QR para registro</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Institución</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Sexo</TableHead>
                    <TableHead>Grupo Sang.</TableHead>
                    <TableHead>Alergias</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPersonnel.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>
                        <div>
                          <div>{person.nombre} {person.apellido}</div>
                        </div>
                      </TableCell>
                      <TableCell>{person.dni}</TableCell>
                      <TableCell>{person.telefono}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{person.institucion}</Badge>
                      </TableCell>
                      <TableCell>{person.rol}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={person.estado === 'activo' ? 'default' : 'secondary'}
                          className={person.estado === 'activo' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                          }
                        >
                          {person.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {person.sexo === 'masculino' ? 'M' : 'F'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {person.grupoSanguineo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {person.alergias === 'Ninguna' ? (
                          <span className="text-muted-foreground">Ninguna</span>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                            {person.alergias}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(person.registeredAt).toLocaleDateString('es-AR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(person)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(person)}
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

      {/* Dialog para Agregar/Editar Personal */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-red-600" />
              {editingPersonnel ? 'Editar Personal' : 'Agregar Personal'}
            </DialogTitle>
            <DialogDescription>
              {editingPersonnel 
                ? 'Modifica los datos del personal seleccionado' 
                : 'Completa el formulario para agregar personal manualmente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => updateField('nombre', e.target.value)}
                  placeholder="Ingrese nombre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => updateField('apellido', e.target.value)}
                  placeholder="Ingrese apellido"
                />
              </div>
            </div>

            {/* DNI */}
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => updateField('dni', e.target.value)}
                placeholder="Ingrese DNI"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => updateField('telefono', e.target.value)}
                placeholder="Ingrese teléfono"
              />
            </div>

            {/* Institución */}
            <div className="space-y-2">
              <Label htmlFor="institucion">Institución *</Label>
              {!showCustomInstitution ? (
                <Select
                  value={formData.institucion || undefined}
                  onValueChange={(value) => updateField('institucion', value)}
                >
                  <SelectTrigger id="institucion">
                    <SelectValue placeholder="Seleccione una institución" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUCIONES.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                    {registeredInstitutions.filter(inst => !INSTITUCIONES.includes(inst)).length > 0 && (
                      <>
                        <div className="my-1 h-px bg-border" />
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          Otras Dotaciones Registradas
                        </div>
                        {registeredInstitutions.filter(inst => !INSTITUCIONES.includes(inst)).map((inst) => (
                          <SelectItem key={inst} value={inst}>
                            {inst}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    <div className="my-1 h-px bg-border" />
                    <SelectItem value="__custom__">
                      <span className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Otra dotación/institución...
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="institucion-custom"
                    placeholder="Nombre de Dotación o Institución"
                    value={customInstitution}
                    onChange={(e) => handleCustomInstitutionChange(e.target.value)}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCustomInstitution(false);
                      setCustomInstitution('');
                      setFormData(prev => ({ ...prev, institucion: '' }));
                    }}
                    className="text-xs"
                  >
                    Volver a seleccionar de la lista
                  </Button>
                </div>
              )}
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <Label htmlFor="rol">Especialidad *</Label>
              <Select
                value={formData.rol}
                onValueChange={(value) => updateField('rol', value)}
              >
                <SelectTrigger id="rol">
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
                value={formData.sexo}
                onValueChange={(value) => updateField('sexo', value as 'masculino' | 'femenino')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="masculino" id="m" />
                  <Label htmlFor="m" className="cursor-pointer">
                    Masculino
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="femenino" id="f" />
                  <Label htmlFor="f" className="cursor-pointer">
                    Femenino
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Alergias */}
            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias *</Label>
              <Select
                value={formData.alergias}
                onValueChange={(value) => updateField('alergias', value)}
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

            {/* Grupo Sanguíneo */}
            <div className="space-y-2">
              <Label htmlFor="grupoSanguineo">Grupo Sanguíneo *</Label>
              <Select
                value={formData.grupoSanguineo}
                onValueChange={(value) => updateField('grupoSanguineo', value)}
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

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => updateField('estado', value as 'activo' | 'inactivo')}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Guardando...' : editingPersonnel ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a{' '}
              <strong>{deletingPersonnel?.nombre} {deletingPersonnel?.apellido}</strong> del registro.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
