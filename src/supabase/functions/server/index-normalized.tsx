import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Configurar CORS y logging
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["*"],
    allowMethods: ["*"],
  }),
);
app.use("*", logger(console.log));

// Crear cliente de Supabase con Service Role Key
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ============================================================================
// MAPEO DE CÓDIGOS A IDs (helpers para normalización)
// ============================================================================

async function getEstadoIdByCodigo(codigo: string): Promise<number> {
  const { data } = await supabase
    .from("estados_incidente")
    .select("id")
    .eq("codigo", codigo.toLowerCase())
    .single();
  return data?.id || 1; // Default: activo
}

async function getPrioridadIdByCodigo(codigo: string): Promise<number> {
  const { data } = await supabase
    .from("prioridades_incidente")
    .select("id")
    .eq("codigo", codigo.toLowerCase())
    .single();
  return data?.id || 3; // Default: media
}

async function getCategoriaIdByCodigo(codigo: string): Promise<number> {
  const { data } = await supabase
    .from("categorias_incidente")
    .select("id")
    .eq("codigo", codigo.toLowerCase().replace(/ /g, "_"))
    .single();
  return data?.id || 1; // Default: persona_perdida
}

// ============================================================================
// RUTAS DE CATÁLOGOS (Nuevas - para formularios dinámicos)
// ============================================================================

app.get("/make-server-69ee164a/catalogos/estados", async (c) => {
  try {
    const { data, error } = await supabase
      .from("estados_incidente")
      .select("*")
      .eq("activo", true)
      .order("orden");

    if (error) throw error;

    return c.json({ estados: data || [] });
  } catch (error) {
    console.log("Error getting estados:", error);
    return c.json({ error: "Error al obtener estados" }, 500);
  }
});

app.get("/make-server-69ee164a/catalogos/prioridades", async (c) => {
  try {
    const { data, error } = await supabase
      .from("prioridades_incidente")
      .select("*")
      .eq("activo", true)
      .order("nivel");

    if (error) throw error;

    return c.json({ prioridades: data || [] });
  } catch (error) {
    console.log("Error getting prioridades:", error);
    return c.json({ error: "Error al obtener prioridades" }, 500);
  }
});

app.get("/make-server-69ee164a/catalogos/categorias", async (c) => {
  try {
    const { data, error } = await supabase
      .from("categorias_incidente")
      .select("*")
      .eq("activo", true)
      .order("nombre");

    if (error) throw error;

    return c.json({ categorias: data || [] });
  } catch (error) {
    console.log("Error getting categorias:", error);
    return c.json({ error: "Error al obtener categorías" }, 500);
  }
});

app.get("/make-server-69ee164a/catalogos/especialidades", async (c) => {
  try {
    const { data, error } = await supabase
      .from("especialidades")
      .select("*")
      .eq("activo", true)
      .order("nombre");

    if (error) throw error;

    return c.json({ especialidades: data || [] });
  } catch (error) {
    console.log("Error getting especialidades:", error);
    return c.json({ error: "Error al obtener especialidades" }, 500);
  }
});

// ============================================================================
// RUTAS DE INCIDENTES CON JOINs
// ============================================================================

// Obtener estadísticas de incidentes (usando JOINs)
app.get("/make-server-69ee164a/incidents/stats", async (c) => {
  try {
    const { data, error } = await supabase
      .from("incidentes")
      .select(`
        estado_id,
        estados_incidente!inner(codigo)
      `);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      activos: data?.filter((i: any) => i.estados_incidente.codigo === "activo").length || 0,
      inactivos: data?.filter((i: any) => i.estados_incidente.codigo === "inactivo").length || 0,
      finalizados: data?.filter((i: any) => i.estados_incidente.codigo === "finalizado").length || 0,
    };

    return c.json({ stats });
  } catch (error) {
    console.log("Error getting stats:", error);
    return c.json({ error: "Error al obtener estadísticas" }, 500);
  }
});

