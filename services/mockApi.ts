
import { 
  Usuario, Equipo, TipoEquipo, Departamento, Puesto, Ciudad, Pais,
  EstadoEquipo, RolUsuario, Licencia, TipoLicencia, PlanMantenimiento, 
  DetallePlan, EstadoPlan, EmailConfig, Notificacion, HistorialMovimiento,
  HistorialAsignacion, RegistroMantenimiento, ReporteGarantia
} from '../types';

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
  { 
    id: 4, nombre_usuario: 'cgarcia', nombre_completo: 'Carlos García', nombres: 'Carlos', apellidos: 'García', 
    correo: 'cgarcia@sys.com', password: '123', rol: RolUsuario.USUARIO, activo: true, 
    departamento_id: 3, departamento_nombre: 'Finanzas', puesto_id: 4, puesto_nombre: 'Contador Senior', numero_empleado: 'EMP088' 
  },
  { 
    id: 5, nombre_usuario: 'lrodriguez', nombre_completo: 'Lucía Rodríguez', nombres: 'Lucía', apellidos: 'Rodríguez', 
    correo: 'lrodriguez@sys.com', password: '123', rol: RolUsuario.USUARIO, activo: false, 
    departamento_id: 4, departamento_nombre: 'Operaciones UIO', puesto_id: 5, puesto_nombre: 'Desarrollador Fullstack', numero_empleado: 'EMP099' 
  },
];

// --- 3. CATÁLOGOS EQUIPOS Y LICENCIAS ---
let MOCK_TIPOS_EQUIPO: TipoEquipo[] = [
  { id: 1, nombre: 'Laptop', descripcion: 'Computadora portátil estándar', frecuencia_anual: 2 },
  { id: 2, nombre: 'Desktop', descripcion: 'Computadora de escritorio', frecuencia_anual: 1 },
  { id: 3, nombre: 'Monitor', descripcion: 'Monitor externo', frecuencia_anual: 0 },
  { id: 4, nombre: 'Impresora', descripcion: 'Impresora láser de red', frecuencia_anual: 4 },
  { id: 5, nombre: 'Tablet', descripcion: 'Dispositivo móvil', frecuencia_anual: 1 },
];

let MOCK_TIPOS_LICENCIA: TipoLicencia[] = [
  { id: 1, nombre: 'Microsoft 365 Business', proveedor: 'Microsoft', descripcion: 'Suite de oficina y correo' },
  { id: 2, nombre: 'Adobe Creative Cloud', proveedor: 'Adobe', descripcion: 'Suite de diseño gráfico' },
  { id: 3, nombre: 'AutoCAD 2024', proveedor: 'Autodesk', descripcion: 'Diseño asistido por computadora' },
  { id: 4, nombre: 'Antivirus ESET', proveedor: 'ESET', descripcion: 'Seguridad Endpoint' },
];

