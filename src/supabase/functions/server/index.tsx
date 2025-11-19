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

// Crear cliente de Supabase con Service Role Key para operaciones del servidor
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ============================================================================
// HELPERS
// ============================================================================

// Helpers para mapear códigos a IDs de tablas normalizadas
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

function validateIncidentData(data: any): boolean {
  return (
    data.titulo &&
    data.descripcion &&
    data.estado &&
    data.prioridad &&
    data.categoria
  );
}

// ============================================================================
// RUTAS DE CATÁLOGOS (Para formularios dinámicos)
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
// RUTAS DE INCIDENTES
// ============================================================================

// Obtener estadísticas de incidentes
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
      activos:
        data?.filter((i: any) => i.estados_incidente.codigo === "activo").length ||
        0,
      inactivos:
        data?.filter((i: any) => i.estados_incidente.codigo === "inactivo").length ||
        0,
      finalizados:
        data?.filter((i: any) => i.estados_incidente.codigo === "finalizado").length ||
        0,
    };

    return c.json({ stats });
  } catch (error) {
    console.log("Error getting stats:", error);
    return c.json(
      { error: "Error al obtener estadísticas" },
      500,
    );
  }
});

// Obtener todos los incidentes con filtros
app.get("/make-server-69ee164a/incidents", async (c) => {
  try {
    const searchTerm = c.req.query("search") || "";
    const statusFilter = c.req.query("status") || "todos";
    const priorityFilter = c.req.query("priority") || "todos";
    const categoryFilter = c.req.query("category") || "todos";

    console.log("🔍 GET /incidents - Filtros:", { searchTerm, statusFilter, priorityFilter, categoryFilter });

    // Query con JOINs a las tablas normalizadas
    let query = supabase
      .from("incidentes")
      .select(
        `
        *,
        estados_incidente!inner(id, codigo, nombre, color),
        prioridades_incidente!inner(id, codigo, nombre, nivel, color),
        categorias_incidente!inner(id, codigo, nombre, color),
        punto_0 (*),
        denunciantes (*),
        fiscales_solicitantes (*),
        personas_desaparecidas (*)
      `,
      )
      .order("fecha_creacion", { ascending: false });

    // Aplicar filtros usando los IDs
    if (statusFilter !== "todos") {
      const estadoId = await getEstadoIdByCodigo(statusFilter);
      console.log(`📌 Filtro estado: ${statusFilter} -> ID: ${estadoId}`);
      query = query.eq("estado_id", estadoId);
    }

    if (priorityFilter !== "todos") {
      const prioridadId = await getPrioridadIdByCodigo(priorityFilter);
      console.log(`📌 Filtro prioridad: ${priorityFilter} -> ID: ${prioridadId}`);
      query = query.eq("prioridad_id", prioridadId);
    }

    if (categoryFilter !== "todos") {
      const categoriaId = await getCategoriaIdByCodigo(categoryFilter);
      console.log(`📌 Filtro categoria: ${categoryFilter} -> ID: ${categoriaId}`);
      query = query.eq("categoria_id", categoriaId);
    }

    const { data: incidents, error } = await query;

    if (error) {
      console.error("❌ Error en query de incidentes:", error);
      throw error;
    }

    console.log(`✅ Incidentes obtenidos: ${incidents?.length || 0}`);

    // Filtro de búsqueda por texto (después de la query)
    let filteredIncidents = incidents || [];
    if (searchTerm) {
      filteredIncidents = filteredIncidents.filter(
        (incident: any) =>
          incident.titulo
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          incident.descripcion
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Transformar datos para mantener compatibilidad con el frontend
    const transformedIncidents = filteredIncidents.map(
      (incident: any) => ({
        id: incident.id,
        titulo: incident.titulo,
        descripcion: incident.descripcion,
        // Retornar códigos para compatibilidad con tipos del frontend
        estado: incident.estados_incidente.codigo,
        prioridad: incident.prioridades_incidente.codigo,
        categoria: incident.categorias_incidente.codigo,
        jefeDotacion: incident.jefe_dotacion,
        comandanteACargo: incident.jefe_dotacion, // Alias para compatibilidad
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
        fiscalSolicitante:
          incident.fiscales_solicitantes || undefined,
        personaDesaparecida: incident.personas_desaparecidas
          ? {
              ...incident.personas_desaparecidas,
              ultimaVezVisto: {
                fecha:
                  incident.personas_desaparecidas
                    .ultima_vez_visto_fecha,
                ubicacion:
                  incident.personas_desaparecidas
                    .ultima_vez_visto_ubicacion,
                coordenadas: incident.personas_desaparecidas
                  .ultima_vez_visto_lat
                  ? {
                      lat: parseFloat(
                        incident.personas_desaparecidas
                          .ultima_vez_visto_lat,
                      ),
                      lng: parseFloat(
                        incident.personas_desaparecidas
                          .ultima_vez_visto_lng,
                      ),
                    }
                  : undefined,
              },
              descripcionFisica:
                incident.personas_desaparecidas
                  .descripcion_fisica,
              condicionesMedicas:
                incident.personas_desaparecidas
                  .condiciones_medicas,
              vestimenta: incident.personas_desaparecidas.vestimenta,
              medicamentos:
                incident.personas_desaparecidas.medicamentos,
              foto: incident.personas_desaparecidas.foto,
              contactoFamiliar: {
                nombre:
                  incident.personas_desaparecidas
                    .contacto_nombre,
                telefono:
                  incident.personas_desaparecidas
                    .contacto_telefono,
                relacion:
                  incident.personas_desaparecidas
                    .contacto_relacion,
              },
            }
          : undefined,
        tiempoInicio: incident.tiempo_inicio,
        tiempoTranscurrido: incident.tiempo_transcurrido,
        pausado: incident.pausado,
        fechaCreacion: incident.fecha_creacion,
        fechaActualizacion: incident.fecha_actualizacion,
        fechaResolucion: incident.fecha_resolucion,
        comentarios: [], // Se cargará por separado
        personalAsignado: [], // Se cargará por separado
        equiposAsignados: [], // Se cargará por separado
      }),
    );

    return c.json({ incidents: transformedIncidents });
  } catch (error) {
    console.log("Error getting incidents:", error);
    return c.json(
      { error: "Error al obtener incidentes" },
      500,
    );
  }
});

// Obtener un incidente específico
app.get("/make-server-69ee164a/incidents/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { data: incident, error } = await supabase
      .from("incidentes")
      .select(
        `
        *,
        estados_incidente!inner(id, codigo, nombre, color),
        prioridades_incidente!inner(id, codigo, nombre, nivel, color),
        categorias_incidente!inner(id, codigo, nombre, color),
        punto_0 (*),
        denunciantes (*),
        fiscales_solicitantes (*),
        personas_desaparecidas (*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return c.json(
          { error: "Incidente no encontrado" },
          404,
        );
      }
      throw error;
    }

    // Obtener comentarios
    const { data: comentarios } = await supabase
      .from("comentarios_incidente")
      .select("*")
      .eq("incidente_id", id)
      .order("fecha", { ascending: false });

    // Obtener personal asignado
    const { data: personalAsignado } = await supabase
      .from("personal_incidente")
      .select("personal_id")
      .eq("incidente_id", id)
      .eq("activo", true);

    // Obtener equipos
    const { data: equipos } = await supabase
      .from("equipos")
      .select("id")
      .eq("incidente_id", id);

    // Transformar datos
    const transformedIncident = {
      id: incident.id,
      titulo: incident.titulo,
      descripcion: incident.descripcion,
      // Retornar códigos para compatibilidad con el frontend
      estado: incident.estados_incidente.codigo,
      prioridad: incident.prioridades_incidente.codigo,
      categoria: incident.categorias_incidente.codigo,
      jefeDotacion: incident.jefe_dotacion,
      comandanteACargo: incident.jefe_dotacion,
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
      fiscalSolicitante:
        incident.fiscales_solicitantes || undefined,
      personaDesaparecida: incident.personas_desaparecidas
        ? {
            nombre: incident.personas_desaparecidas.nombre,
            apellido: incident.personas_desaparecidas.apellido,
            edad: incident.personas_desaparecidas.edad,
            genero: incident.personas_desaparecidas.genero,
            ultimaVezVisto: {
              fecha:
                incident.personas_desaparecidas
                  .ultima_vez_visto_fecha,
              ubicacion:
                incident.personas_desaparecidas
                  .ultima_vez_visto_ubicacion,
              coordenadas: incident.personas_desaparecidas
                .ultima_vez_visto_lat
                ? {
                    lat: parseFloat(
                      incident.personas_desaparecidas
                        .ultima_vez_visto_lat,
                    ),
                    lng: parseFloat(
                      incident.personas_desaparecidas
                        .ultima_vez_visto_lng,
                    ),
                  }
                : undefined,
            },
            descripcionFisica:
              incident.personas_desaparecidas
                .descripcion_fisica,
            condicionesMedicas:
              incident.personas_desaparecidas
                .condiciones_medicas,
            vestimenta: incident.personas_desaparecidas.vestimenta,
            medicamentos:
              incident.personas_desaparecidas.medicamentos,
            foto: incident.personas_desaparecidas.foto,
            contactoFamiliar: {
              nombre:
                incident.personas_desaparecidas.contacto_nombre,
              telefono:
                incident.personas_desaparecidas
                  .contacto_telefono,
              relacion:
                incident.personas_desaparecidas
                  .contacto_relacion,
            },
          }
        : undefined,
      tiempoInicio: incident.tiempo_inicio,
      tiempoTranscurrido: incident.tiempo_transcurrido,
      pausado: incident.pausado,
      fechaCreacion: incident.fecha_creacion,
      fechaActualizacion: incident.fecha_actualizacion,
      fechaResolucion: incident.fecha_resolucion,
      comentarios: comentarios || [],
      personalAsignado:
        personalAsignado?.map((p: any) => p.personal_id) || [],
      equiposAsignados: equipos?.map((e: any) => e.id) || [],
    };

    return c.json(transformedIncident);
  } catch (error) {
    console.log("Error getting incident by ID:", error);
    return c.json(
      { error: "Error al obtener el incidente" },
      500,
    );
  }
});

// Crear nuevo incidente
app.post("/make-server-69ee164a/incidents", async (c) => {
  try {
    const data = await c.req.json();
    console.log("📥 Datos recibidos para crear incidente:", JSON.stringify(data, null, 2));

    if (!validateIncidentData(data)) {
      console.error("❌ Validación falló - Datos inválidos:", data);
      return c.json(
        { error: "Datos de incidente inválidos" },
        400,
      );
    }

    // Convertir códigos a IDs para normalización
    console.log("🔄 Convirtiendo códigos a IDs...");
    const estadoId = await getEstadoIdByCodigo(data.estado);
    const prioridadId = await getPrioridadIdByCodigo(data.prioridad);
    const categoriaId = await getCategoriaIdByCodigo(data.categoria);
    console.log(`✅ IDs obtenidos - Estado: ${estadoId}, Prioridad: ${prioridadId}, Categoría: ${categoriaId}`);

    // Insertar incidente con IDs normalizados
    console.log("💾 Insertando incidente principal...");
    const { data: incident, error: incidentError } =
      await supabase
        .from("incidentes")
        .insert({
          titulo: data.titulo,
          descripcion: data.descripcion,
          estado_id: estadoId,
          prioridad_id: prioridadId,
          categoria_id: categoriaId,
          // TEMPORALMENTE COMENTADO: jefe_dotacion: data.jefeDotacion || null,
          tiempo_inicio: data.tiempoInicio || null,
          tiempo_transcurrido: data.tiempoTranscurrido || 0,
          pausado: data.pausado || false,
        })
        .select()
        .single();

    if (incidentError) {
      console.error("❌ Error al insertar incidente:", incidentError);
      throw incidentError;
    }
    console.log("✅ Incidente creado con ID:", incident.id);

    // Insertar Punto 0 si existe
    if (data.punto0) {
      console.log("💾 Insertando punto 0...");
      const { error: punto0Error } = await supabase.from("punto_0").insert({
        incidente_id: incident.id,
        lat: data.punto0.lat,
        lng: data.punto0.lng,
        direccion: data.punto0.direccion || "",
        zona: data.punto0.zona || null,
        fecha_hora:
          data.punto0.fechaHora || new Date().toISOString(),
        bloqueado: true,
      });
      if (punto0Error) {
        console.error("❌ Error al insertar punto 0:", punto0Error);
        throw punto0Error;
      }
      console.log("✅ Punto 0 insertado");
    }

    // Insertar denunciante si existe
    if (data.denunciante && data.denunciante.nombre) {
      console.log("💾 Insertando denunciante...");
      const { error: denuncianteError } = await supabase.from("denunciantes").insert({
        incidente_id: incident.id,
        nombre: data.denunciante.nombre,
        apellido: data.denunciante.apellido || "",
        dni: data.denunciante.dni || null,
        telefono: data.denunciante.telefono || null,
        email: data.denunciante.email || null,
        direccion: data.denunciante.direccion || null,
        relacion: data.denunciante.relacion || null,
      });
      if (denuncianteError) {
        console.error("❌ Error al insertar denunciante:", denuncianteError);
        throw denuncianteError;
      }
      console.log("✅ Denunciante insertado");
    }

    // Insertar fiscal si existe
    if (
      data.fiscalSolicitante &&
      data.fiscalSolicitante.nombre
    ) {
      console.log("💾 Insertando fiscal solicitante...");
      const { error: fiscalError } = await supabase.from("fiscales_solicitantes").insert({
        incidente_id: incident.id,
        nombre: data.fiscalSolicitante.nombre,
        apellido: data.fiscalSolicitante.apellido || "",
        fiscalia: data.fiscalSolicitante.fiscalia || "",
        expediente: data.fiscalSolicitante.expediente || "",
        telefono: data.fiscalSolicitante.telefono || null,
        email: data.fiscalSolicitante.email || null,
      });
      if (fiscalError) {
        console.error("❌ Error al insertar fiscal:", fiscalError);
        throw fiscalError;
      }
      console.log("✅ Fiscal insertado");
    }

    // Insertar persona desaparecida si existe
    if (
      data.personaDesaparecida &&
      data.personaDesaparecida.nombre
    ) {
      console.log("💾 Insertando persona desaparecida...");
      const { error: personaError } = await supabase.from("personas_desaparecidas").insert({
        incidente_id: incident.id,
        nombre: data.personaDesaparecida.nombre,
        apellido: data.personaDesaparecida.apellido || "",
        edad: data.personaDesaparecida.edad || null,
        genero: data.personaDesaparecida.genero || null,
        descripcion_fisica:
          data.personaDesaparecida.descripcionFisica || "",
        ultima_vez_visto_fecha:
          data.personaDesaparecida.ultimaVezVisto?.fecha ||
          null,
        ultima_vez_visto_ubicacion:
          data.personaDesaparecida.ultimaVezVisto?.ubicacion ||
          null,
        ultima_vez_visto_lat:
          data.personaDesaparecida.ultimaVezVisto?.coordenadas
            ?.lat || null,
        ultima_vez_visto_lng:
          data.personaDesaparecida.ultimaVezVisto?.coordenadas
            ?.lng || null,
        vestimenta: data.personaDesaparecida.vestimenta || null,
        condiciones_medicas:
          data.personaDesaparecida.condicionesMedicas || null,
        medicamentos:
          data.personaDesaparecida.medicamentos || null,
        foto: data.personaDesaparecida.foto || null,
        contacto_nombre:
          data.personaDesaparecida.contactoFamiliar?.nombre ||
          null,
        contacto_telefono:
          data.personaDesaparecida.contactoFamiliar?.telefono ||
          null,
        contacto_relacion:
          data.personaDesaparecida.contactoFamiliar?.relacion ||
          null,
      });
      if (personaError) {
        console.error("❌ Error al insertar persona desaparecida:", personaError);
        throw personaError;
      }
      console.log("✅ Persona desaparecida insertada");
    }

    // Crear evento en timeline
    console.log("💾 Creando evento en timeline...");
    const { error: timelineError } = await supabase.from("eventos_linea_tiempo").insert({
      incidente_id: incident.id,
      tipo: "creado",
      descripcion: `Incidente creado: ${incident.titulo}`,
      timestamp: new Date().toISOString(),
    });
    if (timelineError) {
      console.error("❌ Error al crear evento timeline:", timelineError);
      // No lanzamos el error porque el timeline no es crítico
    } else {
      console.log("✅ Evento timeline creado");
    }

    console.log("🎉 Incidente creado exitosamente!");
    return c.json(
      {
        incident: {
          ...incident,
          comentarios: [],
          personalAsignado: [],
          equiposAsignados: [],
        },
        message: "Incidente creado exitosamente",
      },
      201,
    );
  } catch (error) {
    console.error("❌❌❌ ERROR CRÍTICO creando incidente:", error);
    console.error("❌ Tipo de error:", error.constructor.name);
    console.error("❌ Mensaje:", error.message);
    console.error("❌ Stack:", error.stack);
    return c.json(
      { 
        error: "Error al crear el incidente",
        details: error.message,
        type: error.constructor.name
      },
      500,
    );
  }
});

// Actualizar incidente
app.put("/make-server-69ee164a/incidents/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const data = await c.req.json();

    if (!validateIncidentData(data)) {
      return c.json(
        { error: "Datos de incidente inválidos" },
        400,
      );
    }

    // Convertir códigos a IDs para normalización
    const estadoId = await getEstadoIdByCodigo(data.estado);
    const prioridadId = await getPrioridadIdByCodigo(data.prioridad);
    const categoriaId = await getCategoriaIdByCodigo(data.categoria);

    // Actualizar incidente principal
    const { data: updatedIncident, error: updateError } =
      await supabase
        .from("incidentes")
        .update({
          titulo: data.titulo,
          descripcion: data.descripcion,
          estado_id: estadoId,
          prioridad_id: prioridadId,
          categoria_id: categoriaId,
          // TEMPORALMENTE COMENTADO: jefe_dotacion: data.jefeDotacion || null,
          tiempo_inicio: data.tiempoInicio || null,
          tiempo_transcurrido: data.tiempoTranscurrido || 0,
          pausado: data.pausado || false,
        })
        .eq("id", id)
        .select()
        .single();

    if (updateError) throw updateError;

    // Actualizar o insertar Punto 0
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
            fecha_hora:
              data.punto0.fechaHora || new Date().toISOString(),
          })
          .eq("incidente_id", id);
      } else {
        await supabase.from("punto_0").insert({
          incidente_id: id,
          lat: data.punto0.lat,
          lng: data.punto0.lng,
          direccion: data.punto0.direccion || "",
          zona: data.punto0.zona || null,
          fecha_hora:
            data.punto0.fechaHora || new Date().toISOString(),
          bloqueado: true,
        });
      }
    }

    // Actualizar denunciante si existe
    if (data.denunciante) {
      const { data: existingDenunciante } = await supabase
        .from("denunciantes")
        .select("id")
        .eq("incidente_id", id)
        .single();

      if (existingDenunciante) {
        await supabase
          .from("denunciantes")
          .update({
            nombre: data.denunciante.nombre,
            apellido: data.denunciante.apellido || "",
            dni: data.denunciante.dni || null,
            telefono: data.denunciante.telefono || null,
            email: data.denunciante.email || null,
            direccion: data.denunciante.direccion || null,
            relacion: data.denunciante.relacion || null,
          })
          .eq("incidente_id", id);
      } else if (data.denunciante.nombre) {
        await supabase.from("denunciantes").insert({
          incidente_id: id,
          nombre: data.denunciante.nombre,
          apellido: data.denunciante.apellido || "",
          dni: data.denunciante.dni || null,
          telefono: data.denunciante.telefono || null,
          email: data.denunciante.email || null,
          direccion: data.denunciante.direccion || null,
          relacion: data.denunciante.relacion || null,
        });
      }
    }

    // Actualizar fiscal si existe
    if (data.fiscalSolicitante) {
      const { data: existingFiscal } = await supabase
        .from("fiscales_solicitantes")
        .select("id")
        .eq("incidente_id", id)
        .single();

      if (existingFiscal) {
        await supabase
          .from("fiscales_solicitantes")
          .update({
            nombre: data.fiscalSolicitante.nombre,
            apellido: data.fiscalSolicitante.apellido || "",
            fiscalia: data.fiscalSolicitante.fiscalia || "",
            expediente: data.fiscalSolicitante.expediente || "",
            telefono: data.fiscalSolicitante.telefono || null,
            email: data.fiscalSolicitante.email || null,
          })
          .eq("incidente_id", id);
      } else if (data.fiscalSolicitante.nombre) {
        await supabase.from("fiscales_solicitantes").insert({
          incidente_id: id,
          nombre: data.fiscalSolicitante.nombre,
          apellido: data.fiscalSolicitante.apellido || "",
          fiscalia: data.fiscalSolicitante.fiscalia || "",
          expediente: data.fiscalSolicitante.expediente || "",
          telefono: data.fiscalSolicitante.telefono || null,
          email: data.fiscalSolicitante.email || null,
        });
      }
    }

    // Actualizar persona desaparecida si existe
    if (data.personaDesaparecida) {
      const { data: existingPersona } = await supabase
        .from("personas_desaparecidas")
        .select("id")
        .eq("incidente_id", id)
        .single();

      if (existingPersona) {
        await supabase
          .from("personas_desaparecidas")
          .update({
            nombre: data.personaDesaparecida.nombre,
            apellido: data.personaDesaparecida.apellido || "",
            edad: data.personaDesaparecida.edad || null,
            genero: data.personaDesaparecida.genero || null,
            descripcion_fisica:
              data.personaDesaparecida.descripcionFisica || "",
            ultima_vez_visto_fecha:
              data.personaDesaparecida.ultimaVezVisto?.fecha ||
              null,
            ultima_vez_visto_ubicacion:
              data.personaDesaparecida.ultimaVezVisto
                ?.ubicacion || null,
            ultima_vez_visto_lat:
              data.personaDesaparecida.ultimaVezVisto
                ?.coordenadas?.lat || null,
            ultima_vez_visto_lng:
              data.personaDesaparecida.ultimaVezVisto
                ?.coordenadas?.lng || null,
            vestimenta:
              data.personaDesaparecida.vestimenta || null,
            condiciones_medicas:
              data.personaDesaparecida.condicionesMedicas ||
              null,
            medicamentos:
              data.personaDesaparecida.medicamentos || null,
            foto: data.personaDesaparecida.foto || null,
            contacto_nombre:
              data.personaDesaparecida.contactoFamiliar
                ?.nombre || null,
            contacto_telefono:
              data.personaDesaparecida.contactoFamiliar
                ?.telefono || null,
            contacto_relacion:
              data.personaDesaparecida.contactoFamiliar
                ?.relacion || null,
          })
          .eq("incidente_id", id);
      } else if (data.personaDesaparecida.nombre) {
        await supabase.from("personas_desaparecidas").insert({
          incidente_id: id,
          nombre: data.personaDesaparecida.nombre,
          apellido: data.personaDesaparecida.apellido || "",
          edad: data.personaDesaparecida.edad || null,
          genero: data.personaDesaparecida.genero || null,
          descripcion_fisica:
            data.personaDesaparecida.descripcionFisica || "",
          ultima_vez_visto_fecha:
            data.personaDesaparecida.ultimaVezVisto?.fecha ||
            null,
          ultima_vez_visto_ubicacion:
            data.personaDesaparecida.ultimaVezVisto
              ?.ubicacion || null,
          ultima_vez_visto_lat:
            data.personaDesaparecida.ultimaVezVisto?.coordenadas
              ?.lat || null,
          ultima_vez_visto_lng:
            data.personaDesaparecida.ultimaVezVisto?.coordenadas
              ?.lng || null,
          vestimenta:
            data.personaDesaparecida.vestimenta || null,
          condiciones_medicas:
            data.personaDesaparecida.condicionesMedicas || null,
          medicamentos:
            data.personaDesaparecida.medicamentos || null,
          foto: data.personaDesaparecida.foto || null,
          contacto_nombre:
            data.personaDesaparecida.contactoFamiliar?.nombre ||
            null,
          contacto_telefono:
            data.personaDesaparecida.contactoFamiliar
              ?.telefono || null,
          contacto_relacion:
            data.personaDesaparecida.contactoFamiliar
              ?.relacion || null,
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
      incident: updatedIncident,
      message: "Incidente actualizado exitosamente",
    });
  } catch (error) {
    console.log("Error updating incident:", error);
    return c.json(
      { error: "Error al actualizar el incidente" },
      500,
    );
  }
});

// Eliminar incidente
app.delete("/make-server-69ee164a/incidents/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { error } = await supabase
      .from("incidentes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return c.json({
      message: "Incidente eliminado exitosamente",
    });
  } catch (error) {
    console.log("Error deleting incident:", error);
    return c.json(
      { error: "Error al eliminar el incidente" },
      500,
    );
  }
});

// Agregar comentario a un incidente
app.post(
  "/make-server-69ee164a/incidents/:id/comments",
  async (c) => {
    try {
      const id = c.req.param("id");
      const { autor, contenido } = await c.req.json();

      if (!autor || !contenido) {
        return c.json(
          { error: "Autor y contenido son requeridos" },
          400,
        );
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

      // Crear evento en timeline
      await supabase.from("eventos_linea_tiempo").insert({
        incidente_id: id,
        tipo: "comentario",
        descripcion: `${autor} agregó un comentario`,
        timestamp: new Date().toISOString(),
      });

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
      return c.json(
        { error: "Error al agregar comentario" },
        500,
      );
    }
  },
);

// ============================================================================
// RUTAS DE TÉCNICOS/PERSONAL (Mantenemos compatibilidad)
// ============================================================================

app.get("/make-server-69ee164a/technicians", async (c) => {
  try {
    // Esta ruta se mantiene para compatibilidad, pero no se usa en la nueva estructura
    // El personal se gestiona directamente en la tabla 'personal'
    return c.json({ technicians: [] });
  } catch (error) {
    console.log("Error getting technicians:", error);
    return c.json({ error: "Error al obtener técnicos" }, 500);
  }
});

app.post("/make-server-69ee164a/technicians", async (c) => {
  try {
    const { nombre } = await c.req.json();
    // Esta ruta se mantiene para compatibilidad
    return c.json(
      {
        technician: { id: Date.now().toString(), nombre },
        message: "Técnico agregado",
      },
      201,
    );
  } catch (error) {
    console.log("Error adding technician:", error);
    return c.json({ error: "Error al agregar técnico" }, 500);
  }
});

// ============================================================================
// RUTAS DE ARCHIVOS
// ============================================================================

app.post(
  "/make-server-69ee164a/incidents/:id/files",
  async (c) => {
    try {
      const id = c.req.param("id");
      const {
        nombre,
        tipo,
        tamaño,
        url,
        descripcion,
        subidoPor,
      } = await c.req.json();

      const { data: file, error } = await supabase
        .from("archivos_incidente")
        .insert({
          incidente_id: id,
          nombre,
          tipo,
          tamaño: tamaño || null,
          url,
          descripcion: descripcion || null,
          subido_por: subidoPor || "Sistema",
        })
        .select()
        .single();

      if (error) throw error;

      // Crear evento en timeline
      await supabase.from("eventos_linea_tiempo").insert({
        incidente_id: id,
        tipo: "subida_archivo",
        descripcion: `Archivo subido: ${nombre}`,
        timestamp: new Date().toISOString(),
      });

      return c.json(
        { file, message: "Archivo subido exitosamente" },
        201,
      );
    } catch (error) {
      console.log("Error uploading file:", error);
      return c.json({ error: "Error al subir archivo" }, 500);
    }
  },
);

app.get(
  "/make-server-69ee164a/incidents/:id/files",
  async (c) => {
    try {
      const id = c.req.param("id");

      const { data: files, error } = await supabase
        .from("archivos_incidente")
        .select("*")
        .eq("incidente_id", id)
        .order("fecha_subida", { ascending: false });

      if (error) throw error;

      return c.json({ files: files || [] });
    } catch (error) {
      console.log("Error getting files:", error);
      return c.json(
        { error: "Error al obtener archivos" },
        500,
      );
    }
  },
);

app.delete("/make-server-69ee164a/files/:fileId", async (c) => {
  try {
    const fileId = c.req.param("fileId");

    const { error } = await supabase
      .from("archivos_incidente")
      .delete()
      .eq("id", fileId);

    if (error) throw error;

    return c.json({
      message: "Archivo eliminado exitosamente",
    });
  } catch (error) {
    console.log("Error deleting file:", error);
    return c.json({ error: "Error al eliminar archivo" }, 500);
  }
});

// ============================================================================
// RUTAS DE NOTIFICACIONES
// ============================================================================

app.post("/make-server-69ee164a/notifications", async (c) => {
  try {
    const { incidentId, tipo, titulo, mensaje, prioridad } =
      await c.req.json();

    const { data: notification, error } = await supabase
      .from("notificaciones")
      .insert({
        incidente_id: incidentId || null,
        tipo,
        titulo,
        mensaje,
        prioridad: prioridad || "media",
      })
      .select()
      .single();

    if (error) throw error;

    return c.json(
      { notification, message: "Notificación creada" },
      201,
    );
  } catch (error) {
    console.log("Error creating notification:", error);
    return c.json(
      { error: "Error al crear notificación" },
      500,
    );
  }
});

app.get("/make-server-69ee164a/notifications", async (c) => {
  try {
    const incidentId = c.req.query("incidentId");
    const unreadOnly = c.req.query("unreadOnly") === "true";

    let query = supabase
      .from("notificaciones")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(50);

    if (incidentId) {
      query = query.eq("incidente_id", incidentId);
    }

    if (unreadOnly) {
      query = query.eq("leida", false);
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    return c.json({ notifications: notifications || [] });
  } catch (error) {
    console.log("Error getting notifications:", error);
    return c.json(
      { error: "Error al obtener notificaciones" },
      500,
    );
  }
});

// ============================================================================
// RUTA DE INICIALIZACIÓN (Vacía en la nueva estructura)
// ============================================================================

app.post("/make-server-69ee164a/initialize", async (c) => {
  try {
    // No necesitamos inicializar datos con la nueva estructura SQL
    return c.json({
      message: "Base de datos lista",
      initialized: false,
    });
  } catch (error) {
    console.log("Error initializing:", error);
    return c.json({ error: "Error al inicializar" }, 500);
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get("/make-server-69ee164a/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "PostgreSQL (Supabase)",
    version: "2.0-SQL",
  });
});

// Iniciar servidor
Deno.serve(app.fetch);