# 📊 Diagrama de Entidad-Relación (DER) - Sistema DUAR

## 🎯 Base de Datos Relacional Completa

---

## 📐 Diagrama Visual de Relaciones

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INCIDENTES (Tabla Principal)                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ PK: id (UUID)                                                     │   │
│  │ titulo, descripcion, estado, prioridad, categoria                 │   │
│  │ comandante_a_cargo                                                │   │
│  │ FK: jefe_dotacion_id → personal(id)                               │   │
│  │ tiempo_inicio, tiempo_transcurrido, pausado                       │   │
│  │ fecha_creacion, fecha_actualizacion, fecha_resolucion             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
    │           │           │           │           │           │
    │ 1:1       │ 1:1       │ 1:1       │ 1:1       │ 1:N       │ 1:N
    ▼           ▼           ▼           ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│personas_ │ │denun-    │ │fiscales_ │ │punto_0   │ │equipos   │ │archivos_ │
│desapare- │ │ciantes   │ │solici-   │ │          │ │          │ │incidente │
│cidas     │ │          │ │tantes    │ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
                                            │
                                            │ 1:N
                                            ▼
                                       ┌──────────────┐
                                       │historial_    │
                                       │punto_0       │
                                       └──────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              INCIDENTES                                  │
└─────────────────────────────────────────────────────────────────────────┘
    │           │           │           │           │
    │ 1:N       │ 1:N       │ 1:N       │ 1:N       │ 1:N
    ▼           ▼           ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│areas_    │ │archivos_ │ │comenta-  │ │eventos_  │ │notifica- │
│busqueda  │ │gpx       │ │rios_     │ │linea_    │ │ciones    │
│          │ │          │ │incidente │ │tiempo    │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
    │           │
    │           │ N:1
    ▼           ▼
┌──────────────────┐
│    EQUIPOS       │
│ ┌──────────────┐ │
│ │PK: id        │ │
│ │FK: incidente │ │
│ │FK: lider     │ │
│ └──────────────┘ │
└──────────────────┘
    │           │
    │ 1:N       │ N:1
    ▼           ▼
┌──────────┐ ┌──────────────┐
│equipo_   │ │miembros_     │
│especiali-│ │equipo        │
│dades     │ │              │
└──────────┘ └──────────────┘
                  │
                  │ N:1
                  ▼
┌───────────────────────────────────────────────────────────────┐
│                         PERSONAL                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ PK: id (UUID)                                           │   │
│  │ nombre, apellido, dni (UNIQUE), telefono, email         │   │
│  │ organizacion, jerarquia, tipo_agente                    │   │
│  │ grupo_sanguineo (OBLIGATORIO)                           │   │
│  │ alergias (OBLIGATORIO)                                  │   │
│  │ estado, disponible, turno                               │   │
│  │ coordenadas_lat, coordenadas_lng                        │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
    │           │           │
    │ 1:N       │ 1:N       │ N:M (vía personal_incidente)
    ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────────────┐
│personal_ │ │personal_ │ │personal_incidente│
│especiali-│ │certifica-│ │                  │
│dades     │ │ciones    │ │FK: incidente_id  │
└──────────┘ └──────────┘ │FK: personal_id   │
                          └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          ACCESOS QR                                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ PK: id (UUID)                                                     │   │
│  │ FK: incidente_id → incidentes(id)                                 │   │
│  │ codigo_acceso (UNIQUE), codigo_qr                                 │   │
│  │ valido_hasta, max_personal, activo                                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
    │
    │ 1:N
    ▼
┌───────────────────────────────────────────────────────────────┐
│              PERSONAL_QR_REGISTRADO                            │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ PK: id (UUID)                                           │   │
│  │ FK: acceso_qr_id → accesos_qr(id)                       │   │
│  │ nombre, apellido, dni, telefono, institucion            │   │
│  │ grupo_sanguineo, alergias, sexo                         │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔗 Resumen de Relaciones

### 1. INCIDENTES (Centro del Sistema)

| Relación | Cardinalidad | Tabla Relacionada |
|----------|--------------|-------------------|
| Jefe de Dotación | N:1 | personal |
| Persona Desaparecida | 1:1 | personas_desaparecidas |
| Denunciante | 1:1 | denunciantes |
| Fiscal Solicitante | 1:1 | fiscales_solicitantes |
| Punto 0 | 1:1 | punto_0 |
| Historial Punto 0 | 1:N | historial_punto_0 |
| Equipos | 1:N | equipos |
| Áreas de Búsqueda | 1:N | areas_busqueda |
| Archivos GPX | 1:N | archivos_gpx |
| Archivos de Incidente | 1:N | archivos_incidente |
| Comentarios | 1:N | comentarios_incidente |
| Eventos Timeline | 1:N | eventos_linea_tiempo |
| Notificaciones | 1:N | notificaciones |
| Accesos QR | 1:N | accesos_qr |
| Personal Asignado | N:M | personal (vía personal_incidente) |

### 2. PERSONAL

