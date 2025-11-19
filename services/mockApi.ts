
import { Equipo, EstadoEquipo, RolUsuario, Usuario, ReporteGarantia, Notificacion, TipoEquipo, HistorialMovimiento, Departamento, Puesto, HistorialAsignacion, RegistroMantenimiento, TipoLicencia, Licencia } from '../types';
import { liveApi } from './liveApi';

// --- CONFIGURACIÓN DEL BACKEND ---
// Cambia esto a TRUE cuando tengas tu backend Laravel corriendo en localhost:8000
const USE_LIVE_API = false; 
// ---------------------------------

// --- Mock Data Initialization ---

let MOCK_DEPARTAMENTOS: Departamento[] = [
  { id: 1, nombre: 'Tecnología (IT)' },
  { id: 2, nombre: 'Recursos Humanos' },
  { id: 3, nombre: 'Ventas' },
  { id: 4, nombre: 'Finanzas' }
];

let MOCK_PUESTOS: Puesto[] = [
  { id: 1, nombre: 'Gerente' },
  { id: 2, nombre: 'Desarrollador' },
  { id: 3, nombre: 'Analista' },
  { id: 4, nombre: 'Vendedor' },
  { id: 5, nombre: 'Soporte Técnico' }
];

// Helper to build full name
const buildName = (n: string, a: string) => `${n} ${a}`;

let MOCK_USERS: Usuario[] = [
  { id: 1, nombre_usuario: 'admin', nombres: 'Admin', apellidos: 'Sistema', nombre_completo: 'Admin Sistema', correo: 'admin@sys.com', password: '123', rol: RolUsuario.ADMIN, departamento_id: 1, departamento_nombre: 'Tecnología (IT)', puesto_id: 1, puesto_nombre: 'Gerente', activo: true },
  { id: 2, nombre_usuario: 'tecnico1', nombres: 'Juan', apellidos: 'Técnico', nombre_completo: 'Juan Técnico', correo: 'juan@sys.com', password: '123', rol: RolUsuario.TECNICO, departamento_id: 1, departamento_nombre: 'Tecnología (IT)', puesto_id: 5, puesto_nombre: 'Soporte Técnico', activo: true },
  { id: 3, nombre_usuario: 'empl1', nombres: 'Maria', apellidos: 'Ventas', nombre_completo: 'Maria Ventas', correo: 'maria@sys.com', password: '123', rol: RolUsuario.USUARIO, departamento_id: 3, departamento_nombre: 'Ventas', puesto_id: 4, puesto_nombre: 'Vendedor', activo: true },
];

let MOCK_TIPOS: TipoEquipo[] = [
  { id: 1, nombre: 'Laptop', descripcion: 'Computadora portátil' },
  { id: 2, nombre: 'Desktop', descripcion: 'Computadora de escritorio' },
  { id: 3, nombre: 'Monitor', descripcion: 'Pantalla externa' },
  { id: 4, nombre: 'Impresora', descripcion: 'Impresora láser o inyección' },
];

let MOCK_EQUIPOS: Equipo[] = [
  { id: 1, codigo_activo: 'EQ-2023-001', numero_serie: 'SN123456', marca: 'Dell', modelo: 'Latitude 5420', tipo_equipo_id: 1, tipo_nombre: 'Laptop', fecha_compra: '2023-01-15', valor_compra: 1200, anos_garantia: 3, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, ubicacion_nombre: 'Piso 2 - Ventas', responsable_id: 3, responsable_nombre: 'Maria Ventas', observaciones: 'Asignado a ventas' },
  { id: 2, codigo_activo: 'EQ-2021-045', numero_serie: 'SN987654', marca: 'HP', modelo: 'ProBook 450', tipo_equipo_id: 1, tipo_nombre: 'Laptop', fecha_compra: '2021-03-10', valor_compra: 900, anos_garantia: 3, estado: EstadoEquipo.DISPONIBLE, ubicacion_id: 2, ubicacion_nombre: 'Bodega IT', observaciones: 'Reingresado, listo para asignar' },
  { id: 3, codigo_activo: 'EQ-2020-012', numero_serie: 'SN456123', marca: 'Lenovo', modelo: 'ThinkCentre M720', tipo_equipo_id: 2, tipo_nombre: 'Desktop', fecha_compra: '2020-05-20', valor_compra: 800, anos_garantia: 4, estado: EstadoEquipo.EN_MANTENIMIENTO, ubicacion_id: 3, ubicacion_nombre: 'Taller Externo', observaciones: 'Falla en disco duro' },
  { id: 4, codigo_activo: 'EQ-2019-099', numero_serie: 'SN112233', marca: 'Dell', modelo: 'Optiplex 3060', tipo_equipo_id: 2, tipo_nombre: 'Desktop', fecha_compra: '2019-02-01', valor_compra: 750, anos_garantia: 3, estado: EstadoEquipo.BAJA, ubicacion_id: 4, ubicacion_nombre: 'Almacén Bajas', observaciones: 'Obsoleto, pantalla azul' },
  { id: 5, codigo_activo: 'EQ-2024-005', numero_serie: 'SN998877', marca: 'Apple', modelo: 'MacBook Air M2', tipo_equipo_id: 1, tipo_nombre: 'Laptop', fecha_compra: '2024-02-20', valor_compra: 1400, anos_garantia: 1, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, ubicacion_nombre: 'Dirección General', observaciones: '' },
  { id: 6, codigo_activo: 'EQ-2020-055', numero_serie: 'SN554433', marca: 'HP', modelo: 'EliteDisplay', tipo_equipo_id: 3, tipo_nombre: 'Monitor', fecha_compra: '2020-06-15', valor_compra: 200, anos_garantia: 3, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, ubicacion_nombre: 'Piso 2 - Ventas', observaciones: '' },
];