// --- 4. EQUIPOS (INVENTARIO) ---
let MOCK_EQUIPOS: Equipo[] = [
  // 1. Asignado a Juan Pérez (Activo, Nuevo)
  { 
    id: 1, codigo_activo: 'ECGYELAP001', numero_serie: '8H29FK2', marca: 'Dell', modelo: 'Latitude 5420', 
    tipo_equipo_id: 1, tipo_nombre: 'Laptop', estado: EstadoEquipo.ACTIVO, 
    ubicacion_id: 2, ubicacion_nombre: 'Oficina RRHH',
    responsable_id: 2, responsable_nombre: 'Juan Pérez',
    fecha_compra: getDate(-180), valor_compra: 1250.00, anos_garantia: 3, 
    serie_cargador: 'CN-0K', observaciones: 'Equipo asignado recientemente.'
  },
  // 2. Candidato a Reemplazo (Antiguo, Asignado a Carlos)
  { 
    id: 2, codigo_activo: 'ECGYEDES005', numero_serie: 'MXL8902', marca: 'HP', modelo: 'ProDesk 600 G3', 
    tipo_equipo_id: 2, tipo_nombre: 'Desktop', estado: EstadoEquipo.ACTIVO, 
    ubicacion_id: 3, ubicacion_nombre: 'Oficina Finanzas',
    responsable_id: 4, responsable_nombre: 'Carlos García',
    fecha_compra: getYear(-5), valor_compra: 850.00, anos_garantia: 3, 
    observaciones: 'Equipo lento, solicita cambio.'
  },
  // 3. Garantía por Vencer (Disponible en Bodega)
  { 
    id: 3, codigo_activo: 'ECGYELAP015', numero_serie: '5CG9201', marca: 'Lenovo', modelo: 'ThinkPad T14', 
    tipo_equipo_id: 1, tipo_nombre: 'Laptop', estado: EstadoEquipo.DISPONIBLE, 
    ubicacion_id: 1, ubicacion_nombre: 'Tecnología (Bodega GYE)',
    fecha_compra: getDate(-350), valor_compra: 1400.00, anos_garantia: 1, // Vence en 15 días
    serie_cargador: 'LN-90W', observaciones: 'Reingresado de usuario inactivo. Listo para asignar.'
  },
  // 4. En Mantenimiento
  { 
    id: 4, codigo_activo: 'ECGYEPRN002', numero_serie: 'VNC3022', marca: 'Kyocera', modelo: 'Ecosys M2040', 
    tipo_equipo_id: 4, tipo_nombre: 'Impresora', estado: EstadoEquipo.EN_MANTENIMIENTO, 
    ubicacion_id: 1, ubicacion_nombre: 'Taller Externo',
    fecha_compra: getDate(-400), valor_compra: 450.00, anos_garantia: 1, 
    observaciones: 'Atasco de papel recurrente. Enviado a proveedor.'
  },
  // 5. Dado de Baja
  { 
    id: 5, codigo_activo: 'ECGYEMON099', numero_serie: 'CN4029', marca: 'Samsung', modelo: 'S24F350', 
    tipo_equipo_id: 3, tipo_nombre: 'Monitor', estado: EstadoEquipo.BAJA, 
    ubicacion_id: 1, ubicacion_nombre: 'Bodega de Desechos',
    fecha_compra: getYear(-7), valor_compra: 150.00, anos_garantia: 1, 
    observaciones: 'Pantalla rota. Costo de reparación excede valor en libros.'
  },
  // 6. Para Baja (Pre-Baja)
  { 
    id: 6, codigo_activo: 'ECGYETAB003', numero_serie: 'IPD-882', marca: 'Apple', modelo: 'iPad Air 2', 
    tipo_equipo_id: 5, tipo_nombre: 'Tablet', estado: EstadoEquipo.PARA_BAJA, 
    ubicacion_id: 1, ubicacion_nombre: 'Tecnología (Bodega GYE)',
    fecha_compra: getYear(-6), valor_compra: 600.00, anos_garantia: 1, 
    observaciones: 'Batería hinchada. Peligroso.'
  }
];

