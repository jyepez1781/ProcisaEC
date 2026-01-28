
import { 
  Usuario, Equipo, TipoEquipo, Departamento, Puesto, Ciudad, Pais,
  EstadoEquipo, RolUsuario, Licencia, PlanMantenimiento, 
  DetallePlan, EstadoPlan, EmailConfig, Notificacion, PlanRecambio, DetallePlanRecambio,
  TipoLicencia, EntradaBoveda
} from '../types';
import { liveApi } from './liveApi';

const USE_LIVE_API = false;

// --- ESTADO GLOBAL MOCK ---
let MOCK_EMAIL_CONFIG: EmailConfig = {
  remitente: 'Soporte InvenTory',
  correos_copia: ['admin@sys.com'],
  notificar_asignacion: true,
  notificar_mantenimiento: true,
  notificar_alerta_mantenimiento: true,
  dias_anticipacion_alerta: 15,
  smtp_host: 'smtp.office365.com',
  smtp_port: '587',
  smtp_user: 'notificaciones@empresa.com',
  smtp_encryption: 'TLS'
};

let MOCK_PAISES: Pais[] = [
  { id: 1, nombre: 'Ecuador', abreviatura: 'EC' },
  { id: 2, nombre: 'México', abreviatura: 'MX' },
];

let MOCK_CIUDADES: Ciudad[] = [
  { id: 1, nombre: 'Guayaquil', abreviatura: 'GYE', pais_id: 1, pais_nombre: 'Ecuador' },
  { id: 2, nombre: 'Quito', abreviatura: 'UIO', pais_id: 1, pais_nombre: 'Ecuador' },
];

let MOCK_DEPARTAMENTOS: Departamento[] = [
  { id: 1, nombre: 'Tecnología (Bodega GYE)', es_bodega: true, ciudad_id: 1, ciudad_nombre: 'Guayaquil' },
  { id: 2, nombre: 'Recursos Humanos', es_bodega: false, ciudad_id: 1, ciudad_nombre: 'Guayaquil' },
];

let MOCK_PUESTOS: Puesto[] = [
  { id: 1, nombre: 'Analista de Soporte' },
  { id: 2, nombre: 'Coordinador de Infraestructura' },
  { id: 3, nombre: 'Asistente Administrativo' },
];

let MOCK_USUARIOS: Usuario[] = [
  { 
    id: 1, nombre_usuario: 'admin', nombre_completo: 'Administrador Sistema', nombres: 'Admin', apellidos: 'Sys', 
    correo: 'admin@sys.com', password: '123', rol: RolUsuario.ADMIN, activo: true, 
    departamento_id: 1, departamento_nombre: 'Tecnología (Bodega GYE)', puesto_id: 1, puesto_nombre: 'Analista de Soporte', numero_empleado: 'ADM001' 
  },
];

let MOCK_TIPOS_EQUIPO: TipoEquipo[] = [
  { id: 1, nombre: 'Laptop', descripcion: 'Computadora portátil', frecuencia_anual: 2 },
  { id: 2, nombre: 'Desktop', descripcion: 'Computadora de escritorio', frecuencia_anual: 1 },
  { id: 3, nombre: 'Servidor', descripcion: 'Servidor de Rack', frecuencia_anual: 12 },
];

let MOCK_EQUIPOS: Equipo[] = [
  { 
    id: 1, codigo_activo: 'ECGYELAP2019', numero_serie: 'SN-OLD-01', marca: 'Dell', modelo: 'Latitude 5400', 
    tipo_equipo_id: 1, tipo_nombre: 'Laptop', fecha_compra: '2019-01-10', valor_compra: 1100, 
    anos_garantia: 3, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, responsable_id: 1, responsable_nombre: 'Administrador Sistema', observaciones: 'Vieja pero funcional',
    procesador: 'Intel i5-8365U', ram: '8GB', disco_capacidad: '256GB', disco_tipo: 'SSD', sistema_operativo: 'Windows 10 Pro'
  },
];

let MOCK_NOTIFICACIONES: Notificacion[] = [];
let MOCK_BOVEDA: EntradaBoveda[] = [];

// Helper para hidratar un usuario con datos calculados y nombres de catálogo
const hydrateUser = (data: Partial<Usuario>): Usuario => {
    const nombres = data.nombres || '';
    const apellidos = data.apellidos || '';
    
    // Buscar nombres de departamento y puesto
    const depto = MOCK_DEPARTAMENTOS.find(d => d.id === data.departamento_id);
    const puesto = MOCK_PUESTOS.find(p => p.id === data.puesto_id);

    return {
        ...data,
        nombre_completo: `${nombres} ${apellidos}`.trim(),
        departamento_nombre: depto?.nombre || data.departamento_nombre,
        puesto_nombre: puesto?.nombre || data.puesto_nombre,
    } as Usuario;
};

