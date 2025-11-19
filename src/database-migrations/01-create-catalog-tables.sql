-- ============================================
-- SCRIPT DE NORMALIZACIÓN DE BASE DE DATOS
-- Sistema DUAR - Dirección de Bomberos
-- ============================================
-- IMPORTANTE: Ejecutar en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query
-- ============================================

-- 1. TABLA DE ESTADOS DE INCIDENTE
-- ============================================
CREATE TABLE IF NOT EXISTS estados_incidente (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar estados predefinidos
INSERT INTO estados_incidente (codigo, nombre, descripcion, color, orden) VALUES
  ('activo', 'Activo', 'Incidente en curso con operaciones activas', '#ef4444', 1),
  ('inactivo', 'Inactivo', 'Incidente pausado o en espera', '#f59e0b', 2),
  ('finalizado', 'Finalizado', 'Incidente completado y cerrado', '#10b981', 3)
ON CONFLICT (codigo) DO NOTHING;

-- 2. TABLA DE PRIORIDADES DE INCIDENTE
-- ============================================
CREATE TABLE IF NOT EXISTS prioridades_incidente (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  nivel INTEGER NOT NULL, -- 1=Crítica, 2=Alta, 3=Media, 4=Baja
  color VARCHAR(20),
  tiempo_respuesta_minutos INTEGER, -- Tiempo esperado de respuesta
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar prioridades predefinidas
INSERT INTO prioridades_incidente (codigo, nombre, descripcion, nivel, color, tiempo_respuesta_minutos) VALUES
  ('critica', 'Crítica', 'Requiere respuesta inmediata - riesgo de vida', 1, '#dc2626', 15),
  ('alta', 'Alta', 'Situación urgente que requiere atención prioritaria', 2, '#ea580c', 30),
  ('media', 'Media', 'Situación importante pero sin riesgo inmediato', 3, '#f59e0b', 60),
  ('baja', 'Baja', 'Situación de rutina sin urgencia', 4, '#84cc16', 120)
ON CONFLICT (codigo) DO NOTHING;

-- 3. TABLA DE CATEGORÍAS DE INCIDENTE
-- ============================================
CREATE TABLE IF NOT EXISTS categorias_incidente (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50), -- Nombre del icono de lucide-react
  color VARCHAR(20),
  requiere_evacuacion BOOLEAN DEFAULT false,
  requiere_medicos BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías predefinidas
INSERT INTO categorias_incidente (codigo, nombre, descripcion, icono, color, requiere_evacuacion, requiere_medicos) VALUES
  ('persona_perdida', 'Persona Perdida', 'Búsqueda de persona extraviada en zona urbana o rural', 'user-x', '#ef4444', false, true),
  ('menor_perdido', 'Menor Perdido', 'Búsqueda de niño o adolescente extraviado', 'baby', '#dc2626', false, true),
  ('senderista_perdido', 'Senderista Perdido', 'Búsqueda de excursionista o montañista extraviado', 'mountain', '#f97316', false, true),
  ('adulto_mayor', 'Adulto Mayor Perdido', 'Búsqueda de persona mayor extraviada', 'user', '#f59e0b', false, true),
  ('accidente_montaña', 'Accidente en Montaña', 'Rescate por accidente en zona montañosa', 'alert-triangle', '#dc2626', true, true),
  ('persona_desaparecida', 'Persona Desaparecida', 'Investigación de desaparición reportada', 'search', '#8b5cf6', false, false),
  ('otro', 'Otro', 'Otros tipos de incidentes de búsqueda y rescate', 'help-circle', '#6b7280', false, false)
ON CONFLICT (codigo) DO NOTHING;

-- 4. TABLA DE ESPECIALIDADES (para personal)
-- ============================================
CREATE TABLE IF NOT EXISTS especialidades (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  color VARCHAR(20),
  requiere_certificacion BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar especialidades predefinidas
INSERT INTO especialidades (codigo, nombre, descripcion, icono, color, requiere_certificacion) VALUES
  ('caminante', 'Caminante', 'Personal de rastrillaje a pie', 'footprints', '#10b981', false),
  ('dron', 'Operador de Dron', 'Piloto de drones para reconocimiento aéreo', 'drone', '#3b82f6', true),
  ('canes', 'Guía Canino', 'Guía de perros de búsqueda y rescate', 'dog', '#f59e0b', true),
  ('paramedico', 'Paramédico', 'Personal médico de emergencias', 'heart-pulse', '#ef4444', true),
  ('conductor', 'Conductor', 'Conductor de vehículos de emergencia', 'truck', '#6b7280', true)
ON CONFLICT (codigo) DO NOTHING;

-- 5. TABLA DE ESTADOS DE PERSONAL
-- ============================================
CREATE TABLE IF NOT EXISTS estados_personal (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20),
  permite_asignacion BOOLEAN DEFAULT true,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar estados de personal
INSERT INTO estados_personal (codigo, nombre, descripcion, color, permite_asignacion) VALUES
  ('activo', 'Activo', 'Disponible para asignación', '#10b981', true),
  ('en_servicio', 'En Servicio', 'Actualmente asignado a un incidente', '#3b82f6', false),
  ('descanso', 'En Descanso', 'Periodo de descanso', '#f59e0b', false),
  ('inactivo', 'Inactivo', 'No disponible', '#6b7280', false),
  ('baja_temporal', 'Baja Temporal', 'Fuera de servicio temporalmente', '#ef4444', false),
  ('baja_definitiva', 'Baja Definitiva', 'Ya no forma parte del cuerpo', '#dc2626', false)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_estados_incidente_codigo ON estados_incidente(codigo);
CREATE INDEX IF NOT EXISTS idx_prioridades_incidente_codigo ON prioridades_incidente(codigo);
CREATE INDEX IF NOT EXISTS idx_prioridades_incidente_nivel ON prioridades_incidente(nivel);
CREATE INDEX IF NOT EXISTS idx_categorias_incidente_codigo ON categorias_incidente(codigo);
CREATE INDEX IF NOT EXISTS idx_especialidades_codigo ON especialidades(codigo);
CREATE INDEX IF NOT EXISTS idx_estados_personal_codigo ON estados_personal(codigo);

-- ============================================
-- COMENTARIOS EN TABLAS
-- ============================================
COMMENT ON TABLE estados_incidente IS 'Catálogo de estados posibles para incidentes';
COMMENT ON TABLE prioridades_incidente IS 'Catálogo de niveles de prioridad para incidentes';
COMMENT ON TABLE categorias_incidente IS 'Catálogo de tipos de incidentes de búsqueda y rescate';
COMMENT ON TABLE especialidades IS 'Catálogo de especialidades del personal de emergencias';
COMMENT ON TABLE estados_personal IS 'Catálogo de estados del personal';

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_estados_incidente_updated_at BEFORE UPDATE ON estados_incidente
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prioridades_incidente_updated_at BEFORE UPDATE ON prioridades_incidente
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_incidente_updated_at BEFORE UPDATE ON categorias_incidente
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_especialidades_updated_at BEFORE UPDATE ON especialidades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estados_personal_updated_at BEFORE UPDATE ON estados_personal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN DEL SCRIPT 01
-- ============================================
-- Siguiente paso: ejecutar 02-migrate-incidents-table.sql