// --- 5. HISTORIAL DE MOVIMIENTOS ---
let MOCK_HISTORIAL: HistorialMovimiento[] = [
  // Creaciones iniciales
  { id: 1, equipo_id: 1, equipo_codigo: 'ECGYELAP001', tipo_accion: 'CREACION', fecha: getDate(-180), usuario_responsable: 'Admin Sys', detalle: 'Ingreso inicial por compra.' },
  { id: 2, equipo_id: 2, equipo_codigo: 'ECGYEDES005', tipo_accion: 'CREACION', fecha: getYear(-5), usuario_responsable: 'Admin Sys', detalle: 'Ingreso inicial.' },
  
  // Movimientos Equipo 1 (Asignado a Juan)
  { id: 3, equipo_id: 1, equipo_codigo: 'ECGYELAP001', tipo_accion: 'ASIGNACION', fecha: getDate(-170), usuario_responsable: 'Juan Pérez', detalle: 'Entrega de equipo nuevo.', archivo: 'acta_entrega_001.pdf' },
  
  // Movimientos Equipo 3 (Garantía por vencer - Rotación)
  { id: 4, equipo_id: 3, equipo_codigo: 'ECGYELAP015', tipo_accion: 'ASIGNACION', fecha: getDate(-340), usuario_responsable: 'Lucía Rodríguez', detalle: 'Asignación inicial.', archivo: 'acta_entrega_015.pdf' },
  { id: 5, equipo_id: 3, equipo_codigo: 'ECGYELAP015', tipo_accion: 'RECEPCION', fecha: getDate(-5), usuario_responsable: 'Lucía Rodríguez', detalle: 'Devolución por salida de personal.', archivo: 'acta_recepcion_015.pdf' },
  
  // Movimientos Equipo 4 (Mantenimiento)
  { id: 6, equipo_id: 4, equipo_codigo: 'ECGYEPRN002', tipo_accion: 'MANTENIMIENTO', fecha: getDate(-2), usuario_responsable: 'Admin Sys', detalle: 'Envío a taller por atasco de papel.' },

  // Movimientos Equipo 5 (Baja)
  { id: 7, equipo_id: 5, equipo_codigo: 'ECGYEMON099', tipo_accion: 'ASIGNACION', fecha: getYear(-6), usuario_responsable: 'Carlos García', detalle: 'Entrega inicial.' },
  { id: 8, equipo_id: 5, equipo_codigo: 'ECGYEMON099', tipo_accion: 'RECEPCION', fecha: getDate(-10), usuario_responsable: 'Carlos García', detalle: 'Pantalla fallando.', archivo: 'acta_recepcion_mon.pdf' },
  { id: 9, equipo_id: 5, equipo_codigo: 'ECGYEMON099', tipo_accion: 'BAJA', fecha: getDate(-1), usuario_responsable: 'Admin Sys', detalle: 'Baja definitiva por daño físico irreparable.', archivo: 'informe_baja_mon.pdf' },
];

// --- 6. ASIGNACIONES (ACTUALES E HISTÓRICAS) ---
let MOCK_ASIGNACIONES: HistorialAsignacion[] = [
  // Activa Juan
  { id: 1, equipo_codigo: 'ECGYELAP001', equipo_modelo: 'Dell Latitude 5420', usuario_nombre: 'Juan Pérez', usuario_departamento: 'Recursos Humanos', fecha_inicio: getDate(-170), fecha_fin: null, ubicacion: 'Oficina RRHH', archivo_pdf: 'acta_entrega_001.pdf' },
  // Activa Carlos
  { id: 2, equipo_codigo: 'ECGYEDES005', equipo_modelo: 'HP ProDesk 600 G3', usuario_nombre: 'Carlos García', usuario_departamento: 'Finanzas', fecha_inicio: getYear(-4), fecha_fin: null, ubicacion: 'Oficina Finanzas' },
  // Cerrada Lucía
  { id: 3, equipo_codigo: 'ECGYELAP015', equipo_modelo: 'Lenovo ThinkPad T14', usuario_nombre: 'Lucía Rodríguez', usuario_departamento: 'Operaciones UIO', fecha_inicio: getDate(-340), fecha_fin: getDate(-5), ubicacion: 'Quito', archivo_pdf: 'acta_entrega_015.pdf' }
];

// --- 7. MANTENIMIENTOS (HISTORIAL) ---
let MOCK_MANTENIMIENTOS: RegistroMantenimiento[] = [
  { id: 1, equipo_id: 2, equipo_codigo: 'ECGYEDES005', equipo_modelo: 'HP ProDesk 600 G3', fecha: getDate(-100), tipo_mantenimiento: 'Preventivo', proveedor: 'Soporte Interno', costo: 0, descripcion: 'Limpieza física y optimización de software.', archivo_orden: 'informe_prev_005.pdf' },
  { id: 2, equipo_id: 4, equipo_codigo: 'ECGYEPRN002', equipo_modelo: 'Kyocera Ecosys', fecha: getDate(-200), tipo_mantenimiento: 'Correctivo', proveedor: 'Kyocera Services', costo: 120.50, descripcion: 'Cambio de rodillos de alimentación.', archivo_orden: 'factura_kyo_123.pdf' }
];

