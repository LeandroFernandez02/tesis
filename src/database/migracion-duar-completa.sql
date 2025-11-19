-- ============================================================================
-- SISTEMA DUAR - DIRECCIÓN DE BOMBEROS
-- Script de Migración Completo - Base de Datos Relacional
-- ============================================================================
-- Descripción: Sistema de Gestión de Búsqueda y Rescate
-- Versión: 1.0
-- Fecha: 12 de Noviembre de 2025
-- Idioma: Español
-- ============================================================================

-- ============================================================================
-- EXTENSIONES REQUERIDAS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Para coordenadas geográficas avanzadas (opcional)

-- ============================================================================
-- ELIMINACIÓN DE TABLAS EXISTENTES (si existen)
-- ============================================================================

DROP TABLE IF EXISTS personal_certificaciones CASCADE;
DROP TABLE IF EXISTS personal_especialidades CASCADE;
DROP TABLE IF EXISTS equipo_especialidades CASCADE;
DROP TABLE IF EXISTS personal_qr_registrado CASCADE;
DROP TABLE IF EXISTS accesos_qr CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS eventos_linea_tiempo CASCADE;
DROP TABLE IF EXISTS comentarios_incidente CASCADE;
DROP TABLE IF EXISTS archivos_incidente CASCADE;
DROP TABLE IF EXISTS archivos_gpx CASCADE;
DROP TABLE IF EXISTS areas_busqueda CASCADE;
DROP TABLE IF EXISTS historial_punto_0 CASCADE;
DROP TABLE IF EXISTS punto_0 CASCADE;
DROP TABLE IF EXISTS fiscales_solicitantes CASCADE;
DROP TABLE IF EXISTS denunciantes CASCADE;
DROP TABLE IF EXISTS personas_desaparecidas CASCADE;
DROP TABLE IF EXISTS personal_incidente CASCADE;
DROP TABLE IF EXISTS miembros_equipo CASCADE;
DROP TABLE IF EXISTS equipos CASCADE;
DROP TABLE IF EXISTS personal CASCADE;
DROP TABLE IF EXISTS incidentes CASCADE;

-- ============================================================================
-- TIPOS ENUMERADOS (ENUMS)
-- ============================================================================

-- Estados de Incidente
DROP TYPE IF EXISTS estado_incidente CASCADE;
CREATE TYPE estado_incidente AS ENUM ('activo', 'inactivo', 'finalizado');

-- Prioridades de Incidente
DROP TYPE IF EXISTS prioridad_incidente CASCADE;
CREATE TYPE prioridad_incidente AS ENUM ('critico', 'grave', 'manejable');

-- Categorías de Incidente
DROP TYPE IF EXISTS categoria_incidente CASCADE;
CREATE TYPE categoria_incidente AS ENUM ('persona', 'objeto', 'colaboracion_judicial');

-- Tipos de Agente
DROP TYPE IF EXISTS tipo_agente CASCADE;
CREATE TYPE tipo_agente AS ENUM (
  'bombero',
  'policia',
  'bombero_voluntario',
  'baqueano',
  'defensa_civil',
  'cruz_roja',
  'rescatista',
  'especialista_k9',
  'paramedico',
  'externo',
  'otro'
);

-- Grupos Sanguíneos
DROP TYPE IF EXISTS grupo_sanguineo CASCADE;
CREATE TYPE grupo_sanguineo AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Estados de Personal
DROP TYPE IF EXISTS estado_personal CASCADE;
CREATE TYPE estado_personal AS ENUM (
  'activo',
  'en_servicio',
  'fuera_de_servicio',
  'relevo',
  'de_licencia',
  'capacitacion',
  'suspendido',
  'inactivo'
);

-- Turnos
DROP TYPE IF EXISTS turno CASCADE;
CREATE TYPE turno AS ENUM ('mañana', 'tarde', 'noche', '24_horas', 'libre');

-- Tipos de Equipo
DROP TYPE IF EXISTS tipo_equipo CASCADE;
CREATE TYPE tipo_equipo AS ENUM (
  'busqueda_terrestre',
  'busqueda_acuatica',
  'busqueda_aerea',
  'rastreo_k9',
  'rescate_tecnico',
  'rescate_medico',
  'investigacion',
  'comando_y_control',
  'apoyo_logistico',
  'comunicaciones',
  'analisis_e_inteligencia'
);

-- Estados de Equipo
DROP TYPE IF EXISTS estado_equipo CASCADE;
CREATE TYPE estado_equipo AS ENUM (
  'disponible',
  'en_ruta',
  'en_escena',
  'regresando',
  'fuera_de_servicio',
  'mantenimiento'
);

-- Tipos de Área de Búsqueda
DROP TYPE IF EXISTS tipo_area_busqueda CASCADE;
CREATE TYPE tipo_area_busqueda AS ENUM ('primaria', 'secundaria', 'ampliada');

-- Estados de Área de Búsqueda
DROP TYPE IF EXISTS estado_area_busqueda CASCADE;
CREATE TYPE estado_area_busqueda AS ENUM ('pendiente', 'en_progreso', 'completada', 'sin_resultado');

-- Prioridades de Área
DROP TYPE IF EXISTS prioridad_area CASCADE;
CREATE TYPE prioridad_area AS ENUM ('alta', 'media', 'baja');

-- Dificultad de Área
DROP TYPE IF EXISTS dificultad_area CASCADE;
CREATE TYPE dificultad_area AS ENUM ('facil', 'moderada', 'dificil', 'extrema');

-- Género
DROP TYPE IF EXISTS genero CASCADE;
CREATE TYPE genero AS ENUM ('masculino', 'femenino', 'otro');

