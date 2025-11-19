# 🔧 SOLUCIÓN: "Failed to Fetch" Error

## 🔍 PROBLEMA

```
Error fetching incidents: TypeError: Failed to fetch
Error loading initial data: TypeError: Failed to fetch
Error fetching stats: TypeError: Failed to fetch
```

Este error indica que **el Edge Function no está desplegado** en Supabase.

---

## ✅ SOLUCIÓN: Desplegar Edge Function

### PASO 1: Instalar Supabase CLI

Si no lo tienes instalado, abre tu terminal y ejecuta:

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**NPM (alternativa):**
```bash
npm install -g supabase
```

### PASO 2: Login a Supabase

```bash
supabase login
```

Esto abrirá tu navegador para autenticarte.

### PASO 3: Enlazar tu Proyecto

```bash
supabase link --project-ref ibkxwfhoqsbuakdbbscl
```

Cuando te pida el password, usa tu password de Supabase.

### PASO 4: Desplegar el Edge Function

Desde la raíz de tu proyecto (donde está `/supabase/functions/`):

```bash
supabase functions deploy make-server-69ee164a
```

### PASO 5: Verificar el Deployment

Ejecuta:
```bash
supabase functions list
```

Deberías ver:
```
Name                    Version  Status
make-server-69ee164a    1        ACTIVE
```

---

## 🎯 ALTERNATIVA: Desplegar desde Dashboard

Si no quieres usar CLI, puedes hacerlo desde el Dashboard:

### 1. Ve a Supabase Dashboard
```
https://supabase.com/dashboard/project/ibkxwfhoqsbuakdbbscl/functions
```

### 2. Click en "Deploy New Function"

### 3. Configuración:
- **Name:** `make-server-69ee164a`
- **Code:** Copia TODO el contenido de `/supabase/functions/server/index.tsx`
- Click **"Deploy"**

### 4. Espera que se despliegue (1-2 minutos)

---

## ✅ VERIFICAR QUE FUNCIONA

### Test 1: Health Check Manual

Abre en tu navegador:
```
https://ibkxwfhoqsbuakdbbscl.supabase.co/functions/v1/make-server-69ee164a/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-16T...",
  "database": "PostgreSQL (Supabase)",
  "version": "2.0-SQL"
}
```

### Test 2: Desde tu Aplicación

Recarga tu aplicación. Deberías ver en la consola:
```
Fetching incidents from: https://ibkxwfhoqsbuakdbbscl.supabase.co/functions/v1/make-server-69ee164a/incidents
Response status: 200
Incidents data: { incidents: [] }
```

---

## 📋 CHECKLIST

- [ ] Supabase CLI instalado
- [ ] Login a Supabase
- [ ] Proyecto enlazado
- [ ] Edge Function desplegado
- [ ] Health check funcionando (200)
- [ ] Aplicación cargando correctamente

---

## ❓ TROUBLESHOOTING

### Error: "supabase: command not found"
**Solución:** Instala Supabase CLI (ver Paso 1)

### Error: "Project not found"
**Solución:** Verifica que el project-ref sea `ibkxwfhoqsbuakdbbscl`

### Error: "Authentication required"
**Solución:** Ejecuta `supabase login` de nuevo

### Error: "Function already exists"
**Solución:** Usa `supabase functions deploy make-server-69ee164a --no-verify-jwt` para reemplazar

### Error: CORS en el navegador
**Solución:** El servidor ya tiene CORS configurado, debería funcionar después del deploy

---

## 🚀 COMANDOS COMPLETOS (COPIA Y PEGA)

```bash
# 1. Login
supabase login

# 2. Enlazar proyecto
supabase link --project-ref ibkxwfhoqsbuakdbbscl

# 3. Desplegar función
supabase functions deploy make-server-69ee164a

# 4. Verificar
curl https://ibkxwfhoqsbuakdbbscl.supabase.co/functions/v1/make-server-69ee164a/health
```

---

## 📝 NOTA IMPORTANTE

El archivo `/supabase/functions/server/index.tsx` contiene TODO el código del servidor.

**NO** necesitas crear un archivo separado para `make-server-69ee164a`. 

El CLI de Supabase buscará automáticamente en:
- `/supabase/functions/make-server-69ee164a/index.ts` (no existe)
- `/supabase/functions/server/index.tsx` ✅ (este existe)

Por eso necesitas cambiar la estructura o usar el dashboard.

---

## ⚡ SOLUCIÓN RÁPIDA (Sin CLI)

### Opción 1: Crear estructura correcta

Renombra la carpeta:
```
/supabase/functions/server/ 
→ 
/supabase/functions/make-server-69ee164a/
```

Y luego despliega:
```bash
supabase functions deploy make-server-69ee164a
```

### Opción 2: Desde Dashboard (MÁS FÁCIL)

1. Ve a: https://supabase.com/dashboard/project/ibkxwfhoqsbuakdbbscl/functions
2. Click **"Create Function"**
3. Name: `make-server-69ee164a`
4. Copia TODO el código de `/supabase/functions/server/index.tsx`
5. Click **"Deploy"**

---

## ✅ DESPUÉS DEL DEPLOYMENT

1. Recarga tu aplicación
2. Abre consola del navegador (F12)
3. Deberías ver:
   ```
   Fetching incidents from: https://...
   Response status: 200
   ```

4. Las listas desplegables funcionarán
5. Podrás crear incidentes

---

**¿Qué método prefieres?**
1. CLI (más técnico)
2. Dashboard (más visual)

Avísame si tienes algún problema! 🚀