// --- 8. LICENCIAS ---
let MOCK_LICENCIAS: Licencia[] = [
  // M365 para Juan (Asignada)
  { id: 1, tipo_id: 1, tipo_nombre: 'Microsoft 365 Business', clave: 'XXXX-YYYY-ZZZZ-0001', fecha_compra: getDate(-200), fecha_vencimiento: getDate(165), usuario_id: 2, usuario_nombre: 'Juan Pérez', usuario_departamento: 'Recursos Humanos' },
  // Adobe para Carlos (Asignada)
  { id: 2, tipo_id: 2, tipo_nombre: 'Adobe Creative Cloud', clave: 'ADBE-1122-3344', fecha_compra: getDate(-100), fecha_vencimiento: getDate(265), usuario_id: 4, usuario_nombre: 'Carlos García', usuario_departamento: 'Finanzas' },
  // M365 Disponible
  { id: 3, tipo_id: 1, tipo_nombre: 'Microsoft 365 Business', clave: 'XXXX-YYYY-ZZZZ-0002', fecha_compra: getDate(-200), fecha_vencimiento: getDate(165), usuario_id: null },
  // Antivirus Disponible
  { id: 4, tipo_id: 4, tipo_nombre: 'Antivirus ESET', clave: 'ESET-9988-7766', fecha_compra: getDate(-50), fecha_vencimiento: getDate(315), usuario_id: null },
];

// --- 9. PLANIFICACIÓN DE MANTENIMIENTO ---
const planId = 100;
let MOCK_PLANES: PlanMantenimiento[] = [
  { id: planId, anio: new Date().getFullYear(), nombre: 'Plan Anual GYE 2024', creado_por: 'Admin Sys', fecha_creacion: getDate(-60), estado: 'ACTIVO', ciudad_id: 1, ciudad_nombre: 'Guayaquil' }
];

let MOCK_DETALLES_PLAN: DetallePlan[] = [
  // Equipo 1 (Laptop) - Programado en Mayo (Pendiente)
  { id: 1, plan_id: planId, equipo_id: 1, equipo_codigo: 'ECGYELAP001', equipo_tipo: 'Laptop', equipo_modelo: 'Dell Latitude', equipo_ubicacion: 'Oficina RRHH', mes_programado: 5, estado: EstadoPlan.PENDIENTE },
  // Equipo 2 (Desktop) - Programado en Febrero (Realizado)
  { id: 2, plan_id: planId, equipo_id: 2, equipo_codigo: 'ECGYEDES005', equipo_tipo: 'Desktop', equipo_modelo: 'HP ProDesk', equipo_ubicacion: 'Oficina Finanzas', mes_programado: 2, estado: EstadoPlan.REALIZADO, fecha_ejecucion: getDate(-45), tecnico_responsable: 'Soporte Interno' },
  // Equipo 4 (Impresora) - Programado en Abril (En Proceso, coincide con estado actual del equipo)
  { id: 3, plan_id: planId, equipo_id: 4, equipo_codigo: 'ECGYEPRN002', equipo_tipo: 'Impresora', equipo_modelo: 'Kyocera', equipo_ubicacion: 'Taller Externo', mes_programado: 4, estado: EstadoPlan.EN_PROCESO },
];

let MOCK_NOTIFICACIONES: Notificacion[] = [
  { id: 1, titulo: 'Garantía por Vencer', mensaje: 'El equipo ECGYELAP015 vence garantía en 15 días.', leido: false, fecha: getDate(0), tipo: 'warning' },
  { id: 2, titulo: 'Mantenimiento Pendiente', mensaje: 'Hay 1 equipo programado para mantenimiento este mes.', leido: false, fecha: getDate(-1), tipo: 'info' }
];

let MOCK_EMAIL_CONFIG: EmailConfig = {
  remitente: 'Sistema Inventario',
  correos_copia: ['soporte@empresa.com'],
  notificar_asignacion: true,
  notificar_mantenimiento: true,
  dias_anticipacion_alerta: 15
};

