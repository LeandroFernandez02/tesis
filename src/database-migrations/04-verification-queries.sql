-- ============================================
-- QUERIES DE VERIFICACIÓN Y TESTING
-- ============================================
-- Ejecuta estos queries después de cada paso para verificar
-- que todo funciona correctamente
-- ============================================

-- ============================================
-- VERIFICACIÓN DESPUÉS DEL SCRIPT 01
-- ============================================

-- 1. Verificar que todas las tablas de catálogo existen
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'estados_incidente',
    'prioridades_incidente', 
    'categorias_incidente',
    'especialidades',
    'estados_personal'
  )
ORDER BY tablename;

-- 2. Contar registros en cada catálogo
SELECT 'estados_incidente' as tabla, COUNT(*) as registros FROM estados_incidente
UNION ALL
SELECT 'prioridades_incidente', COUNT(*) FROM prioridades_incidente
UNION ALL
SELECT 'categorias_incidente', COUNT(*) FROM categorias_incidente
UNION ALL
SELECT 'especialidades', COUNT(*) FROM especialidades
UNION ALL
SELECT 'estados_personal', COUNT(*) FROM estados_personal;

-- 3. Ver todos los estados de incidente
SELECT 
  id,
  codigo,
  nombre,
  color,
  orden,
  activo
FROM estados_incidente
ORDER BY orden;

-- 4. Ver todas las prioridades
SELECT 
  id,
  codigo,
  nombre,
  nivel,
  color,
  tiempo_respuesta_minutos
FROM prioridades_incidente
ORDER BY nivel;

-- 5. Ver todas las categorías
SELECT 
  id,
  codigo,
  nombre,
  icono,
  requiere_evacuacion,
  requiere_medicos
FROM categorias_incidente
ORDER BY nombre;

-- 6. Ver todas las especialidades
SELECT 
  id,
  codigo,
  nombre,
  requiere_certificacion
FROM especialidades
ORDER BY nombre;

-- 7. Verificar índices creados
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'estados_incidente',
    'prioridades_incidente',
    'categorias_incidente',
    'especialidades',
    'estados_personal'
  )
ORDER BY tablename, indexname;

-- ============================================
-- VERIFICACIÓN DESPUÉS DEL SCRIPT 02
-- ============================================

-- 8. Verificar que las nuevas columnas existen
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'incidentes'
  AND column_name IN ('estado_id', 'prioridad_id', 'categoria_id')
ORDER BY column_name;

-- 9. Verificar migración completa de datos
SELECT 
  COUNT(*) as total_incidentes,
  COUNT(estado_id) as con_estado_id,
  COUNT(prioridad_id) as con_prioridad_id,
  COUNT(categoria_id) as con_categoria_id,
  COUNT(estado_legacy) as con_estado_legacy,
  COUNT(prioridad_legacy) as con_prioridad_legacy,
  COUNT(categoria_legacy) as con_categoria_legacy
FROM incidentes;

-- 10. Verificar que NO hay incidentes sin FK (deben ser 0)
SELECT 
  COUNT(*) as incidentes_sin_estado_id
FROM incidentes
WHERE estado_id IS NULL;

SELECT 
  COUNT(*) as incidentes_sin_prioridad_id
FROM incidentes
WHERE prioridad_id IS NULL;

SELECT 
  COUNT(*) as incidentes_sin_categoria_id
FROM incidentes
WHERE categoria_id IS NULL;

-- 11. Verificar foreign keys creadas
SELECT
  tc.table_name as tabla, 
  kcu.column_name as columna, 
  ccu.table_name as tabla_referenciada,
  ccu.column_name as columna_referenciada,
  tc.constraint_name as nombre_constraint
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'incidentes' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY kcu.column_name;

-- 12. Probar JOIN con datos reales
SELECT 
  i.id,
  i.titulo,
  e.nombre as estado,
  p.nombre as prioridad,
  c.nombre as categoria,
  e.color as estado_color,
  p.color as prioridad_color,
  p.nivel as prioridad_nivel
FROM incidentes i
LEFT JOIN estados_incidente e ON i.estado_id = e.id
LEFT JOIN prioridades_incidente p ON i.prioridad_id = p.id
LEFT JOIN categorias_incidente c ON i.categoria_id = c.id
LIMIT 10;

-- 13. Verificar vista de compatibilidad
SELECT * FROM v_incidentes_legacy LIMIT 5;

-- 14. Estadísticas: Incidentes por estado
SELECT 
  e.nombre as estado,
  e.color,
  COUNT(i.id) as total_incidentes,
  ROUND(COUNT(i.id) * 100.0 / (SELECT COUNT(*) FROM incidentes), 2) as porcentaje
FROM incidentes i
JOIN estados_incidente e ON i.estado_id = e.id
GROUP BY e.id, e.nombre, e.color, e.orden
ORDER BY e.orden;

-- 15. Estadísticas: Incidentes por prioridad
SELECT 
  p.nombre as prioridad,
  p.nivel,
  p.color,
  COUNT(i.id) as total_incidentes,
  ROUND(COUNT(i.id) * 100.0 / (SELECT COUNT(*) FROM incidentes), 2) as porcentaje
FROM incidentes i
JOIN prioridades_incidente p ON i.prioridad_id = p.id
GROUP BY p.id, p.nombre, p.nivel, p.color
ORDER BY p.nivel;

-- 16. Estadísticas: Incidentes por categoría
SELECT 
  c.nombre as categoria,
  c.icono,
  COUNT(i.id) as total_incidentes,
  ROUND(COUNT(i.id) * 100.0 / (SELECT COUNT(*) FROM incidentes), 2) as porcentaje
FROM incidentes i
JOIN categorias_incidente c ON i.categoria_id = c.id
GROUP BY c.id, c.nombre, c.icono
ORDER BY total_incidentes DESC;