-- Nivel de Clearance
DROP TYPE IF EXISTS nivel_clearance CASCADE;
CREATE TYPE nivel_clearance AS ENUM ('publico', 'restringido', 'confidencial', 'secreto', 'alto_secreto');

-- Tipos de Eventos de Timeline
DROP TYPE IF EXISTS tipo_evento_timeline CASCADE;
CREATE TYPE tipo_evento_timeline AS ENUM (
  'creado',
  'asignacion',
  'cambio_estado',
  'comentario',
  'subida_archivo',
  'actualizacion_ubicacion',
  'personal_asignado',
  'equipo_asignado',
  'equipo_creado',
  'equipo_actualizado',
  'equipo_eliminado',
  'punto_0_actualizado'
);

-- Prioridad de Eventos
DROP TYPE IF EXISTS prioridad_evento CASCADE;
CREATE TYPE prioridad_evento AS ENUM ('baja', 'media', 'alta', 'critica');

-- Tipos de Notificación
DROP TYPE IF EXISTS tipo_notificacion CASCADE;
CREATE TYPE tipo_notificacion AS ENUM (
  'critica',
  'cambio_estado',
  'asignacion',
  'subida_archivo',
  'comentario',
  'actualizacion_personal'
);

-- ============================================================================
-- TABLA: incidentes
-- ============================================================================

CREATE TABLE incidentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  estado estado_incidente NOT NULL DEFAULT 'activo',
  prioridad prioridad_incidente NOT NULL DEFAULT 'manejable',
  categoria categoria_incidente NOT NULL,
  
  -- Responsables
  comandante_a_cargo VARCHAR(255),
  jefe_dotacion_id UUID, -- FK a personal (agregada después)
  
  -- Control de Tiempo
  tiempo_inicio TIMESTAMP WITH TIME ZONE,
  tiempo_transcurrido BIGINT DEFAULT 0, -- En milisegundos
  pausado BOOLEAN DEFAULT FALSE,
  
  -- Fechas
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  
  -- Auditoría
  creado_por VARCHAR(255),
  actualizado_por VARCHAR(255),
  
  -- Metadatos
  observaciones TEXT,
  
  -- Constraints
  CONSTRAINT chk_fecha_resolucion CHECK (
    (estado IN ('inactivo', 'finalizado') AND fecha_resolucion IS NOT NULL) OR
    (estado = 'activo' AND fecha_resolucion IS NULL)
  )
);

-- Comentarios de tabla
COMMENT ON TABLE incidentes IS 'Tabla principal de incidentes de búsqueda y rescate';
COMMENT ON COLUMN incidentes.tiempo_transcurrido IS 'Tiempo transcurrido en milisegundos';
COMMENT ON COLUMN incidentes.pausado IS 'Indica si el contador de tiempo está pausado';

-- ============================================================================
-- TABLA: personal
-- ============================================================================

CREATE TABLE personal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Datos Personales (Obligatorios)
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  
  -- Datos Organizacionales
  organizacion VARCHAR(100) NOT NULL,
  jerarquia VARCHAR(100),
  tipo_agente tipo_agente NOT NULL,
  numero_placa VARCHAR(50),
  unidad VARCHAR(100),
  
  -- Datos Médicos (Obligatorios)
  grupo_sanguineo grupo_sanguineo NOT NULL,
  alergias TEXT NOT NULL DEFAULT '',
  
  -- Contacto de Emergencia
  telefono_emergencia VARCHAR(20),
  contacto_emergencia_nombre VARCHAR(100),
  contacto_emergencia_telefono VARCHAR(20),
  contacto_emergencia_relacion VARCHAR(50),
  
  -- Estado Operacional
  estado estado_personal NOT NULL DEFAULT 'activo',
  disponible BOOLEAN DEFAULT TRUE,
  turno turno,
  
  -- Datos de Servicio
  fecha_ingreso DATE,
  experiencia_anios INTEGER DEFAULT 0,
  experiencia_sar INTEGER DEFAULT 0, -- Años de experiencia en SAR
  
  -- Ubicación Actual
  ubicacion_actual VARCHAR(255),
  coordenadas_lat DECIMAL(10, 8),
  coordenadas_lng DECIMAL(11, 8),
  
  -- Seguridad
  nivel_clearance nivel_clearance DEFAULT 'publico',
  
  -- Otros
  foto TEXT, -- URL o Base64
  ultima_capacitacion VARCHAR(255),
  observaciones TEXT,
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  creado_por VARCHAR(255),
  actualizado_por VARCHAR(255),
  
  -- Constraints
  CONSTRAINT chk_experiencia_positiva CHECK (experiencia_anios >= 0),
  CONSTRAINT chk_coordenadas_lat CHECK (coordenadas_lat >= -90 AND coordenadas_lat <= 90),
  CONSTRAINT chk_coordenadas_lng CHECK (coordenadas_lng >= -180 AND coordenadas_lng <= 180)
);

-- Comentarios
COMMENT ON TABLE personal IS 'Personal de emergencias del sistema DUAR';
COMMENT ON COLUMN personal.dni IS 'Documento Nacional de Identidad - Campo único y obligatorio';
COMMENT ON COLUMN personal.grupo_sanguineo IS 'Grupo sanguíneo - Obligatorio para seguridad';
COMMENT ON COLUMN personal.alergias IS 'Alergias conocidas - Obligatorio aunque sea vacío';

-- ============================================================================
-- TABLA: equipos
-- ============================================================================

