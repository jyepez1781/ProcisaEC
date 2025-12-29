
import { 
  Usuario, Equipo, TipoEquipo, Departamento, Puesto, Ciudad, Pais,
  EstadoEquipo, RolUsuario, Licencia, TipoLicencia, PlanMantenimiento, 
  DetallePlan, EstadoPlan, EmailConfig, Notificacion, HistorialMovimiento,
  HistorialAsignacion, RegistroMantenimiento, ReporteGarantia
} from '../types';
import { liveApi } from './liveApi';

/**
 * TOGGLE: Cambiar a true para conectar con el Backend Laravel real.
 */
const USE_LIVE_API = false;

// Helper para fechas dinámicas
const getDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
};

const getYear = (yearOffset: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + yearOffset);
    return d.toISOString().split('T')[0];
};

// --- 1. UBICACIÓN Y ORGANIZACIÓN ---
let MOCK_PAISES: Pais[] = [
  { id: 1, nombre: 'Ecuador', abreviatura: 'EC' },
  { id: 2, nombre: 'México', abreviatura: 'MX' },
];

let MOCK_CIUDADES: Ciudad[] = [
  { id: 1, nombre: 'Guayaquil', abreviatura: 'GYE', pais_id: 1, pais_nombre: 'Ecuador' },
  { id: 2, nombre: 'Quito', abreviatura: 'UIO', pais_id: 1, pais_nombre: 'Ecuador' },
  { id: 3, nombre: 'Ciudad de México', abreviatura: 'CDMX', pais_id: 2, pais_nombre: 'México' },
];

let MOCK_DEPARTAMENTOS: Departamento[] = [
  { id: 1, nombre: 'Tecnología (Bodega GYE)', es_bodega: true, ciudad_id: 1, ciudad_nombre: 'Guayaquil' },
  { id: 2, nombre: 'Recursos Humanos', es_bodega: false, ciudad_id: 1, ciudad_nombre: 'Guayaquil' },
  { id: 3, nombre: 'Finanzas', es_bodega: false, ciudad_id: 1, ciudad_nombre: 'Guayaquil' },
  { id: 4, nombre: 'Operaciones UIO', es_bodega: false, ciudad_id: 2, ciudad_nombre: 'Quito' },
  { id: 5, nombre: 'Bodega IT CDMX', es_bodega: true, ciudad_id: 3, ciudad_nombre: 'Ciudad de México' },
];

let MOCK_PUESTOS: Puesto[] = [
  { id: 1, nombre: 'Gerente de TI' },
  { id: 2, nombre: 'Analista de Soporte' },
  { id: 3, nombre: 'Jefe de RRHH' },
  { id: 4, nombre: 'Contador Senior' },
  { id: 5, nombre: 'Desarrollador Fullstack' },
];

// --- 2. USUARIOS ---
let MOCK_USUARIOS: Usuario[] = [
  { 
    id: 1, nombre_usuario: 'admin', nombre_completo: 'Administrador Sistema', nombres: 'Admin', apellidos: 'Sys', 
    correo: 'admin@sys.com', password: '123', rol: RolUsuario.ADMIN, activo: true, 
    departamento_id: 1, departamento_nombre: 'Tecnología (Bodega GYE)', puesto_id: 1, puesto_nombre: 'Gerente de TI', numero_empleado: 'ADM001' 
  },
  { 
    id: 2, nombre_usuario: 'jperez', nombre_completo: 'Juan Pérez', nombres: 'Juan', apellidos: 'Pérez', 
    correo: 'jperez@sys.com', password: '123', rol: RolUsuario.USUARIO, activo: true, 
    departamento_id: 2, departamento_nombre: 'Recursos Humanos', puesto_id: 3, puesto_nombre: 'Jefe de RRHH', numero_empleado: 'EMP050' 
  },
  { 
    id: 3, nombre_usuario: 'mlopez', nombre_completo: 'María López', nombres: 'María', apellidos: 'López', 
    correo: 'mlopez@sys.com', password: '123', rol: RolUsuario.TECNICO, activo: true, 
    departamento_id: 1, departamento_nombre: 'Tecnología (Bodega GYE)', puesto_id: 2, puesto_nombre: 'Analista de Soporte', numero_empleado: 'TEC002' 
  },
];