let MOCK_HISTORIAL: HistorialMovimiento[] = [
  { id: 1, equipo_id: 1, equipo_codigo: 'EQ-2023-001', tipo_accion: 'CREACION', fecha: '2023-01-15', usuario_responsable: 'Admin', detalle: 'Ingreso inicial al inventario' },
  { id: 2, equipo_id: 1, equipo_codigo: 'EQ-2023-001', tipo_accion: 'ASIGNACION', fecha: '2023-01-20', usuario_responsable: 'Admin', detalle: 'Asignado a Maria Ventas' },
  { id: 3, equipo_id: 2, equipo_codigo: 'EQ-2021-045', tipo_accion: 'RECEPCION', fecha: '2024-01-10', usuario_responsable: 'Admin', detalle: 'Devolución por cambio de equipo' },
];

// Specific mock for the Assignment History Report
let MOCK_ASIGNACIONES_HISTORY: HistorialAsignacion[] = [
  { id: 1, equipo_codigo: 'EQ-2021-045', equipo_modelo: 'HP ProBook 450', usuario_nombre: 'Juan Técnico', usuario_departamento: 'Tecnología (IT)', fecha_inicio: '2021-03-15', fecha_fin: '2023-12-10', ubicacion: 'Soporte Piso 1' },
  { id: 2, equipo_codigo: 'EQ-2021-045', equipo_modelo: 'HP ProBook 450', usuario_nombre: 'Maria Ventas', usuario_departamento: 'Ventas', fecha_inicio: '2024-01-15', fecha_fin: '2024-05-20', ubicacion: 'Oficina 202' },
  { id: 3, equipo_codigo: 'EQ-2023-001', equipo_modelo: 'Dell Latitude 5420', usuario_nombre: 'Maria Ventas', usuario_departamento: 'Ventas', fecha_inicio: '2023-01-20', fecha_fin: null, ubicacion: 'Piso 2 - Ventas' },
  { id: 4, equipo_codigo: 'EQ-2024-005', equipo_modelo: 'MacBook Air M2', usuario_nombre: 'Admin Sistema', usuario_departamento: 'Tecnología (IT)', fecha_inicio: '2024-02-25', fecha_fin: null, ubicacion: 'Dirección General' }
];

let MOCK_MANTENIMIENTOS: RegistroMantenimiento[] = [
  { id: 1, equipo_id: 3, equipo_codigo: 'EQ-2020-012', equipo_modelo: 'Lenovo ThinkCentre M720', fecha: '2024-04-10', tipo_mantenimiento: 'Correctivo', proveedor: 'TechSupport Inc.', costo: 120.00, descripcion: 'Cambio de disco duro por fallo mecánico.' },
  { id: 2, equipo_id: 1, equipo_codigo: 'EQ-2023-001', equipo_modelo: 'Dell Latitude 5420', fecha: '2023-11-15', tipo_mantenimiento: 'Preventivo', proveedor: 'Soporte Interno', costo: 0, descripcion: 'Limpieza interna y actualización de drivers.' },
  { id: 3, equipo_id: 2, equipo_codigo: 'EQ-2021-045', equipo_modelo: 'HP ProBook 450', fecha: '2023-06-20', tipo_mantenimiento: 'Preventivo', proveedor: 'HP Service', costo: 45.00, descripcion: 'Mantenimiento anual de garantía.' }
];