CREATE TABLE equipos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  tipo tipo_equipo NOT NULL,
  
  -- Relaciones
  incidente_id UUID NOT NULL, -- FK a incidentes
  lider_id UUID, -- FK a personal (opcional)
  
  -- Estado
  estado estado_equipo NOT NULL DEFAULT 'disponible',
  turno turno,
  capacidad_maxima INTEGER DEFAULT 10,
  
  -- Ubicación
  ubicacion_base VARCHAR(255),
  
  -- Fechas
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Otros
  observaciones TEXT,
  
  -- Constraints
  CONSTRAINT chk_capacidad_positiva CHECK (capacidad_maxima > 0)
);

COMMENT ON TABLE equipos IS 'Grupos de rastrillaje independientes por incidente';
COMMENT ON COLUMN equipos.incidente_id IS 'Cada equipo pertenece a un incidente específico';

-- ============================================================================
-- TABLA: miembros_equipo (Relación N:N entre equipos y personal)
-- ============================================================================

CREATE TABLE miembros_equipo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_id UUID NOT NULL, -- FK a equipos
  personal_id UUID NOT NULL, -- FK a personal
  rol VARCHAR(100),
  fecha_asignacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_liberacion TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT TRUE,
  observaciones TEXT,
  
  -- Constraints
  CONSTRAINT uq_equipo_personal UNIQUE(equipo_id, personal_id)
);

COMMENT ON TABLE miembros_equipo IS 'Miembros asignados a cada equipo';

-- ============================================================================
-- TABLA: personal_incidente (Relación N:N entre incidentes y personal)
-- ============================================================================

CREATE TABLE personal_incidente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL, -- FK a incidentes
  personal_id UUID NOT NULL, -- FK a personal
  fecha_asignacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_liberacion TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT TRUE,
  observaciones TEXT,
  
  -- Constraints
  CONSTRAINT uq_incidente_personal UNIQUE(incidente_id, personal_id)
);

COMMENT ON TABLE personal_incidente IS 'Personal asignado directamente a incidentes';

-- ============================================================================
-- TABLA: personas_desaparecidas
-- ============================================================================

CREATE TABLE personas_desaparecidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL UNIQUE, -- FK a incidentes (1:1)
  
  -- Datos Personales
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  edad INTEGER,
  genero genero,
  descripcion_fisica TEXT NOT NULL,
  
  -- Última Vez Visto
  ultima_vez_visto_fecha TIMESTAMP WITH TIME ZONE,
  ultima_vez_visto_ubicacion VARCHAR(255),
  ultima_vez_visto_lat DECIMAL(10, 8),
  ultima_vez_visto_lng DECIMAL(11, 8),
  
  -- Detalles
  vestimenta TEXT,
  condiciones_medicas TEXT,
  medicamentos TEXT,
  foto TEXT, -- URL o Base64
  
  -- Contacto Familiar
  contacto_nombre VARCHAR(100),
  contacto_telefono VARCHAR(20),
  contacto_relacion VARCHAR(50),
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_edad_positiva CHECK (edad > 0 AND edad <= 150)
);

COMMENT ON TABLE personas_desaparecidas IS 'Información de personas desaparecidas en incidentes tipo "persona"';

-- ============================================================================
-- TABLA: denunciantes
-- ============================================================================

CREATE TABLE denunciantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL UNIQUE, -- FK a incidentes (1:1)
  
  -- Datos Personales
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20),
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  relacion VARCHAR(100), -- Relación con la persona desaparecida/objeto
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE denunciantes IS 'Información de denunciantes de incidentes';

-- ============================================================================
-- TABLA: fiscales_solicitantes
-- ============================================================================

CREATE TABLE fiscales_solicitantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL UNIQUE, -- FK a incidentes (1:1)
  
  -- Datos del Fiscal
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fiscalia VARCHAR(255) NOT NULL,
  expediente VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(255),
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE fiscales_solicitantes IS 'Información de fiscales en casos de colaboración judicial';

-- ============================================================================
-- TABLA: punto_0 (Punto 0 Actual)
-- ============================================================================

CREATE TABLE punto_0 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL UNIQUE, -- FK a incidentes (1:1 - solo punto actual)
  
  -- Ubicación
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  zona VARCHAR(255),
  
  -- Control
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  bloqueado BOOLEAN DEFAULT TRUE, -- Bloqueado por defecto para evitar cambios accidentales
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  actualizado_por VARCHAR(255),
  
  -- Constraints
  CONSTRAINT chk_punto0_lat CHECK (lat >= -90 AND lat <= 90),
  CONSTRAINT chk_punto0_lng CHECK (lng >= -180 AND lng <= 180)
);

COMMENT ON TABLE punto_0 IS 'Última ubicación conocida (Punto 0) - Campo crítico bloqueado';
COMMENT ON COLUMN punto_0.bloqueado IS 'Si es TRUE, requiere confirmación especial para modificar';

-- ============================================================================
-- TABLA: historial_punto_0
-- ============================================================================

CREATE TABLE historial_punto_0 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL, -- FK a incidentes
  
  -- Ubicación
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  zona VARCHAR(255),
  
  -- Razon del cambio
  razon TEXT,
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  modificado_por VARCHAR(255),
  
  -- Constraints
  CONSTRAINT chk_hist_punto0_lat CHECK (lat >= -90 AND lat <= 90),
  CONSTRAINT chk_hist_punto0_lng CHECK (lng >= -180 AND lng <= 180)
);

COMMENT ON TABLE historial_punto_0 IS 'Historial de cambios del Punto 0 para trazabilidad';

-- ============================================================================
-- TABLA: areas_busqueda
-- ============================================================================

