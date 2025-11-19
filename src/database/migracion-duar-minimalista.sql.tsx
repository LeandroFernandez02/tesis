-- ============================================================================
-- SISTEMA DUAR - DIRECCIÓN DE BOMBEROS
-- Script de Migración Minimalista - Solo Campos de Interfaz
-- ============================================================================
-- Descripción: Base de datos relacional con SOLO los campos usados en la UI
-- Versión: 1.0 Minimalista
-- Fecha: 12 de Noviembre de 2025
-- Idioma: Español
-- ============================================================================

-- ============================================================================
-- EXTENSIONES REQUERIDAS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ELIMINACIÓN DE TABLAS EXISTENTES (si existen)
-- ============================================================================

DROP TABLE IF EXISTS personal_especialidades CASCADE;
DROP TABLE IF EXISTS personal_certificaciones CASCADE;
DROP TABLE IF EXISTS personal_qr_registrado CASCADE;
DROP TABLE IF EXISTS accesos_qr CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS eventos_linea_tiempo CASCADE;
DROP TABLE IF EXISTS comentarios_incidente CASCADE;
DROP TABLE IF EXISTS archivos_incidente CASCADE;
DROP TABLE IF EXISTS archivos_gpx CASCADE;
DROP TABLE IF EXISTS areas_busqueda CASCADE;
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
-- TIPOS ENUMERADOS (ENUMS) - Solo los necesarios
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

-- Grupos Sanguíneos
DROP TYPE IF EXISTS grupo_sanguineo CASCADE;
CREATE TYPE grupo_sanguineo AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido');

-- Estados de Personal
DROP TYPE IF EXISTS estado_personal CASCADE;
CREATE TYPE estado_personal AS ENUM ('Activo', 'En Servicio', 'Fuera de Servicio', 'De Licencia', 'Capacitación', 'Suspendido', 'Inactivo');

-- Turnos
DROP TYPE IF EXISTS turno CASCADE;
CREATE TYPE turno AS ENUM ('Mañana', 'Tarde', 'Noche', '24 Horas', 'Libre');

-- Género
DROP TYPE IF EXISTS genero CASCADE;
CREATE TYPE genero AS ENUM ('masculino', 'femenino', 'otro');

-- ============================================================================
-- TABLA: incidentes
-- ============================================================================

CREATE TABLE incidentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Datos básicos del formulario
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  estado estado_incidente NOT NULL DEFAULT 'activo',
  prioridad prioridad_incidente NOT NULL DEFAULT 'manejable',
  categoria categoria_incidente NOT NULL,
  
  -- Jefe de dotación (RF2.1)
  jefe_dotacion VARCHAR(255), -- Nombre del jefe, no FK
  
  -- Control de Tiempo (del formulario)
  tiempo_inicio TIMESTAMP WITH TIME ZONE,
  tiempo_transcurrido BIGINT DEFAULT 0,
  pausado BOOLEAN DEFAULT FALSE,
  
  -- Fechas
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_resolucion TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE incidentes IS 'Tabla principal de incidentes';

-- ============================================================================
-- TABLA: punto_0 (Última Ubicación Conocida)
-- ============================================================================

CREATE TABLE punto_0 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL UNIQUE REFERENCES incidentes(id) ON DELETE CASCADE,
  
  -- Ubicación (del formulario)
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  zona VARCHAR(255),
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  bloqueado BOOLEAN DEFAULT TRUE,
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE punto_0 IS 'Última ubicación conocida - Punto 0 bloqueado';

-- ============================================================================
-- TABLA: denunciantes
-- ============================================================================

CREATE TABLE denunciantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL UNIQUE REFERENCES incidentes(id) ON DELETE CASCADE,
  
  -- Datos del formulario incident-form.tsx
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20),
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  relacion VARCHAR(100),
  
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE denunciantes IS 'Denunciantes de incidentes';

-- ============================================================================
-- TABLA: fiscales_solicitantes
-- ============================================================================

CREATE TABLE fiscales_solicitantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL UNIQUE REFERENCES incidentes(id) ON DELETE CASCADE,
  
  -- Datos del formulario incident-form.tsx
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fiscalia VARCHAR(255) NOT NULL,
  expediente VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(255),
  
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE fiscales_solicitantes IS 'Fiscales en casos judiciales';

-- ============================================================================
-- TABLA: personas_desaparecidas
-- ============================================================================