const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
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
    // Fill calculated fields
    const tipo = MOCK_TIPOS_EQUIPO.find(t => t.id === data.tipo_equipo_id);
    const newItem = { 
        id: Date.now(), 
        ...data, 
        tipo_nombre: tipo?.nombre, 
        estado: EstadoEquipo.DISPONIBLE 
    }; 
    MOCK_EQUIPOS.push(newItem); 
    // Log creation
    MOCK_HISTORIAL.push({
      id: Date.now() + 1, equipo_id: newItem.id, equipo_codigo: newItem.codigo_activo,
      tipo_accion: 'CREACION', fecha: new Date().toISOString().split('T')[0],
      usuario_responsable: 'Admin Sys', detalle: 'Ingreso inicial manual.'
    });
    return newItem; 
  },
  updateEquipo: async (id: number, data: any) => { 
    await simulateDelay(); 
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id); 
    if (idx >= 0) {
        MOCK_EQUIPOS[idx] = { ...MOCK_EQUIPOS[idx], ...data };
        // Sync names if IDs changed
        if (data.tipo_equipo_id) {
            const tipo = MOCK_TIPOS_EQUIPO.find(t => t.id === data.tipo_equipo_id);
            MOCK_EQUIPOS[idx].tipo_nombre = tipo?.nombre;
        }
    } 
    return MOCK_EQUIPOS[idx]; 
  },

  // Actions
  asignarEquipo: async (id: number, usuarioId: number, ubicacion: string, observaciones: string, archivo?: File) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        // VALIDACIÓN: Verificar si el usuario ya tiene un equipo del mismo tipo
        const equipoAAsignar = MOCK_EQUIPOS[idx];
        const asignacionExistente = MOCK_EQUIPOS.find(e => 
            e.responsable_id === usuarioId && 
            e.tipo_equipo_id === equipoAAsignar.tipo_equipo_id &&
            e.id !== id // No contar el mismo equipo si fuera una re-asignación
        );

        if (asignacionExistente) {
            throw new Error(`El usuario ya tiene asignado un equipo de tipo "${equipoAAsignar.tipo_nombre}". Debe realizar la devolución del equipo actual antes de asignar uno nuevo.`);
        }

        const usuario = MOCK_USUARIOS.find(u => u.id === usuarioId);
        MOCK_EQUIPOS[idx].estado = EstadoEquipo.ACTIVO;
        MOCK_EQUIPOS[idx].responsable_id = usuarioId;
        MOCK_EQUIPOS[idx].responsable_nombre = usuario?.nombre_completo;
        MOCK_EQUIPOS[idx].ubicacion_nombre = ubicacion; // Physical location
        MOCK_EQUIPOS[idx].observaciones = observaciones;

        // Log Movement
        MOCK_HISTORIAL.push({
            id: Date.now(), equipo_id: id, equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
            tipo_accion: 'ASIGNACION', fecha: new Date().toISOString().split('T')[0],
            usuario_responsable: usuario?.nombre_completo || '', detalle: observaciones, archivo: archivo?.name
        });

        // Log Assignment
        MOCK_ASIGNACIONES.push({
            id: Date.now(), equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo, equipo_modelo: MOCK_EQUIPOS[idx].modelo,
            usuario_nombre: usuario?.nombre_completo || '', usuario_departamento: usuario?.departamento_nombre || '',
            fecha_inicio: new Date().toISOString().split('T')[0], fecha_fin: null, ubicacion: ubicacion, archivo_pdf: archivo?.name
        });
    }
    return MOCK_EQUIPOS[idx];
  },
  recepcionarEquipo: async (id: number, observaciones: string, ubicacionId?: number, ubicacionNombre?: string, liberarLicencias?: boolean, archivo?: File) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        const responsablePrevio = MOCK_EQUIPOS[idx].responsable_nombre;
        const responsableIdPrevio = MOCK_EQUIPOS[idx].responsable_id;

        MOCK_EQUIPOS[idx].estado = EstadoEquipo.DISPONIBLE;
        MOCK_EQUIPOS[idx].responsable_id = undefined;
        MOCK_EQUIPOS[idx].responsable_nombre = undefined;
        MOCK_EQUIPOS[idx].ubicacion_id = ubicacionId!;
        MOCK_EQUIPOS[idx].ubicacion_nombre = ubicacionNombre;
        MOCK_EQUIPOS[idx].observaciones = observaciones;

        // Log Movement
        MOCK_HISTORIAL.push({
            id: Date.now(), equipo_id: id, equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
            tipo_accion: 'RECEPCION', fecha: new Date().toISOString().split('T')[0],
            usuario_responsable: responsablePrevio || '', detalle: observaciones, archivo: archivo?.name
        });

        // Update Assignment History (Close it)
        const lastAsign = MOCK_ASIGNACIONES.find(a => a.equipo_codigo === MOCK_EQUIPOS[idx].codigo_activo && !a.fecha_fin);
        if (lastAsign) {
            lastAsign.fecha_fin = new Date().toISOString().split('T')[0];
        }

        // Release licenses if requested
        if (liberarLicencias && responsableIdPrevio) {
            MOCK_LICENCIAS.forEach(l => {
                if (l.usuario_id === responsableIdPrevio) {
                    l.usuario_id = undefined;
                    l.usuario_nombre = undefined;
                    l.usuario_departamento = undefined;
                }
            });
        }
    }
    return MOCK_EQUIPOS[idx];
  },
  bajaEquipo: async (id: number, motivo: string, archivo?: File) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        // VALIDACIÓN: No se puede dar de baja un equipo asignado (Activo o con Responsable)
        if (MOCK_EQUIPOS[idx].estado === EstadoEquipo.ACTIVO || MOCK_EQUIPOS[idx].responsable_id) {
            throw new Error("No es posible dar de baja un equipo que se encuentra asignado. Por favor, realice la recepción del equipo antes de proceder con la baja.");
        }

        MOCK_EQUIPOS[idx].estado = EstadoEquipo.BAJA;
        MOCK_EQUIPOS[idx].observaciones = motivo;
        MOCK_HISTORIAL.push({
            id: Date.now(), equipo_id: id, equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
            tipo_accion: 'BAJA', fecha: new Date().toISOString().split('T')[0],
            usuario_responsable: 'Admin', detalle: motivo, archivo: archivo?.name
        });
    }
    return MOCK_EQUIPOS[idx];
  },
  enviarAMantenimiento: async (id: number, motivo: string) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        MOCK_EQUIPOS[idx].estado = EstadoEquipo.EN_MANTENIMIENTO;
        MOCK_EQUIPOS[idx].observaciones = motivo;
        MOCK_HISTORIAL.push({
            id: Date.now(), equipo_id: id, equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
            tipo_accion: 'MANTENIMIENTO', fecha: new Date().toISOString().split('T')[0],
            usuario_responsable: 'Admin', detalle: motivo
        });
        
        // Si hay una tarea en el plan que corresponda, marcarla EN_PROCESO
        const currentMonth = new Date().getMonth() + 1;
        const task = MOCK_DETALLES_PLAN.find(t => t.equipo_id === id && t.mes_programado === currentMonth && t.estado === EstadoPlan.PENDIENTE);
        if(task) task.estado = EstadoPlan.EN_PROCESO;
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
            MOCK_EQUIPOS[idx].ubicacion_nombre = data.ubicacionNombre;
        }
        if (data.serie_cargador) {
            MOCK_EQUIPOS[idx].serie_cargador = data.serie_cargador;
        }
        MOCK_EQUIPOS[idx].ultimo_mantenimiento = new Date().toISOString().split('T')[0];

        MOCK_MANTENIMIENTOS.push({
            id: Date.now(),
            equipo_id: equipoId,
            equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
            equipo_modelo: MOCK_EQUIPOS[idx].modelo,
            fecha: new Date().toISOString().split('T')[0],
            tipo_mantenimiento: data.tipo,
            proveedor: data.proveedor,
            costo: data.costo,
            descripcion: data.descripcion,
            archivo_orden: archivo?.name
        });

        // Registrar en Bitácora de Movimientos
        MOCK_HISTORIAL.push({
            id: Date.now() + 10,
            equipo_id: equipoId,
            equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
            tipo_accion: 'MANTENIMIENTO',
            fecha: new Date().toISOString().split('T')[0],
            usuario_responsable: data.proveedor || 'Servicio Técnico',
            detalle: `Mantenimiento Finalizado (${data.tipo}): ${data.descripcion}`,
            archivo: archivo?.name
        });

        const detallePlan = MOCK_DETALLES_PLAN.find(d => 
            d.equipo_id === equipoId && 
            (d.estado === EstadoPlan.EN_PROCESO || d.estado === EstadoPlan.PENDIENTE)
        );

        if (detallePlan) {
            detallePlan.estado = EstadoPlan.REALIZADO;
            detallePlan.fecha_ejecucion = new Date().toISOString().split('T')[0];
            detallePlan.tecnico_responsable = data.proveedor;
        }
    }
  },
  marcarParaBaja: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        MOCK_EQUIPOS[idx].estado = EstadoEquipo.PARA_BAJA;
        MOCK_EQUIPOS[idx].observaciones = observaciones;
        MOCK_EQUIPOS[idx].ubicacion_id = ubicacionId;
        MOCK_EQUIPOS[idx].ubicacion_nombre = ubicacionNombre;
        // Reset responsible
        MOCK_EQUIPOS[idx].responsable_id = undefined;
        MOCK_EQUIPOS[idx].responsable_nombre = undefined;

        MOCK_HISTORIAL.push({
            id: Date.now(), equipo_id: id, equipo_codigo: MOCK_EQUIPOS[idx].codigo_activo,
            tipo_accion: 'PRE_BAJA', fecha: new Date().toISOString().split('T')[0],
            usuario_responsable: 'Admin', detalle: observaciones
        });
    }
    return MOCK_EQUIPOS[idx];
  },
  subirArchivoAsignacion: async (id: number, file: File) => {
      await simulateDelay();
      const assign = MOCK_ASIGNACIONES.find(a => a.id === id);
      if (assign) assign.archivo_pdf = file.name;
      return assign;
  },

  // Licenses
  getTipoLicencias: async () => { await simulateDelay(); return [...MOCK_TIPOS_LICENCIA]; },
  createTipoLicencia: async (data: any) => { 
      await simulateDelay(); 
      const newItem = { id: Date.now(), ...data }; 
      MOCK_TIPOS_LICENCIA.push(newItem); 
      return newItem; 
  },
  getLicencias: async () => { await simulateDelay(); return [...MOCK_LICENCIAS]; },
  agregarStockLicencias: async (tipoId: number, cantidad: number, fechaVencimiento: string) => {
      await simulateDelay();
      const tipo = MOCK_TIPOS_LICENCIA.find(t => t.id === tipoId);
      for (let i = 0; i < cantidad; i++) {
          MOCK_LICENCIAS.push({
              id: Date.now() + i,
              tipo_id: tipoId,
              tipo_nombre: tipo?.nombre || '',
              clave: 'KEY-' + Math.random().toString(36).substring(7).toUpperCase(),
              fecha_compra: new Date().toISOString().split('T')[0],
              fecha_vencimiento: fechaVencimiento,
              usuario_id: null
          });
      }
  },
  asignarLicencia: async (licenciaId: number, usuarioId: number) => {
      await simulateDelay();
      const lic = MOCK_LICENCIAS.find(l => l.id === licenciaId);
      const user = MOCK_USUARIOS.find(u => u.id === usuarioId);
      if (lic && user) {
          lic.usuario_id = usuarioId;
          lic.usuario_nombre = user.nombre_completo;
          lic.usuario_departamento = user.departamento_nombre;
      }
  },
  liberarLicencia: async (licenciaId: number) => {
      await simulateDelay();
      const lic = MOCK_LICENCIAS.find(l => l.id === licenciaId);
      if (lic) {
          lic.usuario_id = undefined;
          lic.usuario_nombre = undefined;
          lic.usuario_departamento = undefined;
      }
  },

  // Planning
  getMaintenancePlans: async () => { await simulateDelay(); return [...MOCK_PLANES]; },
  getPlanDetails: async (planId: number) => {
      await simulateDelay();
      const plan = MOCK_PLANES.find(p => p.id === planId);
      const details = MOCK_DETALLES_PLAN.filter(d => d.plan_id === planId);
      return { plan, details };
  },
  createMaintenancePlan: async (plan: PlanMantenimiento, details: DetallePlan[]) => {
      await simulateDelay();
      MOCK_PLANES.push(plan);
      MOCK_DETALLES_PLAN.push(...details);
  },
  updatePlanDetailMonth: async (itemId: number, newMonth: number) => {
      await simulateDelay();
      const item = MOCK_DETALLES_PLAN.find(d => d.id === itemId);
      if (item) item.mes_programado = newMonth;
  },
  registerMaintenanceExecution: async (detailId: number, data: any) => {
      await simulateDelay();
      const item = MOCK_DETALLES_PLAN.find(d => d.id === detailId);
      if (item) {
          item.estado = EstadoPlan.REALIZADO;
          item.fecha_ejecucion = data.fecha;
          item.tecnico_responsable = data.tecnico;
      }
  },
  getEvidence: async (detailId: number) => {
      await simulateDelay();
      return []; // Mock
  },
  iniciarMantenimientoDesdePlan: async (detailId: number, motivo: string) => {
      await simulateDelay();
      const detail = MOCK_DETALLES_PLAN.find(d => d.id === detailId);
      if (detail) {
          detail.estado = EstadoPlan.EN_PROCESO;
          // Also trigger maintenance on equipment
          await api.enviarAMantenimiento(detail.equipo_id, motivo);
      }
  },
  getPendingMaintenanceCurrentMonth: async () => {
      await simulateDelay();
      const currentMonth = new Date().getMonth() + 1;
      return MOCK_DETALLES_PLAN.filter(d => 
          d.mes_programado === currentMonth && 
          (d.estado === EstadoPlan.PENDIENTE || d.estado === EstadoPlan.EN_PROCESO)
      );
  },

  // Email Config
  getEmailConfig: async () => { await simulateDelay(); return { ...MOCK_EMAIL_CONFIG }; },
  saveEmailConfig: async (config: EmailConfig) => { await simulateDelay(); MOCK_EMAIL_CONFIG = config; },

  // Stats
  getWarrantyReport: async (): Promise<ReporteGarantia[]> => {
      await simulateDelay();
      return MOCK_EQUIPOS.map(e => {
          const expiration = new Date(e.fecha_compra);
          expiration.setFullYear(expiration.getFullYear() + e.anos_garantia);
          const diff = Math.ceil((expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return {
              equipo: e,
              fecha_vencimiento: expiration.toISOString().split('T')[0],
              dias_restantes: diff
          };
      }).filter(r => r.dias_restantes > 0 && r.dias_restantes < 365);
  },
  getReplacementCandidates: async () => {
      await simulateDelay();
      const fourYearsAgo = new Date();
      fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
      return MOCK_EQUIPOS.filter(e => new Date(e.fecha_compra) <= fourYearsAgo);
  },
  getHistorial: async (tipoId?: number) => { 
      await simulateDelay(); 
      // Opcionalmente filtrar por tipo si el backend real lo soporta en query
      return [...MOCK_HISTORIAL]; 
  },
  getHistorialMantenimiento: async (tipoId?: number) => { await simulateDelay(); return [...MOCK_MANTENIMIENTOS]; },
  getHistorialAsignaciones: async () => { await simulateDelay(); return [...MOCK_ASIGNACIONES]; },
  
  // Notifications
  getNotifications: async () => {
      await simulateDelay();
      return [...MOCK_NOTIFICACIONES];
  },
  verificarAlertasMantenimiento: async () => {
      await simulateDelay();
      // Logic to generate notifications based on plan
  },

  // Bulk Operations
  bulkCreateEquipos: async (data: any[]) => { await simulateDelay(); return data.length; },
  bulkCreateUsuarios: async (data: any[]) => { await simulateDelay(); return data.length; },
  bulkCreateLicencias: async (data: any[]) => { await simulateDelay(); return data.length; },
  bulkCreateDepartamentos: async (data: any[]) => { await simulateDelay(); return data.length; },
  bulkCreatePuestos: async (data: any[]) => { await simulateDelay(); return data.length; },
  bulkCreateAsignaciones: async (data: any[]) => { await simulateDelay(); return data.length; }
};