// --- 3. CATÁLOGOS EQUIPOS Y LICENCIAS ---
let MOCK_TIPOS_EQUIPO: TipoEquipo[] = [
  { id: 1, nombre: 'Laptop', descripcion: 'Computadora portátil estándar', frecuencia_anual: 2 },
  { id: 2, nombre: 'Desktop', descripcion: 'Computadora de escritorio', frecuencia_anual: 1 },
  { id: 3, nombre: 'Monitor', descripcion: 'Monitor externo', frecuencia_anual: 0 },
  { id: 4, nombre: 'Impresora', frecuencia_anual: 4, descripcion: 'Impresora láser de red' }
];

let MOCK_EQUIPOS: Equipo[] = [
  { 
    id: 1, codigo_activo: 'ECGYELAP1001', numero_serie: 'SN1001', marca: 'Dell', modelo: 'Latitude 5420', 
    tipo_equipo_id: 1, tipo_nombre: 'Laptop', fecha_compra: '2021-05-10', valor_compra: 1200, 
    anos_garantia: 3, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, ubicacion_nombre: 'Tecnología (Bodega GYE)', 
    responsable_id: 2, responsable_nombre: 'Juan Pérez', observaciones: 'Buen estado' 
  },
  { 
    id: 2, codigo_activo: 'ECGYEDESK1002', numero_serie: 'SN1002', marca: 'HP', modelo: 'ProTower 400', 
    tipo_equipo_id: 2, tipo_nombre: 'Desktop', fecha_compra: '2020-02-15', valor_compra: 800, 
    anos_garantia: 1, estado: EstadoEquipo.DISPONIBLE, ubicacion_id: 1, ubicacion_nombre: 'Tecnología (Bodega GYE)', 
    observaciones: 'Listo para asignar' 
  }
];

let MOCK_TIPOS_LICENCIA: TipoLicencia[] = [
  { id: 1, nombre: 'Microsoft 365 Business', proveedor: 'Microsoft', descripcion: 'Suscripción anual de Office 365' },
  { id: 2, nombre: 'Adobe Creative Cloud', proveedor: 'Adobe', descripcion: 'Suite de diseño gráfico' }
];

let MOCK_LICENCIAS: Licencia[] = [
  { id: 1, tipo_id: 1, tipo_nombre: 'Microsoft 365 Business', clave: 'W269N-WFGWX-YVC9B-4J6C9-T83GX', fecha_compra: '2023-01-01', fecha_vencimiento: '2024-01-01', usuario_id: 2, usuario_nombre: 'Juan Pérez', usuario_departamento: 'Recursos Humanos' },
];

let MOCK_EMAIL_CONFIG: EmailConfig = {
  remitente: 'Sistema InvenTory',
  correos_copia: ['it-admin@sys.com'],
  notificar_asignacion: true,
  notificar_mantenimiento: true,
  dias_anticipacion_alerta: 15
};

// --- 4. PLANIFICACIÓN (MOCK DATA ACTUALIZADA DINÁMICAMENTE) ---
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

let MOCK_PLANES: PlanMantenimiento[] = [
    { 
        id: 101, 
        anio: currentYear, 
        nombre: `Plan Maestro ${currentYear} - Guayaquil`, 
        creado_por: 'Admin', 
        fecha_creacion: getDate(-30), 
        estado: 'ACTIVO', 
        ciudad_id: 1, 
        ciudad_nombre: 'Guayaquil' 
    }
];

let MOCK_DETALLES_PLAN: DetallePlan[] = [
    { 
        id: 1, 
        plan_id: 101, 
        equipo_id: 1, 
        equipo_codigo: 'ECGYELAP1001', 
        equipo_tipo: 'Laptop', 
        equipo_modelo: 'Dell Latitude', 
        equipo_ubicacion: 'Tecnología', 
        mes_programado: currentMonth, 
        estado: EstadoPlan.PENDIENTE 
    },
    { 
        id: 2, 
        plan_id: 101, 
        equipo_id: 2, 
        equipo_codigo: 'ECGYEDESK1002', 
        equipo_tipo: 'Desktop', 
        equipo_modelo: 'HP ProTower', 
        equipo_ubicacion: 'Tecnología', 
        mes_programado: currentMonth === 1 ? 1 : currentMonth - 1, // Ejemplo de backlog
        estado: EstadoPlan.PENDIENTE 
    }
];