CREATE TABLE personas_desaparecidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL UNIQUE REFERENCES incidentes(id) ON DELETE CASCADE,
  
  -- Datos del formulario incident-form.tsx
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  edad INTEGER,
  genero genero,
  descripcion_fisica TEXT NOT NULL,
  
  -- Última vez visto
  ultima_vez_visto_fecha TIMESTAMP WITH TIME ZONE,
  ultima_vez_visto_ubicacion VARCHAR(255),
  ultima_vez_visto_lat DECIMAL(10, 8),
  ultima_vez_visto_lng DECIMAL(11, 8),
  
  -- Detalles
  vestimenta TEXT,
  condiciones_medicas TEXT,
  medicamentos TEXT,
  foto TEXT,
  
  -- Contacto familiar
  contacto_nombre VARCHAR(100),
  contacto_telefono VARCHAR(20),
  contacto_relacion VARCHAR(50),
  
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE personas_desaparecidas IS 'Personas desaparecidas';

-- ============================================================================
-- TABLA: personal
-- ============================================================================

CREATE TABLE personal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Datos del formulario personnel-form.tsx
  numero_placa VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  
  -- Profesional
  rango VARCHAR(100) NOT NULL, -- Comandante, Capitán, etc.
  estado estado_personal NOT NULL DEFAULT 'Activo',
  turno turno NOT NULL DEFAULT 'Mañana',
  disponible BOOLEAN DEFAULT TRUE,
  
  -- Experiencia
  fecha_ingreso DATE NOT NULL,
  experiencia_anios INTEGER DEFAULT 0,
  
  -- Ubicación y asignación
  ubicacion_actual VARCHAR(255),
  equipo_asignado VARCHAR(255),
  
  -- Otros
  foto TEXT,
  ultima_capacitacion DATE,
  observaciones TEXT,
  
  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE personal IS 'Personal del sistema';
COMMENT ON COLUMN personal.numero_placa IS 'Número de placa - Campo obligatorio';

-- ============================================================================
-- TABLA: personal_especialidades
-- ============================================================================

CREATE TABLE personal_especialidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
  especialidad VARCHAR(100) NOT NULL, -- Combate de Incendios, Rescate Vehicular, etc.
  
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT uq_personal_especialidad UNIQUE(personal_id, especialidad)
);

COMMENT ON TABLE personal_especialidades IS 'Especialidades del personal (N:M)';

-- ============================================================================
-- TABLA: personal_certificaciones
-- ============================================================================

CREATE TABLE personal_certificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
  
  -- Datos del formulario personnel-form.tsx
  nombre VARCHAR(255) NOT NULL,
  entidad_certificadora VARCHAR(255) NOT NULL,
  fecha_obtencion DATE NOT NULL,
  fecha_vencimiento DATE,
  vigente BOOLEAN DEFAULT TRUE,
  nivel VARCHAR(50), -- Básico, Intermedio, Avanzado, Instructor
  
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE personal_certificaciones IS 'Certificaciones del personal';

-- ============================================================================
-- TABLA: equipos (Grupos de rastrillaje)
-- ============================================================================

CREATE TABLE equipos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
  
  -- Datos básicos
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(100), -- Búsqueda Terrestre, K9, etc.
  estado VARCHAR(50) DEFAULT 'Disponible',
  
  -- Líder del equipo
  lider_id UUID REFERENCES personal(id) ON DELETE SET NULL,
  
  -- Fechas
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  observaciones TEXT
);

COMMENT ON TABLE equipos IS 'Grupos de rastrillaje por incidente';

-- ============================================================================
-- TABLA: miembros_equipo
-- ============================================================================

CREATE TABLE miembros_equipo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
  
  fecha_asignacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  activo BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT uq_equipo_personal UNIQUE(equipo_id, personal_id)
);

COMMENT ON TABLE miembros_equipo IS 'Miembros de equipos (N:M)';

-- ============================================================================
-- TABLA: personal_incidente (Personal asignado directamente)
-- ============================================================================

CREATE TABLE personal_incidente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
  personal_id UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
  
  fecha_asignacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  activo BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT uq_incidente_personal UNIQUE(incidente_id, personal_id)
);

COMMENT ON TABLE personal_incidente IS 'Personal asignado directamente a incidentes (N:M)';

-- ============================================================================
-- TABLA: areas_busqueda
-- ============================================================================

CREATE TABLE areas_busqueda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
  
  -- Datos básicos
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50), -- primaria, secundaria, ampliada
  estado VARCHAR(50) DEFAULT 'pendiente',
  
  -- Coordenadas como JSONB
  coordenadas JSONB NOT NULL,
  
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE areas_busqueda IS 'Áreas de búsqueda delimitadas';

-- ============================================================================
-- TABLA: archivos_gpx
-- ============================================================================