| Relación | Cardinalidad | Tabla Relacionada |
|----------|--------------|-------------------|
| Especialidades | 1:N | personal_especialidades |
| Certificaciones | 1:N | personal_certificaciones |
| Equipos (como líder) | 1:N | equipos |
| Equipos (como miembro) | N:M | equipos (vía miembros_equipo) |
| Incidentes | N:M | incidentes (vía personal_incidente) |
| Incidentes (como jefe) | 1:N | incidentes |

### 3. EQUIPOS

| Relación | Cardinalidad | Tabla Relacionada |
|----------|--------------|-------------------|
| Incidente | N:1 | incidentes |
| Líder | N:1 | personal |
| Miembros | N:M | personal (vía miembros_equipo) |
| Especialidades | 1:N | equipo_especialidades |
| Áreas de Búsqueda | 1:N | areas_busqueda |
| Archivos GPX | 1:N | archivos_gpx |

### 4. ACCESOS QR

| Relación | Cardinalidad | Tabla Relacionada |
|----------|--------------|-------------------|
| Incidente | N:1 | incidentes |
| Personal Registrado | 1:N | personal_qr_registrado |

---

## 📋 Tablas por Categoría

### 🚨 Gestión de Incidentes (Core)
- `incidentes` - Tabla principal
- `personas_desaparecidas` - Personas extraviadas
- `denunciantes` - Denunciantes del incidente
- `fiscales_solicitantes` - Fiscales en casos judiciales
- `punto_0` - Última ubicación conocida (BLOQUEADO)
- `historial_punto_0` - Cambios del Punto 0

### 👥 Gestión de Personal
- `personal` - Personal del sistema
- `personal_especialidades` - Especialidades (N:M)
- `personal_certificaciones` - Certificaciones y capacitaciones
- `personal_incidente` - Asignación personal-incidente (N:M)

### 👨‍👩‍👧‍👦 Gestión de Equipos
- `equipos` - Grupos de rastrillaje
- `miembros_equipo` - Miembros de equipos (N:M)
- `equipo_especialidades` - Especialidades del equipo (N:M)

### 🗺️ Gestión Geográfica
- `areas_busqueda` - Áreas delimitadas para rastrillaje
- `archivos_gpx` - Archivos GPX con trazas

### 📁 Gestión de Archivos
- `archivos_incidente` - Archivos de evidencia

### 📝 Gestión de Comunicación
- `comentarios_incidente` - Comentarios sobre incidentes
- `notificaciones` - Notificaciones del sistema

### 📊 Auditoría
- `eventos_linea_tiempo` - Timeline completo de eventos

### 📱 Acceso Rápido
- `accesos_qr` - Códigos QR generados
- `personal_qr_registrado` - Personal registrado por QR

---

## 🔑 Campos Clave

### ✅ Campos Obligatorios

#### INCIDENTES
- `titulo` ✓
- `descripcion` ✓
- `estado` ✓
- `prioridad` ✓
- `categoria` ✓

#### PERSONAL
- `nombre` ✓
- `apellido` ✓
- `dni` ✓ (UNIQUE)
- `telefono` ✓
- `organizacion` ✓
- `tipo_agente` ✓
- `grupo_sanguineo` ✓
- `alergias` ✓

#### EQUIPOS
- `nombre` ✓
- `tipo` ✓
- `incidente_id` ✓ (FK)

---

## 🎨 Tipos Enumerados (ENUMS)

### Estados y Prioridades
```sql
estado_incidente: 'activo' | 'inactivo' | 'finalizado'
prioridad_incidente: 'critico' | 'grave' | 'manejable'
categoria_incidente: 'persona' | 'objeto' | 'colaboracion_judicial'
```

### Personal
```sql
tipo_agente: 'bombero' | 'policia' | 'bombero_voluntario' | 'baqueano' |
             'defensa_civil' | 'cruz_roja' | 'rescatista' | 
             'especialista_k9' | 'paramedico' | 'externo' | 'otro'

estado_personal: 'activo' | 'en_servicio' | 'fuera_de_servicio' | 
                 'relevo' | 'de_licencia' | 'capacitacion' | 
                 'suspendido' | 'inactivo'

grupo_sanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

turno: 'mañana' | 'tarde' | 'noche' | '24_horas' | 'libre'
```

### Equipos
```sql
tipo_equipo: 'busqueda_terrestre' | 'busqueda_acuatica' | 
             'busqueda_aerea' | 'rastreo_k9' | 'rescate_tecnico' |
             'rescate_medico' | 'investigacion' | 'comando_y_control' |
             'apoyo_logistico' | 'comunicaciones' | 
             'analisis_e_inteligencia'

estado_equipo: 'disponible' | 'en_ruta' | 'en_escena' | 
               'regresando' | 'fuera_de_servicio' | 'mantenimiento'
```

### Áreas de Búsqueda
```sql
tipo_area_busqueda: 'primaria' | 'secundaria' | 'ampliada'
estado_area_busqueda: 'pendiente' | 'en_progreso' | 
                      'completada' | 'sin_resultado'
prioridad_area: 'alta' | 'media' | 'baja'
dificultad_area: 'facil' | 'moderada' | 'dificil' | 'extrema'
```

---

