# 📊 Diagrama de Entidad-Relación (DER) - Sistema DUAR

## 🎯 Arquitectura de Base de Datos

El Sistema DUAR utiliza una **arquitectura de almacenamiento Clave-Valor (Key-Value)** sobre PostgreSQL con Supabase.

### 📁 Tabla Principal: `kv_store_10a11e59`

```sql
CREATE TABLE kv_store_10a11e59 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

**Descripción:** 
- Tabla única que almacena toda la información del sistema en formato JSONB
- Permite flexibilidad total para el prototipado
- Las claves siguen un patrón de prefijos para organización lógica

---

## 🔑 Estructura de Claves (Keys)

### 1. **Incidentes**
**Patrón:** `incident:{id}`

**Ejemplo:** `incident:m8k2x9p5qw`

### 2. **Archivos de Incidente**
**Patrón:** `files:{incidentId}`

**Ejemplo:** `files:m8k2x9p5qw`

### 3. **Técnicos/Comandantes**
**Patrón:** `technicians`

**Ejemplo:** `technicians`

### 4. **Notificaciones**
**Patrón:** `notifications`

**Ejemplo:** `notifications`

---

## 📋 Entidades Principales del Sistema

### 🚨 1. Incident (Incidente)

**Propósito:** Representa un caso de búsqueda y rescate o colaboración judicial.

**Campos Principales:**

```typescript
{
  id: string                          // Identificador único
  titulo: string                      // Título del incidente
  descripcion: string                 // Descripción detallada
  estado: 'activo' | 'inactivo' | 'finalizado'
  prioridad: 'critico' | 'grave' | 'manejable'
  categoria: 'persona' | 'objeto' | 'colaboracion_judicial'
  
  // Solicitantes
  denunciante?: Denunciante
  fiscalSolicitante?: FiscalSolicitante
  
  // Persona desaparecida (si aplica)
  personaDesaparecida?: MissingPerson
  
  // Responsables
  jefeDotacion?: string               // ID del jefe de dotación
  comandanteACargo?: string           // Nombre del comandante
  
  // Ubicación crítica
  punto0: {                           // Última ubicación conocida (BLOQUEADO)
    lat: number
    lng: number
    direccion: string
    zona?: string
    fechaHora: Date
    bloqueado?: boolean
  }
  
  historialPuntos0?: []               // Historial de cambios del Punto 0
  ubicacionesAdicionales?: []         // Puntos de interés adicionales
  
  // Recursos asignados
  personalAsignado?: string[]         // IDs de personal
  equiposAsignados?: string[]         // IDs de grupos/teams
  
  // Archivos y evidencia
  archivosEvidencia?: IncidentFile[]
  archivoGPX?: GPXFile
  
  // Áreas de búsqueda
  areasBusqueda?: SearchArea[]
  
  // Trazabilidad
  timelineEventos?: TimelineEvent[]
  notificaciones?: IncidentNotification[]
  comentarios: IncidentComment[]
  
  // QR Access para registro rápido
  accesosQR?: QRAccess[]
  
  // Control de tiempo
  tiempoInicio?: Date
  tiempoTranscurrido?: number
  pausado?: boolean
  
  // Fechas
  fechaCreacion: Date
  fechaActualizacion: Date
  fechaResolucion?: Date
}
```

**Relaciones:**
- 1:N con `Personnel` (personal asignado)
- 1:N con `Team` (equipos asignados)
- 1:N con `IncidentFile` (archivos de evidencia)
- 1:N con `TimelineEvent` (eventos del timeline)
- 1:N con `QRAccess` (códigos QR generados)
- 1:1 con `MissingPerson` (persona desaparecida)
- 1:1 con `Denunciante` (denunciante del caso)
- 1:1 con `FiscalSolicitante` (fiscal si es colaboración judicial)

---

### 👤 2. Personnel (Personal)

**Propósito:** Representa a un agente del sistema (bombero, policía, rescatista, etc.)

**Campos Principales:**

```typescript
{
  id: string
  
  // Datos personales
  nombre: string
  apellido: string
  dni: string                         // OBLIGATORIO
  telefono: string
  email?: string
  
  // Datos organizacionales
  organizacion: Organization          // Ver tipos abajo
  jerarquia: PersonnelRank
  tipoAgente: AgentType
  numeroPlaca?: string
  unidad?: string
  
  // Datos médicos (OBLIGATORIOS para seguridad)
  grupoSanguineo: BloodType          // OBLIGATORIO
  alergias: string                   // OBLIGATORIO
  
  // Contacto de emergencia
  telefonoEmergencia?: string
  contactoEmergencia?: {
    nombre: string
    telefono: string
    relacion: string
  }
  
  // Capacidades
  especialidad: PersonnelSpecialty[]
  certificaciones: Certification[]
  
  // Estado operacional
  estado: PersonnelStatus
  disponible: boolean
  turno: Shift
  
  // Ubicación
  ubicacionActual?: string
  coordenadasActuales?: { lat, lng }
  
  // Asignaciones
  equipoAsignado?: string             // ID del equipo
  
  // Otros
  foto?: string
  fechaIngreso: string
  experienciaAnios: number
  nivelClearance: ClearanceLevel
  observaciones?: string
}
```

**Tipos de Agente (AgentType):**
- bombero
- policia
- bombero_voluntario
- baqueano
- defensa_civil
- cruz_roja
- rescatista
- especialista_k9
- paramedico
- externo
- otro

**Especialidades (PersonnelSpecialty):**
- Búsqueda y Rescate
- Rastreo y Seguimiento
- K9 - Perros de Búsqueda
- Rescate en Montaña
- Rescate en Alturas
- Rescate Acuático
- Navegación GPS
- Cartografía y Topografía
- Comunicaciones
- Emergencias Médicas
- Paramedico
- Manejo de Drones
- Y más... (ver `/types/personnel.ts`)

**Relaciones:**
- N:1 con `Incident` (puede estar asignado a uno o más incidentes)
- N:1 con `Team` (puede pertenecer a un equipo)

---

### 👥 3. Team (Grupo de Rastrillaje)

**Propósito:** Representa un grupo de trabajo independiente por incidente.

**Campos Principales:**

```typescript
{
  id: string
  nombre: string
  tipo: TeamType
  
  // Miembros del equipo
  lider?: Personnel                   // Líder opcional
  miembros: Personnel[]               // Array de miembros
  
  // Especialización
  especialidad: PersonnelSpecialty[]
  
  // Estado operacional
  estado: TeamStatus
  turno: Shift
  capacidadMaxima: number
  
  // Asignación
  incidenteAsignado?: string          // ID del incidente
  
  // Ubicación
  ubicacionBase: string
  
  // Equipamiento (NO SE USA - solo recursos humanos)
  equipamiento: Equipment[]           // Mantener para compatibilidad
  
  // Control
  fechaCreacion: string
  observaciones?: string
}
```

**Tipos de Equipo (TeamType):**
- Búsqueda Terrestre
- Búsqueda Acuática
- Búsqueda Aérea
- Rastreo K9
- Rescate Técnico
- Rescate Médico
- Investigación
- Comando y Control
- Apoyo Logístico
- Comunicaciones
- Análisis e Inteligencia

**Relaciones:**
- N:1 con `Incident` (cada grupo pertenece a un incidente)
- 1:N con `Personnel` (contiene varios miembros)
- 0:1 con `Personnel` (puede tener un líder)
- 0:1 con `GPXFile` (puede tener archivos GPX asignados)

---

### 📄 4. IncidentFile (Archivo de Evidencia)

**Propósito:** Archivos adjuntos al incidente (fotos, documentos, etc.)

```typescript
{
  id: string
  incidentId: string
  name: string
  type: string                        // MIME type
  size: number                        // Bytes
  url: string                         // URL del archivo
  uploadedAt: string
  uploadedBy: string
  description?: string
}
```

**Relaciones:**
- N:1 con `Incident`

---

### 🗺️ 5. GPXFile (Archivo GPX)

**Propósito:** Archivos GPX cargados para trazas de rastrillaje.

```typescript
{
  id: string
  nombre: string
  archivo: string                     // Base64 o path
  fechaSubida: Date
  puntos: number
  tracks: GPXTrack[]
  waypoints: GPXWaypoint[]
}
```

**GPXTrack:**
```typescript
{
  nombre: string
  puntos: GPSCoordinate[]
  distancia: number
  duracion?: number
}
```

**GPXWaypoint:**
```typescript
{
  nombre: string
  coordenadas: GPSCoordinate
  descripcion?: string
  tipo: 'inicio' | 'punto_interes' | 'peligro' | 'refugio' | 'agua' | 'otro'
}
```

**Relaciones:**
- N:1 con `Incident`
- 0:1 con `Team` (puede estar asignado a un grupo)

---

### 📍 6. SearchArea (Área de Búsqueda)

**Propósito:** Zonas delimitadas para rastrillaje sistemático.

```typescript
{
  id: string
  nombre: string
  tipo: 'primaria' | 'secundaria' | 'ampliada'
  coordenadas: GPSCoordinate[]
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'sin_resultado'
  equipoAsignado?: string             // ID del equipo
  prioridad: 'alta' | 'media' | 'baja'
  dificultad: 'facil' | 'moderada' | 'dificil' | 'extrema'
  terreno: string
  observaciones?: string
}
```

**Relaciones:**
- N:1 con `Incident`
- 0:1 con `Team` (puede estar asignado a un grupo)

---

### 📱 7. QRAccess (Acceso QR)

**Propósito:** Códigos QR generados para registro rápido de personal externo.

```typescript
{
  id: string
  incidentId: string
  accessCode: string                  // Código alfanumérico único
  qrCode: string                      // Datos del QR
  validUntil: Date
  maxPersonnel?: number               // Límite de registros
  registeredPersonnel: QRRegisteredPersonnel[]
  createdAt: Date
  createdBy: string
  active: boolean
  allowedRoles?: string[]
}
```

**QRRegisteredPersonnel:**
```typescript
{
  id: string
  nombre: string
  apellido: string
  dni: string
  telefono: string
  institucion: string
  rol: string
  sexo: 'masculino' | 'femenino'
  alergias: string
  grupoSanguineo: string
  registeredAt: Date
  estado?: 'activo' | 'inactivo'
}
```

**Relaciones:**
- N:1 con `Incident`
- 1:N con `QRRegisteredPersonnel` (contiene registros de personal)

---

### 📋 8. TimelineEvent (Evento de Timeline)

**Propósito:** Registro de todos los eventos del incidente para auditoría.

```typescript
{
  id: string
  incidentId: string
  type: 'created' | 'assignment' | 'status_change' | 'comment' | 
        'file_upload' | 'location_update' | 'personnel_assigned' | 
        'team_assigned' | 'team_created' | 'team_updated' | 'team_deleted'
  timestamp: string
  user: {
    id: string
    name: string
    role: string
    avatar: string
  }
  description: string
  details?: {
    oldValue?: string
    newValue?: string
    comment?: string
    fileId?: string
    personnelId?: string
    teamId?: string
  }
  priority?: 'low' | 'medium' | 'high' | 'critical'
}
```

**Relaciones:**
- N:1 con `Incident`

---

### 🔔 9. IncidentNotification (Notificación)

**Propósito:** Notificaciones del sistema para usuarios.

```typescript
{
  id: string
  incidentId: string
  type: 'critical' | 'status_change' | 'assignment' | 
        'file_upload' | 'comment' | 'personnel_update'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  read: boolean
  targetUsers?: string[]
}
```

**Relaciones:**
- N:1 con `Incident`

---

### 👤 10. MissingPerson (Persona Desaparecida)

**Propósito:** Información de la persona desaparecida en incidentes de categoría "persona".

```typescript
{
  nombre: string
  apellido: string
  edad?: number
  genero?: 'masculino' | 'femenino' | 'otro'
  descripcionFisica: string
  ultimaVezVisto: {
    fecha: Date
    ubicacion: string
    coordenadas?: { lat: number; lng: number }
  }
  vestimenta?: string
  condicionesMedicas?: string
  medicamentos?: string
  foto?: string
  contactoFamiliar: {
    nombre: string
    telefono: string
    relacion: string
  }
}
```

**Relaciones:**
- 1:1 con `Incident`

---

### 📞 11. Denunciante

**Propósito:** Información del denunciante del incidente.

```typescript
{
  nombre: string
  apellido: string
  dni?: string
  telefono?: string
  email?: string
  direccion?: string
  relacion?: string                   // Relación con la persona desaparecida
}
```

**Relaciones:**
- 1:1 con `Incident`

---

### ⚖️ 12. FiscalSolicitante

**Propósito:** Información del fiscal en casos de colaboración judicial.

```typescript
{
  nombre: string
  apellido: string
  fiscalia: string
  expediente: string
  telefono?: string
  email?: string
}
```

**Relaciones:**
- 1:1 con `Incident`

---

## 🔗 Diagrama de Relaciones Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                         INCIDENT (Incidente)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ • id, titulo, descripcion, estado, prioridad, categoria   │  │
│  │ • punto0 (BLOQUEADO), historialPuntos0                    │  │
│  │ • comandanteACargo, jefeDotacion                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ 1:1                │ 1:N                │ 1:N
         ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ MissingPerson    │  │ TimelineEvent    │  │ IncidentFile     │
│ Denunciante      │  │ Notification     │  │ GPXFile          │
│ FiscalSolicitante│  │ QRAccess         │  │ SearchArea       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
                               │
                               │ 1:N
                               ▼
                      ┌────────────────────┐
                      │ QRRegisteredPersonnel │
                      └────────────────────┘

         INCIDENT
              │
              │ 1:N (personalAsignado)
              ▼
      ┌──────────────┐
      │  PERSONNEL   │
      │  (Personal)  │
      └──────────────┘
              │
              │ N:1 (miembros)
              ▼
      ┌──────────────┐
      │     TEAM     │
      │   (Grupo)    │
      └──────────────┘
              │
              │ N:1 (equiposAsignados)
              ▼
         INCIDENT
```