CREATE TABLE archivos_gpx (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
  equipo_id UUID REFERENCES equipos(id) ON DELETE SET NULL,
  
  nombre VARCHAR(255) NOT NULL,
  archivo TEXT NOT NULL,
  puntos INTEGER,
  
  -- Datos como JSONB
  tracks JSONB,
  waypoints JSONB,
  
  fecha_subida TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE archivos_gpx IS 'Archivos GPX enlazados a equipos';

-- ============================================================================
-- TABLA: archivos_incidente
-- ============================================================================

CREATE TABLE archivos_incidente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
  
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  tamaño BIGINT,
  url TEXT NOT NULL,
  descripcion TEXT,
  
  fecha_subida TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  subido_por VARCHAR(255)
);

COMMENT ON TABLE archivos_incidente IS 'Archivos de evidencia';

-- ============================================================================
-- TABLA: comentarios_incidente
-- ============================================================================

CREATE TABLE comentarios_incidente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
  
  autor VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE comentarios_incidente IS 'Comentarios sobre incidentes';

-- ============================================================================
-- TABLA: eventos_linea_tiempo
-- ============================================================================

CREATE TABLE eventos_linea_tiempo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
  
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  
  -- Usuario (almacenado como texto, no FK)
  usuario_nombre VARCHAR(255),
  usuario_rol VARCHAR(100),
  
  -- Detalles adicionales como JSONB
  detalles JSONB,
  
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE eventos_linea_tiempo IS 'Timeline de eventos del incidente';

-- ============================================================================
-- TABLA: notificaciones
-- ============================================================================

CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID REFERENCES incidentes(id) ON DELETE CASCADE,
  
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  prioridad VARCHAR(20) NOT NULL DEFAULT 'media',
  
  leida BOOLEAN DEFAULT FALSE,
  
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notificaciones IS 'Notificaciones del sistema';

-- ============================================================================
-- TABLA: accesos_qr
-- ============================================================================

CREATE TABLE accesos_qr (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incidente_id UUID NOT NULL REFERENCES incidentes(id) ON DELETE CASCADE,
  
  codigo_acceso VARCHAR(50) UNIQUE NOT NULL,
  codigo_qr TEXT NOT NULL,
  
  valido_hasta TIMESTAMP WITH TIME ZONE NOT NULL,
  max_personal INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  creado_por VARCHAR(255)
);

COMMENT ON TABLE accesos_qr IS 'Códigos QR para registro rápido';

-- ============================================================================
-- TABLA: personal_qr_registrado
-- ============================================================================

