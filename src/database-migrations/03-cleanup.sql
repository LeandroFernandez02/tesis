-- ============================================
-- LIMPIEZA FINAL DE MIGRACIÓN
-- ============================================
-- EJECUTAR SOLO DESPUÉS DE VERIFICAR QUE TODO FUNCIONA
-- ESPERA AL MENOS 1 SEMANA ANTES DE EJECUTAR ESTE SCRIPT
-- ============================================

-- PASO 1: Eliminar columnas legacy
-- ============================================
-- Estas columnas ya no se usan porque fueron reemplazadas por FK
ALTER TABLE incidentes 
  DROP COLUMN IF EXISTS estado_legacy,
  DROP COLUMN IF EXISTS prioridad_legacy,
  DROP COLUMN IF EXISTS categoria_legacy;

-- PASO 2: Eliminar vista legacy (opcional)
-- ============================================
-- Solo si ya no la necesitas para compatibilidad
-- DROP VIEW IF EXISTS v_incidentes_legacy;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- Ejecuta estos queries para verificar la integridad:

-- 1. Contar incidentes por estado
-- SELECT e.nombre, COUNT(i.id) as total
-- FROM incidentes i
-- JOIN estados_incidente e ON i.estado_id = e.id
-- GROUP BY e.nombre;

-- 2. Contar incidentes por prioridad
-- SELECT p.nombre, COUNT(i.id) as total
-- FROM incidentes i
-- JOIN prioridades_incidente p ON i.prioridad_id = p.id
-- GROUP BY p.nombre
-- ORDER BY p.nivel;

-- 3. Contar incidentes por categoría
-- SELECT c.nombre, COUNT(i.id) as total
-- FROM incidentes i
-- JOIN categorias_incidente c ON i.categoria_id = c.id
-- GROUP BY c.nombre;

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
