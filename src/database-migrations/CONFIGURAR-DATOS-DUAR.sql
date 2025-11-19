-- ============================================
-- CONFIGURACIÓN DE DATOS - SISTEMA DUAR
-- Dirección de Bomberos
-- ============================================
-- Este script configura los catálogos con los datos correctos
-- ============================================

-- ============================================
-- PASO 0: LIMPIAR DATOS ANTERIORES
-- ============================================

-- Eliminar vistas
DROP VIEW IF EXISTS vista_incidentes_completos CASCADE;
DROP VIEW IF EXISTS vista_estadisticas_incidentes CASCADE;
DROP VIEW IF EXISTS v_incidentes_legacy CASCADE;

-- Eliminar constraints
ALTER TABLE incidentes
  DROP CONSTRAINT IF EXISTS fk_incidentes_estado,
  DROP CONSTRAINT IF EXISTS fk_incidentes_prioridad,
  DROP CONSTRAINT IF EXISTS fk_incidentes_categoria;

-- Eliminar columnas viejas
ALTER TABLE incidentes 
  DROP COLUMN IF EXISTS estado CASCADE,
  DROP COLUMN IF EXISTS prioridad CASCADE,
  DROP COLUMN IF EXISTS categoria CASCADE,
  DROP COLUMN IF EXISTS estado_id CASCADE,
  DROP COLUMN IF EXISTS prioridad_id CASCADE,
  DROP COLUMN IF EXISTS categoria_id CASCADE;

-- Eliminar tablas de catálogo
DROP TABLE IF EXISTS estados_incidente CASCADE;
DROP TABLE IF EXISTS prioridades_incidente CASCADE;
DROP TABLE IF EXISTS categorias_incidente CASCADE;
DROP TABLE IF EXISTS especialidades CASCADE;
DROP TABLE IF EXISTS estados_personal CASCADE;

-- ============================================
-- PASO 1: CREAR TABLAS DE CATÁLOGO
-- ============================================

