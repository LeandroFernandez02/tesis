# 🚀 Inicio Rápido - Herramientas de Mapa

## Acceso Rápido

### Desde el Dashboard Principal

1. **Selecciona un incidente** desde el Selector de Incidentes
2. En el menú lateral, haz clic en **"Mapa"**
3. Verás 5 pestañas en la parte superior

## Las 5 Pestañas del Módulo de Mapa

### 1️⃣ MAPA
**¿Qué hace?**
- Muestra todos los incidentes activos en el mapa
- Marcadores con colores según prioridad
- Lista de grupos desplegados
- Click en marcador para ver detalles

**Cuándo usarlo:**
- Vista general de operaciones
- Ver ubicación de incidentes
- Consultar qué equipos están en campo

---

### 2️⃣ HERRAMIENTAS ⭐ NUEVO
**¿Qué hace?**
- Dibujar polígonos de áreas de rastrillaje
- Trazar rutas de búsqueda
- Marcar puntos de interés
- Medir áreas y distancias
- Exportar como GeoJSON

**Cuándo usarlo:**
- **ANTES** de iniciar la búsqueda
- Para dividir el área en sectores
- Para planificar rutas de los equipos
- Para documentar zonas ya rastrilladas

**Herramientas disponibles (panel superior derecho del mapa):**

```
🔴 Polígono        → Áreas irregulares de rastrillaje
🟠 Rectángulo      → Grillas de búsqueda
🟢 Círculo         → Radio desde punto conocido
🔵 Línea           → Rutas y senderos
📍 Marcador        → Puntos importantes
✏️  Editar         → Modificar polígonos
🗑️  Eliminar       → Borrar formas
```

---

### 3️⃣ GUÍA ⭐ NUEVO
**¿Qué hace?**
- Tutorial completo de cada herramienta
- Ejemplos de casos de uso SAR
- Flujo de trabajo recomendado
- Buenas prácticas
- Consejos operacionales

**Cuándo usarlo:**
- Primera vez usando las herramientas
- Dudas sobre cómo usar una herramienta
- Consultar mejores prácticas
- Ver ejemplos reales

---

### 4️⃣ GPS
**¿Qué hace?**
- Activar tracking GPS de equipos
- Subir archivos GPX
- Descargar mapas offline
- Ver estadísticas de recorrido

**Cuándo usarlo:**
- Durante la operación de búsqueda
- Para seguimiento en tiempo real
- Para importar tracks de GPS
- Cuando no hay Internet (modo offline)

---

### 5️⃣ ZONAS
**¿Qué hace?**
- Gestionar sectores de búsqueda
- Asignar equipos a zonas (drag & drop)
- Ver estado de cada zona
- Calcular tiempos estimados

**Cuándo usarlo:**
- DESPUÉS de dibujar los polígonos
- Para asignar equipos a sectores
- Para seguir progreso de rastrillaje
- Para ver qué zonas están completadas

---

## Tutorial: Tu Primera Área de Rastrillaje

### ⏱️ 5 minutos

#### Paso 1: Ir a Herramientas
```
Dashboard → Seleccionar Incidente → Mapa → Pestaña "Herramientas"
```

#### Paso 2: Elegir Capa de Mapa
En la parte superior, haz clic en:
- **"Topográfico"** si estás en montañas (Sierras de Córdoba)
- **"Satélite"** si quieres ver el terreno real
- **"ArgenMap"** para mapa con rutas y ciudades

#### Paso 3: Dibujar tu Primer Polígono
1. En el panel superior derecho del mapa, haz clic en el **icono del polígono** 🔴
2. Haz clic en el mapa para agregar puntos (esquinas del área)
3. Para cerrar el polígono:
   - Opción A: Doble clic
   - Opción B: Click en el primer punto

**✅ Listo!** Verás:
- El polígono dibujado en rojo
- Un tooltip con el **área en hectáreas**
- La forma aparece en el panel lateral

