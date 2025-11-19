import { useState, useEffect } from 'react';
import { Incident, IncidentStats, IncidentStatus, IncidentPriority, IncidentCategory } from '../types/incident';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Datos mock para el Sistema DUAR mientras se resuelven problemas de conectividad
const mockTechnicians = [
  'Comandante Carlos Méndez',
  'Capitán Ana García',
  'Comandante Pedro López',
  'Teniente Miguel Torres',
  'Sargento Laura Rodríguez',
  'Capitán Roberto Silva',
  'Teniente Daniela Martínez',
  'Comandante Francisco Herrera',
  'Sargento José Ramírez',
  'Capitán Patricia Flores'
];

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats>({ total: 0, activos: 0, inactivos: 0, finalizados: 0 });
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener incidentes con filtros (conectado a SQL)
  const fetchIncidents = async (filters?: {
    search?: string;
    status?: IncidentStatus | 'todos';
    priority?: IncidentPriority | 'todos';
    category?: IncidentCategory | 'todos';
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'todos') params.append('status', filters.status);
      if (filters?.priority && filters.priority !== 'todos') params.append('priority', filters.priority);
      if (filters?.category && filters.category !== 'todos') params.append('category', filters.category);

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-69ee164a/incidents?${params.toString()}`;
      console.log('Fetching incidents from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Incidents data:', data);
      
      // Transformar fechas de string a Date
      const transformedIncidents = data.incidents.map((inc: any) => ({
        ...inc,
        fechaCreacion: new Date(inc.fechaCreacion),
        fechaActualizacion: new Date(inc.fechaActualizacion),
        fechaResolucion: inc.fechaResolucion ? new Date(inc.fechaResolucion) : undefined,
        punto0: inc.punto0 ? {
          ...inc.punto0,
          fechaHora: new Date(inc.punto0.fechaHora)
        } : undefined,
        comentarios: inc.comentarios?.map((c: any) => ({
          ...c,
          fecha: new Date(c.fecha)
        })) || []
      }));

      setIncidents(transformedIncidents);
      return transformedIncidents;
    } catch (err) {
      console.error('Error fetching incidents:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener incidentes';
      setError(errorMessage);
      setIncidents([]); // Limpiar incidentes en caso de error
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas (conectado a SQL)
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-69ee164a/incidents/stats`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.stats);
      return data.stats;
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener estadísticas');
      throw err;
    }
  };

  // Obtener técnicos (usando mock temporalmente hasta que se implemente tabla de personal)
  const fetchTechnicians = async () => {
    try {
      // Usamos mock temporalmente
      // TODO: Cambiar a consulta SQL cuando se implemente la tabla de personal
      await new Promise(resolve => setTimeout(resolve, 50));
      
      setTechnicians(mockTechnicians);
      return mockTechnicians;
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener técnicos');
      throw err;
    }
  };

  // Crear incidente (conectado a SQL)
  const createIncident = async (incidentData: Omit<Incident, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'comentarios'>) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-69ee164a/incidents`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(incidentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transformar fechas
      const newIncident = {
        ...data.incident,
        fechaCreacion: new Date(data.incident.fechaCreacion || data.incident.fecha_creacion),
        fechaActualizacion: new Date(data.incident.fechaActualizacion || data.incident.fecha_actualizacion),
        fechaResolucion: data.incident.fechaResolucion ? new Date(data.incident.fechaResolucion) : undefined,
        comentarios: [],
        personalAsignado: [],
        equiposAsignados: []
      };
      
      setIncidents(prev => [newIncident, ...prev]);
      await fetchStats(); // Actualizar estadísticas
      return newIncident;
    } catch (err) {
      console.error('Error creating incident:', err);
      setError(err instanceof Error ? err.message : 'Error al crear incidente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar incidente (conectado a SQL)
  const updateIncident = async (id: string, incidentData: Omit<Incident, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'comentarios'>) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-69ee164a/incidents/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(incidentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transformar fechas
      const updatedIncident = {
        ...data.incident,
        fechaCreacion: new Date(data.incident.fechaCreacion || data.incident.fecha_creacion),
        fechaActualizacion: new Date(data.incident.fechaActualizacion || data.incident.fecha_actualizacion),
        fechaResolucion: data.incident.fechaResolucion ? new Date(data.incident.fechaResolucion) : undefined,
        comentarios: [],
        personalAsignado: [],
        equiposAsignados: []
      };
      
      setIncidents(prev => prev.map(inc => inc.id === id ? updatedIncident : inc));
      await fetchStats(); // Actualizar estadísticas
      return updatedIncident;
    } catch (err) {
      console.error('Error updating incident:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar incidente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar incidente (conectado a SQL)
  const deleteIncident = async (id: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-69ee164a/incidents/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setIncidents(prev => prev.filter(inc => inc.id !== id));
      await fetchStats(); // Actualizar estadísticas
    } catch (err) {
      console.error('Error deleting incident:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar incidente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Agregar comentario (conectado a SQL)
  const addComment = async (incidentId: string, autor: string, contenido: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-69ee164a/incidents/${incidentId}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ autor, contenido }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transformar fecha
      const newComment = {
        ...data.comment,
        fecha: new Date(data.comment.fecha)
      };
      
      // Actualizar el incidente con el nuevo comentario
      setIncidents(prev => prev.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            comentarios: [...inc.comentarios, newComment],
            fechaActualizacion: new Date()
          };
        }
        return inc;
      }));
      
      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err instanceof Error ? err.message : 'Error al agregar comentario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Inicializar datos (conectado a SQL)
  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos mock inmediatamente
      await Promise.all([
        fetchTechnicians(),
        fetchIncidents(),   
        fetchStats()       
      ]);
      
      setError(null);
    } catch (err) {
      console.error('Error initializing data:', err);
      setError(err instanceof Error ? err.message : 'Error al inicializar datos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Health check del servidor (mock)
  const checkServerHealth = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (err) {
      console.error('Health check failed:', err);
      throw new Error('Usando datos locales temporalmente.');
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar datos mock inmediatamente
        await Promise.all([
          fetchTechnicians(),
          fetchIncidents(),   
          fetchStats()       
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return {
    incidents,
    stats,
    technicians,
    loading,
    error,
    fetchIncidents,
    fetchStats,
    fetchTechnicians,
    createIncident,
    updateIncident,
    deleteIncident,
    addComment,
    initializeData,
    checkServerHealth
  };
}