// Obtener todos los incidentes con filtros y JOINs
app.get("/make-server-69ee164a/incidents", async (c) => {
  try {
    const searchTerm = c.req.query("search") || "";
    const statusFilter = c.req.query("status") || "todos";
    const priorityFilter = c.req.query("priority") || "todos";
    const categoryFilter = c.req.query("category") || "todos";

    // Query con JOINs a las tablas normalizadas
    let query = supabase
      .from("incidentes")
      .select(`
        *,
        estados_incidente!inner(id, codigo, nombre, color),
        prioridades_incidente!inner(id, codigo, nombre, nivel, color),
        categorias_incidente!inner(id, codigo, nombre, icono, color),
        punto_0(*),
        denunciantes(*),
        fiscales_solicitantes(*),
        personas_desaparecidas(*)
      `)
      .order("fecha_creacion", { ascending: false });

    // Aplicar filtros por código
    if (statusFilter !== "todos") {
      const estadoId = await getEstadoIdByCodigo(statusFilter);
      query = query.eq("estado_id", estadoId);
    }

    if (priorityFilter !== "todos") {
      const prioridadId = await getPrioridadIdByCodigo(priorityFilter);
      query = query.eq("prioridad_id", prioridadId);
    }

    if (categoryFilter !== "todos") {
      const categoriaId = await getCategoriaIdByCodigo(categoryFilter);
      query = query.eq("categoria_id", categoriaId);
    }

    const { data: incidents, error } = await query;

    if (error) throw error;

    // Filtro de búsqueda por texto
    let filteredIncidents = incidents || [];
    if (searchTerm) {
      filteredIncidents = filteredIncidents.filter(
        (incident: any) =>
          incident.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Transformar datos para mantener compatibilidad con frontend
    const transformedIncidents = filteredIncidents.map((incident: any) => ({
      id: incident.id,
      titulo: incident.titulo,
      descripcion: incident.descripcion,
      // Retornar códigos para compatibilidad con tipos
      estado: incident.estados_incidente.codigo,
      prioridad: incident.prioridades_incidente.codigo,
      categoria: incident.categorias_incidente.codigo,
      // También incluir datos completos
      estadoData: incident.estados_incidente,
      prioridadData: incident.prioridades_incidente,
      categoriaData: incident.categorias_incidente,
      jefeDotacion: incident.jefe_dotacion,
      punto0: incident.punto_0
        ? {
            lat: parseFloat(incident.punto_0.lat),
            lng: parseFloat(incident.punto_0.lng),
            direccion: incident.punto_0.direccion,
            zona: incident.punto_0.zona,
            fechaHora: incident.punto_0.fecha_hora,
          }
        : undefined,
      denunciante: incident.denunciantes || undefined,
      fiscalSolicitante: incident.fiscales_solicitantes || undefined,
      personaDesaparecida: incident.personas_desaparecidas
        ? {
            ...incident.personas_desaparecidas,
            ultimaVezVisto: {
              fecha: incident.personas_desaparecidas.ultima_vez_visto_fecha,
              ubicacion: incident.personas_desaparecidas.ultima_vez_visto_ubicacion,
              coordenadas: incident.personas_desaparecidas.ultima_vez_visto_lat
                ? {
                    lat: parseFloat(incident.personas_desaparecidas.ultima_vez_visto_lat),
                    lng: parseFloat(incident.personas_desaparecidas.ultima_vez_visto_lng),
                  }
                : undefined,
            },
            descripcionFisica: incident.personas_desaparecidas.descripcion_fisica,
            condicionesMedicas: incident.personas_desaparecidas.condiciones_medicas,
            contactoFamiliar: {
              nombre: incident.personas_desaparecidas.contacto_nombre,
              telefono: incident.personas_desaparecidas.contacto_telefono,
              relacion: incident.personas_desaparecidas.contacto_relacion,
            },
          }
        : undefined,
      tiempoInicio: incident.tiempo_inicio,
      tiempoTranscurrido: incident.tiempo_transcurrido,
      pausado: incident.pausado,
      fechaCreacion: incident.fecha_creacion,
      fechaActualizacion: incident.fecha_actualizacion,
      fechaResolucion: incident.fecha_resolucion,
      comentarios: [],
      personalAsignado: [],
      equiposAsignados: [],
    }));

    return c.json({ incidents: transformedIncidents });
  } catch (error) {
    console.log("Error getting incidents:", error);
    return c.json({ error: "Error al obtener incidentes" }, 500);
  }
});

// Crear nuevo incidente (con normalización)
app.post("/make-server-69ee164a/incidents", async (c) => {
  try {
    const data = await c.req.json();

    if (!data.titulo || !data.descripcion || !data.estado || !data.prioridad || !data.categoria) {
      return c.json({ error: "Datos de incidente inválidos" }, 400);
    }

    // Convertir códigos a IDs
    const estadoId = await getEstadoIdByCodigo(data.estado);
    const prioridadId = await getPrioridadIdByCodigo(data.prioridad);
    const categoriaId = await getCategoriaIdByCodigo(data.categoria);

    // Insertar incidente
    const { data: incident, error: incidentError } = await supabase
      .from("incidentes")
      .insert({
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado_id: estadoId,
        prioridad_id: prioridadId,
        categoria_id: categoriaId,
        jefe_dotacion: data.jefeDotacion || null,
        tiempo_inicio: data.tiempoInicio || null,
        tiempo_transcurrido: data.tiempoTranscurrido || 0,
        pausado: data.pausado || false,
      })
      .select()
      .single();

    if (incidentError) throw incidentError;

    // Insertar punto 0 si existe
    if (data.punto0) {
      await supabase.from("punto_0").insert({
        incidente_id: incident.id,
        lat: data.punto0.lat,
        lng: data.punto0.lng,
        direccion: data.punto0.direccion || "",
        zona: data.punto0.zona || null,
        fecha_hora: data.punto0.fechaHora || new Date().toISOString(),
        bloqueado: true,
      });
    }

    // Insertar denunciante si existe
    if (data.denunciante && data.denunciante.nombre) {
      await supabase.from("denunciantes").insert({
        incidente_id: incident.id,
        nombre: data.denunciante.nombre,
        apellido: data.denunciante.apellido || "",
        dni: data.denunciante.dni || null,
        telefono: data.denunciante.telefono || null,
        email: data.denunciante.email || null,
        direccion: data.denunciante.direccion || null,
        relacion: data.denunciante.relacion || null,
      });
    }

    // Insertar fiscal si existe
    if (data.fiscalSolicitante && data.fiscalSolicitante.nombre) {
      await supabase.from("fiscales_solicitantes").insert({
        incidente_id: incident.id,
        nombre: data.fiscalSolicitante.nombre,
        apellido: data.fiscalSolicitante.apellido || "",
        fiscalia: data.fiscalSolicitante.fiscalia || "",
        expediente: data.fiscalSolicitante.expediente || "",
        telefono: data.fiscalSolicitante.telefono || null,
        email: data.fiscalSolicitante.email || null,
      });
    }

    // Insertar persona desaparecida si existe
    if (data.personaDesaparecida && data.personaDesaparecida.nombre) {
      await supabase.from("personas_desaparecidas").insert({
        incidente_id: incident.id,
        nombre: data.personaDesaparecida.nombre,
        apellido: data.personaDesaparecida.apellido || "",
        edad: data.personaDesaparecida.edad || null,
        genero: data.personaDesaparecida.genero || null,
        descripcion_fisica: data.personaDesaparecida.descripcionFisica || "",
        ultima_vez_visto_fecha: data.personaDesaparecida.ultimaVezVisto?.fecha || null,
        ultima_vez_visto_ubicacion: data.personaDesaparecida.ultimaVezVisto?.ubicacion || null,
        ultima_vez_visto_lat: data.personaDesaparecida.ultimaVezVisto?.coordenadas?.lat || null,
        ultima_vez_visto_lng: data.personaDesaparecida.ultimaVezVisto?.coordenadas?.lng || null,
        vestimenta: data.personaDesaparecida.vestimenta || null,
        condiciones_medicas: data.personaDesaparecida.condicionesMedicas || null,
        medicamentos: data.personaDesaparecida.medicamentos || null,
        foto: data.personaDesaparecida.foto || null,
        contacto_nombre: data.personaDesaparecida.contactoFamiliar?.nombre || null,
        contacto_telefono: data.personaDesaparecida.contactoFamiliar?.telefono || null,
        contacto_relacion: data.personaDesaparecida.contactoFamiliar?.relacion || null,
      });
    }

    // Crear evento en timeline
    await supabase.from("eventos_linea_tiempo").insert({
      incidente_id: incident.id,
      tipo: "creado",
      descripcion: `Incidente creado: ${incident.titulo}`,
      timestamp: new Date().toISOString(),
    });

    return c.json(
      {
        incident: {
          ...incident,
          estado: data.estado,
          prioridad: data.prioridad,
          categoria: data.categoria,
          comentarios: [],
          personalAsignado: [],
          equiposAsignados: [],
        },
        message: "Incidente creado exitosamente",
      },
      201,
    );
  } catch (error) {
    console.log("Error creating incident:", error);
    return c.json({ error: "Error al crear el incidente" }, 500);
  }
});

// Actualizar incidente (con normalización)
app.put("/make-server-69ee164a/incidents/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();

    if (!data.titulo || !data.descripcion || !data.estado || !data.prioridad || !data.categoria) {
      return c.json({ error: "Datos de incidente inválidos" }, 400);
    }

    // Convertir códigos a IDs
    const estadoId = await getEstadoIdByCodigo(data.estado);
    const prioridadId = await getPrioridadIdByCodigo(data.prioridad);
    const categoriaId = await getCategoriaIdByCodigo(data.categoria);

    // Actualizar incidente
    const { data: updatedIncident, error: updateError } = await supabase
      .from("incidentes")
      .update({
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado_id: estadoId,
        prioridad_id: prioridadId,
        categoria_id: categoriaId,
        jefe_dotacion: data.jefeDotacion || null,
        tiempo_inicio: data.tiempoInicio || null,
        tiempo_transcurrido: data.tiempoTranscurrido || 0,
        pausado: data.pausado || false,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Actualizar punto 0 si existe
    if (data.punto0) {
      const { data: existingPunto0 } = await supabase
        .from("punto_0")
        .select("id")
        .eq("incidente_id", id)
        .single();

      if (existingPunto0) {
        await supabase
          .from("punto_0")
          .update({
            lat: data.punto0.lat,
            lng: data.punto0.lng,
            direccion: data.punto0.direccion || "",
            zona: data.punto0.zona || null,
            fecha_hora: data.punto0.fechaHora || new Date().toISOString(),
          })
          .eq("incidente_id", id);
      } else {
        await supabase.from("punto_0").insert({
          incidente_id: id,
          lat: data.punto0.lat,
          lng: data.punto0.lng,
          direccion: data.punto0.direccion || "",
          zona: data.punto0.zona || null,
          fecha_hora: data.punto0.fechaHora || new Date().toISOString(),
          bloqueado: true,
        });
      }
    }

    // Crear evento en timeline
    await supabase.from("eventos_linea_tiempo").insert({
      incidente_id: id,
      tipo: "actualizacion",
      descripcion: `Incidente actualizado: ${updatedIncident.titulo}`,
      timestamp: new Date().toISOString(),
    });

    return c.json({
      incident: {
        ...updatedIncident,
        estado: data.estado,
        prioridad: data.prioridad,
        categoria: data.categoria,
      },
      message: "Incidente actualizado exitosamente",
    });
  } catch (error) {
    console.log("Error updating incident:", error);
    return c.json({ error: "Error al actualizar el incidente" }, 500);
  }
});

// Eliminar incidente
app.delete("/make-server-69ee164a/incidents/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { error } = await supabase.from("incidentes").delete().eq("id", id);

    if (error) throw error;

    return c.json({ message: "Incidente eliminado exitosamente" });
  } catch (error) {
    console.log("Error deleting incident:", error);
    return c.json({ error: "Error al eliminar el incidente" }, 500);
  }
});

// Agregar comentario
app.post("/make-server-69ee164a/incidents/:id/comments", async (c) => {
  try {
    const id = c.req.param("id");
    const { autor, contenido } = await c.req.json();

    if (!autor || !contenido) {
      return c.json({ error: "Autor y contenido son requeridos" }, 400);
    }

    const { data: comment, error } = await supabase
      .from("comentarios_incidente")
      .insert({
        incidente_id: id,
        autor,
        contenido,
      })
      .select()
      .single();

    if (error) throw error;

    return c.json(
      {
        comment: {
          id: comment.id,
          incidentId: comment.incidente_id,
          autor: comment.autor,
          contenido: comment.contenido,
          fecha: comment.fecha,
        },
        message: "Comentario agregado exitosamente",
      },
      201,
    );
  } catch (error) {
    console.log("Error adding comment:", error);
    return c.json({ error: "Error al agregar comentario" }, 500);
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/make-server-69ee164a/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "PostgreSQL (Supabase) - Normalizado",
    version: "3.0-SQL-Normalized",
  });
});

// Iniciar servidor
Deno.serve(app.fetch);