// --- Mock Data: Licenses ---
let MOCK_TIPOS_LICENCIA: TipoLicencia[] = [
  { id: 1, nombre: 'Office 365 Business', proveedor: 'Microsoft', descripcion: 'Licencia anual por usuario' },
  { id: 2, nombre: 'Adobe Creative Cloud', proveedor: 'Adobe', descripcion: 'Suite completa de diseño' },
  { id: 3, nombre: 'Antivirus ESET Endpoint', proveedor: 'ESET', descripcion: 'Protección de endpoint' },
];

let MOCK_LICENCIAS: Licencia[] = [
  // Generate some initial data
  { id: 1, tipo_id: 1, tipo_nombre: 'Office 365 Business', clave: 'KEY-OFFICE-001', fecha_compra: '2024-01-01', fecha_vencimiento: '2025-01-01', usuario_id: 3, usuario_nombre: 'Maria Ventas', usuario_departamento: 'Ventas' },
  { id: 2, tipo_id: 1, tipo_nombre: 'Office 365 Business', clave: 'KEY-OFFICE-002', fecha_compra: '2024-01-01', fecha_vencimiento: '2025-01-01', usuario_id: 1, usuario_nombre: 'Admin Sistema', usuario_departamento: 'Tecnología (IT)' },
  { id: 3, tipo_id: 1, tipo_nombre: 'Office 365 Business', clave: 'KEY-OFFICE-003', fecha_compra: '2024-01-01', fecha_vencimiento: '2025-01-01', usuario_id: null }, // Available
  { id: 4, tipo_id: 2, tipo_nombre: 'Adobe Creative Cloud', clave: 'KEY-ADOBE-001', fecha_compra: '2023-06-01', fecha_vencimiento: '2024-06-01', usuario_id: null }, // Available
];