---

## 🔧 Operaciones CRUD

### API Endpoints del Servidor

**Base URL:** `/make-server-69ee164a`

#### Incidentes
- `GET /incidents` - Obtener todos los incidentes (con filtros)
- `GET /incidents/:id` - Obtener incidente específico
- `POST /incidents` - Crear nuevo incidente
- `PUT /incidents/:id` - Actualizar incidente
- `DELETE /incidents/:id` - Eliminar incidente
- `GET /incidents/stats` - Obtener estadísticas

#### Archivos
- `POST /incidents/:id/files` - Subir archivo
- `GET /incidents/:id/files` - Obtener archivos del incidente
- `DELETE /files/:fileId` - Eliminar archivo

#### Comentarios
- `POST /incidents/:id/comments` - Agregar comentario

#### Técnicos/Comandantes
- `GET /technicians` - Obtener lista de técnicos
- `POST /technicians` - Agregar técnico

#### Notificaciones
- `GET /notifications` - Obtener notificaciones
- `POST /notifications` - Crear notificación
- `PATCH /notifications/:id/read` - Marcar como leída

#### Inicialización
- `POST /initialize` - Inicializar datos de ejemplo
- `GET /health` - Health check

---

## 📊 Funciones KV Store

El sistema utiliza las siguientes funciones para interactuar con la base de datos:

```typescript
// Operaciones individuales
set(key: string, value: any): Promise<void>
get(key: string): Promise<any>
del(key: string): Promise<void>

// Operaciones múltiples
mset(keys: string[], values: any[]): Promise<void>
mget(keys: string[]): Promise<any[]>
mdel(keys: string[]): Promise<void>

// Búsqueda por prefijo
getByPrefix(prefix: string): Promise<any[]>
```

**Nota:** NO existe función `list()` - usar `getByPrefix()` en su lugar.

---

## ⚠️ Consideraciones Importantes

### 🔒 Limitaciones
1. **NO se pueden crear nuevas tablas** - Todo debe almacenarse en `kv_store`
2. **NO se pueden escribir migraciones DDL** - La estructura es fija
3. **NO existe función `list()`** - Usar `getByPrefix()` para listar
4. **Solo recursos humanos** - No gestionar vehículos ni equipamiento material

### ✅ Ventajas del Sistema KV
1. **Flexibilidad total** - Permite cambiar estructura sin migraciones
2. **Ideal para prototipado** - Cambios rápidos sin DDL
3. **JSONB eficiente** - PostgreSQL optimiza queries JSONB
4. **Escalable** - Supabase maneja el backend

### 🔐 Seguridad
1. **SUPABASE_SERVICE_ROLE_KEY** - NUNCA exponer en frontend
2. **Authorization tokens** - Usar en llamadas al servidor
3. **Validación de datos** - Todas las entradas deben validarse
4. **Auditoría completa** - Timeline registra todos los cambios