CREATE TABLE areas_busqueda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL, -- FK a incidentes
  equipo_id UUID, -- FK a equipos (opcional)
  
  -- Datos del Área
  nombre VARCHAR(255) NOT NULL,
  tipo tipo_area_busqueda NOT NULL,
  estado estado_area_busqueda NOT NULL DEFAULT 'pendiente',
  prioridad prioridad_area NOT NULL DEFAULT 'media',
  dificultad dificultad_area NOT NULL DEFAULT 'moderada',
  terreno VARCHAR(255),
  
  -- Coordenadas (almacenadas como JSONB)
  coordenadas JSONB NOT NULL, -- Array de {lat, lng, elevation?, timestamp?}
  
  -- Otros
  observaciones TEXT,
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE areas_busqueda IS 'Áreas delimitadas para rastrillaje sistemático';
COMMENT ON COLUMN areas_busqueda.coordenadas IS 'Array JSON de coordenadas GPS del polígono';

-- ============================================================================
-- TABLA: archivos_gpx
-- ============================================================================

CREATE TABLE archivos_gpx (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL, -- FK a incidentes
  equipo_id UUID, -- FK a equipos (opcional - enlazado al grupo)
  
  -- Datos del Archivo
  nombre VARCHAR(255) NOT NULL,
  archivo TEXT NOT NULL, -- Base64 o path
  fecha_subida TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  puntos INTEGER,
  
  -- Tracks y Waypoints (almacenados como JSONB)
  tracks JSONB, -- Array de tracks con puntos
  waypoints JSONB, -- Array de waypoints
  
  -- Auditoría
  subido_por VARCHAR(255),
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE archivos_gpx IS 'Archivos GPX cargados para trazas de rastrillaje';
COMMENT ON COLUMN archivos_gpx.equipo_id IS 'Grupo al que está enlazado el archivo GPX';

-- ============================================================================
-- TABLA: archivos_incidente
-- ============================================================================

CREATE TABLE archivos_incidente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL, -- FK a incidentes
  
  -- Datos del Archivo
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL, -- MIME type
  tamaño BIGINT, -- Tamaño en bytes
  url TEXT NOT NULL,
  descripcion TEXT,
  
  -- Auditoría
  fecha_subida TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  subido_por VARCHAR(255),
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE archivos_incidente IS 'Archivos de evidencia adjuntos a incidentes';

-- ============================================================================
-- TABLA: comentarios_incidente
-- ============================================================================

CREATE TABLE comentarios_incidente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL, -- FK a incidentes
  
  -- Contenido
  autor VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  
  -- Auditoría
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE comentarios_incidente IS 'Comentarios y notas sobre incidentes';

-- ============================================================================
-- TABLA: eventos_linea_tiempo
-- ============================================================================

CREATE TABLE eventos_linea_tiempo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL, -- FK a incidentes
  
  -- Tipo de Evento
  tipo tipo_evento_timeline NOT NULL,
  
  -- Usuario que generó el evento
  usuario_id VARCHAR(255),
  usuario_nombre VARCHAR(255),
  usuario_rol VARCHAR(100),
  usuario_avatar TEXT,
  
  -- Descripción
  descripcion TEXT NOT NULL,
  
  -- Detalles adicionales (almacenados como JSONB)
  detalles JSONB,
  
  -- Prioridad
  prioridad prioridad_evento DEFAULT 'media',
  
  -- Auditoría
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE eventos_linea_tiempo IS 'Timeline de eventos para auditoría completa del incidente';
COMMENT ON COLUMN eventos_linea_tiempo.detalles IS 'Detalles específicos del evento en formato JSON';

-- ============================================================================
-- TABLA: notificaciones
-- ============================================================================

CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID, -- FK a incidentes (opcional - puede ser global)
  
  -- Tipo y Contenido
  tipo tipo_notificacion NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  prioridad prioridad_evento NOT NULL DEFAULT 'media',
  
  -- Estado
  leida BOOLEAN DEFAULT FALSE,
  
  -- Destinatarios (almacenado como JSONB)
  usuarios_destino JSONB, -- Array de IDs de usuarios
  
  -- Auditoría
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notificaciones IS 'Notificaciones del sistema para usuarios';

-- ============================================================================
-- TABLA: accesos_qr
-- ============================================================================

CREATE TABLE accesos_qr (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL, -- FK a incidentes
  
  -- Código QR
  codigo_acceso VARCHAR(50) UNIQUE NOT NULL,
  codigo_qr TEXT NOT NULL, -- Datos del QR
  
  -- Validez
  valido_hasta TIMESTAMP WITH TIME ZONE NOT NULL,
  max_personal INTEGER, -- Límite de registros
  activo BOOLEAN DEFAULT TRUE,
  
  -- Roles permitidos (almacenado como JSONB)
  roles_permitidos JSONB, -- Array de roles
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  creado_por VARCHAR(255),
  
  -- Constraints
  CONSTRAINT chk_max_personal_positivo CHECK (max_personal IS NULL OR max_personal > 0)
);

COMMENT ON TABLE accesos_qr IS 'Códigos QR generados para registro rápido de personal externo';

-- ============================================================================
-- TABLA: personal_qr_registrado
-- ============================================================================

CREATE TABLE personal_qr_registrado (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acceso_qr_id UUID NOT NULL, -- FK a accesos_qr
  
  -- Datos Personales
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  institucion VARCHAR(255) NOT NULL,
  rol VARCHAR(100) NOT NULL,
  sexo genero NOT NULL,
  
  -- Datos Médicos
  alergias TEXT NOT NULL DEFAULT '',
  grupo_sanguineo grupo_sanguineo NOT NULL,
  
  -- Estado
  estado estado_personal DEFAULT 'activo',
  
  -- Auditoría
  fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE personal_qr_registrado IS 'Personal registrado mediante códigos QR';

-- ============================================================================
-- TABLA: personal_especialidades (Relación N:N)
-- ============================================================================

CREATE TABLE personal_especialidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personal_id UUID NOT NULL, -- FK a personal
  especialidad VARCHAR(100) NOT NULL,
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT uq_personal_especialidad UNIQUE(personal_id, especialidad)
);

COMMENT ON TABLE personal_especialidades IS 'Especialidades del personal (relación muchos a muchos)';

-- ============================================================================
-- TABLA: personal_certificaciones
-- ============================================================================

CREATE TABLE personal_certificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personal_id UUID NOT NULL, -- FK a personal
  
  -- Datos de Certificación
  nombre VARCHAR(255) NOT NULL,
  entidad_certificadora VARCHAR(255) NOT NULL,
  fecha_obtencion DATE NOT NULL,
  fecha_vencimiento DATE,
  vigente BOOLEAN DEFAULT TRUE,
  nivel VARCHAR(50), -- Básico, Intermedio, Avanzado, Instructor
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_fechas_certificacion CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento > fecha_obtencion)
);

