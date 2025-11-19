import { useState, useEffect, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "./components/ui/button";
import { IncidentForm } from "./components/incident-form";
import { FirefighterDashboard } from "./components/firefighter-dashboard";
import { IncidentMap } from "./components/incident-map";
import { IncidentFiles } from "./components/incident-files";
import { IncidentTimeline } from "./components/incident-timeline";
import { AuthProvider } from "./components/auth/auth-wrapper";
import { QRIncidentAccess } from "./components/auth/qr-incident-access";
import { IncidentSelector } from "./components/incident-selector";
import { IncidentContextHeader } from "./components/incident-context-header";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { PublicRegistrationRouter } from "./components/public-registration-router";
import { QRPersonnelManager } from "./components/qr-personnel-manager";
import { GroupManager } from "./components/group-manager";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";

import { useIncidents } from "./hooks/useIncidents";
import {
  Incident,
  IncidentStatus,
  IncidentPriority,
  IncidentCategory,
  IncidentFile,
  TimelineEvent,
  QRAccess,
} from "./types/incident";
import { Loader2, AlertCircle, AlertTriangle, RefreshCw, FileText } from "lucide-react";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "./components/ui/sidebar";
import { FirefighterSidebar } from "./components/firefighter-sidebar";
import { FirefighterHeader } from "./components/firefighter-header";
import { FirefighterBreadcrumbs } from "./components/firefighter-breadcrumbs";
import { PersonnelDashboard } from "./components/personnel-dashboard";
import { PersonnelForm } from "./components/personnel-form";
import { TeamForm } from "./components/team-form";
import { OfflineMap } from "./components/offline-map";
import { SearchAreaPlanner } from "./components/search-area-planner";
import { MapDrawTools } from "./components/map-draw-tools-simple";
import { SystemLogs } from "./components/system-logs";
import { WeatherDashboard } from "./components/weather-dashboard";
import { Personnel, Team } from "./types/personnel";
import { mockPersonnel, mockTeams } from "./data/mockPersonnel";

// Backend estable para DnD - debe estar fuera del componente
const dndBackend = HTML5Backend;

export default function App() {
  // Suprimir errores de CSS CORS de librerías externas (Leaflet, etc)
  useEffect(() => {
    // Manejador para errores de runtime
    const handleError = (event: ErrorEvent) => {
      const message = event.message?.toLowerCase() || "";
      // Suprimir errores de acceso a CSS de dominios externos
      if (
        message.includes("cssrules") ||
        message.includes("cssstylesheet") ||
        message.includes("stylesheet") ||
        message.includes("cannot access rules") ||
        message.includes("failed to read")
      ) {
        event.preventDefault();
        event.stopPropagation();
        console.warn(
          "CSS CORS error suprimido (esto es normal con hojas de estilo externas)",
        );
        return false;
      }
    };

    // Manejador para errores no capturados en promesas
    const handleUnhandledRejection = (
      event: PromiseRejectionEvent,
    ) => {
      const reason =
        event.reason?.toString().toLowerCase() || "";
      if (
        reason.includes("cssrules") ||
        reason.includes("cssstylesheet") ||
        reason.includes("stylesheet")
      ) {
        event.preventDefault();
        console.warn("CSS CORS promise error suprimido");
        return false;
      }
    };

    // Sobreescribir console.error temporalmente para suprimir errores de CSS
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args[0]?.toString().toLowerCase() || "";
      if (
        message.includes("cssrules") ||
        message.includes("cssstylesheet") ||
        message.includes("cannot access rules") ||
        message.includes("failed to read")
      ) {
        // Suprimir silenciosamente
        return;
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener(
      "unhandledrejection",
      handleUnhandledRejection,
    );

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      console.error = originalConsoleError;
    };
  }, []);

  const {
    incidents,
    stats,
    technicians,
    loading,
    error,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
    initializeData,
  } = useIncidents();

  // Estados principales de la aplicación
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<
    Incident | undefined
  >(undefined);
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);
  const [activeView, setActiveView] = useState("selector"); // Cambiado a 'selector' por defecto

  // Estados globales de personal (disponibles para asignar a incidentes)
  const [globalPersonnel, setGlobalPersonnel] =
    useState<Personnel[]>(mockPersonnel);
  const [globalTeams, setGlobalTeams] =
    useState<Team[]>(mockTeams);
  const [isPersonnelFormOpen, setIsPersonnelFormOpen] =
    useState(false);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<
    Personnel | undefined
  >(undefined);
  const [editingTeam, setEditingTeam] = useState<
    Team | undefined
  >(undefined);

  // Funciones auxiliares para obtener recursos específicos del incidente
  const getIncidentPersonnel = (
    incident: Incident,
  ): Personnel[] => {
    if (!incident.personalAsignado) return [];
    return globalPersonnel.filter((p) =>
      incident.personalAsignado?.includes(p.id),
    );
  };

  const getIncidentTeams = (incident: Incident): Team[] => {
    if (!incident.equiposAsignados) return [];
    return globalTeams.filter((t) =>
      incident.equiposAsignados?.includes(t.id),
    );
  };

  const getIncidentFiles = (
    incident: Incident,
  ): IncidentFile[] => {
    return incident.archivosEvidencia || [];
  };

  const getIncidentTimeline = (
    incident: Incident,
  ): TimelineEvent[] => {
    return incident.timelineEventos || [];
  };

  const getIncidentQRAccesses = (
    incident: Incident,
  ): QRAccess[] => {
    return incident.accesosQR || [];
  };

  // Shortcuts de teclado para navegación
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo activar si no estamos escribiendo en un input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.altKey) {
        switch (event.key) {
          case "1":
            event.preventDefault();
            if (selectedIncident) setActiveView("dashboard");
            break;
          case "2":
            event.preventDefault();
            if (selectedIncident) setActiveView("personnel");
            break;
          case "3":
            event.preventDefault();
            if (selectedIncident) setActiveView("map");
            break;
          case "4":
            event.preventDefault();
            if (selectedIncident) setActiveView("files");
            break;
          case "5":
            event.preventDefault();
            if (selectedIncident) setActiveView("timeline");
            break;
          case "6":
            event.preventDefault();
            if (selectedIncident) setActiveView("gps");
            break;
          case "7":
            event.preventDefault();
            if (selectedIncident) setActiveView("search-zones");
            break;
          case "8":
            event.preventDefault();
            if (selectedIncident) setActiveView("qr-access");
            break;
          case "9":
            event.preventDefault();
            if (selectedIncident)
              setActiveView("notifications");
            break;
          case "0":
            event.preventDefault();
            setActiveView("logs");
            break;
          case "Escape":
            event.preventDefault();
            setSelectedIncident(null);
            setActiveView("selector");
            break;
          case "n":
            event.preventDefault();
            setIsFormOpen(true);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIncident]);

  const handleCreateIncident = async (
    incidentData: Omit<
      Incident,
      | "id"
      | "fechaCreacion"
      | "fechaActualizacion"
      | "comentarios"
    >,
  ) => {
    setLocalLoading(true);
    try {
      await createIncident(incidentData);
    } catch (err) {
      console.error("Error creating incident:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEditIncident = (incident: Incident) => {
    setEditingIncident(incident);
    setIsFormOpen(true);
  };

  const handleUpdateIncident = async (
    incidentData: Omit<
      Incident,
      | "id"
      | "fechaCreacion"
      | "fechaActualizacion"
      | "comentarios"
    >,
  ) => {
    if (!editingIncident) return;

    setLocalLoading(true);
    try {
      await updateIncident(editingIncident.id, incidentData);
      setEditingIncident(undefined);
    } catch (err) {
      console.error("Error updating incident:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIncident(undefined);
  };

  const handleInitializeData = async () => {
    setLocalLoading(true);
    try {
      await initializeData();
    } catch (err) {
      console.error("Error initializing data:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  // Función para actualizar un incidente con nuevos datos
  const updateIncidentResources = async (
    incidentId: string,
    updates: Partial<Incident>,
  ) => {
    // Si es el incidente seleccionado, usar su estado actual en lugar del array
    // para preservar cambios locales recientes
    const incident = selectedIncident?.id === incidentId 
      ? selectedIncident 
      : incidents.find((i) => i.id === incidentId);
    
    if (!incident) return;

    const updatedIncident = { ...incident, ...updates };

    try {
      await updateIncident(incidentId, updatedIncident);

      // Actualizar el incidente seleccionado si es el mismo
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(updatedIncident);
      }
    } catch (err) {
      console.error("Error updating incident resources:", err);
    }
  };

  // Handlers para los datos específicos del incidente
  const handleFileUpload = async (
    files: File[],
    description?: string,
  ) => {
    if (!selectedIncident) return;

    const newFiles: IncidentFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      incidentId: selectedIncident.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Usuario Actual",
      description:
        description || `Archivo subido: ${file.name}`,
    }));

    const currentFiles =
      selectedIncident.archivosEvidencia || [];
    const updatedFiles = [...currentFiles, ...newFiles];

    await updateIncidentResources(selectedIncident.id, {
      archivosEvidencia: updatedFiles,
    });

    // Agregar evento al timeline
    const timelineEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      incidentId: selectedIncident.id,
      type: "file_upload",
      timestamp: new Date().toISOString(),
      user: {
        id: "current",
        name: "Usuario Actual",
        role: "Bombero",
        avatar: "",
      },
      description: `${files.length} archivo(s) subido(s)`,
      details: { fileId: newFiles[0].id },
    };

    const currentTimeline =
      selectedIncident.timelineEventos || [];
    await updateIncidentResources(selectedIncident.id, {
      timelineEventos: [timelineEvent, ...currentTimeline],
    });
  };

  const handleFileDelete = async (fileId: string) => {
    if (!selectedIncident) return;

    const currentFiles =
      selectedIncident.archivosEvidencia || [];
    const updatedFiles = currentFiles.filter(
      (f) => f.id !== fileId,
    );

    await updateIncidentResources(selectedIncident.id, {
      archivosEvidencia: updatedFiles,
    });
  };

  const handleAddComment = async (comment: string) => {
    if (!selectedIncident) return;

    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      incidentId: selectedIncident.id,
      type: "comment",
      timestamp: new Date().toISOString(),
      user: {
        id: "current",
        name: "Usuario Actual",
        role: "Bombero",
        avatar: "",
      },
      description: "Comentario agregado",
      details: { comment },
    };

    const currentTimeline =
      selectedIncident.timelineEventos || [];
    await updateIncidentResources(selectedIncident.id, {
      timelineEventos: [newEvent, ...currentTimeline],
    });
  };

  const handleAssignPersonnelToIncident = async (
    personnelIds: string[],
  ) => {
    if (!selectedIncident) return;

    const currentPersonnel =
      selectedIncident.personalAsignado || [];
    const updatedPersonnel = [
      ...new Set([...currentPersonnel, ...personnelIds]),
    ];

    await updateIncidentResources(selectedIncident.id, {
      personalAsignado: updatedPersonnel,
    });

    // Agregar evento al timeline
    const timelineEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      incidentId: selectedIncident.id,
      type: "personnel_assigned",
      timestamp: new Date().toISOString(),
      user: {
        id: "current",
        name: "Usuario Actual",
        role: "Comandante",
        avatar: "",
      },
      description: `${personnelIds.length} persona(s) asignada(s) al incidente`,
      details: { personnelId: personnelIds.join(",") },
    };

    const currentTimeline =
      selectedIncident.timelineEventos || [];
    await updateIncidentResources(selectedIncident.id, {
      timelineEventos: [timelineEvent, ...currentTimeline],
    });
  };

  const handleRemovePersonnelFromIncident = async (
    personnelId: string,
  ) => {
    if (!selectedIncident) return;

    const currentPersonnel =
      selectedIncident.personalAsignado || [];
    const updatedPersonnel = currentPersonnel.filter(
      (id) => id !== personnelId,
    );

    await updateIncidentResources(selectedIncident.id, {
      personalAsignado: updatedPersonnel,
    });
  };

  // Handlers para gestión de personal global
  const handleCreatePersonnel = async (
    personnelData: Omit<Personnel, "id">,
  ) => {
    const newPersonnel: Personnel = {
      ...personnelData,
      id: `pers-${Date.now()}`,
    };
    setGlobalPersonnel((prev) => [...prev, newPersonnel]);
  };

  const handleEditPersonnel = (person: Personnel) => {
    setEditingPersonnel(person);
    setIsPersonnelFormOpen(true);
  };

  const handleUpdatePersonnel = async (
    personnelData: Omit<Personnel, "id">,
  ) => {
    if (!editingPersonnel) return;

    setGlobalPersonnel((prev) =>
      prev.map((p) =>
        p.id === editingPersonnel.id
          ? { ...personnelData, id: editingPersonnel.id }
          : p,
      ),
    );
    setEditingPersonnel(undefined);
  };

  const handleCreateTeam = async (
    teamData: Omit<Team, "id" | "fechaCreacion">,
  ) => {
    if (!selectedIncident) return;
    
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      fechaCreacion: new Date().toISOString(),
    };
    
    // Agregar el equipo al estado global
    setGlobalTeams((prev) => [...prev, newTeam]);
    
    // Agregar evento al timeline
    const timelineEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      incidentId: selectedIncident.id,
      type: "team_created",
      timestamp: new Date().toISOString(),
      user: {
        id: "current",
        name: "Usuario Actual",
        role: "Comandante",
        avatar: "",
      },
      description: `Grupo "${newTeam.nombre}" creado`,
      details: { teamId: newTeam.id },
    };

    // Asociar el equipo al incidente actual y agregar evento al timeline en una sola llamada
    const currentTeams = selectedIncident.equiposAsignados || [];
    const updatedTeamIds = [...currentTeams, newTeam.id];
    const currentTimeline = selectedIncident.timelineEventos || [];
    const updatedTimeline = [timelineEvent, ...currentTimeline];
    
    // Actualizar selectedIncident inmediatamente para evitar parpadeos
    setSelectedIncident((prev) => prev ? {
      ...prev,
      equiposAsignados: updatedTeamIds,
      timelineEventos: updatedTimeline,
    } : null);
    
    await updateIncidentResources(selectedIncident.id, {
      equiposAsignados: updatedTeamIds,
      timelineEventos: updatedTimeline,
    });
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setIsTeamFormOpen(true);
  };

  const handleUpdateTeam = async (
    teamData: Omit<Team, "id" | "fechaCreacion">,
  ) => {
    if (!editingTeam || !selectedIncident) return;

    setGlobalTeams((prev) =>
      prev.map((t) =>
        t.id === editingTeam.id
          ? {
              ...teamData,
              id: editingTeam.id,
              fechaCreacion: editingTeam.fechaCreacion,
            }
          : t,
      ),
    );
    
    // Agregar evento al timeline
    const timelineEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      incidentId: selectedIncident.id,
      type: "team_updated",
      timestamp: new Date().toISOString(),
      user: {
        id: "current",
        name: "Usuario Actual",
        role: "Comandante",
        avatar: "",
      },
      description: `Grupo "${teamData.nombre}" actualizado`,
      details: { teamId: editingTeam.id },
    };

    const currentTimeline = selectedIncident.timelineEventos || [];
    await updateIncidentResources(selectedIncident.id, {
      timelineEventos: [timelineEvent, ...currentTimeline],
    });
    
    setEditingTeam(undefined);
  };

  // Función específica para actualizar team por ID (usado en drag & drop)
  // Acepta un callback que recibe el team actual y retorna las actualizaciones
  // O acepta directamente un objeto Partial<Team> para compatibilidad
  const handleUpdateTeamById = async (
    teamId: string,
    updaterOrUpdates:
      | ((currentTeam: Team) => Partial<Team>)
      | Partial<Team>,
  ) => {
    console.log("🔄 Actualizando equipo:", teamId);
    setGlobalTeams((prev) => {
      const updated = prev.map((t) => {
        if (t.id === teamId) {
          // Si es una función, llamarla con el team actual
          const updates =
            typeof updaterOrUpdates === "function"
              ? updaterOrUpdates(t)
              : updaterOrUpdates;

          console.log("   Estado anterior:", {
            lider: t.lider?.nombre,
            miembros: t.miembros.map((m) => m.nombre),
          });
          console.log("   Actualizaciones:", updates);
          const newTeam = { ...t, ...updates };
          console.log("   Estado nuevo:", {
            lider: newTeam.lider?.nombre,
            miembros: newTeam.miembros.map((m) => m.nombre),
          });
          return newTeam;
        }
        return t;
      });
      return updated;
    });
  };

  const handleClosePersonnelForm = () => {
    setIsPersonnelFormOpen(false);
    setEditingPersonnel(undefined);
  };

  const handleCloseTeamForm = () => {
    setIsTeamFormOpen(false);
    setEditingTeam(undefined);
  };

  // Handlers para QR Access específicos del incidente
  const handleGenerateQR = async (config: any) => {
    if (!selectedIncident) return;

    const accessCode = Math.random()
      .toString(36)
      .substr(2, 8)
      .toUpperCase();
    const validUntil = new Date(
      Date.now() + config.validHours * 60 * 60 * 1000,
    );

    const newQRAccess: QRAccess = {
      id: `qr-${Date.now()}`,
      incidentId: selectedIncident.id,
      qrCode: `qr-data-${accessCode}`,
      accessCode,
      validUntil,
      maxPersonnel: config.maxPersonnel,
      registeredPersonnel: [],
      createdAt: new Date(),
      createdBy: "Usuario Actual",
      active: true,
      allowedRoles: config.allowedRoles,
    };

    const currentQRAccesses = selectedIncident.accesosQR || [];
    await updateIncidentResources(selectedIncident.id, {
      accesosQR: [...currentQRAccesses, newQRAccess],
    });

    return newQRAccess;
  };

  const handleRegenerateQR = async (
    oldQRId: string,
    config: any,
  ) => {
    if (!selectedIncident) return;

    const currentQRAccesses = selectedIncident.accesosQR || [];
    const oldQR = currentQRAccesses.find(
      (qr) => qr.id === oldQRId,
    );

    if (!oldQR) {
      throw new Error("QR no encontrado");
    }

    // Generar nuevo código de acceso
    const accessCode = Math.random()
      .toString(36)
      .substr(2, 8)
      .toUpperCase();
    const validUntil = new Date(
      Date.now() + config.validHours * 60 * 60 * 1000,
    );

    // Crear nuevo QR manteniendo el personal registrado del anterior
    const newQRAccess: QRAccess = {
      id: `qr-${Date.now()}`,
      incidentId: selectedIncident.id,
      qrCode: `qr-data-${accessCode}`,
      accessCode,
      validUntil,
      maxPersonnel: config.maxPersonnel,
      registeredPersonnel: oldQR.registeredPersonnel, // Mantener personal registrado
      createdAt: new Date(),
      createdBy: "Usuario Actual",
      active: true,
      allowedRoles: config.allowedRoles,
    };

    // Desactivar el QR anterior y agregar el nuevo
    const updatedQRAccesses = currentQRAccesses.map((qr) =>
      qr.id === oldQRId ? { ...qr, active: false } : qr,
    );

    // Crear evento de timeline
    const timelineEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      incidentId: selectedIncident.id,
      type: "status_change",
      timestamp: new Date().toISOString(),
      user: {
        id: "current",
        name: "Usuario Actual",
        role: "Comandante",
        avatar: "",
      },
      description: `Código QR regenerado (anterior: ${oldQR.accessCode}, nuevo: ${accessCode})`,
      details: {
        oldCode: oldQR.accessCode,
        newCode: accessCode,
      },
    };

    const currentTimeline =
      selectedIncident.timelineEventos || [];

    // Actualizar ambos en una sola llamada para evitar sobrescritura
    await updateIncidentResources(selectedIncident.id, {
      accesosQR: [...updatedQRAccesses, newQRAccess],
      timelineEventos: [timelineEvent, ...currentTimeline],
    });

    return newQRAccess;
  };

  // Handler para registrar personal mediante QR (usado desde el formulario público)
  const handleRegisterPersonnelViaQR = async (
    accessCode: string,
    personnelData: any,
  ) => {
    // Buscar el incidente que tiene este código QR
    const incident = incidents.find((inc) => {
      const qrAccesses = inc.accesosQR || [];
      return qrAccesses.some(
        (qr) =>
          qr.active &&
          qr.accessCode === accessCode.toUpperCase() &&
          new Date(qr.validUntil) > new Date(),
      );
    });

    if (!incident) {
      throw new Error("Código de acceso inválido o expirado");
    }

    const currentQRAccesses = incident.accesosQR || [];
    const qrAccess = currentQRAccesses.find(
      (qr) =>
        qr.active &&
        qr.accessCode === accessCode.toUpperCase() &&
        new Date(qr.validUntil) > new Date(),
    );

    if (!qrAccess) {
      throw new Error("Código de acceso inválido o expirado");
    }

    if (
      qrAccess.maxPersonnel &&
      qrAccess.registeredPersonnel.length >=
        qrAccess.maxPersonnel
    ) {
      throw new Error(
        "Se ha alcanzado el límite máximo de personal para este incidente",
      );
    }

    const newEntry = {
      id: `entry-${Date.now()}`,
      ...personnelData,
      registeredAt: new Date(),
    };

    const updatedQRAccesses = currentQRAccesses.map((qr) =>
      qr.id === qrAccess.id
        ? {
            ...qr,
            registeredPersonnel: [
              ...qr.registeredPersonnel,
              newEntry,
            ],
          }
        : qr,
    );

    await updateIncidentResources(incident.id, {
      accesosQR: updatedQRAccesses,
    });

    return incident;
  };

  // Handlers para CRUD de personal QR
  const handleAddQRPersonnel = async (personnelData: any) => {
    if (!selectedIncident) return;

    const newEntry = {
      id: `manual-${Date.now()}`,
      ...personnelData,
      registeredAt: new Date(),
    };

    const currentQRAccesses = selectedIncident.accesosQR || [];

    // Si no hay QR accesses, crear uno por defecto para personal manual
    if (currentQRAccesses.length === 0) {
      const defaultQR = {
        id: `qr-manual-${Date.now()}`,
        incidentId: selectedIncident.id,
        qrCode: "manual-entry",
        accessCode: "MANUAL",
        validUntil: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ), // 1 año
        registeredPersonnel: [newEntry],
        createdAt: new Date(),
        createdBy: "Sistema",
        active: true,
      };

      await updateIncidentResources(selectedIncident.id, {
        accesosQR: [defaultQR],
      });
    } else {
      // Agregar al primer QR access activo o crear uno nuevo
      const activeQR =
        currentQRAccesses.find((qr) => qr.active) ||
        currentQRAccesses[0];

      const updatedQRAccesses = currentQRAccesses.map((qr) =>
        qr.id === activeQR.id
          ? {
              ...qr,
              registeredPersonnel: [
                ...qr.registeredPersonnel,
                newEntry,
              ],
            }
          : qr,
      );

      await updateIncidentResources(selectedIncident.id, {
        accesosQR: updatedQRAccesses,
      });
    }
  };

  const handleUpdateQRPersonnel = async (
    personnelId: string,
    personnelData: any,
  ) => {
    if (!selectedIncident) return;

    const currentQRAccesses = selectedIncident.accesosQR || [];

    const updatedQRAccesses = currentQRAccesses.map((qr) => ({
      ...qr,
      registeredPersonnel: qr.registeredPersonnel.map((p) =>
        p.id === personnelId ? { ...p, ...personnelData } : p,
      ),
    }));

    await updateIncidentResources(selectedIncident.id, {
      accesosQR: updatedQRAccesses,
    });

    // Si el estado cambió a "inactivo", remover de todos los grupos
    if (personnelData.estado === "inactivo") {
      const teamsToUpdate = globalTeams.filter(
        (team) =>
          team.lider?.id === personnelId ||
          team.miembros.some((m) => m.id === personnelId),
      );

      for (const team of teamsToUpdate) {
        let updates: Partial<Team> = {};

        // Remover como líder si es el líder
        if (team.lider?.id === personnelId) {
          updates.lider = undefined;
        }

        // Remover de miembros si está en la lista
        if (team.miembros.some((m) => m.id === personnelId)) {
          updates.miembros = team.miembros.filter(
            (m) => m.id !== personnelId,
          );
        }

        // Actualizar el equipo si hay cambios
        if (Object.keys(updates).length > 0) {
          setGlobalTeams((prev) =>
            prev.map((t) =>
              t.id === team.id ? { ...t, ...updates } : t,
            ),
          );
        }
      }

      toast.info(
        `Agente removido de todos los grupos por estar inactivo`,
      );
    }
  };

  const handleDeleteQRPersonnel = async (
    personnelId: string,
  ) => {
    if (!selectedIncident) return;

    const currentQRAccesses = selectedIncident.accesosQR || [];

    const updatedQRAccesses = currentQRAccesses.map((qr) => ({
      ...qr,
      registeredPersonnel: qr.registeredPersonnel.filter(
        (p) => p.id !== personnelId,
      ),
    }));

    await updateIncidentResources(selectedIncident.id, {
      accesosQR: updatedQRAccesses,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            Cargando sistema DUAR...
          </p>
        </div>
      </div>
    );
  }

  // Función para seleccionar un incidente
  const handleSelectIncident = (incident: Incident) => {
    // Buscar la versión más actualizada del incidente desde el array de incidentes
    const updatedIncident = incidents.find((i) => i.id === incident.id) || incident;
    setSelectedIncident(updatedIncident);
    setActiveView("personnel"); // Cambiar a la primera vista disponible o mantener el menú
  };

  // Función para volver al selector de incidentes
  const handleBackToSelector = () => {
    setSelectedIncident(null);
    setActiveView("selector");
  };

  // Función para editar el incidente actual
  const handleEditCurrentIncident = () => {
    if (selectedIncident) {
      setEditingIncident(selectedIncident);
      setIsFormOpen(true);
    }
  };

  const renderContent = () => {
    // Si no hay incidente seleccionado, mostrar el selector
    if (!selectedIncident) {
      return (
        <IncidentSelector
          incidents={incidents}
          stats={stats}
          onSelectIncident={handleSelectIncident}
          onCreateNew={() => setIsFormOpen(true)}
          onEditIncident={handleEditIncident}
        />
      );
    }

    // Si hay incidente seleccionado, mostrar vistas específicas del incidente
    switch (activeView) {
      case "dashboard":
        return (
          <FirefighterDashboard
            incidents={[selectedIncident]}
            stats={stats}
            selectedIncident={selectedIncident}
            onUpdateIncident={(updates) =>
              updateIncidentResources(
                selectedIncident.id,
                updates,
              )
            }
          />
        );
      case "personnel":
        return (
          <Tabs
            key="personnel-tabs"
            defaultValue="personnel"
            className="w-full"
          >
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="personnel">
                Personal
              </TabsTrigger>
              <TabsTrigger value="groups">
                Grupos de Rastrillaje
              </TabsTrigger>
              <TabsTrigger value="qr">QR</TabsTrigger>
            </TabsList>

            <TabsContent value="personnel" className="mt-6">
              <QRPersonnelManager
                qrAccesses={getIncidentQRAccesses(
                  selectedIncident,
                )}
                onAddPersonnel={handleAddQRPersonnel}
                onUpdatePersonnel={handleUpdateQRPersonnel}
                onDeletePersonnel={handleDeleteQRPersonnel}
              />
            </TabsContent>

            <TabsContent value="qr" className="mt-6">
              <QRIncidentAccess
                incident={selectedIncident}
                onGenerateQR={handleGenerateQR}
                onRegenerateQR={handleRegenerateQR}
                qrAccesses={getIncidentQRAccesses(
                  selectedIncident,
                )}
              />
            </TabsContent>

            <TabsContent value="groups" className="mt-6">
              <GroupManager
                personnel={(() => {
                  // Combinar personal global con personal QR del incidente
                  const qrPersonnel = (
                    selectedIncident.accesosQR || []
                  )
                    .flatMap(
                      (qr) => qr.registeredPersonnel || [],
                    )
                    .map(
                      (qrPerson) =>
                        ({
                          id: qrPerson.id,
                          numeroPlaca: qrPerson.dni || "N/A",
                          nombre: qrPerson.nombre,
                          apellido: qrPerson.apellido,
                          dni: qrPerson.dni,
                          telefono: qrPerson.telefono,
                          email: "",
                          organizacion: qrPerson.institucion,
                          jerarquia: qrPerson.rol,
                          tipoAgente: "externo" as const,
                          especialidad: [qrPerson.rol],
                          estado: (qrPerson.estado === "activo"
                            ? "Activo"
                            : "Inactivo") as any,
                          turno: "Mañana" as any,
                          disponible:
                            qrPerson.estado === "activo",
                          grupoSanguineo:
                            qrPerson.grupoSanguineo,
                          alergias: qrPerson.alergias,
                          certificaciones: [],
                          fechaIngreso:
                            new Date().toISOString(),
                        }) as Personnel,
                    );

                  return [...globalPersonnel, ...qrPersonnel];
                })()}
                teams={getIncidentTeams(selectedIncident)}
                onCreateTeam={handleCreateTeam}
                onUpdateTeam={handleUpdateTeam}
                onUpdateTeamById={handleUpdateTeamById}
                onLoadGPX={(teamId) => {
                  // Cambiar a la pestaña de mapa/polígonos donde está el botón de cargar GPX
                  toast.info("Ve a la pestaña 'Polígonos' para cargar trazas GPX desde el mapa");
                  setActiveView("map");
                }}
                onDeleteTeam={async (teamId) => {
                  // Remover del estado global
                  setGlobalTeams((prev) =>
                    prev.filter((t) => t.id !== teamId),
                  );
                  
                  // Agregar evento al timeline
                  const timelineEvent: TimelineEvent = {
                    id: Math.random().toString(36).substr(2, 9),
                    incidentId: selectedIncident.id,
                    type: "team_deleted",
                    timestamp: new Date().toISOString(),
                    user: {
                      id: "current",
                      name: "Usuario Actual",
                      role: "Comandante",
                      avatar: "",
                    },
                    description: `Grupo eliminado del incidente`,
                    details: { teamId },
                  };
                  
                  // Remover del incidente actual y agregar evento en una sola llamada
                  const currentTeams = selectedIncident.equiposAsignados || [];
                  const updatedTeamIds = currentTeams.filter(id => id !== teamId);
                  const currentTimeline = selectedIncident.timelineEventos || [];
                  const updatedTimeline = [timelineEvent, ...currentTimeline];
                  
                  // Actualizar selectedIncident inmediatamente para evitar parpadeos
                  setSelectedIncident((prev) => prev ? {
                    ...prev,
                    equiposAsignados: updatedTeamIds,
                    timelineEventos: updatedTimeline,
                  } : null);
                  
                  await updateIncidentResources(selectedIncident.id, {
                    equiposAsignados: updatedTeamIds,
                    timelineEventos: updatedTimeline,
                  });
                }}
                incidentId={selectedIncident.id}
              />
            </TabsContent>
          </Tabs>
        );
      case "map":
        return (
          <Tabs
            key="map-tabs"
            defaultValue="main"
            className="w-full"
          >
            <TabsList className="grid w-full max-w-3xl grid-cols-3">
              <TabsTrigger value="main">Mapa</TabsTrigger>
              <TabsTrigger value="draw">
                Polígonos
              </TabsTrigger>
              <TabsTrigger value="zones">
                Zonas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="mt-6">
              <IncidentMap
                incidents={[selectedIncident]}
                teams={getIncidentTeams(selectedIncident)}
                onIncidentSelect={() => {}}
                selectedIncident={selectedIncident}
                centerOnIncident={true}
              />
            </TabsContent>

            <TabsContent value="draw" className="mt-6">
              <MapDrawTools
                teams={getIncidentTeams(selectedIncident)}
                punto0={selectedIncident.punto0 ? {
                  lat: selectedIncident.punto0.lat,
                  lng: selectedIncident.punto0.lng,
                  direccion: selectedIncident.punto0.direccion
                } : null}
                onPunto0Update={async (punto0) => {
                  console.log("Punto 0 actualizado:", punto0);
                  try {
                    // Actualizar el incidente con el nuevo punto 0
                    const updatedIncident = {
                      ...selectedIncident,
                      punto0: {
                        lat: punto0.lat,
                        lng: punto0.lng,
                        direccion: punto0.direccion || '',
                        zona: selectedIncident.punto0?.zona,
                        fechaHora: new Date()
                      }
                    };
                    
                    await updateIncident(selectedIncident.id, updatedIncident);
                    setSelectedIncident(updatedIncident);
                    toast.success('Punto 0 actualizado exitosamente');
                  } catch (error) {
                    console.error('Error al actualizar Punto 0:', error);
                    toast.error('Error al actualizar el Punto 0');
                  }
                }}
                onShapeCreated={(shape) => {
                  console.log("Forma dibujada:", shape);
                  toast.success(`Polígono creado: ${shape.measurement?.area?.toFixed(2) || 0} hectáreas`);
                }}
                onMeasurement={(measurement) => {
                  if (measurement.area) {
                    console.log("Área medida:", measurement.area, "ha");
                  }
                  if (measurement.distance) {
                    console.log("Distancia medida:", measurement.distance, "km");
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="zones" className="mt-6">
              <SearchAreaPlanner
                teams={getIncidentTeams(selectedIncident)}
                personnel={getIncidentPersonnel(
                  selectedIncident,
                )}
                incident={selectedIncident}
                onZoneAssignment={(zoneId, teamId) => {
                  console.log(
                    "Zona asignada:",
                    zoneId,
                    "a equipo:",
                    teamId,
                  );
                }}
                onZoneUpdate={(zone) => {
                  console.log("Zona actualizada:", zone);
                }}
              />
            </TabsContent>
          </Tabs>
        );
      case "weather":
        return <WeatherDashboard incidentId={selectedIncident.id} />;
      case "reports":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Módulo de Reportes
              </CardTitle>
              <CardDescription>
                Sistema de reportes y análisis en desarrollo...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  El módulo de reportes se encuentra en desarrollo.
                  Próximamente estará disponible con generación de reportes automáticos, análisis estadísticos y exportación de datos del incidente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );
      case "files":
        return (
          <IncidentFiles
            incidentId={selectedIncident.id}
            files={getIncidentFiles(selectedIncident)}
            onFileUpload={handleFileUpload}
            onFileDelete={handleFileDelete}
          />
        );
      case "timeline":
        return (
          <IncidentTimeline
            incidentId={selectedIncident.id}
            events={getIncidentTimeline(selectedIncident)}
            onAddComment={handleAddComment}
            currentUser={{
              id: "current",
              name: "Comandante Torres",
              role: "Comandante de Guardia",
              avatar: "",
            }}
          />
        );
      default:
        return (
          <FirefighterDashboard
            incidents={[selectedIncident]}
            stats={stats}
            selectedIncident={selectedIncident}
            onUpdateIncident={(updates) =>
              updateIncidentResources(
                selectedIncident.id,
                updates,
              )
            }
          />
        );
    }
  };

  return (
    <AuthProvider>
      <DndProvider backend={dndBackend}>
        <PublicRegistrationRouter
          incidents={incidents}
          onRegisterPersonnel={handleRegisterPersonnelViaQR}
        >
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              {/* Sidebar */}
              <Sidebar
                collapsible="icon"
                className="border-r border-border"
              >
                <FirefighterSidebar
                  activeView={activeView}
                  onViewChange={setActiveView}
                  selectedIncident={selectedIncident}
                  onBackToSelector={handleBackToSelector}
                  incidentsCount={incidents.length}
                  filesCount={
                    selectedIncident
                      ? selectedIncident.archivosEvidencia
                          ?.length || 0
                      : 0
                  }
                  timelineCount={
                    selectedIncident
                      ? selectedIncident.timelineEventos
                          ?.length || 0
                      : 0
                  }
                />
              </Sidebar>

              {/* Main Content */}
              <SidebarInset className="flex-1">
                {/* Error Alert */}
                {error && (
                  <div className="p-6">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.location.reload()
                          }
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reintentar
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Header contextual */}
                {selectedIncident ? (
                  <IncidentContextHeader
                    incident={selectedIncident}
                    onBackToSelector={handleBackToSelector}
                    onEditIncident={handleEditCurrentIncident}
                    activeView={activeView}
                  />
                ) : (
                  <>
                    <FirefighterHeader
                      activeView={activeView}
                      loading={localLoading}
                      hasIncidents={incidents.length > 0}
                      hasError={!!error}
                    />
                    <FirefighterBreadcrumbs
                      activeView={activeView}
                      onNavigate={setActiveView}
                    />
                  </>
                )}

                {/* Contenido principal */}
                <div className="p-4 animate-in fade-in-50 duration-200">
                  {renderContent()}
                </div>
              </SidebarInset>

              {/* Formulario de incidente */}
              <IncidentForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={
                  editingIncident
                    ? handleUpdateIncident
                    : handleCreateIncident
                }
                incident={editingIncident}
                mode={editingIncident ? "edit" : "create"}
                technicians={technicians || []}
              />

              {/* Formulario de personal */}
              <PersonnelForm
                isOpen={isPersonnelFormOpen}
                onClose={handleClosePersonnelForm}
                onSubmit={
                  editingPersonnel
                    ? handleUpdatePersonnel
                    : handleCreatePersonnel
                }
                personnel={editingPersonnel}
                mode={editingPersonnel ? "edit" : "create"}
              />

              {/* Formulario de equipo */}
              <TeamForm
                isOpen={isTeamFormOpen}
                onClose={handleCloseTeamForm}
                onSubmit={
                  editingTeam
                    ? handleUpdateTeam
                    : handleCreateTeam
                }
                team={editingTeam}
                mode={editingTeam ? "edit" : "create"}
                availablePersonnel={globalPersonnel.filter(
                  (p) => p.disponible && p.estado === "Activo",
                )}
              />
            </div>
          </SidebarProvider>
          <Toaster
            position="top-right"
            expand={true}
            richColors
            closeButton
          />
        </PublicRegistrationRouter>
      </DndProvider>
    </AuthProvider>
  );
}