const MOCK_NOTIFICATIONS: Notificacion[] = [
  { id: 1, title: 'Garantía por vencer', mensaje: 'El equipo EQ-2021-045 vence su garantía en 15 días.', leido: false, fecha: '2024-05-20T10:00:00', tipo: 'warning' },
  { id: 2, title: 'Mantenimiento completado', mensaje: 'El equipo EQ-2020-012 ha regresado del taller.', leido: true, fecha: '2024-05-19T14:30:00', tipo: 'info' },
] as any;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockApiImplementation = {
  login: async (email: string, password?: string): Promise<Usuario> => {
    await delay(800);
    // Simple check: find user with email and matching password
    // Default password in mock is '123'
    const user = MOCK_USERS.find(u => u.correo === email && u.password === (password || '123'));
    
    if (user && user.activo) {
      // Return user without password
      const { password, ...userWithoutPass } = user;
      return userWithoutPass as Usuario;
    }
    throw new Error("Credenciales inválidas o usuario inactivo");
  },

  changePassword: async (userId: number, newPass: string): Promise<void> => {
    await delay(500);
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      user.password = newPass;
    } else {
      throw new Error("Usuario no encontrado");
    }
  },

  // --- Organization (Departamentos / Puestos) ---
  getDepartamentos: async (): Promise<Departamento[]> => {
    await delay(300);
    return [...MOCK_DEPARTAMENTOS];
  },
  createDepartamento: async (nombre: string): Promise<Departamento> => {
    await delay(300);
    const newDept = { id: Date.now(), nombre };
    MOCK_DEPARTAMENTOS.push(newDept);
    return newDept;
  },
  updateDepartamento: async (id: number, nombre: string): Promise<Departamento> => {
    await delay(300);
    MOCK_DEPARTAMENTOS = MOCK_DEPARTAMENTOS.map(d => d.id === id ? { ...d, nombre } : d);
    return MOCK_DEPARTAMENTOS.find(d => d.id === id)!;
  },
  deleteDepartamento: async (id: number) => {
    await delay(300);
    MOCK_DEPARTAMENTOS = MOCK_DEPARTAMENTOS.filter(d => d.id !== id);
  },

  getPuestos: async (): Promise<Puesto[]> => {
    await delay(300);
    return [...MOCK_PUESTOS];
  },
  createPuesto: async (nombre: string): Promise<Puesto> => {
    await delay(300);
    const newPuesto = { id: Date.now(), nombre };
    MOCK_PUESTOS.push(newPuesto);
    return newPuesto;
  },
  updatePuesto: async (id: number, nombre: string): Promise<Puesto> => {
    await delay(300);
    MOCK_PUESTOS = MOCK_PUESTOS.map(p => p.id === id ? { ...p, nombre } : p);
    return MOCK_PUESTOS.find(p => p.id === id)!;
  },
  deletePuesto: async (id: number) => {
    await delay(300);
    MOCK_PUESTOS = MOCK_PUESTOS.filter(p => p.id !== id);
  },

  // --- Users Management ---
  getUsuarios: async (): Promise<Usuario[]> => {
    await delay(400);
    // Return users, usually you wouldn't return passwords, but for mock management we might need them or just ignore
    return MOCK_USERS.map(({ password, ...u }) => u as Usuario);
  },
  
  createUsuario: async (data: Omit<Usuario, 'id' | 'nombre_completo' | 'departamento_nombre' | 'puesto_nombre'>): Promise<Usuario> => {
    await delay(400);
    const dept = MOCK_DEPARTAMENTOS.find(d => d.id === Number(data.departamento_id));
    const puesto = MOCK_PUESTOS.find(p => p.id === Number(data.puesto_id));
    
    const newUser: Usuario = {
      ...data,
      id: Math.floor(Math.random() * 10000),
      nombre_completo: buildName(data.nombres, data.apellidos),
      departamento_nombre: dept ? dept.nombre : 'Sin Departamento',
      puesto_nombre: puesto ? puesto.nombre : 'Sin Puesto',
      password: data.password || '123456' // Set default if not provided
    };
    MOCK_USERS.push(newUser);
    return newUser;
  },

  updateUsuario: async (id: number, data: Partial<Usuario>): Promise<Usuario> => {
    await delay(400);
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index !== -1) {
      const current = MOCK_USERS[index];
      const updated = { ...current, ...data };
      
      // Logic for User Deactivation: Release Licenses
      if (current.activo === true && data.activo === false) {
         MOCK_LICENCIAS.forEach(l => {
           if (l.usuario_id === id) {
             l.usuario_id = null;
             l.usuario_nombre = undefined;
             l.usuario_departamento = undefined;
           }
         });
      }

      // Recalculate derived fields if needed
      if (data.nombres || data.apellidos) {
        updated.nombre_completo = buildName(updated.nombres, updated.apellidos);
      }
      if (data.departamento_id) {
         const dept = MOCK_DEPARTAMENTOS.find(d => d.id === Number(data.departamento_id));
         updated.departamento_nombre = dept?.nombre;
      }
      if (data.puesto_id) {
        const puesto = MOCK_PUESTOS.find(p => p.id === Number(data.puesto_id));
        updated.puesto_nombre = puesto?.nombre;
     }
      if (data.password) {
        updated.password = data.password;
      }

      MOCK_USERS[index] = updated;
      return updated;
    }
    throw new Error("Usuario no encontrado");
  },
  
  deleteUsuario: async (id: number): Promise<void> => {
    await delay(400);
    
    // Release Licenses before deleting
    MOCK_LICENCIAS.forEach(l => {
      if (l.usuario_id === id) {
        l.usuario_id = null;
        l.usuario_nombre = undefined;
        l.usuario_departamento = undefined;
      }
    });

    MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
  },

  // --- Equipment Types ---
  getTiposEquipo: async (): Promise<TipoEquipo[]> => {
    await delay(400);
    return [...MOCK_TIPOS];
  },

  createTipoEquipo: async (tipo: Omit<TipoEquipo, 'id'>): Promise<TipoEquipo> => {
    await delay(400);
    const newTipo = { ...tipo, id: Math.floor(Math.random() * 10000) };
    MOCK_TIPOS = [...MOCK_TIPOS, newTipo];
    return newTipo;
  },

  updateTipoEquipo: async (id: number, data: Partial<TipoEquipo>): Promise<TipoEquipo> => {
    await delay(400);
    MOCK_TIPOS = MOCK_TIPOS.map(t => t.id === id ? { ...t, ...data } : t);
    return MOCK_TIPOS.find(t => t.id === id)!;
  },

  deleteTipoEquipo: async (id: number): Promise<void> => {
    await delay(400);
    MOCK_TIPOS = MOCK_TIPOS.filter(t => t.id !== id);
  },

  // --- Equipment ---
  getEquipos: async (): Promise<Equipo[]> => {
    await delay(600);
    return [...MOCK_EQUIPOS];
  },

  createEquipo: async (data: Omit<Equipo, 'id'>): Promise<Equipo> => {
    await delay(500);
    const tipo = MOCK_TIPOS.find(t => t.id === Number(data.tipo_equipo_id));
    const newEquipo: Equipo = {
      ...data,
      id: Math.floor(Math.random() * 10000),
      tipo_nombre: tipo?.nombre || 'Desconocido',
      ubicacion_nombre: 'Bodega Central', // Default
      estado: EstadoEquipo.DISPONIBLE
    };
    MOCK_EQUIPOS = [newEquipo, ...MOCK_EQUIPOS];
    
    // Add History
    MOCK_HISTORIAL.push({
      id: Date.now(),
      equipo_id: newEquipo.id,
      equipo_codigo: newEquipo.codigo_activo,
      tipo_accion: 'CREACION',
      fecha: new Date().toISOString().split('T')[0],
      usuario_responsable: 'Admin Sistema',
      detalle: 'Ingreso al sistema'
    });

    return newEquipo;
  },

  updateEquipo: async (id: number, data: Partial<Equipo>): Promise<Equipo> => {
    await delay(400);
    const index = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (index !== -1) {
      const updated = { ...MOCK_EQUIPOS[index], ...data };
      
      if (data.tipo_equipo_id) {
        const tipo = MOCK_TIPOS.find(t => t.id === Number(data.tipo_equipo_id));
        updated.tipo_nombre = tipo?.nombre;
      }

      MOCK_EQUIPOS[index] = updated;
      return updated;
    }
    throw new Error("Equipo no encontrado");
  },

  // --- Actions ---
  asignarEquipo: async (id: number, usuarioId: number, ubicacion: string, observaciones: string): Promise<Equipo> => {
    await delay(500);
    const equipo = MOCK_EQUIPOS.find(e => e.id === id);
    const usuario = MOCK_USERS.find(u => u.id === Number(usuarioId));
    
    if (!equipo || !usuario) throw new Error("Datos inválidos");
    if (equipo.estado !== EstadoEquipo.DISPONIBLE) throw new Error("El equipo no está disponible");

    equipo.estado = EstadoEquipo.ACTIVO;
    equipo.responsable_id = usuario.id;
    equipo.responsable_nombre = usuario.nombre_completo;
    equipo.ubicacion_nombre = ubicacion;
    equipo.observaciones = observaciones;

    MOCK_HISTORIAL.push({
      id: Date.now(),
      equipo_id: equipo.id,
      equipo_codigo: equipo.codigo_activo,
      tipo_accion: 'ASIGNACION',
      fecha: new Date().toISOString().split('T')[0],
      usuario_responsable: 'Admin Sistema',
      detalle: `Asignado a ${usuario.nombre_completo}. Obs: ${observaciones}`
    });

    // Add to Assignment Mock History (For the report)
    MOCK_ASIGNACIONES_HISTORY.unshift({
      id: Date.now(),
      equipo_codigo: equipo.codigo_activo,
      equipo_modelo: `${equipo.marca} ${equipo.modelo}`,
      usuario_nombre: usuario.nombre_completo,
      usuario_departamento: usuario.departamento_nombre || 'N/A',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: null,
      ubicacion: ubicacion
    });

    return { ...equipo };
  },

  recepcionarEquipo: async (id: number, observaciones: string): Promise<Equipo> => {
    await delay(500);
    const equipo = MOCK_EQUIPOS.find(e => e.id === id);
    if (!equipo) throw new Error("Equipo no encontrado");

    // Find current assignment in mock history to close it
    const currentAssingment = MOCK_ASIGNACIONES_HISTORY.find(a => a.equipo_codigo === equipo.codigo_activo && a.fecha_fin === null);
    if (currentAssingment) {
      currentAssingment.fecha_fin = new Date().toISOString().split('T')[0];
    }

    equipo.estado = EstadoEquipo.DISPONIBLE;
    equipo.responsable_id = undefined;
    equipo.responsable_nombre = undefined;
    equipo.ubicacion_nombre = 'Bodega IT'; // Default return location
    equipo.observaciones = observaciones;

    MOCK_HISTORIAL.push({
      id: Date.now(),
      equipo_id: equipo.id,
      equipo_codigo: equipo.codigo_activo,
      tipo_accion: 'RECEPCION',
      fecha: new Date().toISOString().split('T')[0],
      usuario_responsable: 'Admin Sistema',
      detalle: `Devolución a bodega. Obs: ${observaciones}`
    });

    return { ...equipo };
  },

  bajaEquipo: async (id: number, motivo: string): Promise<Equipo> => {
    await delay(500);
    const equipo = MOCK_EQUIPOS.find(e => e.id === id);
    if (!equipo) throw new Error("Equipo no encontrado");

    // Restriction: Only Available or In Maintenance
    if (equipo.estado !== EstadoEquipo.DISPONIBLE && equipo.estado !== EstadoEquipo.EN_MANTENIMIENTO) {
      throw new Error("Solo equipos disponibles o en mantenimiento pueden darse de baja.");
    }

    // If it's being retired, clear any assignment that might exist (e.g. if it was in maintenance but had an owner)
    if (equipo.responsable_id) {
      const currentAssingment = MOCK_ASIGNACIONES_HISTORY.find(a => a.equipo_codigo === equipo.codigo_activo && a.fecha_fin === null);
      if (currentAssingment) {
        currentAssingment.fecha_fin = new Date().toISOString().split('T')[0];
      }
      equipo.responsable_id = undefined;
      equipo.responsable_nombre = undefined;
    }

    equipo.estado = EstadoEquipo.BAJA;
    equipo.observaciones = `BAJA: ${motivo}`;

    MOCK_HISTORIAL.push({
      id: Date.now(),
      equipo_id: equipo.id,
      equipo_codigo: equipo.codigo_activo,
      tipo_accion: 'BAJA',
      fecha: new Date().toISOString().split('T')[0],
      usuario_responsable: 'Admin Sistema',
      detalle: `Baja definitiva. Motivo: ${motivo}`
    });

    return { ...equipo };
  },
  
  enviarAMantenimiento: async (id: number, motivo: string): Promise<Equipo> => {
    await delay(500);
    const equipo = MOCK_EQUIPOS.find(e => e.id === id);
    if (!equipo) throw new Error("Equipo no encontrado");
    
    // NOTE: We do NOT close the assignment history here anymore.
    // The user retains "ownership" while it is being repaired.
    // We only update the state and location.

    equipo.estado = EstadoEquipo.EN_MANTENIMIENTO;
    // DO NOT CLEAR responsable_id so we can restore it later
    // equipo.ubicacion_nombre = 'Taller/Servicio Técnico'; // Optional: Update location but keep user?
    // Let's keep the location as "Taller" to reflect reality
    equipo.ubicacion_nombre = 'Taller/Servicio Técnico';
    equipo.observaciones = `EN MANTENIMIENTO: ${motivo}`;

    MOCK_HISTORIAL.push({
      id: Date.now(),
      equipo_id: equipo.id,
      equipo_codigo: equipo.codigo_activo,
      tipo_accion: 'MANTENIMIENTO',
      fecha: new Date().toISOString().split('T')[0],
      usuario_responsable: 'Admin Sistema',
      detalle: `Envío a mantenimiento (Mantiene asignación si existe). Motivo: ${motivo}`
    });

    return { ...equipo };
  },

  finalizarMantenimiento: async (equipoId: number, data: { tipo: 'Preventivo' | 'Correctivo', proveedor: string, costo: number, descripcion: string }, nuevoEstado: 'DISPONIBLE' | 'BAJA'): Promise<Equipo> => {
    await delay(600);
    const equipo = MOCK_EQUIPOS.find(e => e.id === equipoId);
    if (!equipo) throw new Error("Equipo no encontrado");

    // Create Maintenance Record
    const newMaintenanceRecord: RegistroMantenimiento = {
      id: Date.now(),
      equipo_id: equipo.id,
      equipo_codigo: equipo.codigo_activo,
      equipo_modelo: `${equipo.marca} ${equipo.modelo}`,
      fecha: new Date().toISOString().split('T')[0],
      tipo_mantenimiento: data.tipo,
      proveedor: data.proveedor,
      costo: data.costo,
      descripcion: data.descripcion
    };
    MOCK_MANTENIMIENTOS.push(newMaintenanceRecord);

    // Update Equipment State Logic
    let estadoFinalTexto = '';

    if (nuevoEstado === 'DISPONIBLE') {
      // Check if it had an owner
      if (equipo.responsable_id) {
        equipo.estado = EstadoEquipo.ACTIVO; // Return to ACTIVE
        // Location might need to be updated back to user's location, but we don't track that deeply in mock.
        // We set it to generic 'En poder del usuario' or keep previous if we had it stored.
        // For now, let's set it to 'Retorno de Taller'
        equipo.ubicacion_nombre = 'Retorno de Taller (En poder del usuario)'; 
        estadoFinalTexto = 'ACTIVO (Retornado al usuario)';
      } else {
        equipo.estado = EstadoEquipo.DISPONIBLE;
        equipo.ubicacion_nombre = 'Bodega IT'; // Return to stock
        estadoFinalTexto = 'DISPONIBLE (Stock)';
      }
      equipo.observaciones = `Mantenimiento completado: ${data.descripcion}`;

    } else if (nuevoEstado === 'BAJA') {
      // If retiring, now we close assignment
      if (equipo.responsable_id) {
         const currentAssingment = MOCK_ASIGNACIONES_HISTORY.find(a => a.equipo_codigo === equipo.codigo_activo && a.fecha_fin === null);
         if (currentAssingment) {
           currentAssingment.fecha_fin = new Date().toISOString().split('T')[0];
         }
         equipo.responsable_id = undefined;
         equipo.responsable_nombre = undefined;
      }
      
      equipo.estado = EstadoEquipo.BAJA;
      equipo.observaciones = `BAJA post-mantenimiento: ${data.descripcion}`;
      estadoFinalTexto = 'BAJA';
    }

    // Add Traceability
    MOCK_HISTORIAL.push({
      id: Date.now(),
      equipo_id: equipo.id,
      equipo_codigo: equipo.codigo_activo,
      tipo_accion: 'MANTENIMIENTO',
      fecha: new Date().toISOString().split('T')[0],
      usuario_responsable: 'Admin Sistema',
      detalle: `Mantenimiento finalizado. Estado final: ${estadoFinalTexto}. Costo: $${data.costo}`
    });

    return { ...equipo };
  },

  // --- License Management ---

  getTipoLicencias: async (): Promise<TipoLicencia[]> => {
    await delay(300);
    return [...MOCK_TIPOS_LICENCIA];
  },

  createTipoLicencia: async (data: Omit<TipoLicencia, 'id'>): Promise<TipoLicencia> => {
    await delay(300);
    const newType = { ...data, id: Math.floor(Math.random() * 10000) };
    MOCK_TIPOS_LICENCIA.push(newType);
    return newType;
  },
  
  updateTipoLicencia: async (id: number, data: Partial<TipoLicencia>): Promise<TipoLicencia> => {
    await delay(300);
    MOCK_TIPOS_LICENCIA = MOCK_TIPOS_LICENCIA.map(t => t.id === id ? { ...t, ...data } : t);
    return MOCK_TIPOS_LICENCIA.find(t => t.id === id)!;
  },

  deleteTipoLicencia: async (id: number): Promise<void> => {
    await delay(300);
    MOCK_TIPOS_LICENCIA = MOCK_TIPOS_LICENCIA.filter(t => t.id !== id);
    // Also cascade delete licenses? Usually yes, or block. For mock, let's just filter
    MOCK_LICENCIAS = MOCK_LICENCIAS.filter(l => l.tipo_id !== id);
  },

  getLicencias: async (): Promise<Licencia[]> => {
    await delay(500);
    return [...MOCK_LICENCIAS];
  },

  agregarStockLicencias: async (tipoId: number, cantidad: number, fechaVencimiento: string): Promise<void> => {
    await delay(500);
    const tipo = MOCK_TIPOS_LICENCIA.find(t => t.id === tipoId);
    if (!tipo) throw new Error("Tipo de licencia no encontrado");

    for (let i = 0; i < cantidad; i++) {
      const id = Date.now() + i;
      MOCK_LICENCIAS.push({
        id,
        tipo_id: tipo.id,
        tipo_nombre: tipo.nombre,
        clave: `${tipo.nombre.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 100000)}`,
        fecha_compra: new Date().toISOString().split('T')[0],
        fecha_vencimiento: fechaVencimiento,
        usuario_id: null
      });
    }
  },

  asignarLicencia: async (licenciaId: number, usuarioId: number): Promise<Licencia> => {
    await delay(400);
    const licencia = MOCK_LICENCIAS.find(l => l.id === licenciaId);
    const usuario = MOCK_USERS.find(u => u.id === usuarioId);
    
    if (!licencia || !usuario) throw new Error("Licencia o Usuario no válido");
    if (licencia.usuario_id) throw new Error("Licencia ya asignada");

    // --- Check if user already has a license of this type ---
    const alreadyHasType = MOCK_LICENCIAS.some(l => 
      l.usuario_id === usuarioId && 
      l.tipo_id === licencia.tipo_id
    );

    if (alreadyHasType) {
      throw new Error(`El usuario ${usuario.nombre_completo} ya tiene una licencia de tipo "${licencia.tipo_nombre}" asignada.`);
    }
    // --------------------------------------------------------

    licencia.usuario_id = usuario.id;
    licencia.usuario_nombre = usuario.nombre_completo;
    licencia.usuario_departamento = usuario.departamento_nombre;
    
    return { ...licencia };
  },

  liberarLicencia: async (licenciaId: number): Promise<Licencia> => {
    await delay(400);
    const licencia = MOCK_LICENCIAS.find(l => l.id === licenciaId);
    if (!licencia) throw new Error("Licencia no encontrada");

    licencia.usuario_id = null;
    licencia.usuario_nombre = undefined;
    licencia.usuario_departamento = undefined;

    return { ...licencia };
  },

  // --- Stats & Reports ---
  getStats: async () => {
    await delay(600);
    const total = MOCK_EQUIPOS.length;
    const assigned = MOCK_EQUIPOS.filter(e => e.estado === EstadoEquipo.ACTIVO).length;
    const available = MOCK_EQUIPOS.filter(e => e.estado === EstadoEquipo.DISPONIBLE).length;
    const maintenance = MOCK_EQUIPOS.filter(e => e.estado === EstadoEquipo.EN_MANTENIMIENTO).length;
    const retired = MOCK_EQUIPOS.filter(e => e.estado === EstadoEquipo.BAJA).length;

    return { total, assigned, available, maintenance, retired };
  },

  getWarrantyReport: async (): Promise<ReporteGarantia[]> => {
    await delay(500);
    const today = new Date();
    return MOCK_EQUIPOS.map(e => {
      const purchaseDate = new Date(e.fecha_compra);
      const expirationDate = new Date(purchaseDate);
      expirationDate.setFullYear(purchaseDate.getFullYear() + e.anos_garantia);
      
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        equipo: e,
        dias_restantes: diffDays,
        fecha_vencimiento: expirationDate.toISOString().split('T')[0]
      };
    }).filter(r => r.dias_restantes < 90 && r.dias_restantes > -30).sort((a, b) => a.dias_restantes - b.dias_restantes);
  },

  getReplacementCandidates: async (): Promise<Equipo[]> => {
    await delay(500);
    const currentYear = new Date().getFullYear();
    return MOCK_EQUIPOS.filter(e => {
      const purchaseYear = new Date(e.fecha_compra).getFullYear();
      return (currentYear - purchaseYear) >= 4;
    });
  },

  getHistorial: async (tipoId?: number): Promise<HistorialMovimiento[]> => {
    await delay(500);
    if (!tipoId) {
      return [...MOCK_HISTORIAL].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }

    // Filter equipments by type first
    const targetEquipmentIds = MOCK_EQUIPOS
      .filter(e => Number(e.tipo_equipo_id) === Number(tipoId))
      .map(e => e.id);
    
    return MOCK_HISTORIAL.filter(h => targetEquipmentIds.includes(h.equipo_id))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },

  getHistorialAsignaciones: async (): Promise<HistorialAsignacion[]> => {
    await delay(500);
    return [...MOCK_ASIGNACIONES_HISTORY].sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime());
  },

  getHistorialMantenimiento: async (tipoId?: number): Promise<RegistroMantenimiento[]> => {
    await delay(500);
    let results = [...MOCK_MANTENIMIENTOS];

    if (tipoId) {
       const equipmentIdsWithType = MOCK_EQUIPOS
        .filter(e => Number(e.tipo_equipo_id) === Number(tipoId))
        .map(e => e.id);
       
       results = results.filter(m => equipmentIdsWithType.includes(m.equipo_id));
    }

    return results.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  },

  getNotifications: async (): Promise<Notificacion[]> => {
    await delay(300);
    const notifs = [...MOCK_NOTIFICATIONS];

    // --- License Threshold Logic ---
    // Calculate available percentage for each license type
    MOCK_TIPOS_LICENCIA.forEach(tipo => {
      const total = MOCK_LICENCIAS.filter(l => l.tipo_id === tipo.id).length;
      if (total > 0) {
        const available = MOCK_LICENCIAS.filter(l => l.tipo_id === tipo.id && !l.usuario_id).length;
        const ratio = available / total;
        
        if (ratio <= 0.05) {
          notifs.push({
            id: Date.now() + tipo.id,
            titulo: 'Stock de Licencias Crítico',
            mensaje: `Quedan ${available} licencias disponibles de ${tipo.nombre} (${(ratio * 100).toFixed(1)}%). Se sugiere adquirir más.`,
            leido: false,
            fecha: new Date().toISOString(),
            tipo: 'alert'
          });
        }
      }
    });

    return notifs;
  }
};

export const api = USE_LIVE_API ? liveApi : mockApiImplementation;
