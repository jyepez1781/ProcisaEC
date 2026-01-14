
import { 
  Usuario, Equipo, TipoEquipo, Departamento, Puesto, Ciudad, Pais,
  EstadoEquipo, RolUsuario, Licencia, PlanMantenimiento, 
  DetallePlan, EstadoPlan, EmailConfig, Notificacion, PlanRecambio, DetallePlanRecambio,
  TipoLicencia
} from '../types';
import { liveApi } from './liveApi';

const USE_LIVE_API = false;

const getDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
};

const calculateAge = (dateStr: string) => {
  return new Date().getFullYear() - new Date(dateStr).getFullYear();
};

// --- ESTADO GLOBAL MOCK ---
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
  { 
    id: 2, codigo_activo: 'ECGYEDESK2018', numero_serie: 'SN-OLD-02', marca: 'HP', modelo: 'EliteDesk 800', 
    tipo_equipo_id: 2, tipo_nombre: 'Desktop', fecha_compra: '2018-05-15', valor_compra: 900, 
    anos_garantia: 1, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, responsable_id: 1, responsable_nombre: 'Admin', observaciones: 'Lenta',
    procesador: 'Intel i7-6700', ram: '16GB', disco_capacidad: '500GB', disco_tipo: 'HDD', sistema_operativo: 'Windows 10 Pro'
  }
];

let MOCK_PLANES_RECAMBIO: PlanRecambio[] = [];
let MOCK_DETALLES_RECAMBIO: DetallePlanRecambio[] = [];