const internalMockApi = {
  // --- Auth ---
  login: async (email: string, password?: string) => { await simulateDelay(); return MOCK_USUARIOS[0]; },
  changePassword: async (userId: number, old: string, pass: string, confirm: string) => { await simulateDelay(); },

  // --- Actions ---
  asignarEquipo: async (id: number, usuarioId: number, ubicacion: string, observaciones: string, archivo?: File) => { 
    await simulateDelay(); 
    const u = MOCK_USUARIOS.find(x => x.id === usuarioId);
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? { 
      ...e, 
      estado: EstadoEquipo.ACTIVO, 
      responsable_id: usuarioId, 
      responsable_nombre: u?.nombre_completo, 
      observaciones,
      ubicacion_nombre: ubicacion 
    } : e);
    
    if (MOCK_EMAIL_CONFIG.notificar_asignacion) {
        const attachmentText = archivo ? `con archivo adjunto: ${archivo.name}` : '(sin adjunto de acta)';
        console.log(`[EMAIL SIM] Enviando notificación de asignación a ${u?.correo} ${attachmentText}`);
    }
    return MOCK_EQUIPOS.find(x => x.id === id)!; 
  },

  recepcionarEquipo: async (id: number, observaciones: string, ubicacionId?: number, ubicacionNombre?: string, liberarLicencias: boolean = false, archivo?: File): Promise<Equipo> => {
    await simulateDelay();
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? {
        ...e,
        estado: EstadoEquipo.DISPONIBLE,
        responsable_id: undefined,
        responsable_nombre: undefined,
        ubicacion_id: ubicacionId || e.ubicacion_id,
        ubicacion_nombre: ubicacionNombre || 'BODEGA IT',
        observaciones: observaciones
    } : e);
    return MOCK_EQUIPOS.find(e => e.id === id)!;
  },

  bajaEquipo: async (id: number, motivo: string, archivo?: File): Promise<Equipo> => {
    await simulateDelay();
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? {
        ...e,
        estado: EstadoEquipo.BAJA,
        responsable_id: undefined,
        responsable_nombre: undefined,
        observaciones: motivo
    } : e);
    return MOCK_EQUIPOS.find(e => e.id === id)!;
  },

  enviarAMantenimiento: async (id: number, motivo: string): Promise<Equipo> => {
    await simulateDelay();
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? {
        ...e,
        estado: EstadoEquipo.EN_MANTENIMIENTO,
        observaciones: motivo
    } : e);
    return MOCK_EQUIPOS.find(e => e.id === id)!;
  },

  marcarParaBaja: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string): Promise<Equipo> => {
    await simulateDelay();
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? {
        ...e,
        estado: EstadoEquipo.PARA_BAJA,
        ubicacion_id: ubicacionId,
        ubicacion_nombre: ubicacionNombre,
        observaciones: observaciones
    } : e);
    return MOCK_EQUIPOS.find(e => e.id === id)!;
  },

  finalizarMantenimiento: async (equipoId: number, data: any, nuevoEstado: string, archivo?: File) => { 
    await simulateDelay(); 
    const eq = MOCK_EQUIPOS.find(e => e.id === equipoId);
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => {
        if (e.id === equipoId) {
            return {
                ...e,
                estado: nuevoEstado as EstadoEquipo,
                ultimo_mantenimiento: new Date().toISOString().split('T')[0],
                serie_cargador: data.serie_cargador || e.serie_cargador,
                procesador: data.procesador || e.procesador,
                ram: data.ram || e.ram,
                disco_capacidad: data.disco_capacidad || e.disco_capacidad,
                disco_tipo: data.disco_tipo || e.disco_tipo,
                sistema_operativo: data.sistema_operativo || e.sistema_operativo
            };
        }
        return e;
    });

    if (MOCK_EMAIL_CONFIG.notificar_mantenimiento) {
        console.log(`[EMAIL SIM] Notificación fin mantenimiento para equipo ${equipoId}`);
    }

    return { success: true }; 
  },

  // --- Maintenance Planning ---
  verificarAlertasMantenimiento: async () => {
    if (!MOCK_EMAIL_CONFIG.notificar_alerta_mantenimiento) return;
    const equiposProximos = MOCK_EQUIPOS.filter(e => e.estado === EstadoEquipo.ACTIVO);
    if (equiposProximos.length > 0) {
        const yaNotificado = MOCK_NOTIFICACIONES.some(n => n.titulo.includes('Recordatorio Mantenimiento Anual'));
        if (!yaNotificado) {
            MOCK_NOTIFICACIONES.push({
                id: Date.now(),
                titulo: 'Recordatorio Mantenimiento Anual',
                mensaje: `Existen equipos programados para mantenimiento.`,
                leido: false,
                fecha: new Date().toISOString().split('T')[0],
                tipo: 'info'
            });
        }
    }
  },

  // --- Email Config ---
  getEmailConfig: async () => { await simulateDelay(100); return { ...MOCK_EMAIL_CONFIG }; },
  saveEmailConfig: async (config: EmailConfig) => { 
    await simulateDelay(); 
    MOCK_EMAIL_CONFIG = { ...config };
  },
  testEmailConfig: async (config: EmailConfig, to: string) => { 
      await simulateDelay(1000); 
      return { success: true }; 
  },

  // --- Vault ---
  getBoveda: async (): Promise<EntradaBoveda[]> => MOCK_BOVEDA,
  createEntradaBoveda: async (data: any): Promise<EntradaBoveda> => {
    const n = { id: Date.now(), ...data, fecha_actualizacion: new Date().toISOString().split('T')[0] };
    MOCK_BOVEDA.push(n);
    return n;
  },
  updateEntradaBoveda: async (id: number, data: any): Promise<EntradaBoveda> => {
    MOCK_BOVEDA = MOCK_BOVEDA.map(e => e.id === id ? { ...e, ...data, fecha_actualizacion: new Date().toISOString().split('T')[0] } : e);
    return MOCK_BOVEDA.find(e => e.id === id)!;
  },
  deleteEntradaBoveda: async (id: number): Promise<void> => {
    MOCK_BOVEDA = MOCK_BOVEDA.filter(e => e.id !== id);
    await simulateDelay();
  },

  // --- Organization ---
  getDepartamentos: async () => MOCK_DEPARTAMENTOS,
  createDepartamento: async (data: any) => {
    const n = { id: Date.now(), ...data };
    MOCK_DEPARTAMENTOS.push(n);
    return n;
  },
  updateDepartamento: async (id: number, data: any) => {
    MOCK_DEPARTAMENTOS = MOCK_DEPARTAMENTOS.map(d => d.id === id ? { ...d, ...data } : d);
    return MOCK_DEPARTAMENTOS.find(d => d.id === id);
  },
  deleteDepartamento: async (id: number) => { 
    MOCK_DEPARTAMENTOS = MOCK_DEPARTAMENTOS.filter(d => d.id !== id);
    await simulateDelay(); 
  },
  getCiudades: async () => MOCK_CIUDADES,
  createCiudad: async (data: any) => {
    const n = { id: Date.now(), ...data };
    MOCK_CIUDADES.push(n);
    return n;
  },
  updateCiudad: async (id: number, data: any) => {
    MOCK_CIUDADES = MOCK_CIUDADES.map(c => c.id === id ? { ...c, ...data } : c);
    return MOCK_CIUDADES.find(c => c.id === id);
  },
  deleteCiudad: async (id: number) => { 
    MOCK_CIUDADES = MOCK_CIUDADES.filter(c => c.id !== id);
    await simulateDelay(); 
  },
  getPaises: async () => MOCK_PAISES,
  createPais: async (data: any) => {
    const n = { id: Date.now(), ...data };
    MOCK_PAISES.push(n);
    return n;
  },
  updatePais: async (id: number, data: any) => {
    MOCK_PAISES = MOCK_PAISES.map(p => p.id === id ? { ...p, ...data } : p);
    return MOCK_PAISES.find(p => p.id === id);
  },
  deletePais: async (id: number) => { 
    MOCK_PAISES = MOCK_PAISES.filter(p => p.id !== id);
    await simulateDelay(); 
  },
  
  getPuestos: async () => [...MOCK_PUESTOS],
  createPuesto: async (data: { nombre: string }) => {
    const n = { id: Date.now(), nombre: data.nombre };
    MOCK_PUESTOS.push(n);
    return n;
  },
  updatePuesto: async (id: number, data: { nombre: string }) => {
    MOCK_PUESTOS = MOCK_PUESTOS.map(p => p.id === id ? { ...p, nombre: data.nombre } : p);
    return MOCK_PUESTOS.find(p => p.id === id);
  },
  deletePuesto: async (id: number) => { 
    MOCK_PUESTOS = MOCK_PUESTOS.filter(p => p.id !== id);
    await simulateDelay(); 
  },

  // --- Users ---
  getUsuarios: async () => [...MOCK_USUARIOS],
  createUsuario: async (data: any) => {
    const hydratedUser = hydrateUser({ ...data, id: Date.now() });
    MOCK_USUARIOS.push(hydratedUser);
    return hydratedUser;
  },
  updateUsuario: async (id: number, data: any) => {
    let updated: Usuario | null = null;
    MOCK_USUARIOS = MOCK_USUARIOS.map(u => {
        if (u.id === id) {
            updated = hydrateUser({ ...u, ...data });
            return updated;
        }
        return u;
    });
    return updated!;
  },
  deleteUsuario: async (id: number) => { 
    MOCK_USUARIOS = MOCK_USUARIOS.filter(u => u.id !== id);
    await simulateDelay(); 
  },

  // --- Equipment ---
  getEquipos: async () => [...MOCK_EQUIPOS],
  createEquipo: async (data: any) => {
    const n = { ...data, id: Date.now() };
    MOCK_EQUIPOS.push(n);
    return n;
  },
  updateEquipo: async (id: number, data: any) => {
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? { ...e, ...data } : e);
    return MOCK_EQUIPOS.find(e => e.id === id)!;
  },
  getTiposEquipo: async () => MOCK_TIPOS_EQUIPO,
  createTipoEquipo: async (data: any) => {
    const n = { id: Date.now(), ...data };
    MOCK_TIPOS_EQUIPO.push(n);
    return n;
  },
  updateTipoEquipo: async (id: number, data: any) => {
    MOCK_TIPOS_EQUIPO = MOCK_TIPOS_EQUIPO.map(t => t.id === id ? { ...t, ...data } : t);
    return MOCK_TIPOS_EQUIPO.find(t => t.id === id);
  },
  deleteTipoEquipo: async (id: number) => { 
    MOCK_TIPOS_EQUIPO = MOCK_TIPOS_EQUIPO.filter(t => t.id !== id);
    await simulateDelay(); 
  },

  // --- Licenses ---
  getLicencias: async () => [],
  getTipoLicencias: async () => [],
  createTipoLicencia: async (data: any) => ({ id: Date.now(), ...data }),
  updateTipoLicencia: async (id: number, data: any) => ({ id, ...data }),
  deleteTipoLicencia: async (id: number) => { await simulateDelay(); },
  agregarStockLicencias: async (tipoId: number, cantidad: number, fechaVencimiento: string) => ({ success: true }),
  asignarLicencia: async (licenciaId: number, usuarioId: number) => ({} as any),
  liberarLicencia: async (licenciaId: number) => ({} as any),

  // --- Stats & History ---
  getStats: async () => ({}),
  getNotifications: async () => [...MOCK_NOTIFICACIONES],
  getWarrantyReport: async () => [],
  getReplacementCandidates: async () => [],
  getHistorialAsignaciones: async () => [],
  getHistorial: async (tipoId?: number) => [],
  getHistorialMantenimiento: async (tipoId?: number) => [],

  // --- Maintenance Plans ---
  getMaintenancePlans: async () => [],
  getPlanDetails: async (planId: number): Promise<{ plan: PlanMantenimiento, details: DetallePlan[] }> => ({ 
    plan: { id: planId, anio: 2025, nombre: 'Plan Mock', creado_por: 'Admin', fecha_creacion: '', estado: 'ACTIVO' }, 
    details: [] 
  }),
  createMaintenancePlan: async (plan: any, details: any[]) => ({ success: true }),
  updatePlanDetailMonth: async () => ({ success: true }),
  iniciarMantenimientoDesdePlan: async () => ({ success: true }),
  registerMaintenanceExecution: async () => ({ success: true }),
  getEvidence: async () => [],
  getExecutions: async (detailId: number) => [],

  // --- Replacement Plans ---
  getReplacementPlans: async () => [],
  saveReplacementPlan: async (plan: PlanRecambio, details: DetallePlanRecambio[]) => true,
  getReplacementPlanDetails: async (planId: number): Promise<{ plan: PlanRecambio, details: DetallePlanRecambio[] }> => ({ 
    plan: { 
      id: planId, anio: 2025, nombre: 'Plan Recambio Mock', creado_por: 'Admin', 
      fecha_creacion: '', presupuesto_estimado: 0, total_equipos: 0, estado: 'ACTIVO' 
    }, 
    details: [] 
  }),

  // --- Migration & Files ---
  subirArchivoAsignacion: async (id: number) => ({ id } as any),
  bulkCreateEquipos: async (rows: any[]) => rows.length,
  bulkCreateUsuarios: async (rows: any[]) => rows.length,
  bulkCreateLicencias: async (rows: any[]) => rows.length,
  bulkCreateDepartamentos: async (rows: any[]) => rows.length,
  bulkCreatePuestos: async (rows: any[]) => rows.length,
  bulkCreateAsignaciones: async (rows: any[]) => rows.length
};

const simulateDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));
export const api = USE_LIVE_API ? liveApi : internalMockApi;
export { MOCK_EQUIPOS, MOCK_USUARIOS, MOCK_DEPARTAMENTOS, MOCK_CIUDADES, MOCK_PAISES, MOCK_PUESTOS };
