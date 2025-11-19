# 🧪 TESTS DE VALIDACIÓN - MIGRACIÓN SQL

## 🎯 Objetivo
Verificar que la migración a SQL funcione correctamente en tu aplicación.

---

## ✅ TEST 1: HEALTH CHECK DEL SERVIDOR

### URL a probar:
```
https://ibkxwfhoqsbuakdbbscl.supabase.co/functions/v1/make-server-69ee164a/health
```

### Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-11-16T...",
  "database": "PostgreSQL (Supabase)",
  "version": "2.0-SQL"
}
```

### ✅ PASAR si:
- Status code: 200
- Contiene `"database": "PostgreSQL (Supabase)"`
- Contiene `"version": "2.0-SQL"`

---

## ✅ TEST 2: VERIFICAR TABLAS EN SUPABASE

### En Supabase SQL Editor, ejecuta:
```sql
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE columns.table_name = tables.table_name) as columnas
FROM information_schema.tables tables
WHERE table_schema = 'public'
  AND table_name IN (
    'incidentes',
    'personal',
    'equipos',
    'punto_0',
    'denunciantes',
    'fiscales_solicitantes',
    'personas_desaparecidas',
    'comentarios_incidente',
    'archivos_incidente',
    'eventos_linea_tiempo'
  )
ORDER BY table_name;
```

### Resultado esperado:
```
table_name                 | columnas
---------------------------+---------
archivos_incidente         | 9
comentarios_incidente      | 5
denunciantes               | 8
equipos                    | 7
eventos_linea_tiempo       | 8
fiscales_solicitantes      | 7
incidentes                 | 11
personas_desaparecidas     | 19
personal                   | 17
punto_0                    | 7
```

### ✅ PASAR si:
- Se listan **al menos 10 tablas**
- Cada tabla tiene el número correcto de columnas

---

## ✅ TEST 3: CREAR INCIDENTE DE PRUEBA

### En Supabase SQL Editor, ejecuta:
```sql
-- Insertar incidente de prueba
INSERT INTO incidentes (
  titulo,
  descripcion,
  estado,
  prioridad,
  categoria,
  jefe_dotacion
) VALUES (
  'PRUEBA MIGRACIÓN SQL',
  'Incidente de prueba para validar base de datos relacional',
  'activo',
  'grave',
  'persona',
  'Comandante Test'
)
RETURNING *;
```

### Resultado esperado:
- Se inserta correctamente
- Devuelve el incidente con:
  - `id` (UUID generado)
  - `fecha_creacion` (timestamp actual)
  - `fecha_actualizacion` (timestamp actual)

### ✅ PASAR si:
- Inserta sin errores
- `id` es un UUID válido
- Fechas son timestamps válidos

---

## ✅ TEST 4: AGREGAR PUNTO 0

### En Supabase SQL Editor, ejecuta:
```sql
-- Reemplaza <ID_DEL_INCIDENTE> con el ID del test anterior
INSERT INTO punto_0 (
  incidente_id,
  lat,
  lng,
  direccion,
  zona,
  fecha_hora,
  bloqueado
) VALUES (
  '<ID_DEL_INCIDENTE>',
  -34.6037,
  -58.3816,
  'Plaza de Mayo, Buenos Aires',
  'Centro',
  NOW(),
  true
)
RETURNING *;
```

### ✅ PASAR si:
- Inserta correctamente
- `incidente_id` coincide con el ID del incidente
- Coordenadas son numéricas

---

## ✅ TEST 5: VERIFICAR FOREIGN KEY

### En Supabase SQL Editor, ejecuta:
```sql
-- DEBE FALLAR: Intentar insertar punto_0 con incidente inexistente
INSERT INTO punto_0 (
  incidente_id,
  lat,
  lng,
  direccion,
  bloqueado
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  0,
  0,
  'Test',
  true
);
```

### Resultado esperado:
```
ERROR: insert or update on table "punto_0" violates foreign key constraint
```

### ✅ PASAR si:
- **FALLA** con error de Foreign Key
- Menciona violación de constraint

---

## ✅ TEST 6: VALIDACIÓN DE ENUMS

### En Supabase SQL Editor, ejecuta:
```sql
-- DEBE FALLAR: Estado inválido
INSERT INTO incidentes (
  titulo,
  descripcion,
  estado,
  prioridad,
  categoria
) VALUES (
  'Test',
  'Test',
  'pendiente',  -- ❌ Estado inválido (solo: activo, inactivo, finalizado)
  'grave',
  'persona'
);
```

### Resultado esperado:
```
ERROR: invalid input value for enum estado_incidente: "pendiente"
```

### ✅ PASAR si:
- **FALLA** con error de ENUM
- Menciona valores válidos

---

## ✅ TEST 7: QUERY CON JOINS

### En Supabase SQL Editor, ejecuta:
```sql
-- Obtener incidentes con todas sus relaciones
SELECT 
  i.id,
  i.titulo,
  i.estado,
  i.prioridad,
  p0.direccion as punto_0_direccion,
  d.nombre as denunciante_nombre,
  pd.nombre as persona_desaparecida_nombre
