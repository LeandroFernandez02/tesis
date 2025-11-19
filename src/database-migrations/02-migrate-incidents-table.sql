-- ============================================
-- MIGRACIÓN DE TABLA INCIDENTES
-- Normalización de campos con foreign keys
-- ============================================
-- EJECUTAR DESPUÉS DE 01-create-catalog-tables.sql
-- ============================================

-- PASO 1: Crear columnas temporales con los nuevos IDs
-- ============================================
ALTER TABLE incidentes 
  ADD COLUMN IF NOT EXISTS estado_id INTEGER,
  ADD COLUMN IF NOT EXISTS prioridad_id INTEGER,
  ADD COLUMN IF NOT EXISTS categoria_id INTEGER;

-- PASO 2: Migrar datos existentes usando los códigos
-- ============================================

-- Migrar estados
UPDATE incidentes i
SET estado_id = e.id
FROM estados_incidente e
WHERE LOWER(i.estado) = e.codigo;

-- Migrar prioridades
UPDATE incidentes i
SET prioridad_id = p.id
FROM prioridades_incidente p
WHERE LOWER(i.prioridad) = p.codigo;

-- Migrar categorías
UPDATE incidentes i
SET categoria_id = c.id
FROM categorias_incidente c
WHERE LOWER(i.categoria) = c.codigo;

-- PASO 3: Verificar que todos los datos migraron correctamente
-- ============================================
-- Ejecuta este query para verificar si hay incidentes sin migrar:
-- SELECT 
--   COUNT(*) as total_incidentes,
--   COUNT(estado_id) as con_estado,
--   COUNT(prioridad_id) as con_prioridad,
--   COUNT(categoria_id) as con_categoria
-- FROM incidentes;

-- Si hay incidentes sin estado_id, prioridad_id o categoria_id, 
-- asignarles valores por defecto:
UPDATE incidentes 
SET estado_id = (SELECT id FROM estados_incidente WHERE codigo = 'activo')
WHERE estado_id IS NULL;

UPDATE incidentes 
SET prioridad_id = (SELECT id FROM prioridades_incidente WHERE codigo = 'media')
WHERE prioridad_id IS NULL;

UPDATE incidentes 
SET categoria_id = (SELECT id FROM categorias_incidente WHERE codigo = 'persona_perdida')
WHERE categoria_id IS NULL;

-- PASO 4: Hacer las columnas NOT NULL
-- ============================================
ALTER TABLE incidentes 
  ALTER COLUMN estado_id SET NOT NULL,
  ALTER COLUMN prioridad_id SET NOT NULL,
  ALTER COLUMN categoria_id SET NOT NULL;

-- PASO 5: Crear foreign keys
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

-- PASO 6: Crear índices para mejorar performance de joins
-- ============================================
CREATE INDEX IF NOT EXISTS idx_incidentes_estado_id ON incidentes(estado_id);
CREATE INDEX IF NOT EXISTS idx_incidentes_prioridad_id ON incidentes(prioridad_id);
CREATE INDEX IF NOT EXISTS idx_incidentes_categoria_id ON incidentes(categoria_id);

-- PASO 7: Renombrar columnas antiguas (NO eliminar todavía)
-- ============================================
-- Guardamos las columnas antiguas por seguridad
-- Las eliminaremos después de verificar que todo funciona
ALTER TABLE incidentes 
  RENAME COLUMN estado TO estado_legacy;
ALTER TABLE incidentes 
  RENAME COLUMN prioridad TO prioridad_legacy;
ALTER TABLE incidentes 
  RENAME COLUMN categoria TO categoria_legacy;

-- PASO 8: Crear vista para compatibilidad temporal
-- ============================================
-- Esta vista permite que el código viejo siga funcionando
CREATE OR REPLACE VIEW v_incidentes_legacy AS
SELECT 
  i.*,
  e.codigo as estado,
  p.codigo as prioridad,
  c.codigo as categoria,
  e.nombre as estado_nombre,
  p.nombre as prioridad_nombre,
  c.nombre as categoria_nombre,
  e.color as estado_color,
  p.color as prioridad_color,
  c.color as categoria_color
FROM incidentes i
LEFT JOIN estados_incidente e ON i.estado_id = e.id
LEFT JOIN prioridades_incidente p ON i.prioridad_id = p.id
LEFT JOIN categorias_incidente c ON i.categoria_id = c.id;

-- ============================================
-- SCRIPT DE ROLLBACK (en caso de problemas)
-- ============================================
-- SOLO EJECUTAR SI NECESITAS REVERTIR LOS CAMBIOS
-- ============================================
/*
-- Restaurar nombres de columnas
ALTER TABLE incidentes RENAME COLUMN estado_legacy TO estado;
ALTER TABLE incidentes RENAME COLUMN prioridad_legacy TO prioridad;
ALTER TABLE incidentes RENAME COLUMN categoria_legacy TO categoria;

-- Eliminar foreign keys
ALTER TABLE incidentes 
  DROP CONSTRAINT IF EXISTS fk_incidentes_estado,
  DROP CONSTRAINT IF EXISTS fk_incidentes_prioridad,
  DROP CONSTRAINT IF EXISTS fk_incidentes_categoria;

-- Eliminar columnas nuevas
ALTER TABLE incidentes 
  DROP COLUMN IF EXISTS estado_id,
  DROP COLUMN IF EXISTS prioridad_id,
  DROP COLUMN IF EXISTS categoria_id;

-- Eliminar vista
DROP VIEW IF EXISTS v_incidentes_legacy;
*/

-- ============================================
-- FIN DEL SCRIPT 02
-- ============================================
-- Después de verificar que todo funciona correctamente durante 
-- al menos una semana, ejecutar 03-cleanup.sql
