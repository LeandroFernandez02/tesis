# 🗄️ Normalización de Base de Datos - Sistema DUAR

## 📋 Descripción

Scripts SQL para normalizar la base de datos del sistema de gestión de búsqueda y rescate, eliminando redundancia y mejorando la integridad referencial.

## 🎯 Objetivos

- ✅ Normalizar campos `estado`, `prioridad` y `categoria` en tabla `incidentes`
- ✅ Crear tablas de catálogo con datos maestros
- ✅ Implementar foreign keys para integridad referencial
- ✅ Mejorar rendimiento con índices apropiados
- ✅ Mantener compatibilidad con datos existentes

## 📁 Archivos

### 1. `01-create-catalog-tables.sql`
Crea las tablas de catálogo:
- `estados_incidente` - Estados posibles de un incidente
- `prioridades_incidente` - Niveles de prioridad
- `categorias_incidente` - Tipos de incidentes
- `especialidades` - Especialidades del personal
- `estados_personal` - Estados del personal

**Incluye:**
- ✅ Datos semilla (seed data)
- ✅ Índices de rendimiento
- ✅ Triggers para `updated_at`
- ✅ Comentarios descriptivos

### 2. `02-migrate-incidents-table.sql`
Migra la tabla `incidentes` existente:
- Crea nuevas columnas con foreign keys
- Migra datos existentes
- Mantiene columnas antiguas como backup
- Crea vista de compatibilidad

**Incluye:**
- ✅ Script de rollback completo
- ✅ Verificaciones de integridad
- ✅ Valores por defecto para datos sin mapear

### 3. `03-cleanup.sql`
Limpieza final (ejecutar después de verificar):
- Elimina columnas legacy
- Queries de verificación
- Estadísticas de uso

## 🚀 Instrucciones de Ejecución

### Paso 1: Backup de Seguridad
```bash
# Desde el dashboard de Supabase:
# Settings > Database > Database Backups
# Crear un backup manual antes de comenzar
```

### Paso 2: Ejecutar Scripts en Orden

#### Script 1: Crear Tablas de Catálogo
```sql
-- Dashboard > SQL Editor > New Query
-- Copiar y pegar contenido de: 01-create-catalog-tables.sql
-- Ejecutar (Ctrl+Enter o botón "Run")
```

**Verificación:**
```sql
-- Verificar que las tablas se crearon correctamente
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'estados_incidente',
    'prioridades_incidente', 
    'categorias_incidente',
    'especialidades',
    'estados_personal'
  );

-- Verificar datos semilla
SELECT * FROM estados_incidente;
SELECT * FROM prioridades_incidente;
SELECT * FROM categorias_incidente;
```

#### Script 2: Migrar Tabla Incidentes
```sql
-- Dashboard > SQL Editor > New Query
-- Copiar y pegar contenido de: 02-migrate-incidents-table.sql
-- Ejecutar (Ctrl+Enter o botón "Run")
```

**Verificación:**
```sql
-- Verificar que todos los incidentes migraron correctamente
SELECT 
  COUNT(*) as total_incidentes,
  COUNT(estado_id) as con_estado,
  COUNT(prioridad_id) as con_prioridad,
  COUNT(categoria_id) as con_categoria
FROM incidentes;

-- Los 4 números deben ser iguales

-- Verificar foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'incidentes' 
  AND tc.constraint_type = 'FOREIGN KEY';
```

### Paso 3: Probar la Aplicación

**⚠️ IMPORTANTE:** Después de ejecutar los scripts 1 y 2:

1. Actualizar el código de la aplicación (yo me encargo)
2. Probar todas las funcionalidades CRUD de incidentes
3. Verificar que los datos se guardan correctamente
4. Monitorear por errores durante **al menos 1 semana**

### Paso 4: Limpieza Final (Opcional)
```sql
-- SOLO después de verificar que todo funciona por 1+ semana
-- Dashboard > SQL Editor > New Query
-- Copiar y pegar contenido de: 03-cleanup.sql
-- Ejecutar (Ctrl+Enter o botón "Run")
```

## 🔄 Rollback en Caso de Problemas

Si algo sale mal después del Script 2, ejecutar:

```sql
-- ROLLBACK COMPLETO
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
```

## 📊 Esquema Normalizado Resultante

