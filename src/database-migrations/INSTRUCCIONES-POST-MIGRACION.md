# 📋 Instrucciones Post-Migración

## ✅ COMPLETADO

1. ✅ Script SQL ejecutado (`SETUP-COMPLETO.sql`)
2. ✅ Base de datos normalizada con tablas de catálogo
3. ✅ Tipos TypeScript actualizados (`/types/incident.ts`)

---

## 🔄 SIGUIENTE PASO: Actualizar Servidor

### Opción A: Reemplazar archivo completo del servidor

1. **Renombrar** el archivo actual:
   - Ve a: `/supabase/functions/server/index.tsx`
   - Renombralo a: `/supabase/functions/server/index-OLD-BACKUP.tsx`

2. **Renombrar** el archivo nuevo:
   - Ve a: `/supabase/functions/server/index-normalized.tsx`
   - Renombralo a: `/supabase/functions/server/index.tsx`

3. **Verificar** que funciona:
   - Ve a la app y recarga
   - Prueba crear un incidente

### Opción B: Copiar y pegar (MÁS SEGURO)

1. **Abrir** `/supabase/functions/server/index-normalized.tsx`
2. **Copiar** todo el contenido
3. **Abrir** `/supabase/functions/server/index.tsx`
4. **Reemplazar** TODO el contenido con el copiado
5. **Guardar**

---

## 📝 CAMBIOS PRINCIPALES EN EL SERVIDOR

### Nuevas rutas de catálogos:
```typescript
GET /make-server-69ee164a/catalogos/estados
GET /make-server-69ee164a/catalogos/prioridades
GET /make-server-69ee164a/catalogos/categorias
GET /make-server-69ee164a/catalogos/especialidades
```

### Rutas actualizadas con JOINs:
```typescript
GET  /make-server-69ee164a/incidents        // Ahora usa JOINs
GET  /make-server-69ee164a/incidents/stats  // Usa relaciones
POST /make-server-69ee164a/incidents        // Convierte códigos a IDs
PUT  /make-server-69ee164a/incidents/:id    // Convierte códigos a IDs
```

### Helpers de normalización:
```typescript
async function getEstadoIdByCodigo(codigo: string)
async function getPrioridadIdByCodigo(codigo: string)
async function getCategoriaIdByCodigo(codigo: string)
```

---

## 🧪 TESTING

Después de actualizar el servidor, prueba:

1. ✅ **Crear incidente**
   - Abre la app
   - Clic en "Nuevo Incidente"
   - Completa el formulario
   - Verifica que se crea correctamente

2. ✅ **Listar incidentes**
   - Los incidentes deben mostrarse
   - Los estados deben tener colores

3. ✅ **Filtrar incidentes**
   - Filtra por estado: Activo/Inactivo/Finalizado
   - Filtra por prioridad: Crítica/Alta/Media/Baja

4. ✅ **Editar incidente**
   - Abre un incidente
   - Cambia el estado
   - Verifica que se actualiza

---

## ⚠️ SI ALGO FALLA

### Error: "Failed to fetch"
**Causa:** El servidor no está corriendo  
**Solución:**  
```bash
# El servidor debería auto-deployarse
# Espera 30 segundos y recarga la página
```

### Error: "estado_id violates foreign key constraint"
**Causa:** Código de estado no existe en catálogo  
**Solución:**  
```sql
-- Verifica que los catálogos tienen datos
SELECT * FROM estados_incidente;
SELECT * FROM prioridades_incidente;
SELECT * FROM categorias_incidente;
```

### Error en console: "Cannot read property 'codigo'"
**Causa:** JOINs no funcionando  
**Solución:**  
```typescript
// Verifica la query en el servidor
// Debe tener !inner en los JOINs:
estados_incidente!inner(id, codigo, nombre, color)
```

---

## 📊 VERIFICACIÓN DE ÉXITO

Ejecuta esto en SQL Editor de Supabase:

```sql
-- Verificar que todo está conectado
SELECT 
  i.id,
  i.titulo,
  e.nombre as estado,
  p.nombre as prioridad,
  c.nombre as categoria
FROM incidentes i
LEFT JOIN estados_incidente e ON i.estado_id = e.id
LEFT JOIN prioridades_incidente p ON i.prioridad_id = p.id
LEFT JOIN categorias_incidente c ON i.categoria_id = c.id
LIMIT 5;
```

Si ves datos con los nombres correctos, ¡la normalización funciona! ✅

---

## 🎯 PRÓXIMOS PASOS OPCIONALES

Una vez que confirmes que todo funciona:

1. 🔧 **Actualizar formularios** para cargar catálogos dinámicamente
2. 🎨 **Agregar badges** con colores de prioridades
3. 📈 **Mejorar dashboards** con datos normalizados
4. 🗑️ **Limpiar archivos** de backup

---

## 📞 ¿NECESITAS AYUDA?

Avísame si encuentras algún error y te ayudo a resolverlo.
Proporciona:
- ❌ Mensaje de error exacto
- 📍 En qué paso ocurrió
- 🖥️ Captura de console del navegador (F12 > Console)

**¡Estás a un paso de tener la BD normalizada funcionando!** 🚀