-- 17. Verificar integridad referencial (debe fallar si intentas insertar ID inválido)
-- Este INSERT debe FALLAR con error de foreign key:
-- INSERT INTO incidentes (titulo, estado_id, prioridad_id, categoria_id) 
-- VALUES ('Test', 9999, 9999, 9999);

-- 18. Comparar datos legacy vs nuevos (deben coincidir)
SELECT 
  i.id,
  i.estado_legacy as estado_viejo,
  e.codigo as estado_nuevo,
  CASE 
    WHEN LOWER(i.estado_legacy) = e.codigo THEN '✓ OK'
    ELSE '✗ MISMATCH'
  END as estado_match,
  i.prioridad_legacy as prioridad_vieja,
  p.codigo as prioridad_nueva,
  CASE 
    WHEN LOWER(i.prioridad_legacy) = p.codigo THEN '✓ OK'
    ELSE '✗ MISMATCH'
  END as prioridad_match
FROM incidentes i
LEFT JOIN estados_incidente e ON i.estado_id = e.id
LEFT JOIN prioridades_incidente p ON i.prioridad_id = p.id
WHERE LOWER(i.estado_legacy) != e.codigo 
   OR LOWER(i.prioridad_legacy) != p.codigo
LIMIT 10;

-- ============================================
-- VERIFICACIÓN DESPUÉS DEL SCRIPT 03 (CLEANUP)
-- ============================================

-- 19. Verificar que columnas legacy fueron eliminadas
SELECT 
  column_name
FROM information_schema.columns
WHERE table_name = 'incidentes'
  AND column_name IN ('estado_legacy', 'prioridad_legacy', 'categoria_legacy');
-- Debe retornar 0 filas

-- 20. Verificar estructura final de la tabla incidentes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'incidentes'
ORDER BY ordinal_position;

-- ============================================
-- QUERIES ÚTILES PARA ADMINISTRACIÓN
-- ============================================

-- 21. Agregar nuevo estado personalizado
/*
INSERT INTO estados_incidente (codigo, nombre, descripcion, color, orden)
VALUES ('en_revision', 'En Revisión', 'Incidente bajo revisión administrativa', '#8b5cf6', 4);
*/

-- 22. Agregar nueva prioridad
/*
INSERT INTO prioridades_incidente (codigo, nombre, descripcion, nivel, color, tiempo_respuesta_minutos)
VALUES ('emergencia', 'Emergencia', 'Máxima prioridad - vida en riesgo inmediato', 0, '#7f1d1d', 5);
*/

-- 23. Agregar nueva categoría
/*
INSERT INTO categorias_incidente (codigo, nombre, descripcion, icono, color)
VALUES ('avalancha', 'Avalancha', 'Rescate en zona de avalancha', 'mountain-snow', '#0ea5e9');
*/

-- 24. Desactivar un estado sin eliminarlo
/*
UPDATE estados_incidente 
SET activo = false 
WHERE codigo = 'inactivo';
*/

-- 25. Cambiar el color de una prioridad
/*
UPDATE prioridades_incidente 
SET color = '#ff0000' 
WHERE codigo = 'critica';
*/

-- 26. Ver incidentes críticos activos con toda su info
SELECT 
  i.id,
  i.titulo,
  i.descripcion,
  e.nombre as estado,
  p.nombre as prioridad,
  c.nombre as categoria,
  i.fecha_creacion
FROM incidentes i
JOIN estados_incidente e ON i.estado_id = e.id
JOIN prioridades_incidente p ON i.prioridad_id = p.id
JOIN categorias_incidente c ON i.categoria_id = c.id
WHERE e.codigo = 'activo' 
  AND p.codigo = 'critica'
ORDER BY i.fecha_creacion DESC;

-- 27. Reporte mensual de incidentes
SELECT 
  TO_CHAR(i.fecha_creacion, 'YYYY-MM') as mes,
  e.nombre as estado,
  p.nombre as prioridad,
  COUNT(*) as total
FROM incidentes i
JOIN estados_incidente e ON i.estado_id = e.id
JOIN prioridades_incidente p ON i.prioridad_id = p.id
WHERE i.fecha_creacion >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
GROUP BY TO_CHAR(i.fecha_creacion, 'YYYY-MM'), e.nombre, p.nombre
ORDER BY mes DESC, total DESC;

-- 28. Performance: Verificar uso de índices
EXPLAIN ANALYZE
SELECT 
  i.*,
  e.nombre as estado_nombre,
  p.nombre as prioridad_nombre
FROM incidentes i
JOIN estados_incidente e ON i.estado_id = e.id
JOIN prioridades_incidente p ON i.prioridad_id = p.id
WHERE e.codigo = 'activo'
  AND p.nivel <= 2
LIMIT 100;

-- 29. Auditoría: Ver cuándo se modificaron los catálogos por última vez
SELECT 
  'estados_incidente' as tabla,
  MAX(updated_at) as ultima_modificacion
FROM estados_incidente
UNION ALL
SELECT 
  'prioridades_incidente',
  MAX(updated_at)
FROM prioridades_incidente
UNION ALL
SELECT 
  'categorias_incidente',
  MAX(updated_at)
FROM categorias_incidente;

-- 30. Cleanup de datos huérfanos (si existen)
-- Ejecutar SOLO si encuentras datos inconsistentes
/*
DELETE FROM incidentes 
WHERE estado_id NOT IN (SELECT id FROM estados_incidente)
   OR prioridad_id NOT IN (SELECT id FROM prioridades_incidente)
   OR categoria_id NOT IN (SELECT id FROM categorias_incidente);
*/

-- ============================================
-- FIN DE QUERIES DE VERIFICACIÓN
-- ============================================
