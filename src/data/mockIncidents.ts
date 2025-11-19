import { Incident, IncidentStats } from '../types/incident';

export const mockIncidents: Incident[] = [
  {
    id: '1',
    titulo: 'Persona desaparecida en Cerro de las Rosas',
    descripcion: 'Hombre de 45 años desaparecido durante excursión en las sierras de Córdoba. Familia reporta que no regresó a la hora acordada. Última comunicación fue a las 14:30 horas informando que había llegado a la cumbre.',
    estado: 'activo',
    prioridad: 'critico',
    categoria: 'persona',
    denunciante: {
      nombre: 'María',
      apellido: 'Rodríguez',
      dni: '12345678',
      telefono: '+54 351 765 4321',
      email: 'maria.rodriguez@email.com',
      direccion: 'Av. Colón 1234, Córdoba',
      relacion: 'Esposa'
    },
    jefeDotacion: 'Comandante Carlos Méndez',
    fechaCreacion: new Date('2024-12-15T18:30:00'),
    fechaActualizacion: new Date('2024-12-15T19:15:00'),
    punto0: {
      lat: -31.3851,
      lng: -64.2351,
      direccion: 'Sendero Principal Cerro de las Rosas',
      zona: 'Sierras Chicas, Sector Norte',
      fechaHora: new Date('2024-12-15T14:30:00')
    },
    personaDesaparecida: {
      nombre: 'Roberto',
      apellido: 'González',
      edad: 45,
      genero: 'masculino',
      descripcionFisica: 'Altura aproximada 1.75m, complexión media, cabello castaño corto con algunas canas, ojos marrones. Barba corta. Sin señas particulares visibles.',
      ultimaVezVisto: {
        fecha: new Date('2024-12-15T14:30:00'),
        ubicacion: 'Cumbre Cerro de las Rosas',
        coordenadas: { lat: -31.3851, lng: -64.2351 }
      },
      vestimenta: 'Chaqueta impermeable azul oscuro, pantalón de trekking gris, botas de montaña marrones, mochila roja de 40 litros, gorro de lana negro.',
      condicionesMedicas: 'Hipertensión controlada con medicación. No presenta otras condiciones médicas relevantes.',
      medicamentos: 'Losartán 50mg (toma una pastilla en la mañana)',
      foto: 'https://images.unsplash.com/photo-1678885209991-65b899332b71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlcnNvbiUyMG1pc3Npbmd8ZW58MXx8fHwxNzU3MTcxMDM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      contactoFamiliar: {
        nombre: 'María Rodríguez',
        telefono: '+56 9 8765 4321',
        relacion: 'Esposa'
      }
    },
    comentarios: [
      {
        id: '1',
        incidentId: '1',
        autor: 'Comandante Carlos Méndez',
        contenido: 'Iniciando operación SAR. Equipo Alpha desplegado al sector norte. Condiciones meteorológicas estables.',
        fecha: new Date('2024-12-15T19:15:00')
      }
    ],
    personalAsignado: ['pers-001', 'pers-002', 'pers-003'],
    equiposAsignados: ['team-001'],
    accesosQR: [
      {
        id: 'qr-1',
        incidentId: '1',
        qrCode: 'qr-data-B957X3NT',
        accessCode: 'B957X3NT',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año desde ahora
        registeredPersonnel: [],
        createdAt: new Date('2024-12-15T18:30:00'),
        createdBy: 'Comandante Carlos Méndez',
        active: true
      }
    ]
  },
  {
    id: '2',
    titulo: 'Búsqueda en zona urbana - Menor extraviado',
    descripcion: 'Menor de 8 años extraviado en centro comercial Patio Olmos. Los padres informan que el niño se alejó mientras hacían compras. Personal de seguridad del mall colabora en la búsqueda.',
    estado: 'activo',
    prioridad: 'grave',
    categoria: 'persona',
    denunciante: {
      nombre: 'Juan',
      apellido: 'García',
      dni: '23456789',
      telefono: '+54 351 654 3210',
      email: 'juan.garcia@email.com',
      direccion: 'Patio Olmos, Av. Vélez Sarsfield 361',
      relacion: 'Padre'
    },
    jefeDotacion: 'Capitán Ana García',
    fechaCreacion: new Date('2024-12-15T16:20:00'),
    fechaActualizacion: new Date('2024-12-15T17:45:00'),
    punto0: {
      lat: -31.4201,
      lng: -64.1888,
      direccion: 'Patio Olmos, Av. Vélez Sarsfield 361',
      zona: 'Centro Comercial - Nivel 2',
      fechaHora: new Date('2024-12-15T16:20:00')
    },
    comentarios: [
      {
        id: '2',
        incidentId: '2',
        autor: 'Capitán Ana García',
        contenido: 'Coordinando con seguridad del mall. Revisando cámaras de seguridad. Equipo Bravo desplegado.',
        fecha: new Date('2024-12-15T17:45:00')
      }
    ],
    personalAsignado: ['pers-004', 'pers-005'],
    equiposAsignados: ['team-002'],
    accesosQR: [
      {
        id: 'qr-2',
        incidentId: '2',
        qrCode: 'qr-data-XY98K4LM',
        accessCode: 'XY98K4LM',
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        registeredPersonnel: [],
        createdAt: new Date('2024-12-15T16:20:00'),
        createdBy: 'Capitán Ana García',
        active: true
      }
    ]
  },
  {
    id: '3',
    titulo: 'Búsqueda de evidencia en caso judicial',
    descripcion: 'Solicitud fiscal para búsqueda de evidencia en área forestal relacionada con investigación criminal. Se requiere rastrillaje sistemático del área designada.',
    estado: 'inactivo',
    prioridad: 'grave',
    categoria: 'colaboracion_judicial',
    fiscalSolicitante: {
      nombre: 'Ana',
      apellido: 'Martínez',
      fiscalia: 'Fiscalía de Instrucción de Córdoba - 3ra Nominación',
      expediente: 'SAC-2024-001234',
      telefono: '+54 351 476 8900',
      email: 'ana.martinez@justiciacordoba.gob.ar'
    },
    jefeDotacion: 'Comandante Pedro López',
    fechaCreacion: new Date('2024-12-14T14:30:00'),
    fechaActualizacion: new Date('2024-12-14T17:15:00'),
    fechaResolucion: new Date('2024-12-14T17:15:00'),
    punto0: {
      lat: -31.3990,
      lng: -64.2428,
      direccion: 'Parque Sarmiento - Sector Bosque',
      zona: 'Área forestal protegida',
      fechaHora: new Date('2024-12-14T14:30:00')
    },
    comentarios: [
      {
        id: '3',
        incidentId: '3',
        autor: 'Comandante Pedro López',
        contenido: 'Rescate exitoso. Víctima estabilizada y trasladada al Hospital UC.',
        fecha: new Date('2024-12-14T17:15:00')
      }
    ],
    personalAsignado: ['pers-006', 'pers-007', 'pers-008', 'pers-009'],
    equiposAsignados: ['team-003']
  },
  {
    id: '4',
    titulo: 'Búsqueda de embarcación perdida en Río Suquía',
    descripcion: 'Kayak con equipo personal perdido durante actividad recreativa en el Río Suquía. La embarcación se separó del grupo cerca del Puente Sarmiento y contiene documentos personales importantes.',
    estado: 'activo',
    prioridad: 'critico',
    categoria: 'objeto',
    denunciante: {
      nombre: 'Luis',
      apellido: 'Morales',
      dni: '34567890',
      telefono: '+54 351 543 2109',
      email: 'luis.morales@email.com',
      direccion: 'Club de Kayak Córdoba, Río Suquía',
      relacion: 'Instructor del club'
    },
    jefeDotacion: 'Capitán Roberto Silva',
    fechaCreacion: new Date('2024-12-15T15:45:00'),
    fechaActualizacion: new Date('2024-12-15T18:20:00'),
    punto0: {
      lat: -31.4135,
      lng: -64.1795,
      direccion: 'Río Suquía, Puente Sarmiento',
      zona: 'Sector ribereño, Parque del Kempes',
      fechaHora: new Date('2024-12-15T15:45:00')
    },
    comentarios: [
      {
        id: '4',
        incidentId: '4',
        autor: 'Capitán Roberto Silva',
        contenido: 'Desplegando equipo de rescate acuático. Helicóptero en ruta para reconocimiento aéreo.',
        fecha: new Date('2024-12-15T18:20:00')
      }
    ],
    personalAsignado: ['pers-010', 'pers-011', 'pers-012'],
    equiposAsignados: ['team-004']
  },
  {
    id: '5',
    titulo: 'Búsqueda rural - Adulto mayor perdido',
    descripcion: 'Adulto mayor de 78 años con principios de demencia extraviado en zona rural de Villa Carlos Paz. Familia reporta que salió de casa en la madrugada y no ha sido localizado.',
    estado: 'finalizado',
    prioridad: 'alta',
    categoria: 'persona',
    reportadoPor: 'Familia González',
    asignadoA: 'Teniente María Fernández',
    fechaCreacion: new Date('2024-12-13T06:30:00'),
    fechaActualizacion: new Date('2024-12-13T14:45:00'),
    fechaResolucion: new Date('2024-12-13T14:45:00'),
    punto0: {
      lat: -31.4245,
      lng: -64.4970,
      direccion: 'Zona Rural - Camino a La Cuesta',
      zona: 'Sector Rural, Villa Carlos Paz',
      fechaHora: new Date('2024-12-13T06:30:00')
    },
    comentarios: [
      {
        id: '5',
        incidentId: '5',
        autor: 'Teniente María Fernández',
        contenido: 'Persona localizada sana y salva a 2 km de su domicilio. Trasladada de vuelta con familia.',
        fecha: new Date('2024-12-13T14:45:00')
      }
    ],
    personalAsignado: ['pers-013', 'pers-014'],
    equiposAsignados: ['team-005']
  }
];

export const mockStats: IncidentStats = {
  total: 5,
  activos: 3,
  inactivos: 1,
  finalizados: 1
};