#### Paso 4: Agregar Más Información
1. Haz clic en el **icono del marcador** 📍
2. Marca el último punto conocido de la persona
3. Haz clic en el **icono de línea** 🔵
4. Traza la ruta de acceso al sector

#### Paso 5: Exportar
En el panel lateral izquierdo:
1. Haz clic en **"Exportar GeoJSON"**
2. Se descargará un archivo `.geojson`
3. Compártelo con los equipos o cárgalo en GPS

---

## Ejemplo Práctico: Persona Desaparecida

### Escenario
**Persona:** Senderista perdido  
**Ubicación:** Sierras de Córdoba  
**Último punto conocido:** Coordenadas -31.3683, -64.1437  
**Tiempo desaparecido:** 6 horas  
**Equipos disponibles:** 4 grupos de rastrillaje

### Solución con Herramientas de Mapa

#### 1. Preparación (Pestaña HERRAMIENTAS)
```
✓ Cambiar a capa "Topográfico"
✓ Acercar zoom a la zona
✓ Marcar LKP (Last Known Position) con 📍
```

#### 2. División en Sectores
```
✓ Dibujar círculo de 5km desde LKP 🟢
✓ Dividir círculo en 4 polígonos 🔴:
  - Sector Norte (montaña, difícil)
  - Sector Sur (bosque, medio)
  - Sector Este (campo abierto, fácil)
  - Sector Oeste (río, difícil)
```

**Resultado automático:**
- Sector Norte: 19.6 ha
- Sector Sur: 19.6 ha
- Sector Este: 19.6 ha
- Sector Oeste: 19.6 ha
- **Total: ~78 hectáreas**

#### 3. Rutas de Acceso
```
✓ Trazar con líneas 🔵:
  - Camino principal de acceso
  - Senderos existentes
  - Rutas de evacuación
```

#### 4. Puntos de Interés
```
✓ Marcar con 📍:
  - Campamento base
  - Fuentes de agua
  - Refugios cercanos
  - Miradores
```

#### 5. Exportar y Distribuir
```
✓ Exportar GeoJSON
✓ Cargar en GPS de cada equipo
✓ Tomar screenshot del mapa
✓ Imprimir backup en papel
```

#### 6. Asignación (Pestaña ZONAS)
```
✓ Arrastrar "Grupo Canes" → Sector Norte
✓ Arrastrar "Grupo Dron" → Sector Este
✓ Arrastrar "Grupo Caminante 1" → Sector Sur
✓ Arrastrar "Grupo Caminante 2" → Sector Oeste
```

#### 7. Seguimiento (Pestaña GPS)
```
✓ Activar tracking de equipos
✓ Monitorear progreso en tiempo real
✓ Ver tracks de recorrido
```

---

## Atajos y Tips

### ⌨️ Atajos de Teclado
- **Esc** - Cancelar dibujo actual
- **Delete** - Borrar forma seleccionada
- **Ctrl+Z** - Deshacer (en modo edición)

### 💡 Tips Pro

#### Para Sectores Perfectos
```
1. Usa "Satélite" para ver terreno real
2. Evita dividir un obstáculo (río, acantilado)
3. Sectores de 15-25 hectáreas son ideales
4. Considera tiempo: 2-4 horas por sector
```

#### Para Rutas Eficientes
```
1. Marca senderos existentes con líneas azules
2. Une puntos de interés con rutas lógicas
3. Planea rutas de evacuación desde cada sector
4. Marca fuentes de agua en la ruta
```

#### Para Mediciones Exactas
```
1. Las áreas son en HECTÁREAS (no metros)
2. 1 hectárea = 100m x 100m = 10,000 m²
3. Las distancias son en KILÓMETROS
4. Los cálculos consideran curvatura terrestre
```

### ⚠️ Errores Comunes a Evitar

❌ **Sectores muy grandes**
- Problema: Equipos tardan más de 4 horas
- Solución: Dividir en sectores más pequeños