const internalMockApi = {
  // --- Auth ---
  login: async (email: string, password?: string) => { await simulateDelay(); return MOCK_USUARIOS[0]; },
  changePassword: async (userId: number, newPass: string) => { await simulateDelay(); },

  // --- Organization ---
  getDepartamentos: async () => { await simulateDelay(); return [...MOCK_DEPARTAMENTOS]; },
  createDepartamento: async (data: any) => { await simulateDelay(); return { ...data, id: Date.now() }; },
  updateDepartamento: async (id: number, data: any) => { await simulateDelay(); return { ...data, id }; },
  deleteDepartamento: async (id: number) => { await simulateDelay(); },

  getPuestos: async () => { await simulateDelay(); return [{ id: 1, nombre: 'Analista' }]; },
  createPuesto: async (nombre: string) => { await simulateDelay(); return { id: Date.now(), nombre }; },
  updatePuesto: async (id: number, nombre: string) => { await simulateDelay(); return { id, nombre }; },
  deletePuesto: async (id: number) => { await simulateDelay(); },

  getPaises: async () => { await simulateDelay(); return [...MOCK_PAISES]; },
  createPais: async (data: any) => { await simulateDelay(); return { ...data, id: Date.now() }; },
  updatePais: async (id: number, data: any) => { await simulateDelay(); return { ...data, id }; },
  deletePais: async (id: number) => { await simulateDelay(); },

  getCiudades: async () => { await simulateDelay(); return [...MOCK_CIUDADES]; },
  createCiudad: async (data: any) => { await simulateDelay(); return { ...data, id: Date.now() }; },
  updateCiudad: async (id: number, data: any) => { await simulateDelay(); return { ...data, id }; },
  deleteCiudad: async (id: number) => { await simulateDelay(); },

  // --- Users ---
  getUsuarios: async () => { await simulateDelay(); return [...MOCK_USUARIOS]; },
  createUsuario: async (data: any) => { await simulateDelay(); return { ...data, id: Date.now(), nombre_completo: `${data.nombres} ${data.apellidos}` }; },
  updateUsuario: async (id: number, data: Partial<Usuario>) => { await simulateDelay(); return { ...data, id } as Usuario; },
  deleteUsuario: async (id: number) => { await simulateDelay(); },

  // --- Equipment Types ---
  getTiposEquipo: async () => { await simulateDelay(); return [...MOCK_TIPOS_EQUIPO]; },
  createTipoEquipo: async (data: any) => { 
    await simulateDelay(); 
    const newItem = { ...data, id: Date.now() };
    MOCK_TIPOS_EQUIPO.push(newItem);
    return newItem; 
  },
  updateTipoEquipo: async (id: number, data: any) => { 
    await simulateDelay(); 
    MOCK_TIPOS_EQUIPO = MOCK_TIPOS_EQUIPO.map(t => t.id === id ? { ...t, ...data } : t);
    return { ...data, id }; 
  },
  deleteTipoEquipo: async (id: number) => { 
    await simulateDelay(); 
    MOCK_TIPOS_EQUIPO = MOCK_TIPOS_EQUIPO.filter(t => t.id !== id);
  },

  // --- Equipment ---
  getEquipos: async () => { await simulateDelay(); return [...MOCK_EQUIPOS]; },
  createEquipo: async (data: any) => { await simulateDelay(); return { ...data, id: Date.now() }; },
  updateEquipo: async (id: number, data: Partial<Equipo>) => { 
    await simulateDelay(); 
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? { ...e, ...data } : e);
    return { ...data, id } as Equipo; 
  },

  // --- Actions ---
  asignarEquipo: async (id: number, usuarioId: number, ubicacion: string, observaciones: string, archivo?: File) => { 
    await simulateDelay(); 
    const u = MOCK_USUARIOS.find(x => x.id === usuarioId);
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? { ...e, estado: EstadoEquipo.ACTIVO, responsable_id: usuarioId, responsable_nombre: u?.nombre_completo, observaciones } : e);
    return MOCK_EQUIPOS.find(x => x.id === id)!; 
  },
  recepcionarEquipo: async (id: number, observaciones: string, ubicacionId?: number, ubicacionNombre?: string, liberarLicencias: boolean = false, archivo?: File) => { 
    await simulateDelay(); 
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? { ...e, estado: EstadoEquipo.DISPONIBLE, responsable_id: undefined, responsable_nombre: undefined, ubicacion_id: ubicacionId || e.ubicacion_id, ubicacion_nombre: ubicacionNombre || e.ubicacion_nombre, observaciones } : e);
    return MOCK_EQUIPOS.find(x => x.id === id)!; 
  },
  bajaEquipo: async (id: number, motivo: string, archivo?: File) => { 
    await simulateDelay(); 
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? { ...e, estado: EstadoEquipo.BAJA, observaciones: motivo } : e);
    return MOCK_EQUIPOS.find(x => x.id === id)!; 
  },
  enviarAMantenimiento: async (id: number, motivo: string) => { 
    await simulateDelay(); 
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? { ...e, estado: EstadoEquipo.EN_MANTENIMIENTO, observaciones: motivo } : e);
    return MOCK_EQUIPOS.find(x => x.id === id)!; 
  },
  finalizarMantenimiento: async (equipoId: number, data: any, nuevoEstado: string, archivo?: File) => { 
    await simulateDelay(); 
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => {
        if (e.id === equipoId) {
            return {
                ...e,
                estado: nuevoEstado as EstadoEquipo,
                serie_cargador: data.serie_cargador || e.serie_cargador,
                // Aplicar actualización de especificaciones técnicas
                procesador: data.procesador !== undefined ? data.procesador : e.procesador,
                ram: data.ram !== undefined ? data.ram : e.ram,
                disco_capacidad: data.disco_capacidad !== undefined ? data.disco_capacidad : e.disco_capacidad,
                disco_tipo: data.disco_tipo !== undefined ? data.disco_tipo : e.disco_tipo,
                sistema_operativo: data.sistema_operativo !== undefined ? data.sistema_operativo : e.sistema_operativo,
                // Si va a bodega, actualizar ubicación
                ubicacion_id: data.ubicacionId || e.ubicacion_id,
                ubicacion_nombre: data.ubicacionNombre || e.ubicacion_nombre,
                // Si va a usuario activo, el estado ya lo define el parametro nuevoEstado
                responsable_id: (nuevoEstado === EstadoEquipo.DISPONIBLE || nuevoEstado === EstadoEquipo.BAJA) ? undefined : e.responsable_id,
                responsable_nombre: (nuevoEstado === EstadoEquipo.DISPONIBLE || nuevoEstado === EstadoEquipo.BAJA) ? undefined : e.responsable_nombre,
                ultimo_mantenimiento: new Date().toISOString().split('T')[0]
            };
        }
        return e;
    });
    return { success: true }; 
  },
  marcarParaBaja: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string) => { 
    await simulateDelay(); 
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => e.id === id ? { ...e, estado: EstadoEquipo.PARA_BAJA, observaciones, ubicacion_id: ubicacionId, ubicacion_nombre: ubicacionNombre } : e);
    return MOCK_EQUIPOS.find(x => x.id === id)!; 
  },
  subirArchivoAsignacion: async (id: number, file: File) => { await simulateDelay(); return { id } as any; },

  // --- Licenses ---
  getTipoLicencias: async (): Promise<TipoLicencia[]> => { await simulateDelay(); return [{ id: 1, nombre: 'Office', proveedor: 'MS', descripcion: '...' }]; },
  createTipoLicencia: async (data: any) => { await simulateDelay(); return { ...data, id: Date.now() }; },
  updateTipoLicencia: async (id: number, data: any) => { await simulateDelay(); return { ...data, id }; },
  deleteTipoLicencia: async (id: number) => { await simulateDelay(); },
  getLicencias: async () => { await simulateDelay(); return []; },
  agregarStockLicencias: async (tipoId: number, cantidad: number, fechaVencimiento: string) => { await simulateDelay(); return { success: true }; },
  asignarLicencia: async (licenciaId: number, usuarioId: number) => { await simulateDelay(); return {} as Licencia; },
  liberarLicencia: async (licenciaId: number) => { await simulateDelay(); return {} as Licencia; },

  // --- Stats & Reports ---
  getStats: async () => { await simulateDelay(); return {}; },
  getEmailConfig: async () => { await simulateDelay(); return { remitente: 'Soporte', correos_copia: [], notificar_asignacion: true, notificar_mantenimiento: true, notificar_alerta_mantenimiento: true }; },
  saveEmailConfig: async (c: any) => { await simulateDelay(); },
  getNotifications: async () => [],
  verificarAlertasMantenimiento: async () => {},
  getWarrantyReport: async () => [],
  getHistorial: async (tipoId?: number) => [],
  getHistorialAsignaciones: async () => [],
  getHistorialMantenimiento: async (tipoId?: number) => [],

  // --- Maintenance Planning ---
  getMaintenancePlans: async () => [],
  getPlanDetails: async (id: number) => ({ plan: {}, details: [] }),
  generateProposal: async (payload: any) => ({ details: [] }),
  createMaintenancePlan: async (plan: any, details: any[]) => { await simulateDelay(); return { id: Date.now() }; },
  updatePlanDetailMonth: async (detailId: number, month: number) => { await simulateDelay(); return { success: true }; },
  iniciarMantenimientoDesdePlan: async (detailId: number, motivo: string) => { await simulateDelay(); return { success: true }; },
  registerMaintenanceExecution: async (detailId: number, data: any) => { await simulateDelay(); return { success: true }; },
  getExecutions: async (detailId: number) => [],
  getEvidence: async (detailId: number) => [],

  // --- Bulk migrations ---
  bulkCreateEquipos: async (rows: any[]) => { await simulateDelay(); return rows.length; },
  bulkCreateUsuarios: async (rows: any[]) => { await simulateDelay(); return rows.length; },
  bulkCreateLicencias: async (rows: any[]) => { await simulateDelay(); return rows.length; },
  bulkCreateDepartamentos: async (rows: any[]) => { await simulateDelay(); return rows.length; },
  bulkCreatePuestos: async (rows: any[]) => { await simulateDelay(); return rows.length; },
  bulkCreateAsignaciones: async (rows: any[]) => { await simulateDelay(); return rows.length; },

  // --- REPLACEMENT PLANNING ENDPOINTS ---
  getReplacementPlans: async (): Promise<PlanRecambio[]> => {
    await simulateDelay();
    return [...MOCK_PLANES_RECAMBIO];
  },

  getReplacementPlanDetails: async (planId: number): Promise<{ plan: PlanRecambio, details: DetallePlanRecambio[] }> => {
    await simulateDelay();
    const plan = MOCK_PLANES_RECAMBIO.find(p => p.id === planId);
    const details = MOCK_DETALLES_RECAMBIO.filter(d => d.plan_id === planId);
    if (!plan) throw new Error("Plan no encontrado");
    return { plan, details };
  },

  getReplacementCandidates: async (): Promise<Equipo[]> => {
    await simulateDelay();
    const RENOVATION_TYPES = ['desktop', 'laptop', 'workstation', 'portatil', 'notebook', 'servidor'];
    
    return MOCK_EQUIPOS.filter(e => {
        const typeName = e.tipo_nombre?.toLowerCase() || '';
        const isComputing = RENOVATION_TYPES.some(t => typeName.includes(t));
        const age = calculateAge(e.fecha_compra);
        const isActive = e.estado !== EstadoEquipo.BAJA;
        const notPlanned = !e.plan_recambio_id;

        return isComputing && age >= 4 && isActive && notPlanned;
    });
  },

  saveReplacementPlan: async (plan: PlanRecambio, details: DetallePlanRecambio[]): Promise<boolean> => {
    await simulateDelay();
    MOCK_PLANES_RECAMBIO.push(plan);
    MOCK_DETALLES_RECAMBIO.push(...details);

    const equipoIds = details.map(d => d.equipo_id);
    MOCK_EQUIPOS = MOCK_EQUIPOS.map(e => 
        equipoIds.includes(e.id) ? { ...e, plan_recambio_id: plan.id } : e
    );

    return true;
  }
};

const simulateDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));
export const api = USE_LIVE_API ? liveApi : internalMockApi;
export { MOCK_EQUIPOS, MOCK_USUARIOS, MOCK_DEPARTAMENTOS, MOCK_CIUDADES, MOCK_PAISES };