---

## 📝 Notas de Implementación

### Estados de Incidente
Solo tres estados permitidos:
- `activo` - Incidente en curso
- `inactivo` - Pausado temporalmente
- `finalizado` - Caso cerrado

### Punto 0 (Última Ubicación Conocida)
- **CRÍTICO:** Campo bloqueado para evitar modificaciones accidentales
- Cambios registrados en `historialPuntos0[]`
- Siempre centrado en Córdoba, Argentina por defecto

### Grupos Independientes por Incidente
- Cada incidente tiene sus propios grupos (`getIncidentTeams()`)
- Personal puede agregarse por asignación directa o QR
- Archivos GPX se enlazan a grupos específicos

### Especialidades del Personal
Nomenclatura cambiada: "Rol" → "Especialidad"
- caminante
- dron
- canes
- paramédico
- conductor

---

## 📚 Referencias

- Código de tipos: `/types/incident.ts`, `/types/personnel.ts`
- Servidor backend: `/supabase/functions/server/index.tsx`
- KV Store: `/supabase/functions/server/kv_store.tsx`
- Hook de datos: `/hooks/useIncidents.ts`

---

**Fecha de creación:** Miércoles, 12 de Noviembre de 2025  
**Versión del sistema:** DUAR v1.0  
**Autor:** Sistema de Gestión de Búsqueda y Rescate