## 🔒 Constraints y Validaciones

### Constraints de Integridad

1. **DNI Único**
   ```sql
   UNIQUE(dni) en tabla personal
   ```

2. **Fechas Lógicas**
   ```sql
   CHECK (fecha_resolucion solo si estado IN ('inactivo', 'finalizado'))
   CHECK (fecha_vencimiento > fecha_obtencion en certificaciones)
   ```

3. **Coordenadas Válidas**
   ```sql
   CHECK (coordenadas_lat >= -90 AND coordenadas_lat <= 90)
   CHECK (coordenadas_lng >= -180 AND coordenadas_lng <= 180)
   ```

4. **Valores Positivos**
   ```sql
   CHECK (experiencia_anios >= 0)
   CHECK (capacidad_maxima > 0)
   CHECK (edad > 0 AND edad <= 150)
   ```

5. **Unicidad en Relaciones N:M**
   ```sql
   UNIQUE(equipo_id, personal_id) en miembros_equipo
   UNIQUE(incidente_id, personal_id) en personal_incidente
   UNIQUE(personal_id, especialidad) en personal_especialidades
   ```

### Foreign Keys con Cascade

**ON DELETE CASCADE:**
- Todas las tablas secundarias relacionadas con `incidentes`
- Todas las tablas secundarias relacionadas con `personal`
- Todas las tablas secundarias relacionadas con `equipos`

**ON DELETE SET NULL:**
- `incidentes.jefe_dotacion_id`
- `equipos.lider_id`
- `areas_busqueda.equipo_id`
- `archivos_gpx.equipo_id`

---

## ⚡ Índices para Optimización

### Índices Principales

```sql
-- Búsquedas frecuentes
idx_incidentes_estado
idx_incidentes_prioridad
idx_incidentes_fecha_creacion

-- Personal
idx_personal_dni
idx_personal_nombre_apellido
idx_personal_disponible

-- Equipos
idx_equipos_incidente
idx_equipos_estado

-- Coordenadas (búsquedas geográficas)
idx_punto0_coordenadas (lat, lng)
```

---

## 🔄 Triggers Automáticos

### 1. Actualización de Fechas
```sql
trigger_actualizar_incidentes
trigger_actualizar_personal
trigger_actualizar_equipos
trigger_actualizar_personas_desaparecidas
trigger_actualizar_punto0
trigger_actualizar_areas_busqueda
```

### 2. Historial de Punto 0
```sql
trigger_historial_punto0
-- Registra automáticamente cambios en historial_punto_0
```

### 3. Fecha de Resolución
```sql
trigger_fecha_resolucion
-- Actualiza automáticamente al cambiar estado del incidente
```

---

## 📊 Vistas Predefinidas

### vista_incidentes_completos
Muestra incidentes con toda la información relacionada (persona desaparecida, denunciante, fiscal, punto 0, conteos).

### vista_personal_completo
Muestra personal con especialidades concatenadas y conteos de certificaciones e incidentes.

### vista_equipos_completos
Muestra equipos con información del incidente, líder, cantidad de miembros y especialidades.

### vista_estadisticas_incidentes
Genera estadísticas agregadas de todos los incidentes.

---

## 📝 Datos Iniciales (Seeds)

El script incluye 10 registros de personal de ejemplo:
1. Carlos Méndez - Comandante (Bomberos)
2. Ana García - Capitán (Bomberos)
3. Pedro López - Subinspector (Policía)
4. Miguel Torres - Teniente (Bomberos)
5. Laura Rodríguez - Sargento (Defensa Civil)
6. Roberto Silva - Comandante (Bomberos Voluntarios)
7. María Fernández - Capitán (Cruz Roja)
8. Francisco Herrera - Teniente (Rescate Montaña)
9. José González - Comandante (Bomberos)
10. Patricia Morales - Capitán (Brigada K9)

Con especialidades asignadas:
- Búsqueda y Rescate
- K9 - Perros de Búsqueda
- Rescate en Montaña
- Emergencias Médicas
- Coordinación Operativa

---

## 🚀 Cómo Usar el Script

### Paso 1: Acceder a Supabase
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en **SQL Editor**

### Paso 2: Ejecutar el Script
1. Copia el contenido de `/database/migracion-duar-completa.sql`
2. Pégalo en el SQL Editor
3. Click en **Run** o presiona `Ctrl + Enter`

### Paso 3: Verificar
```sql
-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver estadísticas
SELECT * FROM vista_estadisticas_incidentes;

-- Ver personal inicial
SELECT * FROM vista_personal_completo;
```

---

## 📚 Próximos Pasos

1. ✅ **Script SQL ejecutado** → Base de datos creada
2. 🔄 **Migrar datos** del KV Store a las nuevas tablas
3. 🔧 **Actualizar código** de la aplicación para usar las nuevas tablas
4. 🧪 **Testing** exhaustivo de todas las funcionalidades
5. 📊 **Optimización** de queries según uso real

---

**Autor:** Sistema DUAR - Dirección de Bomberos  
**Fecha:** 12 de Noviembre de 2025  
**Versión:** 1.0