COMMENT ON TABLE personal_certificaciones IS 'Certificaciones y capacitaciones del personal';

-- ============================================================================
-- TABLA: equipo_especialidades (Relación N:N)
-- ============================================================================

CREATE TABLE equipo_especialidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_id UUID NOT NULL, -- FK a equipos
  especialidad VARCHAR(100) NOT NULL,
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT uq_equipo_especialidad UNIQUE(equipo_id, especialidad)
);

COMMENT ON TABLE equipo_especialidades IS 'Especialidades de los equipos (relación muchos a muchos)';

-- ============================================================================
-- FOREIGN KEYS (LLAVES FORÁNEAS)
-- ============================================================================

-- Incidentes -> Personal (Jefe de Dotación)
ALTER TABLE incidentes
  ADD CONSTRAINT fk_incidentes_jefe_dotacion
  FOREIGN KEY (jefe_dotacion_id)
  REFERENCES personal(id)
  ON DELETE SET NULL;

-- Equipos -> Incidentes
ALTER TABLE equipos
  ADD CONSTRAINT fk_equipos_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Equipos -> Personal (Líder)
ALTER TABLE equipos
  ADD CONSTRAINT fk_equipos_lider
  FOREIGN KEY (lider_id)
  REFERENCES personal(id)
  ON DELETE SET NULL;

-- Miembros Equipo -> Equipos
ALTER TABLE miembros_equipo
  ADD CONSTRAINT fk_miembros_equipo_equipo
  FOREIGN KEY (equipo_id)
  REFERENCES equipos(id)
  ON DELETE CASCADE;

-- Miembros Equipo -> Personal
ALTER TABLE miembros_equipo
  ADD CONSTRAINT fk_miembros_equipo_personal
  FOREIGN KEY (personal_id)
  REFERENCES personal(id)
  ON DELETE CASCADE;

-- Personal Incidente -> Incidentes
ALTER TABLE personal_incidente
  ADD CONSTRAINT fk_personal_incidente_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Personal Incidente -> Personal
ALTER TABLE personal_incidente
  ADD CONSTRAINT fk_personal_incidente_personal
  FOREIGN KEY (personal_id)
  REFERENCES personal(id)
  ON DELETE CASCADE;

-- Personas Desaparecidas -> Incidentes
ALTER TABLE personas_desaparecidas
  ADD CONSTRAINT fk_personas_desaparecidas_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Denunciantes -> Incidentes
ALTER TABLE denunciantes
  ADD CONSTRAINT fk_denunciantes_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Fiscales Solicitantes -> Incidentes
ALTER TABLE fiscales_solicitantes
  ADD CONSTRAINT fk_fiscales_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Punto 0 -> Incidentes
ALTER TABLE punto_0
  ADD CONSTRAINT fk_punto0_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Historial Punto 0 -> Incidentes
ALTER TABLE historial_punto_0
  ADD CONSTRAINT fk_historial_punto0_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Áreas Búsqueda -> Incidentes
ALTER TABLE areas_busqueda
  ADD CONSTRAINT fk_areas_busqueda_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Áreas Búsqueda -> Equipos
ALTER TABLE areas_busqueda
  ADD CONSTRAINT fk_areas_busqueda_equipo
  FOREIGN KEY (equipo_id)
  REFERENCES equipos(id)
  ON DELETE SET NULL;

-- Archivos GPX -> Incidentes
ALTER TABLE archivos_gpx
  ADD CONSTRAINT fk_archivos_gpx_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Archivos GPX -> Equipos
ALTER TABLE archivos_gpx
  ADD CONSTRAINT fk_archivos_gpx_equipo
  FOREIGN KEY (equipo_id)
  REFERENCES equipos(id)
  ON DELETE SET NULL;

-- Archivos Incidente -> Incidentes
ALTER TABLE archivos_incidente
  ADD CONSTRAINT fk_archivos_incidente_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Comentarios Incidente -> Incidentes
ALTER TABLE comentarios_incidente
  ADD CONSTRAINT fk_comentarios_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Eventos Línea Tiempo -> Incidentes
ALTER TABLE eventos_linea_tiempo
  ADD CONSTRAINT fk_eventos_timeline_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Notificaciones -> Incidentes
ALTER TABLE notificaciones
  ADD CONSTRAINT fk_notificaciones_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Accesos QR -> Incidentes
ALTER TABLE accesos_qr
  ADD CONSTRAINT fk_accesos_qr_incidente
  FOREIGN KEY (incidente_id)
  REFERENCES incidentes(id)
  ON DELETE CASCADE;

