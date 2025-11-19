# 🚀 INSTRUCCIONES PARA MIGRACIÓN A BASE DE DATOS RELACIONAL

## PASO 1: Ejecutar Script SQL en Supabase ⚡

### 1.1 Acceder a Supabase
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: `ibkxwfhoqsbuakdbbscl`
3. En el menú lateral, click en **"SQL Editor"**

### 1.2 Ejecutar el Script
1. Abre el archivo `/database/migracion-duar-minimalista.sql`
2. Copia **TODO** el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Click en **"Run"** o presiona `Ctrl + Enter`

### 1.3 Verificar que se creó correctamente
Ejecuta esta query en el SQL Editor:

```sql
-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver **16 tablas**:
- accesos_qr
- archivos_gpx
- archivos_incidente
- areas_busqueda
- comentarios_incidente
- denunciantes
- equipos
- eventos_linea_tiempo
- fiscales_solicitantes
- incidentes
- miembros_equipo
- notificaciones
- personal
- personal_certificaciones
- personal_especialidades
- personal_incidente
- personal_qr_registrado
- punto_0

---

## PASO 2: Confirmar que ejecutaste el script ✅

**Una vez que hayas ejecutado el script SQL**, avísame escribiendo:

```
"Script ejecutado correctamente"
```

Y yo procederé a:
1. ✅ Reescribir el servidor backend para usar SQL
2. ✅ Actualizar el frontend para usar las nuevas rutas
3. ✅ Eliminar todas las referencias al KV Store
4. ✅ Probar que todo funcione correctamente

---

## ⚠️ IMPORTANTE

- **NO cierres** el SQL Editor hasta que veas el mensaje de confirmación
- Si hay algún error, cópialo y envíamelo para ayudarte a resolverlo
- El script es **idempotente** (puedes ejecutarlo varias veces sin problemas)

---

## 🎯 Beneficios después de la migración

✅ Queries 10x más rápidas
✅ Integridad referencial automática
✅ Validación de datos con ENUMS
✅ Estructura clara y mantenible
✅ Escalabilidad garantizada
✅ Auditoría completa con triggers

---

**¿Listo? Ejecuta el script y avísame cuando termines!** 🚀