FROM incidentes i
LEFT JOIN punto_0 p0 ON p0.incidente_id = i.id
LEFT JOIN denunciantes d ON d.incidente_id = i.id
LEFT JOIN personas_desaparecidas pd ON pd.incidente_id = i.id
WHERE i.titulo = 'PRUEBA MIGRACIÓN SQL'
LIMIT 1;
```

### Resultado esperado:
- Devuelve el incidente de prueba
- Muestra el punto_0 si lo agregaste
- Joins funcionan correctamente

### ✅ PASAR si:
- Query ejecuta sin errores
- Devuelve al menos 1 fila
- Joins traen datos relacionados

---

## ✅ TEST 8: ESTADÍSTICAS

### En Supabase SQL Editor, ejecuta:
```sql
-- Usar la vista de estadísticas
SELECT * FROM vista_estadisticas_incidentes;
```

### Resultado esperado:
```
total_incidentes | activos | inactivos | finalizados | criticos | graves | manejables
-----------------+---------+-----------+-------------+----------+--------+-----------
1                | 1       | 0         | 0           | 0        | 1      | 0
```

### ✅ PASAR si:
- Vista existe y devuelve datos
- Contadores son correctos

---

## ✅ TEST 9: TRIGGER DE ACTUALIZACIÓN

### En Supabase SQL Editor, ejecuta:
```sql
-- Obtener fecha_actualizacion actual
SELECT fecha_actualizacion 
FROM incidentes 
WHERE titulo = 'PRUEBA MIGRACIÓN SQL';

-- Esperar 2 segundos y actualizar
SELECT pg_sleep(2);

UPDATE incidentes 
SET descripcion = 'Descripción actualizada por trigger'
WHERE titulo = 'PRUEBA MIGRACIÓN SQL';

-- Verificar que fecha_actualizacion cambió
SELECT fecha_actualizacion 
FROM incidentes 
WHERE titulo = 'PRUEBA MIGRACIÓN SQL';
```

### ✅ PASAR si:
- `fecha_actualizacion` cambió automáticamente
- El trigger funciona correctamente

---

## ✅ TEST 10: DELETE CASCADE

### En Supabase SQL Editor, ejecuta:
```sql
-- Crear comentario para el incidente
INSERT INTO comentarios_incidente (
  incidente_id,
  autor,
  contenido
)
SELECT 
  id,
  'Test User',
  'Comentario de prueba'
FROM incidentes
WHERE titulo = 'PRUEBA MIGRACIÓN SQL'
RETURNING *;

-- Verificar que existe
SELECT COUNT(*) as comentarios
FROM comentarios_incidente c
JOIN incidentes i ON i.id = c.incidente_id
WHERE i.titulo = 'PRUEBA MIGRACIÓN SQL';

-- Eliminar incidente
DELETE FROM incidentes
WHERE titulo = 'PRUEBA MIGRACIÓN SQL';

-- Verificar que los comentarios se eliminaron en CASCADE
SELECT COUNT(*) as comentarios_restantes
FROM comentarios_incidente c
WHERE c.incidente_id IN (
  SELECT id FROM incidentes WHERE titulo = 'PRUEBA MIGRACIÓN SQL'
);
```

### Resultado esperado:
- `comentarios = 1` (antes de delete)
- `comentarios_restantes = 0` (después de delete)

### ✅ PASAR si:
- Comentarios se eliminan automáticamente
- DELETE CASCADE funciona

---

## 📊 RESUMEN DE RESULTADOS

### Checklist:
- [ ] Test 1: Health Check ✅
- [ ] Test 2: Verificar Tablas ✅
- [ ] Test 3: Crear Incidente ✅
- [ ] Test 4: Agregar Punto 0 ✅
- [ ] Test 5: Foreign Key ✅
- [ ] Test 6: Validación ENUM ✅
- [ ] Test 7: Query con Joins ✅
- [ ] Test 8: Estadísticas ✅
- [ ] Test 9: Trigger Actualización ✅
- [ ] Test 10: Delete Cascade ✅

---

## 🎯 VALIDACIÓN FINAL

### Si TODOS los tests pasan:
```
✅ MIGRACIÓN EXITOSA
✅ Base de datos relacional funcionando
✅ Integridad referencial activa
✅ Triggers automáticos funcionando
✅ Listo para producción
```

### Si algún test falla:
1. Copia el error exacto
2. Indica qué test falló (número)
3. Envíame la información para ayudarte

---

## 🚀 PRÓXIMO PASO

Una vez que TODOS los tests pasen, prueba la aplicación frontend:

1. **Crear incidente** desde la interfaz
2. **Agregar comentarios**
3. **Filtrar por estado/prioridad**
4. **Ver estadísticas**
5. **Asignar personal** (cuando esté implementado)

---

**¿Listo para probar?** Ejecuta los tests en orden y marca cada uno que pase! ✅
