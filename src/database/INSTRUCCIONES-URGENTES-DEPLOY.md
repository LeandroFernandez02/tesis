# 🚨 SOLUCIÓN URGENTE: Failed to Fetch

## ❌ PROBLEMA
El Edge Function no está desplegado en Supabase, por eso obtienes "Failed to fetch".

---

## ✅ SOLUCIÓN MÁS RÁPIDA (Dashboard - 2 minutos)

### 1. Abre Supabase Dashboard

Ve a: https://supabase.com/dashboard/project/ibkxwfhoqsbuakdbbscl/functions

### 2. Click en "Deploy a new function"

### 3. Copia el código

**Abre el archivo:** `/supabase/functions/server/index.tsx`

**Copia TODO el contenido** (850 líneas aprox)

### 4. Pega en el Dashboard

- **Function name:** `make-server-69ee164a`
- **Code editor:** Pega el código que copiaste
- Click **"Deploy"**

### 5. Espera 1-2 minutos

El deploy tardará un poco.

### 6. VERIFICA que funcionó

Abre en tu navegador:
```
https://ibkxwfhoqsbuakdbbscl.supabase.co/functions/v1/make-server-69ee164a/health
```

**Deberías ver:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-16...",
  "database": "PostgreSQL (Supabase)",
  "version": "2.0-SQL"
}
```

### 7. Recarga tu aplicación

Refresca tu navegador (F5) y la aplicación debería funcionar.

---

## 🎯 ALTERNATIVA: CLI (Solo si sabes usar terminal)

### Paso 1: Renombrar carpeta

Renombra:
```
/supabase/functions/server/  →  /supabase/functions/make-server-69ee164a/
```

Mueve `index.tsx` dentro de esa carpeta.

### Paso 2: Instalar CLI

```bash
npm install -g supabase
```

### Paso 3: Login y Deploy

```bash
supabase login
supabase link --project-ref ibkxwfhoqsbuakdbbscl
supabase functions deploy make-server-69ee164a
```

---

## ✅ DESPUÉS DEL DEPLOY

1. **Recarga navegador** (F5)
2. **Abre consola** (F12)
3. Deberías ver:
   ```
   Fetching incidents from: https://...
   Response status: 200
   Incidents data: { incidents: [] }
   ```
4. **Las listas desplegables funcionarán**
5. **Podrás crear incidentes**

---

## 📋 CHECKLIST

- [ ] Abrir Dashboard de Supabase
- [ ] Deploy función `make-server-69ee164a`
- [ ] Verificar Health Check (debe devolver 200)
- [ ] Recargar aplicación
- [ ] Verificar que no hay errores "Failed to fetch"
- [ ] Probar crear incidente

---

## ❓ SI EL DEPLOY FALLA

### Error: "Module not found"
**Solución:** Asegúrate de copiar TODO el archivo, incluyendo todos los imports

### Error: "Invalid function name"
**Solución:** El nombre DEBE ser exactamente `make-server-69ee164a`

### Error: "Syntax error"
**Solución:** Verifica que copiaste el código completo sin cortar

---

## 🎯 USA EL DASHBOARD

**La opción del Dashboard es la más fácil y rápida.**

Solo copia y pega el código, dale deploy, y listo.

---

**¿Hiciste el deploy? Avísame cuando termine!** 🚀