// --- FUNCIONES DE UTILIDAD PARA SINCRONIZACIÓN (SOLO PARA MOCK) ---

const regenerateAssetCode = (numeroSerie: string, ubicacionId: number): string | null => {
    const dept = MOCK_DEPARTAMENTOS.find(d => d.id === ubicacionId);
    if (!dept) return null;
    const city = MOCK_CIUDADES.find(c => c.id === dept.ciudad_id);
    if (!city) return null;
    const country = MOCK_PAISES.find(p => p.id === city.pais_id);
    if (!country) return null;
    return `${country.abreviatura}${city.abreviatura}${numeroSerie.trim().toUpperCase()}`.toUpperCase();
};

const syncEquipoMetadata = (equipo: Equipo) => {
    const tipo = MOCK_TIPOS_EQUIPO.find(t => t.id === equipo.tipo_equipo_id);
    if (tipo) equipo.tipo_nombre = tipo.nombre;
    const dept = MOCK_DEPARTAMENTOS.find(d => d.id === equipo.ubicacion_id);
    if (dept) equipo.ubicacion_nombre = dept.nombre;
    const newCode = regenerateAssetCode(equipo.numero_serie, equipo.ubicacion_id);
    if (newCode) equipo.codigo_activo = newCode;
};

// --- IMPLEMENTACIÓN INTERNA MOCK ---