-- Personal QR Registrado -> Accesos QR
ALTER TABLE personal_qr_registrado
  ADD CONSTRAINT fk_personal_qr_acceso
  FOREIGN KEY (acceso_qr_id)
  REFERENCES accesos_qr(id)
  ON DELETE CASCADE;

-- Personal Especialidades -> Personal
ALTER TABLE personal_especialidades
  ADD CONSTRAINT fk_personal_especialidades_personal
  FOREIGN KEY (personal_id)
  REFERENCES personal(id)
  ON DELETE CASCADE;

-- Personal Certificaciones -> Personal
ALTER TABLE personal_certificaciones
  ADD CONSTRAINT fk_personal_certificaciones_personal
  FOREIGN KEY (personal_id)
  REFERENCES personal(id)
  ON DELETE CASCADE;

-- Equipo Especialidades -> Equipos
ALTER TABLE equipo_especialidades
  ADD CONSTRAINT fk_equipo_especialidades_equipo
  FOREIGN KEY (equipo_id)
  REFERENCES equipos(id)
  ON DELETE CASCADE;

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Incidentes
CREATE INDEX idx_incidentes_estado ON incidentes(estado);
CREATE INDEX idx_incidentes_prioridad ON incidentes(prioridad);
CREATE INDEX idx_incidentes_categoria ON incidentes(categoria);
CREATE INDEX idx_incidentes_fecha_creacion ON incidentes(fecha_creacion DESC);
CREATE INDEX idx_incidentes_comandante ON incidentes(comandante_a_cargo);
CREATE INDEX idx_incidentes_jefe_dotacion ON incidentes(jefe_dotacion_id);

-- Personal
CREATE INDEX idx_personal_dni ON personal(dni);
CREATE INDEX idx_personal_nombre_apellido ON personal(nombre, apellido);
CREATE INDEX idx_personal_organizacion ON personal(organizacion);
CREATE INDEX idx_personal_estado ON personal(estado);
CREATE INDEX idx_personal_disponible ON personal(disponible);
CREATE INDEX idx_personal_tipo_agente ON personal(tipo_agente);

-- Equipos
CREATE INDEX idx_equipos_incidente ON equipos(incidente_id);
CREATE INDEX idx_equipos_lider ON equipos(lider_id);
CREATE INDEX idx_equipos_estado ON equipos(estado);
CREATE INDEX idx_equipos_tipo ON equipos(tipo);

-- Miembros Equipo
CREATE INDEX idx_miembros_equipo_equipo ON miembros_equipo(equipo_id);
CREATE INDEX idx_miembros_equipo_personal ON miembros_equipo(personal_id);
CREATE INDEX idx_miembros_equipo_activo ON miembros_equipo(activo);

-- Personal Incidente
CREATE INDEX idx_personal_incidente_incidente ON personal_incidente(incidente_id);
CREATE INDEX idx_personal_incidente_personal ON personal_incidente(personal_id);
CREATE INDEX idx_personal_incidente_activo ON personal_incidente(activo);

-- Personas Desaparecidas
CREATE INDEX idx_personas_desaparecidas_incidente ON personas_desaparecidas(incidente_id);
CREATE INDEX idx_personas_desaparecidas_nombre ON personas_desaparecidas(nombre, apellido);

-- Punto 0
CREATE INDEX idx_punto0_incidente ON punto_0(incidente_id);
CREATE INDEX idx_punto0_coordenadas ON punto_0(lat, lng);

-- Historial Punto 0
CREATE INDEX idx_historial_punto0_incidente ON historial_punto_0(incidente_id);
CREATE INDEX idx_historial_punto0_fecha ON historial_punto_0(fecha_creacion DESC);

-- Áreas de Búsqueda
CREATE INDEX idx_areas_busqueda_incidente ON areas_busqueda(incidente_id);
CREATE INDEX idx_areas_busqueda_equipo ON areas_busqueda(equipo_id);
CREATE INDEX idx_areas_busqueda_estado ON areas_busqueda(estado);
CREATE INDEX idx_areas_busqueda_prioridad ON areas_busqueda(prioridad);

-- Archivos GPX
CREATE INDEX idx_archivos_gpx_incidente ON archivos_gpx(incidente_id);
CREATE INDEX idx_archivos_gpx_equipo ON archivos_gpx(equipo_id);
CREATE INDEX idx_archivos_gpx_fecha ON archivos_gpx(fecha_subida DESC);

-- Archivos Incidente
CREATE INDEX idx_archivos_incidente_incidente ON archivos_incidente(incidente_id);
CREATE INDEX idx_archivos_incidente_fecha ON archivos_incidente(fecha_subida DESC);

-- Comentarios
CREATE INDEX idx_comentarios_incidente ON comentarios_incidente(incidente_id);
CREATE INDEX idx_comentarios_fecha ON comentarios_incidente(fecha DESC);

-- Eventos Timeline
CREATE INDEX idx_eventos_timeline_incidente ON eventos_linea_tiempo(incidente_id);
CREATE INDEX idx_eventos_timeline_tipo ON eventos_linea_tiempo(tipo);
CREATE INDEX idx_eventos_timeline_timestamp ON eventos_linea_tiempo(timestamp DESC);