❌ **No exportar backup**
- Problema: Si se cierra el navegador, se pierde todo
- Solución: Exportar cada vez que termines un área

❌ **Usar solo digital**
- Problema: Si falla GPS o Internet
- Solución: SIEMPRE llevar mapa impreso de backup

❌ **Polígonos que se solapan**
- Problema: Se rastrilla dos veces la misma área
- Solución: Revisar que no haya solapamiento

❌ **No considerar el terreno**
- Problema: Sector muy difícil para el equipo asignado
- Solución: Usar capa Topográfico para ver desniveles

---

## Checklist Pre-Operación

### Antes de Salir al Campo

- [ ] Cambié a capa apropiada (Topográfico o Satélite)
- [ ] Marqué el último punto conocido
- [ ] Dividí el área en sectores manejables (10-30 ha)
- [ ] Tracé rutas de acceso principales
- [ ] Marqué puntos críticos (agua, refugios)
- [ ] Exporté el GeoJSON
- [ ] Cargué waypoints en GPS
- [ ] Tomé screenshot del mapa
- [ ] Imprimí mapa de backup
- [ ] Asigné equipos a sectores
- [ ] Verifiqué que todos tengan el mapa

---

## FAQ - Preguntas Frecuentes

### ¿Puedo usar esto sin Internet?
**No en el navegador.** Los mapas del IGN requieren Internet.  
**Solución:** Usa la pestaña GPS para descargar tiles offline antes de salir.

### ¿Los polígonos se guardan automáticamente?
**Sí y No.**  
- En la sesión actual: Sí
- Si cierras el navegador: No  
**Solución:** Exporta regularmente como GeoJSON.

### ¿Puedo editar un polígono después de dibujarlo?
**Sí.** Usa el botón de "Editar" en el panel del mapa.  
Podrás mover vértices arrastrándolos.

### ¿Cómo elimino una forma?
**Opción 1:** Botón "Eliminar" en el panel del mapa  
**Opción 2:** Selecciona la forma y presiona Delete  
**Opción 3:** Botón "Limpiar Todo" en panel lateral (¡cuidado!)

### ¿Las mediciones son exactas?
**Muy exactas.** Usan cálculos geodésicos que consideran:
- Curvatura de la Tierra
- Proyección cartográfica correcta
- Precisión: ±0.1%

**Pero...** en campo, verifica con GPS porque:
- El terreno real puede variar
- GPS tiene margen de error
- La escala del mapa es referencial

### ¿Puedo importar polígonos que dibujé en Google Earth?
**Próximamente.** Estamos trabajando en importación de KML/GPX.  
**Por ahora:** Dibújalos manualmente en el sistema.

### ¿Los equipos pueden ver los polígonos en sus celulares?
**No directamente.**  
**Solución actual:**
1. Exporta el GeoJSON
2. Carga en app GPS del celular
3. O envía screenshot por WhatsApp

**Futuro:** Modo colaborativo en tiempo real.

---

## Soporte

### Si algo no funciona:

1. **Recargar página** (Ctrl+R)
2. **Limpiar caché** del navegador
3. **Verificar Internet** (los mapas necesitan conexión)
4. **Cambiar capa** de mapa (a veces una capa falla)
5. **Probar otro navegador** (Chrome recomendado)

### Si necesitas ayuda:
- 📚 Lee la **Guía** (pestaña 3)
- 📖 Consulta el archivo `/guidelines/Herramientas-Dibujo-IGN.md`
- 🆘 Contacta soporte interno

---

## Resumen de 30 Segundos

```
1. Pestaña HERRAMIENTAS
2. Cambiar a capa Topográfico
3. Dibujar polígonos = sectores de rastrillaje
4. Medir áreas automáticamente
5. Exportar GeoJSON
6. Cargar en GPS
7. ¡Listo para rastrillar!
```

---

**¡Estás listo para usar las Herramientas de Mapa del Sistema DUAR!** 🎯