-- 1.1 Estados de la Operación
CREATE TABLE estados_incidente (
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

INSERT INTO estados_incidente (codigo, nombre, descripcion, color, orden) VALUES
  ('activo', 'Activo', 'Operación en curso', '#ef4444', 1),
  ('inactivo', 'Inactivo', 'Operación pausada', '#f59e0b', 2),
  ('finalizado', 'Finalizado', 'Operación finalizada', '#10b981', 3);

-- 1.2 Prioridades (Manejable, Grave, Crítico)
CREATE TABLE prioridades_incidente (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  nivel INTEGER NOT NULL,
  color VARCHAR(20),
  tiempo_respuesta_minutos INTEGER,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO prioridades_incidente (codigo, nombre, descripcion, nivel, color, tiempo_respuesta_minutos) VALUES
  ('critico', 'Crítico', 'Situación crítica que requiere respuesta inmediata', 1, '#dc2626', 15),
  ('grave', 'Grave', 'Situación grave que requiere atención urgente', 2, '#ea580c', 30),
  ('manejable', 'Manejable', 'Situación manejable sin urgencia inmediata', 3, '#f59e0b', 60);

-- 1.3 Tipo de Incidente (Persona, Objeto, Colaboración Judicial)
CREATE TABLE categorias_incidente (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO categorias_incidente (codigo, nombre, descripcion, color) VALUES
  ('persona', 'Persona', 'Búsqueda y rescate de personas', '#ef4444'),
  ('objeto', 'Objeto', 'Búsqueda de objetos u otros elementos', '#3b82f6'),
  ('colaboracion_judicial', 'Colaboración Judicial', 'Operación en colaboración con autoridades judiciales', '#8b5cf6');

-- 1.4 Especialidades (caminante, dron, canes, paramédico, conductor)
CREATE TABLE especialidades (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  color VARCHAR(20),
  requiere_certificacion BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO especialidades (codigo, nombre, descripcion, color, requiere_certificacion) VALUES
  ('caminante', 'Caminante', 'Personal de rastrillaje a pie', '#10b981', false),
  ('dron', 'Dron', 'Operador de drones', '#3b82f6', true),
  ('canes', 'Canes', 'Guía de perros de búsqueda', '#f59e0b', true),
  ('paramedico', 'Paramédico', 'Personal médico', '#ef4444', true),
  ('conductor', 'Conductor', 'Conductor de vehículos', '#6b7280', true);

-- 1.5 Estados de Personal
CREATE TABLE estados_personal (
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

INSERT INTO estados_personal (codigo, nombre, descripcion, color, permite_asignacion) VALUES
  ('activo', 'Activo', 'Disponible para asignación', '#10b981', true),
  ('en_servicio', 'En Servicio', 'Asignado a una operación', '#3b82f6', false),
  ('descanso', 'En Descanso', 'Periodo de descanso', '#f59e0b', false),
  ('inactivo', 'Inactivo', 'No disponible', '#6b7280', false);

-- ============================================
-- PASO 2: AGREGAR COLUMNAS A INCIDENTES
-- ============================================

ALTER TABLE incidentes 
  ADD COLUMN estado_id INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN prioridad_id INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN categoria_id INTEGER NOT NULL DEFAULT 1;

-- ============================================
-- PASO 3: CREAR FOREIGN KEYS
-- ============================================

ALTER TABLE incidentes
  ADD CONSTRAINT fk_incidentes_estado
    FOREIGN KEY (estado_id) 
    REFERENCES estados_incidente(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  
  ADD CONSTRAINT fk_incidentes_prioridad
    FOREIGN KEY (prioridad_id) 
    REFERENCES prioridades_incidente(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  
  ADD CONSTRAINT fk_incidentes_categoria
    FOREIGN KEY (categoria_id) 
    REFERENCES categorias_incidente(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

-- Remover defaults
ALTER TABLE incidentes 
  ALTER COLUMN estado_id DROP DEFAULT,
  ALTER COLUMN prioridad_id DROP DEFAULT,
  ALTER COLUMN categoria_id DROP DEFAULT;

-- ============================================
-- PASO 4: CREAR ÍNDICES
-- ============================================

CREATE INDEX idx_estados_incidente_codigo ON estados_incidente(codigo);
CREATE INDEX idx_prioridades_incidente_codigo ON prioridades_incidente(codigo);
CREATE INDEX idx_prioridades_incidente_nivel ON prioridades_incidente(nivel);
CREATE INDEX idx_categorias_incidente_codigo ON categorias_incidente(codigo);
CREATE INDEX idx_especialidades_codigo ON especialidades(codigo);
CREATE INDEX idx_estados_personal_codigo ON estados_personal(codigo);

CREATE INDEX idx_incidentes_estado_id ON incidentes(estado_id);
CREATE INDEX idx_incidentes_prioridad_id ON incidentes(prioridad_id);
CREATE INDEX idx_incidentes_categoria_id ON incidentes(categoria_id);

-- ============================================
-- PASO 5: TRIGGERS
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
-- PASO 6: COMENTARIOS
-- ============================================

COMMENT ON TABLE estados_incidente IS 'Estados de la operación (Activo, Inactivo, Finalizado)';
COMMENT ON TABLE prioridades_incidente IS 'Prioridades de incidentes (Manejable, Grave, Crítico)';
COMMENT ON TABLE categorias_incidente IS 'Tipos de incidente (Persona, Objeto, Colaboración Judicial)';
COMMENT ON TABLE especialidades IS 'Especialidades del personal (caminante, dron, canes, paramédico, conductor)';
COMMENT ON TABLE estados_personal IS 'Estados del personal de emergencias';

-- ============================================
-- PASO 7: RECREAR VISTAS
-- ============================================

CREATE OR REPLACE VIEW vista_incidentes_completos AS
SELECT 
  i.*,
  e.codigo as estado_codigo,
  e.nombre as estado_nombre,
  e.color as estado_color,
  p.codigo as prioridad_codigo,
  p.nombre as prioridad_nombre,
  p.nivel as prioridad_nivel,
  p.color as prioridad_color,
  c.codigo as categoria_codigo,
  c.nombre as categoria_nombre,
  c.color as categoria_color
FROM incidentes i
LEFT JOIN estados_incidente e ON i.estado_id = e.id
LEFT JOIN prioridades_incidente p ON i.prioridad_id = p.id
LEFT JOIN categorias_incidente c ON i.categoria_id = c.id;

CREATE OR REPLACE VIEW vista_estadisticas_incidentes AS
SELECT 
  e.nombre as estado,
  e.color as estado_color,
  p.nombre as prioridad,
  p.nivel as prioridad_nivel,
  c.nombre as categoria,
  COUNT(i.id) as total_incidentes,
  ROUND(COUNT(i.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM incidentes), 0), 2) as porcentaje
FROM incidentes i
JOIN estados_incidente e ON i.estado_id = e.id
JOIN prioridades_incidente p ON i.prioridad_id = p.id
JOIN categorias_incidente c ON i.categoria_id = c.id
GROUP BY e.nombre, e.color, e.orden, p.nombre, p.nivel, c.nombre
ORDER BY e.orden, p.nivel;

-- ============================================
-- PASO 8: VERIFICACIÓN FINAL
-- ============================================

DO $$
DECLARE
  v_estados INTEGER;
  v_prioridades INTEGER;
  v_categorias INTEGER;
  v_especialidades INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_estados FROM estados_incidente;
  SELECT COUNT(*) INTO v_prioridades FROM prioridades_incidente;
  SELECT COUNT(*) INTO v_categorias FROM categorias_incidente;
  SELECT COUNT(*) INTO v_especialidades FROM especialidades;
  
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ CONFIGURACIÓN COMPLETADA - SISTEMA DUAR';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Estados: % (Activo, Inactivo, Finalizado)', v_estados;
  RAISE NOTICE 'Prioridades: % (Crítico, Grave, Manejable)', v_prioridades;
  RAISE NOTICE 'Tipos: % (Persona, Objeto, Colaboración Judicial)', v_categorias;
  RAISE NOTICE 'Especialidades: % (caminante, dron, canes, paramédico, conductor)', v_especialidades;
  RAISE NOTICE '================================================';
  RAISE NOTICE '🎉 TODO LISTO - Recarga la aplicación (F5)';
  RAISE NOTICE '================================================';
END $$;

-- Mostrar datos configurados
SELECT '📊 ESTADOS DE OPERACIÓN' as seccion;
SELECT codigo, nombre, color FROM estados_incidente ORDER BY orden;

SELECT '📊 PRIORIDADES' as seccion;
SELECT codigo, nombre, nivel, color FROM prioridades_incidente ORDER BY nivel;

SELECT '📊 TIPOS DE INCIDENTE' as seccion;
SELECT codigo, nombre, color FROM categorias_incidente ORDER BY nombre;

SELECT '📊 ESPECIALIDADES' as seccion;
SELECT codigo, nombre FROM especialidades ORDER BY nombre;

SELECT 
  '🎉 CONFIGURACIÓN COMPLETADA' as status,
  'Recarga la aplicación para ver los cambios' as next_step;