-- Notificaciones
CREATE INDEX idx_notificaciones_incidente ON notificaciones(incidente_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_prioridad ON notificaciones(prioridad);
CREATE INDEX idx_notificaciones_timestamp ON notificaciones(timestamp DESC);

-- Accesos QR
CREATE INDEX idx_accesos_qr_incidente ON accesos_qr(incidente_id);
CREATE INDEX idx_accesos_qr_codigo ON accesos_qr(codigo_acceso);
CREATE INDEX idx_accesos_qr_activo ON accesos_qr(activo);

-- Personal QR Registrado
CREATE INDEX idx_personal_qr_acceso ON personal_qr_registrado(acceso_qr_id);
CREATE INDEX idx_personal_qr_dni ON personal_qr_registrado(dni);

-- Especialidades
CREATE INDEX idx_personal_especialidades_personal ON personal_especialidades(personal_id);
CREATE INDEX idx_equipo_especialidades_equipo ON equipo_especialidades(equipo_id);

-- Certificaciones
CREATE INDEX idx_certificaciones_personal ON personal_certificaciones(personal_id);
CREATE INDEX idx_certificaciones_vigente ON personal_certificaciones(vigente);

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER trigger_actualizar_incidentes
  BEFORE UPDATE ON incidentes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_personal
  BEFORE UPDATE ON personal
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_equipos
  BEFORE UPDATE ON equipos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_personas_desaparecidas
  BEFORE UPDATE ON personas_desaparecidas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_punto0
  BEFORE UPDATE ON punto_0
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_areas_busqueda
  BEFORE UPDATE ON areas_busqueda
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Función para registrar cambios en Punto 0 al historial
CREATE OR REPLACE FUNCTION registrar_cambio_punto0()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo registrar si cambió la ubicación
  IF OLD.lat != NEW.lat OR OLD.lng != NEW.lng THEN
    INSERT INTO historial_punto_0 (
      incidente_id,
      lat,
      lng,
      direccion,
      zona,
      fecha_hora,
      razon,
      modificado_por
    ) VALUES (
      OLD.incidente_id,
      OLD.lat,
      OLD.lng,
      OLD.direccion,
      OLD.zona,
      OLD.fecha_hora,
      'Actualización del Punto 0',
      NEW.actualizado_por
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar cambios de Punto 0
CREATE TRIGGER trigger_historial_punto0
  BEFORE UPDATE ON punto_0
  FOR EACH ROW
  EXECUTE FUNCTION registrar_cambio_punto0();

-- Función para actualizar fecha_resolucion cuando cambia el estado
CREATE OR REPLACE FUNCTION actualizar_fecha_resolucion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado IN ('inactivo', 'finalizado') AND OLD.estado = 'activo' THEN
    NEW.fecha_resolucion = NOW();
  ELSIF NEW.estado = 'activo' AND OLD.estado IN ('inactivo', 'finalizado') THEN
    NEW.fecha_resolucion = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_resolucion
CREATE TRIGGER trigger_fecha_resolucion
  BEFORE UPDATE ON incidentes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_resolucion();

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista: Incidentes con información completa
CREATE OR REPLACE VIEW vista_incidentes_completos AS
SELECT 
  i.id,
  i.titulo,
  i.descripcion,
  i.estado,
  i.prioridad,
  i.categoria,
  i.comandante_a_cargo,
  p.nombre || ' ' || p.apellido AS jefe_dotacion_nombre,
  i.fecha_creacion,
  i.fecha_actualizacion,
  i.fecha_resolucion,
  p0.lat AS punto0_lat,
  p0.lng AS punto0_lng,
  p0.direccion AS punto0_direccion,
  pd.nombre || ' ' || pd.apellido AS persona_desaparecida,
  d.nombre || ' ' || d.apellido AS denunciante,
  f.nombre || ' ' || f.apellido AS fiscal_solicitante,
  COUNT(DISTINCT pi.personal_id) AS cantidad_personal_asignado,
  COUNT(DISTINCT e.id) AS cantidad_equipos
FROM incidentes i
LEFT JOIN personal p ON i.jefe_dotacion_id = p.id
LEFT JOIN punto_0 p0 ON i.id = p0.incidente_id
LEFT JOIN personas_desaparecidas pd ON i.id = pd.incidente_id
LEFT JOIN denunciantes d ON i.id = d.incidente_id
LEFT JOIN fiscales_solicitantes f ON i.id = f.incidente_id
LEFT JOIN personal_incidente pi ON i.id = pi.incidente_id AND pi.activo = TRUE
LEFT JOIN equipos e ON i.id = e.incidente_id
GROUP BY i.id, p.nombre, p.apellido, p0.lat, p0.lng, p0.direccion, 
         pd.nombre, pd.apellido, d.nombre, d.apellido, f.nombre, f.apellido;

-- Vista: Personal con especialidades
CREATE OR REPLACE VIEW vista_personal_completo AS
SELECT 
  p.id,
  p.nombre,
  p.apellido,
  p.dni,
  p.telefono,
  p.email,
  p.organizacion,
  p.jerarquia,
  p.tipo_agente,
  p.grupo_sanguineo,
  p.estado,
  p.disponible,
  STRING_AGG(DISTINCT pe.especialidad, ', ' ORDER BY pe.especialidad) AS especialidades,
  COUNT(DISTINCT pc.id) AS cantidad_certificaciones,
  COUNT(DISTINCT pi.incidente_id) AS incidentes_activos
FROM personal p
LEFT JOIN personal_especialidades pe ON p.id = pe.personal_id
LEFT JOIN personal_certificaciones pc ON p.id = pc.personal_id AND pc.vigente = TRUE
LEFT JOIN personal_incidente pi ON p.id = pi.personal_id AND pi.activo = TRUE
GROUP BY p.id;

-- Vista: Equipos con miembros
CREATE OR REPLACE VIEW vista_equipos_completos AS
SELECT 
  e.id,
  e.nombre,
  e.tipo,
  e.estado,
  i.titulo AS incidente_titulo,
  p.nombre || ' ' || p.apellido AS lider_nombre,
  COUNT(DISTINCT me.personal_id) AS cantidad_miembros,
  STRING_AGG(DISTINCT ee.especialidad, ', ' ORDER BY ee.especialidad) AS especialidades
FROM equipos e
LEFT JOIN incidentes i ON e.incidente_id = i.id
LEFT JOIN personal p ON e.lider_id = p.id
LEFT JOIN miembros_equipo me ON e.id = me.equipo_id AND me.activo = TRUE
LEFT JOIN equipo_especialidades ee ON e.id = ee.equipo_id
GROUP BY e.id, i.titulo, p.nombre, p.apellido;

-- Vista: Estadísticas de incidentes
CREATE OR REPLACE VIEW vista_estadisticas_incidentes AS
SELECT 
  COUNT(*) AS total_incidentes,
  COUNT(CASE WHEN estado = 'activo' THEN 1 END) AS activos,
  COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) AS inactivos,
  COUNT(CASE WHEN estado = 'finalizado' THEN 1 END) AS finalizados,
  COUNT(CASE WHEN prioridad = 'critico' THEN 1 END) AS criticos,
  COUNT(CASE WHEN prioridad = 'grave' THEN 1 END) AS graves,
  COUNT(CASE WHEN prioridad = 'manejable' THEN 1 END) AS manejables,
  COUNT(CASE WHEN categoria = 'persona' THEN 1 END) AS personas,
  COUNT(CASE WHEN categoria = 'objeto' THEN 1 END) AS objetos,
  COUNT(CASE WHEN categoria = 'colaboracion_judicial' THEN 1 END) AS colaboracion_judicial
FROM incidentes;

-- ============================================================================
-- DATOS INICIALES (SEEDS)
-- ============================================================================

-- Insertar personal de ejemplo
INSERT INTO personal (
  nombre, apellido, dni, telefono, organizacion, jerarquia, tipo_agente,
  grupo_sanguineo, alergias, estado, disponible, turno
) VALUES 
  ('Carlos', 'Méndez', '12345678', '+54 351 123-4567', 'Bomberos', 'Comandante', 'bombero', 'O+', 'Ninguna', 'activo', TRUE, 'mañana'),
  ('Ana', 'García', '23456789', '+54 351 234-5678', 'Bomberos', 'Capitán', 'bombero', 'A+', 'Ninguna', 'activo', TRUE, 'tarde'),
  ('Pedro', 'López', '34567890', '+54 351 345-6789', 'Policía Nacional', 'Subinspector', 'policia', 'B+', 'Penicilina', 'activo', TRUE, 'noche'),
  ('Miguel', 'Torres', '45678901', '+54 351 456-7890', 'Bomberos', 'Teniente', 'bombero', 'AB+', 'Ninguna', 'activo', TRUE, 'mañana'),
  ('Laura', 'Rodríguez', '56789012', '+54 351 567-8901', 'Defensa Civil', 'Sargento', 'defensa_civil', 'O-', 'Ninguna', 'activo', TRUE, '24_horas'),
  ('Roberto', 'Silva', '67890123', '+54 351 678-9012', 'Bomberos Voluntarios', 'Comandante', 'bombero_voluntario', 'A-', 'Ninguna', 'activo', TRUE, 'libre'),
  ('María', 'Fernández', '78901234', '+54 351 789-0123', 'Cruz Roja', 'Capitán', 'paramedico', 'B-', 'Ninguna', 'activo', TRUE, 'tarde'),
  ('Francisco', 'Herrera', '89012345', '+54 351 890-1234', 'Rescate Montaña', 'Teniente', 'rescatista', 'AB-', 'Ninguna', 'activo', TRUE, 'mañana'),
  ('José', 'González', '90123456', '+54 351 901-2345', 'Bomberos', 'Comandante', 'bombero', 'O+', 'Ninguna', 'activo', TRUE, 'noche'),
  ('Patricia', 'Morales', '01234567', '+54 351 012-3456', 'Brigada K9', 'Capitán', 'especialista_k9', 'A+', 'Ninguna', 'activo', TRUE, 'mañana');

-- Insertar especialidades para el personal
INSERT INTO personal_especialidades (personal_id, especialidad)
SELECT p.id, 'Búsqueda y Rescate'
FROM personal p
WHERE p.nombre IN ('Carlos', 'Ana', 'Miguel');

INSERT INTO personal_especialidades (personal_id, especialidad)
SELECT p.id, 'K9 - Perros de Búsqueda'
FROM personal p
WHERE p.nombre = 'Patricia';

INSERT INTO personal_especialidades (personal_id, especialidad)
SELECT p.id, 'Rescate en Montaña'
FROM personal p
WHERE p.nombre IN ('Francisco', 'Roberto');

INSERT INTO personal_especialidades (personal_id, especialidad)
SELECT p.id, 'Emergencias Médicas'
FROM personal p
WHERE p.nombre = 'María';

INSERT INTO personal_especialidades (personal_id, especialidad)
SELECT p.id, 'Coordinación Operativa'
FROM personal p
WHERE p.nombre IN ('Carlos', 'José', 'Pedro');

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Base de datos DUAR creada con:';
  RAISE NOTICE '- 20 Tablas principales';
  RAISE NOTICE '- Tipos enumerados (ENUMS)';
  RAISE NOTICE '- Foreign Keys y Constraints';
  RAISE NOTICE '- Índices optimizados';
  RAISE NOTICE '- Triggers automáticos';
  RAISE NOTICE '- Vistas útiles';
  RAISE NOTICE '- Datos iniciales (10 registros de personal)';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Siguiente paso: Adaptar el código de la aplicación a usar estas tablas';
  RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
