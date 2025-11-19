# 🚀 Setup Simple - Base de Datos Normalizada

## ⚡ VERSIÓN RÁPIDA (Sin datos importantes)

Si **NO tienes datos importantes** que necesites preservar, este es el proceso más simple:

### Paso 1: Ejecutar Script Único ⭐

1. Ve a tu dashboard de Supabase:
   ```
   https://supabase.com/dashboard/project/qnqbqcwvuwngcmsgistp
   ```

2. Navega a: **SQL Editor** (menú izquierdo)

3. Clic en **"New Query"**

4. Copia y pega **TODO** el contenido de:
   ```
   SETUP-COMPLETO.sql
   ```

5. Clic en **"Run"** (o presiona Ctrl+Enter)

6. ✅ Espera el mensaje:
   ```
   🎉 BASE DE DATOS NORMALIZADA EXITOSAMENTE
   ```

**¡Eso es todo!** 🎉

---

### Paso 2: Verificar (Opcional)

Ejecuta este query para confirmar:

```sql
-- Ver todos los catálogos creados
SELECT 'Estados' as tabla, COUNT(*) as registros FROM estados_incidente
UNION ALL
SELECT 'Prioridades', COUNT(*) FROM prioridades_incidente
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categorias_incidente
UNION ALL
SELECT 'Especialidades', COUNT(*) FROM especialidades
UNION ALL
SELECT 'Estados Personal', COUNT(*) FROM estados_personal;
```

Deberías ver:
```
Estados           | 3
Prioridades       | 4
Categorías        | 7
Especialidades    | 5
Estados Personal  | 6
```

---

### Paso 3: Avísame

Una vez ejecutado el script, **avísame aquí** y yo actualizaré automáticamente:

- ✅ Código TypeScript para usar las nuevas tablas
- ✅ Hooks de Supabase con JOINs optimizados
- ✅ Formularios con selects dinámicos
- ✅ Tipos e interfaces actualizadas

---

## 📊 ¿Qué hace el script?

### Crea 5 tablas de catálogo:

1. **`estados_incidente`** (3 registros)
   - Activo, Inactivo, Finalizado

2. **`prioridades_incidente`** (4 registros)
   - Crítica, Alta, Media, Baja

3. **`categorias_incidente`** (7 registros)
   - Persona Perdida, Menor Perdido, Senderista, etc.

4. **`especialidades`** (5 registros)
   - Caminante, Dron, Canes, Paramédico, Conductor

5. **`estados_personal`** (6 registros)
   - Activo, En Servicio, Descanso, Inactivo, etc.

### Modifica la tabla `incidentes`:

- ❌ Elimina: `estado`, `prioridad`, `categoria` (columnas text)
- ✅ Agrega: `estado_id`, `prioridad_id`, `categoria_id` (foreign keys)
- ✅ Crea restricciones de integridad referencial
- ✅ Crea índices para mejorar performance

---

## 🔧 Troubleshooting

### Error: "column already exists"
**Causa:** Ya ejecutaste el script antes  
**Solución:** El script es idempotente, ignora el error y verifica que tienes los datos

### Error: "relation already exists"
**Causa:** Las tablas ya existen  
**Solución:** Normal, el script usa `IF NOT EXISTS`

### Error: "violates foreign key constraint"
**Causa:** Tienes incidentes con datos antiguos  
**Solución:** Ejecuta esto primero para limpiar:
```sql
DELETE FROM incidentes;
```

---

## 🎯 Ventajas de la Base Normalizada

| Antes | Después |
|-------|---------|
| `estado: "Activo"` | `estado_id: 1` |
| `prioridad: "alta"` | `prioridad_id: 2` |
| `categoria: "Persona Perdida"` | `categoria_id: 1` |
| ❌ Inconsistencias posibles | ✅ Datos garantizados |
| ❌ Sin validación | ✅ Foreign keys validan |
| ❌ Difícil de mantener | ✅ Cambios centralizados |

---

## 📝 Siguiente Paso

Una vez que ejecutes el script y veas el mensaje de éxito:

**👉 Avísame aquí y actualizo el código de la app** 

---

## ⚠️ IMPORTANTE

- Este script **elimina** las columnas `estado`, `prioridad`, `categoria` antiguas
- Solo ejecutar si **NO tienes datos importantes** que preservar
- Si tienes datos que quieres conservar, usa los scripts de migración completos (01, 02, 03)

---

**¿Listo?** Solo ejecuta `SETUP-COMPLETO.sql` en el SQL Editor de Supabase y avísame cuando termine. 🚀