const internalMockApi = {
  // Auth
  login: async (email: string, password?: string): Promise<Usuario> => {
    await simulateDelay();
    const user = MOCK_USUARIOS.find(u => u.correo === email && u.password === password);
    if (!user) throw new Error('Credenciales inválidas');
    if (!user.activo) throw new Error('Usuario inactivo');
    return user;
  },
  changePassword: async (userId: number, newPass: string) => {
    await simulateDelay();
    const idx = MOCK_USUARIOS.findIndex(u => u.id === userId);
    if (idx >= 0) MOCK_USUARIOS[idx].password = newPass;
  },

  // Organization
  getDepartamentos: async () => { await simulateDelay(); return [...MOCK_DEPARTAMENTOS]; },
  createDepartamento: async (data: any) => { await simulateDelay(); const newItem = { id: Date.now(), ...data }; MOCK_DEPARTAMENTOS.push(newItem); return newItem; },
  updateDepartamento: async (id: number, data: any) => { 
    await simulateDelay(); 
    const idx = MOCK_DEPARTAMENTOS.findIndex(d => d.id === id); 
    if (idx >= 0) MOCK_DEPARTAMENTOS[idx] = { ...MOCK_DEPARTAMENTOS[idx], ...data }; 
    return MOCK_DEPARTAMENTOS[idx]; 
  },
  deleteDepartamento: async (id: number) => { await simulateDelay(); MOCK_DEPARTAMENTOS = MOCK_DEPARTAMENTOS.filter(d => d.id !== id); },

  getPuestos: async () => { await simulateDelay(); return [...MOCK_PUESTOS]; },
  createPuesto: async (data: any) => { await simulateDelay(); const newItem = { id: Date.now(), ...data }; MOCK_PUESTOS.push(newItem); return newItem; },
  updatePuesto: async (id: number, data: any) => { 
    await simulateDelay(); 
    const idx = MOCK_PUESTOS.findIndex(p => p.id === id); 
    if (idx >= 0) MOCK_PUESTOS[idx] = { ...MOCK_PUESTOS[idx], ...data }; 
    return MOCK_PUESTOS[idx]; 
  },
  deletePuesto: async (id: number) => { await simulateDelay(); MOCK_PUESTOS = MOCK_PUESTOS.filter(p => p.id !== id); },

  getCiudades: async () => { await simulateDelay(); return [...MOCK_CIUDADES]; },
  createCiudad: async (data: any) => { await simulateDelay(); const newItem = { id: Date.now(), ...data }; MOCK_CIUDADES.push(newItem); return newItem; },
  updateCiudad: async (id: number, data: any) => { 
    await simulateDelay(); 
    const idx = MOCK_CIUDADES.findIndex(c => c.id === id); 
    if (idx >= 0) MOCK_CIUDADES[idx] = { ...MOCK_CIUDADES[idx], ...data }; 
    return MOCK_CIUDADES[idx]; 
  },
  deleteCiudad: async (id: number) => { await simulateDelay(); MOCK_CIUDADES = MOCK_CIUDADES.filter(c => c.id !== id); },

  getPaises: async () => { await simulateDelay(); return [...MOCK_PAISES]; },
  createPais: async (data: any) => { await simulateDelay(); const newItem = { id: Date.now(), ...data }; MOCK_PAISES.push(newItem); return newItem; },
  updatePais: async (id: number, data: any) => { 
    await simulateDelay(); 
    const idx = MOCK_PAISES.findIndex(p => p.id === id); 
    if (idx >= 0) MOCK_PAISES[idx] = { ...MOCK_PAISES[idx], ...data }; 
    return MOCK_PAISES[idx]; 
  },
  deletePais: async (id: number) => { await simulateDelay(); MOCK_PAISES = MOCK_PAISES.filter(p => p.id !== id); },

  // Users
  getUsuarios: async () => { await simulateDelay(); return [...MOCK_USUARIOS]; },
  createUsuario: async (data: any) => { await simulateDelay(); const newItem = { id: Date.now(), ...data }; MOCK_USUARIOS.push(newItem); return newItem; },
  updateUsuario: async (id: number, data: any) => { 
    await simulateDelay(); 
    const idx = MOCK_USUARIOS.findIndex(u => u.id === id); 
    if (idx >= 0) MOCK_USUARIOS[idx] = { ...MOCK_USUARIOS[idx], ...data }; 
    return MOCK_USUARIOS[idx]; 
  },

  // Equipment Types
  getTiposEquipo: async () => { await simulateDelay(); return [...MOCK_TIPOS_EQUIPO]; },
  createTipoEquipo: async (data: any) => { await simulateDelay(); const newItem = { id: Date.now(), ...data }; MOCK_TIPOS_EQUIPO.push(newItem); return newItem; },
  updateTipoEquipo: async (id: number, data: any) => { 
    await simulateDelay(); 
    const idx = MOCK_TIPOS_EQUIPO.findIndex(t => t.id === id); 
    if (idx >= 0) MOCK_TIPOS_EQUIPO[idx] = { ...MOCK_TIPOS_EQUIPO[idx], ...data }; 
    return MOCK_TIPOS_EQUIPO[idx]; 
  },
  deleteTipoEquipo: async (id: number) => { await simulateDelay(); MOCK_TIPOS_EQUIPO = MOCK_TIPOS_EQUIPO.filter(t => t.id !== id); },

  // Equipment
  getEquipos: async () => { await simulateDelay(); return [...MOCK_EQUIPOS]; },
  createEquipo: async (data: any) => { 
    await simulateDelay(); 
    const newItem = { id: Date.now(), ...data, estado: EstadoEquipo.DISPONIBLE }; 
    syncEquipoMetadata(newItem as Equipo);
    MOCK_EQUIPOS.push(newItem as Equipo); 
    return newItem as Equipo; 
  },
  updateEquipo: async (id: number, data: any) => { 
    await simulateDelay(); 
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id); 
    if (idx >= 0) {
        MOCK_EQUIPOS[idx] = { ...MOCK_EQUIPOS[idx], ...data };
        syncEquipoMetadata(MOCK_EQUIPOS[idx]);
    } 
    return MOCK_EQUIPOS[idx]; 
  },

  // Actions
  asignarEquipo: async (id: number, usuarioId: number, ubicacion: string, observaciones: string, archivo?: File) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        const usuario = MOCK_USUARIOS.find(u => u.id === usuarioId);
        MOCK_EQUIPOS[idx].estado = EstadoEquipo.ACTIVO;
        MOCK_EQUIPOS[idx].responsable_id = usuarioId;
        MOCK_EQUIPOS[idx].responsable_nombre = usuario?.nombre_completo;
        MOCK_EQUIPOS[idx].ubicacion_nombre = ubicacion; 
        MOCK_EQUIPOS[idx].observaciones = observaciones;
    }
    return MOCK_EQUIPOS[idx];
  },
  recepcionarEquipo: async (id: number, observaciones: string, ubicacionId?: number, ubicacionNombre?: string, liberarLicencias?: boolean, archivo?: File) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        MOCK_EQUIPOS[idx].estado = EstadoEquipo.DISPONIBLE;
        MOCK_EQUIPOS[idx].responsable_id = undefined;
        MOCK_EQUIPOS[idx].responsable_nombre = undefined;
        if (ubicacionId) {
            MOCK_EQUIPOS[idx].ubicacion_id = ubicacionId;
            syncEquipoMetadata(MOCK_EQUIPOS[idx]);
        }
        MOCK_EQUIPOS[idx].observaciones = observaciones;
    }
    return MOCK_EQUIPOS[idx];
  },
  bajaEquipo: async (id: number, motivo: string, archivo?: File) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        MOCK_EQUIPOS[idx].estado = EstadoEquipo.BAJA;
        MOCK_EQUIPOS[idx].observaciones = motivo;
    }
    return MOCK_EQUIPOS[idx];
  },
  enviarAMantenimiento: async (id: number, motivo: string) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        MOCK_EQUIPOS[idx].estado = EstadoEquipo.EN_MANTENIMIENTO;
        MOCK_EQUIPOS[idx].observaciones = motivo;
    }
    return MOCK_EQUIPOS[idx];
  },
  finalizarMantenimiento: async (equipoId: number, data: any, nuevoEstado: string, archivo?: File) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === equipoId);
    if (idx >= 0) {
        MOCK_EQUIPOS[idx].estado = nuevoEstado as EstadoEquipo;
        if (data.ubicacionId) {
            MOCK_EQUIPOS[idx].ubicacion_id = data.ubicacionId;
            syncEquipoMetadata(MOCK_EQUIPOS[idx]);
        }
        MOCK_EQUIPOS[idx].ultimo_mantenimiento = new Date().toISOString().split('T')[0];
    }
  },
  marcarParaBaja: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        MOCK_EQUIPOS[idx].estado = EstadoEquipo.PARA_BAJA;
        MOCK_EQUIPOS[idx].ubicacion_id = ubicacionId;
        syncEquipoMetadata(MOCK_EQUIPOS[idx]);
        MOCK_EQUIPOS[idx].responsable_id = undefined;
        MOCK_EQUIPOS[idx].responsable_nombre = undefined;
    }
    return MOCK_EQUIPOS[idx];
  },
  subirArchivoAsignacion: async (id: number, file: File) => {
      await simulateDelay();
      return {} as any;
  },

  // Licenses
  getTipoLicencias: async () => { await simulateDelay(); return [...MOCK_TIPOS_LICENCIA]; },
  createTipoLicencia: async (data: any) => { await simulateDelay(); const newItem = { id: Date.now(), ...data }; MOCK_TIPOS_LICENCIA.push(newItem); return newItem; },
  getLicencias: async () => { await simulateDelay(); return [...MOCK_LICENCIAS]; },
  agregarStockLicencias: async (tipoId: number, cantidad: number, fechaVencimiento: string) => { await simulateDelay(); },
  asignarLicencia: async (licenciaId: number, usuarioId: number) => { await simulateDelay(); },
  liberarLicencia: async (licenciaId: number) => { await simulateDelay(); },

  // Planning
  getMaintenancePlans: async () => { 
      await simulateDelay(); 
      return [...MOCK_PLANES]; 
  },
  getPlanDetails: async (planId: number) => { 
      await simulateDelay(); 
      const plan = MOCK_PLANES.find(p => p.id === planId);
      const details = MOCK_DETALLES_PLAN.filter(d => d.plan_id === planId);
      return { plan: plan || {} as any, details }; 
  },
  createMaintenancePlan: async (plan: PlanMantenimiento, details: DetallePlan[]) => { 
      await simulateDelay(); 
      MOCK_PLANES.push(plan);
      MOCK_DETALLES_PLAN.push(...details);
      return true;
  },
  updatePlanDetailMonth: async (itemId: number, newMonth: number) => { 
      await simulateDelay(); 
      const idx = MOCK_DETALLES_PLAN.findIndex(d => d.id === itemId);
      if (idx >= 0) MOCK_DETALLES_PLAN[idx].mes_programado = newMonth;
  },
  registerMaintenanceExecution: async (detailId: number, data: any) => { 
      await simulateDelay(); 
      const idx = MOCK_DETALLES_PLAN.findIndex(d => d.id === detailId);
      if (idx >= 0) {
          MOCK_DETALLES_PLAN[idx].estado = EstadoPlan.REALIZADO;
          MOCK_DETALLES_PLAN[idx].fecha_ejecucion = data.fecha;
          MOCK_DETALLES_PLAN[idx].tecnico_responsable = data.tecnico;
      }
  },
  getEvidence: async (detailId: number) => { await simulateDelay(); return []; },
  iniciarMantenimientoDesdePlan: async (detailId: number, motivo: string) => { 
      await simulateDelay(); 
      const detail = MOCK_DETALLES_PLAN.find(d => d.id === detailId);
      if (detail) {
          detail.estado = EstadoPlan.EN_PROCESO;
          await internalMockApi.enviarAMantenimiento(detail.equipo_id, motivo);
      }
  },
  // UPDATED: Include backlog (previous months) and sort by month ascending
  getPendingMaintenanceCurrentMonth: async () => { 
      await simulateDelay(); 
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const activeYearPlanIds = MOCK_PLANES
        .filter(p => p.anio === year)
        .map(p => p.id);

      return MOCK_DETALLES_PLAN
        .filter(d => 
            activeYearPlanIds.includes(d.plan_id) && 
            d.mes_programado <= month && 
            d.estado !== EstadoPlan.REALIZADO
        )
        .sort((a, b) => a.mes_programado - b.mes_programado);
  },

  // Email Config
  getEmailConfig: async () => { await simulateDelay(); return { ...MOCK_EMAIL_CONFIG }; },
  saveEmailConfig: async (config: EmailConfig) => { await simulateDelay(); MOCK_EMAIL_CONFIG = config; },

  // Stats
  getStats: async () => { await simulateDelay(); return {}; },
  getWarrantyReport: async () => { 
      await simulateDelay(); 
      return MOCK_EQUIPOS.map(e => ({ equipo: e, dias_restantes: 15, fecha_vencimiento: '2024-05-20' })); 
  },
  getReplacementCandidates: async () => { await simulateDelay(); return []; },
  getHistorial: async () => { await simulateDelay(); return []; },
  getHistorialMantenimiento: async () => { await simulateDelay(); return []; },
  getHistorialAsignaciones: async () => { await simulateDelay(); return []; },
  getNotifications: async () => { await simulateDelay(); return []; },
  verificarAlertasMantenimiento: async () => { await simulateDelay(); },

  // Bulk Operations
  bulkCreateEquipos: async (data: any[]) => { await simulateDelay(); return data.length; },
  bulkCreateUsuarios: async (data: any[]) => { await simulateDelay(); return data.length; },
  bulkCreateLicencias: async (data: any[]) => { await simulateDelay(); return data.length; },
  bulkCreateDepartamentos: async (data: any[]) => { await simulateDelay(); return data.length; },
  bulkCreatePuestos: async (data: any[]) => { await simulateDelay(); return data.length; },
  bulkCreateAsignaciones: async (data: any[]) => { await simulateDelay(); return data.length; }
};

// Mock Delay Helper
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// --- EXPORTACIÓN CONDICIONAL ---
export const api = USE_LIVE_API ? liveApi : internalMockApi;

// También exportamos MOCK_EQUIPOS y otros para compatibilidad si algún componente lo requiere
export { MOCK_EQUIPOS, MOCK_USUARIOS, MOCK_DEPARTAMENTOS, MOCK_CIUDADES, MOCK_PAISES };
