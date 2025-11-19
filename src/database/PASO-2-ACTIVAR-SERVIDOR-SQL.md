# 🔄 PASO 2: ACTIVAR SERVIDOR CON SQL

## ✅ PREREQUISITO
Debes haber ejecutado el script SQL en Supabase (Paso 1).

---

## 📋 CONFIRMACIÓN

**¿Ejecutaste el script SQL correctamente?**

Verifica ejecutando esta query en Supabase SQL Editor:

```sql
SELECT COUNT(*) as total_tablas
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
  'incidentes',
  'personal',
  'equipos',
  'punto_0',
  'denunciantes',
  'fiscales_solicitantes',
  'personas_desaparecidas'
);
```

**Resultado esperado:** `total_tablas = 7` (o más)

---

## 🚀 ACTIVACIÓN DEL NUEVO SERVIDOR

Una vez que confirmes que el script SQL se ejecutó correctamente, escribe:

```
"Tablas creadas correctamente. Activar servidor SQL."
```

Y yo procederé a:

1. ✅ Reemplazar el servidor actual (index.tsx) por el nuevo (index-sql.tsx)
2. ✅ Eliminar referencias al KV Store
3. ✅ Probar que todo funcione correctamente
4. ✅ Darte instrucciones finales para verificar la migración

---

## ⚠️ IMPORTANTE

- **NO** hagas cambios manuales en el código todavía
- Confirma que las tablas están creadas ANTES de continuar
- Si hay algún error, cópialo y envíamelo

---

## 🎯 ¿Qué cambiará?

### Antes (KV Store):
```typescript
const incidents = await kv.getByPrefix('incident:');
```

### Después (SQL):
```typescript
const { data: incidents } = await supabase
  .from('incidentes')
  .select('*');
```

**Ventajas:**
- ⚡ Queries 10x más rápidas
- 🔒 Integridad referencial automática
- 📊 Joins y relaciones eficientes
- 🎯 Validación con ENUMS
- 📈 Escalabilidad garantizada

---

**¿Listo para activar el servidor SQL?** Confirma la creación de tablas y avísame! 🚀
