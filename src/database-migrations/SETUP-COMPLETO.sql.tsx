-- ============================================
-- SETUP COMPLETO - BASE DE DATOS NORMALIZADA
-- Sistema DUAR - Dirección de Bomberos
-- ============================================
-- EJECUTAR TODO DE UNA VEZ en SQL Editor de Supabase
-- NO requiere backup si no tienes datos importantes
-- ============================================

-- ============================================
-- PASO 1: CREAR TABLAS DE CATÁLOGO
-- ============================================

-- 1.1 Estados de Incidente
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

INSERT INTO estados_incidente (codigo, nombre, descripcion, color, orden) VALUES
  ('activo', 'Activo', 'Incidente en curso con operaciones activas', '#ef4444', 1),
  ('inactivo', 'Inactivo', 'Incidente pausado o en espera', '#f59e0b', 2),
  ('finalizado', 'Finalizado', 'Incidente completado y cerrado', '#10b981', 3)
ON CONFLICT (codigo) DO NOTHING;

-- 1.2 Prioridades de Incidente
CREATE TABLE IF NOT EXISTS prioridades_incidente (
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
  ('critica', 'Crítica', 'Requiere respuesta inmediata - riesgo de vida', 1, '#dc2626', 15),
  ('alta', 'Alta', 'Situación urgente que requiere atención prioritaria', 2, '#ea580c', 30),
  ('media', 'Media', 'Situación importante pero sin riesgo inmediato', 3, '#f59e0b', 60),
  ('baja', 'Baja', 'Situación de rutina sin urgencia', 4, '#84cc16', 120)
ON CONFLICT (codigo) DO NOTHING;

-- 1.3 Categorías de Incidente
CREATE TABLE IF NOT EXISTS categorias_incidente (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  color VARCHAR(20),
  requiere_evacuacion BOOLEAN DEFAULT false,
  requiere_medicos BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO categorias_incidente (codigo, nombre, descripcion, icono, color, requiere_evacuacion, requiere_medicos) VALUES
  ('persona_perdida', 'Persona Perdida', 'Búsqueda de persona extraviada en zona urbana o rural', 'user-x', '#ef4444', false, true),
  ('menor_perdido', 'Menor Perdido', 'Búsqueda de niño o adolescente extraviado', 'baby', '#dc2626', false, true),
  ('senderista_perdido', 'Senderista Perdido', 'Búsqueda de excursionista o montañista extraviado', 'mountain', '#f97316', false, true),
  ('adulto_mayor', 'Adulto Mayor Perdido', 'Búsqueda de persona mayor extraviada', 'user', '#f59e0b', false, true),
  ('accidente_montaña', 'Accidente en Montaña', 'Rescate por accidente en zona montañosa', 'alert-triangle', '#dc2626', true, true),
  ('persona_desaparecida', 'Persona Desaparecida', 'Investigación de desaparición reportada', 'search', '#8b5cf6', false, false),
  ('otro', 'Otro', 'Otros tipos de incidentes de búsqueda y rescate', 'help-circle', '#6b7280', false, false)
ON CONFLICT (codigo) DO NOTHING;

-- 1.4 Especialidades (para personal)
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

INSERT INTO especialidades (codigo, nombre, descripcion, icono, color, requiere_certificacion) VALUES
  ('caminante', 'Caminante', 'Personal de rastrillaje a pie', 'footprints', '#10b981', false),
  ('dron', 'Operador de Dron', 'Piloto de drones para reconocimiento aéreo', 'drone', '#3b82f6', true),
  ('canes', 'Guía Canino', 'Guía de perros de búsqueda y rescate', 'dog', '#f59e0b', true),
  ('paramedico', 'Paramédico', 'Personal médico de emergencias', 'heart-pulse', '#ef4444', true),
  ('conductor', 'Conductor', 'Conductor de vehículos de emergencia', 'truck', '#6b7280', true)
ON CONFLICT (codigo) DO NOTHING;

-- 1.5 Estados de Personal
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

INSERT INTO estados_personal (codigo, nombre, descripcion, color, permite_asignacion) VALUES
  ('activo', 'Activo', 'Disponible para asignación', '#10b981', true),
  ('en_servicio', 'En Servicio', 'Actualmente asignado a un incidente', '#3b82f6', false),
  ('descanso', 'En Descanso', 'Periodo de descanso', '#f59e0b', false),
  ('inactivo', 'Inactivo', 'No disponible', '#6b7280', false),
  ('baja_temporal', 'Baja Temporal', 'Fuera de servicio temporalmente', '#ef4444', false),
  ('baja_definitiva', 'Baja Definitiva', 'Ya no forma parte del cuerpo', '#dc2626', false)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- PASO 2: MODIFICAR TABLA INCIDENTES
-- ============================================

-- 2.0 Eliminar vistas que dependen de las columnas antiguas
DROP VIEW IF EXISTS vista_incidentes_completos CASCADE;
DROP VIEW IF EXISTS vista_estadisticas_incidentes CASCADE;
DROP VIEW IF EXISTS v_incidentes_legacy CASCADE;

-- 2.1 Eliminar columnas viejas si existen
ALTER TABLE incidentes 
  DROP COLUMN IF EXISTS estado CASCADE,
  DROP COLUMN IF EXISTS prioridad CASCADE,
  DROP COLUMN IF EXISTS categoria CASCADE;

-- 2.2 Agregar nuevas columnas con Foreign Keys
ALTER TABLE incidentes 
  ADD COLUMN IF NOT EXISTS estado_id INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS prioridad_id INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS categoria_id INTEGER NOT NULL DEFAULT 1;

-- 2.3 Crear Foreign Keys
ALTER TABLE incidentes
  DROP CONSTRAINT IF EXISTS fk_incidentes_estado,
  DROP CONSTRAINT IF EXISTS fk_incidentes_prioridad,
  DROP CONSTRAINT IF EXISTS fk_incidentes_categoria;

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

-- 2.4 Remover defaults después de crear las constraints
ALTER TABLE incidentes 
  ALTER COLUMN estado_id DROP DEFAULT,
  ALTER COLUMN prioridad_id DROP DEFAULT,
  ALTER COLUMN categoria_id DROP DEFAULT;

-- ============================================
-- PASO 3: CREAR ÍNDICES
-- ============================================

-- Índices en tablas de catálogo
CREATE INDEX IF NOT EXISTS idx_estados_incidente_codigo ON estados_incidente(codigo);
CREATE INDEX IF NOT EXISTS idx_prioridades_incidente_codigo ON prioridades_incidente(codigo);
CREATE INDEX IF NOT EXISTS idx_prioridades_incidente_nivel ON prioridades_incidente(nivel);
CREATE INDEX IF NOT EXISTS idx_categorias_incidente_codigo ON categorias_incidente(codigo);
CREATE INDEX IF NOT EXISTS idx_especialidades_codigo ON especialidades(codigo);
CREATE INDEX IF NOT EXISTS idx_estados_personal_codigo ON estados_personal(codigo);

-- Índices en tabla incidentes para joins rápidos
CREATE INDEX IF NOT EXISTS idx_incidentes_estado_id ON incidentes(estado_id);
CREATE INDEX IF NOT EXISTS idx_incidentes_prioridad_id ON incidentes(prioridad_id);
CREATE INDEX IF NOT EXISTS idx_incidentes_categoria_id ON incidentes(categoria_id);

-- ============================================
-- PASO 4: TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_estados_incidente_updated_at ON estados_incidente;
CREATE TRIGGER update_estados_incidente_updated_at BEFORE UPDATE ON estados_incidente
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prioridades_incidente_updated_at ON prioridades_incidente;
CREATE TRIGGER update_prioridades_incidente_updated_at BEFORE UPDATE ON prioridades_incidente
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categorias_incidente_updated_at ON categorias_incidente;
CREATE TRIGGER update_categorias_incidente_updated_at BEFORE UPDATE ON categorias_incidente
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_especialidades_updated_at ON especialidades;
CREATE TRIGGER update_especialidades_updated_at BEFORE UPDATE ON especialidades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_estados_personal_updated_at ON estados_personal;
CREATE TRIGGER update_estados_personal_updated_at BEFORE UPDATE ON estados_personal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PASO 5: COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE estados_incidente IS 'Catálogo de estados posibles para incidentes';
COMMENT ON TABLE prioridades_incidente IS 'Catálogo de niveles de prioridad para incidentes';
COMMENT ON TABLE categorias_incidente IS 'Catálogo de tipos de incidentes de búsqueda y rescate';
COMMENT ON TABLE especialidades IS 'Catálogo de especialidades del personal de emergencias';
COMMENT ON TABLE estados_personal IS 'Catálogo de estados del personal';

-- ============================================
-- PASO 5.5: RECREAR VISTAS CON NUEVA ESTRUCTURA
-- ============================================

-- Vista completa de incidentes con todos los datos relacionados
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
  c.icono as categoria_icono,
  c.color as categoria_color
FROM incidentes i
LEFT JOIN estados_incidente e ON i.estado_id = e.id
LEFT JOIN prioridades_incidente p ON i.prioridad_id = p.id
LEFT JOIN categorias_incidente c ON i.categoria_id = c.id;

-- Vista de estadísticas de incidentes
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

COMMENT ON VIEW vista_incidentes_completos IS 'Vista completa de incidentes con todos los datos relacionados';
COMMENT ON VIEW vista_estadisticas_incidentes IS 'Estadísticas agregadas de incidentes por estado, prioridad y categoría';

-- ============================================
-- PASO 6: VERIFICACIÓN
-- ============================================

-- Verificar que todo se creó correctamente
DO $$
DECLARE
  v_estados INTEGER;
  v_prioridades INTEGER;
  v_categorias INTEGER;
  v_especialidades INTEGER;
  v_estados_personal INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_estados FROM estados_incidente;
  SELECT COUNT(*) INTO v_prioridades FROM prioridades_incidente;
  SELECT COUNT(*) INTO v_categorias FROM categorias_incidente;
  SELECT COUNT(*) INTO v_especialidades FROM especialidades;
  SELECT COUNT(*) INTO v_estados_personal FROM estados_personal;
  
  RAISE NOTICE '✅ Setup completado exitosamente:';
  RAISE NOTICE '   - Estados de incidente: % registros', v_estados;
  RAISE NOTICE '   - Prioridades: % registros', v_prioridades;
  RAISE NOTICE '   - Categorías: % registros', v_categorias;
  RAISE NOTICE '   - Especialidades: % registros', v_especialidades;
  RAISE NOTICE '   - Estados de personal: % registros', v_estados_personal;
  
  IF v_estados = 0 OR v_prioridades = 0 OR v_categorias = 0 THEN
    RAISE WARNING '⚠️ Algunas tablas están vacías. Verifica que los INSERTs se ejecutaron correctamente.';
  END IF;
END $$;

-- ============================================
-- FIN DEL SETUP
-- ============================================
-- La base de datos está lista y normalizada ✅
-- Siguiente paso: Actualizar el código de la aplicación
-- ============================================

SELECT 
  '🎉 BASE DE DATOS NORMALIZADA EXITOSAMENTE' as status,
  'Ejecuta las queries de verificación en 04-verification-queries.sql' as next_step;