CREATE TABLE personal_qr_registrado (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acceso_qr_id UUID NOT NULL REFERENCES accesos_qr(id) ON DELETE CASCADE,
  
  -- Datos del formulario personnel-registration-form.tsx
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  institucion VARCHAR(255) NOT NULL,
  rol VARCHAR(100) NOT NULL, -- Caminante, Dron, Canes, Paramédico, Conductor
  sexo genero NOT NULL,
  
  -- Datos médicos
  alergias TEXT NOT NULL DEFAULT '',
  grupo_sanguineo grupo_sanguineo NOT NULL,
  
  estado estado_personal DEFAULT 'Activo',
  
  fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE personal_qr_registrado IS 'Personal registrado vía QR';

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Incidentes
CREATE INDEX idx_incidentes_estado ON incidentes(estado);
CREATE INDEX idx_incidentes_prioridad ON incidentes(prioridad);
CREATE INDEX idx_incidentes_categoria ON incidentes(categoria);
CREATE INDEX idx_incidentes_fecha_creacion ON incidentes(fecha_creacion DESC);

-- Personal
CREATE INDEX idx_personal_numero_placa ON personal(numero_placa);
CREATE INDEX idx_personal_nombre_apellido ON personal(nombre, apellido);
CREATE INDEX idx_personal_estado ON personal(estado);
CREATE INDEX idx_personal_disponible ON personal(disponible);

-- Equipos
CREATE INDEX idx_equipos_incidente ON equipos(incidente_id);
CREATE INDEX idx_equipos_lider ON equipos(lider_id);

-- Miembros Equipo
CREATE INDEX idx_miembros_equipo_equipo ON miembros_equipo(equipo_id);
CREATE INDEX idx_miembros_equipo_personal ON miembros_equipo(personal_id);

-- Personal Incidente
CREATE INDEX idx_personal_incidente_incidente ON personal_incidente(incidente_id);
CREATE INDEX idx_personal_incidente_personal ON personal_incidente(personal_id);

-- Punto 0
CREATE INDEX idx_punto0_incidente ON punto_0(incidente_id);

-- Áreas de Búsqueda
CREATE INDEX idx_areas_busqueda_incidente ON areas_busqueda(incidente_id);

-- Archivos GPX
CREATE INDEX idx_archivos_gpx_incidente ON archivos_gpx(incidente_id);
CREATE INDEX idx_archivos_gpx_equipo ON archivos_gpx(equipo_id);

-- Archivos Incidente
CREATE INDEX idx_archivos_incidente_incidente ON archivos_incidente(incidente_id);

-- Comentarios
CREATE INDEX idx_comentarios_incidente ON comentarios_incidente(incidente_id);

-- Timeline
CREATE INDEX idx_eventos_timeline_incidente ON eventos_linea_tiempo(incidente_id);
CREATE INDEX idx_eventos_timeline_timestamp ON eventos_linea_tiempo(timestamp DESC);

-- Notificaciones
CREATE INDEX idx_notificaciones_incidente ON notificaciones(incidente_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);

-- Accesos QR
CREATE INDEX idx_accesos_qr_incidente ON accesos_qr(incidente_id);
CREATE INDEX idx_accesos_qr_codigo ON accesos_qr(codigo_acceso);

-- Personal QR
CREATE INDEX idx_personal_qr_acceso ON personal_qr_registrado(acceso_qr_id);
CREATE INDEX idx_personal_qr_dni ON personal_qr_registrado(dni);

-- ============================================================================
-- TRIGGERS AUTOMÁTICOS
-- ============================================================================

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas relevantes
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

CREATE TRIGGER trigger_actualizar_punto0
  BEFORE UPDATE ON punto_0
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Función para actualizar fecha_resolucion
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

CREATE TRIGGER trigger_fecha_resolucion
  BEFORE UPDATE ON incidentes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_resolucion();

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista: Incidentes completos
CREATE OR REPLACE VIEW vista_incidentes_completos AS
SELECT 
  i.id,
  i.titulo,
  i.descripcion,
  i.estado,
  i.prioridad,
  i.categoria,
  i.jefe_dotacion,
  i.fecha_creacion,
  i.fecha_actualizacion,
  p0.lat AS punto0_lat,
  p0.lng AS punto0_lng,
  p0.direccion AS punto0_direccion,
  pd.nombre || ' ' || pd.apellido AS persona_desaparecida,
  d.nombre || ' ' || d.apellido AS denunciante,
  COUNT(DISTINCT pi.personal_id) AS cantidad_personal,
  COUNT(DISTINCT e.id) AS cantidad_equipos
FROM incidentes i
LEFT JOIN punto_0 p0 ON i.id = p0.incidente_id
LEFT JOIN personas_desaparecidas pd ON i.id = pd.incidente_id
LEFT JOIN denunciantes d ON i.id = d.incidente_id
LEFT JOIN personal_incidente pi ON i.id = pi.incidente_id AND pi.activo = TRUE
LEFT JOIN equipos e ON i.id = e.incidente_id
GROUP BY i.id, p0.lat, p0.lng, p0.direccion, pd.nombre, pd.apellido, d.nombre, d.apellido;

-- Vista: Personal con especialidades
CREATE OR REPLACE VIEW vista_personal_completo AS
SELECT 
  p.id,
  p.numero_placa,
  p.nombre,
  p.apellido,
  p.email,
  p.telefono,
  p.rango,
  p.estado,
  p.disponible,
  STRING_AGG(DISTINCT pe.especialidad, ', ' ORDER BY pe.especialidad) AS especialidades,
  COUNT(DISTINCT pc.id) AS cantidad_certificaciones
FROM personal p
LEFT JOIN personal_especialidades pe ON p.id = pe.personal_id
LEFT JOIN personal_certificaciones pc ON p.id = pc.personal_id AND pc.vigente = TRUE
GROUP BY p.id;

-- Vista: Estadísticas
CREATE OR REPLACE VIEW vista_estadisticas_incidentes AS
SELECT 
  COUNT(*) AS total,
  COUNT(CASE WHEN estado = 'activo' THEN 1 END) AS activos,
  COUNT(CASE WHEN estado = 'inactivo' THEN 1 END) AS inactivos,
  COUNT(CASE WHEN estado = 'finalizado' THEN 1 END) AS finalizados
FROM incidentes;

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'MIGRACIÓN MINIMALISTA COMPLETADA';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Base de datos DUAR creada con SOLO los campos de la interfaz:';
  RAISE NOTICE '- 16 Tablas principales';
  RAISE NOTICE '- 7 Tipos ENUM';
  RAISE NOTICE '- Índices optimizados';
  RAISE NOTICE '- Triggers automáticos';
  RAISE NOTICE '- 3 Vistas útiles';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'SIN campos adicionales - Solo lo que existe en la UI';
  RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
