
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

let MOCK_USUARIOS: Usuario[] = [
  { 
    id: 1, nombre_usuario: 'admin', nombre_completo: 'Administrador Sistema', nombres: 'Admin', apellidos: 'Sys', 
    correo: 'admin@sys.com', password: '123', rol: RolUsuario.ADMIN, activo: true, 
    departamento_id: 1, departamento_nombre: 'Tecnología (Bodega GYE)', numero_empleado: 'ADM001' 
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
    anos_garantia: 3, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, responsable_id: 1, responsable_nombre: 'Admin', observaciones: 'Vieja pero funcional',
    procesador: 'Intel i5-8365U', ram: '8GB', disco_capacidad: '256GB', disco_tipo: 'SSD', sistema_operativo: 'Windows 10 Pro'
  },
];

let MOCK_NOTIFICACIONES: Notificacion[] = [];

const internalMockApi = {
  // --- Auth ---
  login: async (email: string, password?: string) => { await simulateDelay(); return MOCK_USUARIOS[0]; },
  changePassword: async (userId: number, old: string, pass: string, confirm: string) => { await simulateDelay(); },

  // --- Actions ---
  asignarEquipo: async (id: number, usuarioId: number, ubicacion: string, observaciones: string, archivo?: File) => { 
    await simulateDelay(); 
    const u = MOCK_USUARIOS.find(x => x.id === usuarioId);
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? { ...e, estado: EstadoEquipo.ACTIVO, responsable_id: usuarioId, responsable_nombre: u?.nombre_completo, observaciones } : e);
    
    // Simular envío de correo según configuración
    if (MOCK_EMAIL_CONFIG.notificar_asignacion) {
        console.log(`[EMAIL SIM] Enviando notificación de asignación de equipo ${id} a ${u?.correo}`);
        if (MOCK_EMAIL_CONFIG.correos_copia.length > 0) {
            console.log(`[EMAIL SIM] Enviando CC a: ${MOCK_EMAIL_CONFIG.correos_copia.join(', ')}`);
        }
    }
    return MOCK_EQUIPOS.find(x => x.id === id)!; 
  },

  // Fix: Added missing receivers for common actions to satisfy union type of 'api'
  recepcionarEquipo: async (id: number, observaciones: string, ubicacionId?: number, ubicacionNombre?: string, liberarLicencias: boolean = false, archivo?: File): Promise<Equipo> => {
    await simulateDelay();
    return MOCK_EQUIPOS.find(e => e.id === id) || MOCK_EQUIPOS[0];
  },

  bajaEquipo: async (id: number, motivo: string, archivo?: File): Promise<Equipo> => {
    await simulateDelay();
    return MOCK_EQUIPOS.find(e => e.id === id) || MOCK_EQUIPOS[0];
  },

  enviarAMantenimiento: async (id: number, motivo: string): Promise<Equipo> => {
    await simulateDelay();
    return MOCK_EQUIPOS.find(e => e.id === id) || MOCK_EQUIPOS[0];
  },

  marcarParaBaja: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string): Promise<Equipo> => {
    await simulateDelay();
    return MOCK_EQUIPOS.find(e => e.id === id) || MOCK_EQUIPOS[0];
  },

  finalizarMantenimiento: async (equipoId: number, data: any, nuevoEstado: string, archivo?: File) => { 
    await simulateDelay(); 
    const eq = MOCK_EQUIPOS.find(e => e.id === equipoId);
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => {
        if (e.id === equipoId) {
            return {
                ...e,
                estado: nuevoEstado as EstadoEquipo,
                ultimo_mantenimiento: new Date().toISOString().split('T')[0]
            };
        }
        return e;
    });

    if (MOCK_EMAIL_CONFIG.notificar_mantenimiento) {
        const dest = eq?.responsable_id ? MOCK_USUARIOS.find(u => u.id === eq.responsable_id)?.correo : MOCK_EMAIL_CONFIG.correos_copia[0];
        console.log(`[EMAIL SIM] Enviando notificación de fin de mantenimiento de equipo ${equipoId} a ${dest}`);
    }

    return { success: true }; 
  },

  // --- Maintenance Planning ---
  verificarAlertasMantenimiento: async () => {
    if (!MOCK_EMAIL_CONFIG.notificar_alerta_mantenimiento) return;

    // Simulación: Si hay equipos con mantenimiento próximo mes y la fecha actual es >= (mes - anticipación)
    const nextMonth = new Date().getMonth() + 2; 
    const equiposProximos = MOCK_EQUIPOS.filter(e => e.estado === EstadoEquipo.ACTIVO);
    
    if (equiposProximos.length > 0) {
        const yaNotificado = MOCK_NOTIFICACIONES.some(n => n.titulo.includes('Recordatorio Mantenimiento Anual'));
        if (!yaNotificado) {
            MOCK_NOTIFICACIONES.push({
                id: Date.now(),
                titulo: 'Recordatorio Mantenimiento Anual',
                mensaje: `Existen ${equiposProximos.length} equipos programados para mantenimiento el próximo mes. Se han enviado los correos de recordatorio automáticamente.`,
                leido: false,
                fecha: new Date().toISOString().split('T')[0],
                tipo: 'info'
            });
            console.log(`[EMAIL SIM] Enviando recordatorios anuales automáticos (${MOCK_EMAIL_CONFIG.dias_anticipacion_alerta} días de antelación)`);
        }
    }
  },

  // --- Email Config ---
  getEmailConfig: async () => { await simulateDelay(100); return { ...MOCK_EMAIL_CONFIG }; },
  saveEmailConfig: async (config: EmailConfig) => { 
    await simulateDelay(); 
    MOCK_EMAIL_CONFIG = { ...config };
    console.log('[CONFIG] Nueva configuración de correo guardada:', MOCK_EMAIL_CONFIG);
  },
  testEmailConfig: async (config: EmailConfig, to: string) => { 
      await simulateDelay(1000); 
      console.log(`[EMAIL TEST] Probando conexión SMTP ${config.smtp_host}:${config.smtp_port} enviando a ${to}`);
      return { success: true }; 
  },

  // --- Vault ---
  // Fix: Added missing Vault methods to match liveApi
  getBoveda: async (): Promise<EntradaBoveda[]> => [],
  createEntradaBoveda: async (data: any): Promise<EntradaBoveda> => ({ 
    id: Date.now(), ...data, fecha_actualizacion: new Date().toISOString().split('T')[0] 
  }),
  updateEntradaBoveda: async (id: number, data: any): Promise<EntradaBoveda> => ({ 
    id, ...data, fecha_actualizacion: new Date().toISOString().split('T')[0] 
  }),
  deleteEntradaBoveda: async (id: number): Promise<void> => { await simulateDelay(); },

  // --- Organization ---
  // Fix: Added missing Org methods to match liveApi and satisfy OrganizatonManager
  getDepartamentos: async () => MOCK_DEPARTAMENTOS,
  createDepartamento: async (data: any) => ({ id: Date.now(), ...data }),
  updateDepartamento: async (id: number, data: any) => ({ id, ...data }),
  deleteDepartamento: async (id: number) => { await simulateDelay(); },

  getCiudades: async () => MOCK_CIUDADES,
  createCiudad: async (data: any) => ({ id: Date.now(), ...data }),
  updateCiudad: async (id: number, data: any) => ({ id, ...data }),
  deleteCiudad: async (id: number) => { await simulateDelay(); },

  getPaises: async () => MOCK_PAISES,
  createPais: async (data: any) => ({ id: Date.now(), ...data }),
  updatePais: async (id: number, data: any) => ({ id, ...data }),
  deletePais: async (id: number) => { await simulateDelay(); },

  getPuestos: async () => [],
  createPuesto: async (nombre: string) => ({ id: Date.now(), nombre }),
  updatePuesto: async (id: number, nombre: string) => ({ id, nombre }),
  deletePuesto: async (id: number) => { await simulateDelay(); },

  // --- Users ---
  getUsuarios: async () => MOCK_USUARIOS,
  createUsuario: async (data: any) => ({ ...data, id: Date.now() }),
  updateUsuario: async (id: number, data: any) => ({ ...data, id }),
  deleteUsuario: async (id: number) => { await simulateDelay(); },

  // --- Equipment ---
  getEquipos: async () => MOCK_EQUIPOS,
  createEquipo: async (data: any) => ({ ...data, id: Date.now() }),
  updateEquipo: async (id: number, data: any) => ({ ...data, id }),
  getTiposEquipo: async () => MOCK_TIPOS_EQUIPO,
  // Fix: Added missing Equipment Type methods
  createTipoEquipo: async (data: any) => ({ id: Date.now(), ...data }),
  updateTipoEquipo: async (id: number, data: any) => ({ id, ...data }),
  deleteTipoEquipo: async (id: number) => { await simulateDelay(); },

  // --- Licenses ---
  getLicencias: async () => [],
  getTipoLicencias: async () => [],
  // Fix: Added missing License methods to match liveApi
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
  // Fix: Added missing History methods for reportService
  getHistorialAsignaciones: async () => [],
  getHistorial: async (tipoId?: number) => [],
  getHistorialMantenimiento: async (tipoId?: number) => [],

  // --- Maintenance Plans ---
  getMaintenancePlans: async () => [],
  // Fix: Satisfy PlanMantenimiento structure and return type for view component
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
  // Fix: Satisfy PlanRecambio structure and return type for ReplacementPlanning
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
export { MOCK_EQUIPOS, MOCK_USUARIOS, MOCK_DEPARTAMENTOS, MOCK_CIUDADES, MOCK_PAISES };