```
┌─────────────────────────┐
│  estados_incidente      │
├─────────────────────────┤
│ id (PK)                 │
│ codigo (UNIQUE)         │
│ nombre                  │
│ descripcion             │
│ color                   │
│ orden                   │
└─────────────────────────┘
          ▲
          │
          │ FK: estado_id
          │
┌─────────────────────────┐
│     incidentes          │
├─────────────────────────┤
│ id (PK)                 │
│ titulo                  │
│ descripcion             │
│ estado_id (FK)          │◄───┐
│ prioridad_id (FK)       │◄───┼───────────────────┐
│ categoria_id (FK)       │◄───┼─────────────┐     │
│ ...                     │    │             │     │
└─────────────────────────┘    │             │     │
                               │             │     │
┌─────────────────────────┐    │             │     │
│ prioridades_incidente   │    │             │     │
├─────────────────────────┤    │             │     │
│ id (PK)                 │────┘             │     │
│ codigo (UNIQUE)         │                  │     │
│ nombre                  │                  │     │
│ nivel                   │                  │     │
│ color                   │                  │     │
└─────────────────────────┘                  │     │
                                             │     │
┌─────────────────────────┐                  │     │
│ categorias_incidente    │                  │     │
├─────────────────────────┤                  │     │
│ id (PK)                 │──────────────────┘     │
│ codigo (UNIQUE)         │                        │
│ nombre                  │                        │
│ descripcion             │                        │
│ icono                   │                        │
└─────────────────────────┘                        │
                                                   │
┌─────────────────────────┐                        │
│    especialidades       │                        │
├─────────────────────────┤                        │
│ id (PK)                 │                        │
│ codigo (UNIQUE)         │                        │
│ nombre                  │                        │
│ requiere_certificacion  │                        │
└─────────────────────────┘                        │
                                                   │
┌─────────────────────────┐                        │
│   estados_personal      │                        │
├─────────────────────────┤                        │
│ id (PK)                 │                        │
│ codigo (UNIQUE)         │                        │
│ nombre                  │                        │
│ permite_asignacion      │                        │
└─────────────────────────┘
```

## ✅ Beneficios de la Normalización

### 1. **Integridad de Datos**
- ❌ Antes: `estado: "ACTIVO"`, `"activo"`, `"Activo"` (inconsistente)
- ✅ Ahora: `estado_id: 1` → Siempre consistente

### 2. **Facilidad de Mantenimiento**
- Cambiar el nombre de un estado: 1 UPDATE en lugar de migrar todos los incidentes
- Agregar nuevos metadatos (color, descripción): No requiere alterar tabla `incidentes`

### 3. **Rendimiento**
- Índices en foreign keys → JOINs más rápidos
- Queries de agregación más eficientes

### 4. **Validación en Base de Datos**
- Foreign keys evitan datos inválidos
- No se puede insertar un incidente con estado inexistente

### 5. **Reportes y Analytics**
```sql
-- Antes (difícil, propenso a errores)
SELECT estado, COUNT(*) 
FROM incidentes 
WHERE LOWER(estado) = 'activo' -- Manejo manual de case
GROUP BY estado;

-- Ahora (simple, garantizado)
SELECT e.nombre, COUNT(i.id)
FROM incidentes i
JOIN estados_incidente e ON i.estado_id = e.id
WHERE e.codigo = 'activo'
GROUP BY e.nombre;
```

## 🎨 Próximos Pasos (Después de Migración)

Una vez ejecutados los scripts, necesitarás:

1. ✅ Actualizar el código TypeScript para usar los nuevos campos FK
2. ✅ Modificar los hooks de Supabase para hacer JOINs
3. ✅ Actualizar los formularios para usar IDs en lugar de strings
4. ✅ Crear componentes de select dinámicos que consuman los catálogos

**¿Quieres que genere el código actualizado de la aplicación después de ejecutar los scripts?**

## 📞 Soporte

Si encuentras errores durante la migración:
1. NO ejecutar el Script 3 (cleanup)
2. Ejecutar el script de rollback incluido en el Script 2
3. Reportar el error con el mensaje exacto de PostgreSQL

## 🔒 Seguridad

- Todos los scripts incluyen `IF NOT EXISTS` y `IF EXISTS` para ser idempotentes
- Se mantienen columnas antiguas como backup hasta la limpieza final
- Vista de compatibilidad permite transición gradual
- Scripts de rollback incluidos para cada paso

---

**📌 IMPORTANTE:** Ejecuta estos scripts en **horario de bajo tráfico** y ten un **backup reciente** antes de comenzar.
