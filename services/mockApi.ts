
import { Equipo, EstadoEquipo, RolUsuario, Usuario, ReporteGarantia, Notificacion, TipoEquipo, HistorialMovimiento, Departamento, Puesto, HistorialAsignacion, RegistroMantenimiento, TipoLicencia, Licencia } from '../types';
import { liveApi } from './liveApi';

// --- CONFIGURACIÓN DEL BACKEND ---
// Cambia esto a TRUE cuando tengas tu backend Laravel corriendo en localhost:8000
const USE_LIVE_API = false; 
// ---------------------------------

// --- Mock Data Initialization ---

let MOCK_DEPARTAMENTOS: Departamento[] = [
  { id: 1, nombre: 'Tecnología (IT)', es_bodega: true },
  { id: 2, nombre: 'Recursos Humanos', es_bodega: false },
  { id: 3, nombre: 'Ventas', es_bodega: false },
  { id: 4, nombre: 'Finanzas', es_bodega: false }
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
  { id: 1, nombre_usuario: 'admin', numero_empleado: 'EMP-001', nombres: 'Admin', apellidos: 'Sistema', nombre_completo: 'Admin Sistema', correo: 'admin@sys.com', password: '123', rol: RolUsuario.ADMIN, departamento_id: 1, departamento_nombre: 'Tecnología (IT)', puesto_id: 1, puesto_nombre: 'Gerente', activo: true },
  { id: 2, nombre_usuario: 'tecnico1', numero_empleado: 'EMP-002', nombres: 'Juan', apellidos: 'Técnico', nombre_completo: 'Juan Técnico', correo: 'juan@sys.com', password: '123', rol: RolUsuario.TECNICO, departamento_id: 1, departamento_nombre: 'Tecnología (IT)', puesto_id: 5, puesto_nombre: 'Soporte Técnico', activo: true },
  { id: 3, nombre_usuario: 'empl1', numero_empleado: 'EMP-003', nombres: 'Maria', apellidos: 'Ventas', nombre_completo: 'Maria Ventas', correo: 'maria@sys.com', password: '123', rol: RolUsuario.USUARIO, departamento_id: 3, departamento_nombre: 'Ventas', puesto_id: 4, puesto_nombre: 'Vendedor', activo: true },
];

let MOCK_TIPOS: TipoEquipo[] = [
  { id: 1, nombre: 'Laptop', descripcion: 'Computadora portátil' },
  { id: 2, nombre: 'Desktop', descripcion: 'Computadora de escritorio' },
  { id: 3, nombre: 'Monitor', descripcion: 'Pantalla externa' },
  { id: 4, nombre: 'Impresora', descripcion: 'Impresora láser o inyección' },
];

let MOCK_EQUIPOS: Equipo[] = [
  { id: 1, codigo_activo: 'EQ-2023-001', numero_serie: 'SN123456', marca: 'Dell', modelo: 'Latitude 5420', tipo_equipo_id: 1, tipo_nombre: 'Laptop', serie_cargador: 'CH-999111', fecha_compra: '2023-01-15', valor_compra: 1200, anos_garantia: 3, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, ubicacion_nombre: 'Piso 2 - Ventas', responsable_id: 3, responsable_nombre: 'Maria Ventas', observaciones: 'Asignado a ventas' },
  { id: 2, codigo_activo: 'EQ-2021-045', numero_serie: 'SN987654', marca: 'HP', modelo: 'ProBook 450', tipo_equipo_id: 1, tipo_nombre: 'Laptop', fecha_compra: '2021-03-10', valor_compra: 900, anos_garantia: 3, estado: EstadoEquipo.DISPONIBLE, ubicacion_id: 2, ubicacion_nombre: 'Bodega IT', observaciones: 'Reingresado, listo para asignar' },
  { id: 3, codigo_activo: 'EQ-2020-012', numero_serie: 'SN456123', marca: 'Lenovo', modelo: 'ThinkCentre M720', tipo_equipo_id: 2, tipo_nombre: 'Desktop', fecha_compra: '2020-05-20', valor_compra: 800, anos_garantia: 4, estado: EstadoEquipo.EN_MANTENIMIENTO, ubicacion_id: 3, ubicacion_nombre: 'Taller Externo', observaciones: 'Falla en disco duro' },
  { id: 4, codigo_activo: 'EQ-2019-099', numero_serie: 'SN112233', marca: 'Dell', modelo: 'Optiplex 3060', tipo_equipo_id: 2, tipo_nombre: 'Desktop', fecha_compra: '2019-02-01', valor_compra: 750, anos_garantia: 3, estado: EstadoEquipo.BAJA, ubicacion_id: 4, ubicacion_nombre: 'Almacén Bajas', observaciones: 'Obsoleto, pantalla azul' },
  { id: 5, codigo_activo: 'EQ-2024-005', numero_serie: 'SN998877', marca: 'Apple', modelo: 'MacBook Air M2', tipo_equipo_id: 1, tipo_nombre: 'Laptop', fecha_compra: '2024-02-20', valor_compra: 1400, anos_garantia: 1, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, ubicacion_nombre: 'Dirección General', observaciones: '' },
  { id: 6, codigo_activo: 'EQ-2020-055', numero_serie: 'SN554433', marca: 'HP', modelo: 'EliteDisplay', tipo_equipo_id: 3, tipo_nombre: 'Monitor', fecha_compra: '2020-06-15', valor_compra: 200, anos_garantia: 3, estado: EstadoEquipo.ACTIVO, ubicacion_id: 1, ubicacion_nombre: 'Piso 2 - Ventas', observaciones: '' },
];

let MOCK_HISTORIAL: HistorialMovimiento[] = [
  { id: 1, equipo_id: 1, equipo_codigo: 'EQ-2023-001', tipo_accion: 'CREACION', fecha: '2023-01-15', usuario_responsable: 'Admin', detalle: 'Ingreso inicial al inventario' },
  { id: 2, equipo_id: 1, equipo_codigo: 'EQ-2023-001', tipo_accion: 'ASIGNACION', fecha: '2023-01-20', usuario_responsable: 'Admin', detalle: 'Asignado a Maria Ventas' },
];

let MOCK_ASIGNACIONES: HistorialAsignacion[] = [
  { id: 1, equipo_codigo: 'EQ-2023-001', equipo_modelo: 'Latitude 5420', usuario_nombre: 'Maria Ventas', usuario_departamento: 'Ventas', fecha_inicio: '2023-01-20', fecha_fin: null, ubicacion: 'Piso 2', archivo_pdf: undefined }
];

let MOCK_MANTENIMIENTOS: RegistroMantenimiento[] = [
  { id: 1, equipo_id: 3, equipo_codigo: 'EQ-2020-012', equipo_modelo: 'ThinkCentre M720', fecha: '2024-03-10', tipo_mantenimiento: 'Correctivo', proveedor: 'Taller Externo', costo: 120, descripcion: 'Cambio de Disco Duro' }
];

let MOCK_TIPOS_LICENCIA: TipoLicencia[] = [
  { id: 1, nombre: 'Office 365 Business', proveedor: 'Microsoft', descripcion: 'Licencia anual por usuario' },
  { id: 2, nombre: 'Adobe Creative Cloud', proveedor: 'Adobe', descripcion: 'Suite completa de diseño' }
];

let MOCK_LICENCIAS: Licencia[] = [
  { id: 1, tipo_id: 1, tipo_nombre: 'Office 365 Business', clave: 'KEY-001-ABC', fecha_compra: '2024-01-01', fecha_vencimiento: '2025-01-01', usuario_id: 1, usuario_nombre: 'Admin Sistema', usuario_departamento: 'Tecnología (IT)' },
  { id: 2, tipo_id: 1, tipo_nombre: 'Office 365 Business', clave: 'KEY-002-XYZ', fecha_compra: '2024-01-01', fecha_vencimiento: '2025-01-01', usuario_id: null },
  { id: 3, tipo_id: 2, tipo_nombre: 'Adobe Creative Cloud', clave: 'ADB-999-CLD', fecha_compra: '2023-06-15', fecha_vencimiento: '2024-06-15', usuario_id: 2, usuario_nombre: 'Juan Técnico', usuario_departamento: 'Tecnología (IT)' }
];

let MOCK_NOTIFICACIONES: Notificacion[] = [
  { id: 1, titulo: 'Garantía por vencer', mensaje: 'La garantía del equipo EQ-2021-045 vence en 15 días.', fecha: '2024-03-20', leido: false, tipo: 'warning' },
  { id: 2, titulo: 'Mantenimiento programado', mensaje: 'Mantenimiento general de servidores el 25 de Marzo.', fecha: '2024-03-18', leido: true, tipo: 'info' }
];

const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// --- API Implementation ---

export const api = {
  // Auth
  login: async (email: string, password?: string) => {
    await simulateDelay();
    const user = MOCK_USERS.find(u => u.correo === email && (u.password === password || password === '123'));
    if (!user) throw new Error('Credenciales inválidas');
    if (!user.activo) throw new Error('Usuario inactivo');
    return user;
  },
  changePassword: async (userId: number, newPass: string) => {
    await simulateDelay();
    const u = MOCK_USERS.find(x => x.id === userId);
    if (u) u.password = newPass;
  },

  // Organization
  getDepartamentos: async () => { await simulateDelay(); return [...MOCK_DEPARTAMENTOS]; },
  createDepartamento: async (data: any) => {
    await simulateDelay();
    const newId = MOCK_DEPARTAMENTOS.length + 1;
    const newItem = { ...data, id: newId };
    MOCK_DEPARTAMENTOS.push(newItem);
    return newItem;
  },
  updateDepartamento: async (id: number, data: any) => {
    await simulateDelay();
    const idx = MOCK_DEPARTAMENTOS.findIndex(d => d.id === id);
    if (idx >= 0) MOCK_DEPARTAMENTOS[idx] = { ...MOCK_DEPARTAMENTOS[idx], ...data };
    return MOCK_DEPARTAMENTOS[idx];
  },
  deleteDepartamento: async (id: number) => {
    await simulateDelay();
    // VALIDACIÓN: Verificar si hay usuarios asignados a este departamento
    const hasUsers = MOCK_USERS.some(u => u.departamento_id === id);
    if (hasUsers) {
      throw new Error("No se puede eliminar este departamento porque tiene usuarios asignados.");
    }
    const idx = MOCK_DEPARTAMENTOS.findIndex(d => d.id === id);
    if (idx >= 0) {
      MOCK_DEPARTAMENTOS.splice(idx, 1);
    }
  },
  
  getPuestos: async () => { await simulateDelay(); return [...MOCK_PUESTOS]; },
  createPuesto: async (data: any) => {
    await simulateDelay();
    const newId = MOCK_PUESTOS.length + 1;
    const newItem = { ...data, id: newId };
    MOCK_PUESTOS.push(newItem);
    return newItem;
  },
  updatePuesto: async (id: number, data: any) => {
    await simulateDelay();
    const idx = MOCK_PUESTOS.findIndex(d => d.id === id);
    if (idx >= 0) MOCK_PUESTOS[idx] = { ...MOCK_PUESTOS[idx], ...data };
    return MOCK_PUESTOS[idx];
  },
  deletePuesto: async (id: number) => {
    await simulateDelay();
    // VALIDACIÓN: Verificar si hay usuarios asignados a este puesto
    const hasUsers = MOCK_USERS.some(u => u.puesto_id === id);
    if (hasUsers) {
      throw new Error("No se puede eliminar este puesto porque tiene usuarios asignados.");
    }
    const idx = MOCK_PUESTOS.findIndex(d => d.id === id);
    if (idx >= 0) {
      MOCK_PUESTOS.splice(idx, 1);
    }
  },

  // Users
  getUsuarios: async () => { await simulateDelay(); return [...MOCK_USERS]; },
  createUsuario: async (data: Usuario) => {
    await simulateDelay();
    // Enrich with Dept/Puesto names
    const dept = MOCK_DEPARTAMENTOS.find(d => d.id === data.departamento_id);
    const puesto = MOCK_PUESTOS.find(p => p.id === data.puesto_id);
    const newUser = { 
        ...data, 
        id: MOCK_USERS.length + 1,
        nombre_completo: buildName(data.nombres, data.apellidos),
        departamento_nombre: dept?.nombre,
        puesto_nombre: puesto?.nombre,
        password: data.password || '123'
    };
    MOCK_USERS.push(newUser);
    return newUser;
  },
  updateUsuario: async (id: number, data: Partial<Usuario>) => {
    await simulateDelay();
    const idx = MOCK_USERS.findIndex(u => u.id === id);
    if (idx >= 0) {
        const dept = data.departamento_id ? MOCK_DEPARTAMENTOS.find(d => d.id === data.departamento_id) : null;
        const puesto = data.puesto_id ? MOCK_PUESTOS.find(p => p.id === data.puesto_id) : null;
        
        MOCK_USERS[idx] = { 
            ...MOCK_USERS[idx], 
            ...data,
            ...(data.nombres || data.apellidos ? { nombre_completo: buildName(data.nombres || MOCK_USERS[idx].nombres, data.apellidos || MOCK_USERS[idx].apellidos) } : {}),
            ...(dept ? { departamento_nombre: dept.nombre } : {}),
            ...(puesto ? { puesto_nombre: puesto.nombre } : {})
        };
        return MOCK_USERS[idx];
    }
    throw new Error("Usuario no encontrado");
  },
  deleteUsuario: async (id: number) => {
     // Soft delete usually, but for mock delete
     await simulateDelay();
     MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
  },

  // Equipment Types
  getTiposEquipo: async () => { await simulateDelay(); return [...MOCK_TIPOS]; },
  createTipoEquipo: async (data: any) => {
    await simulateDelay();
    const newItem = { ...data, id: MOCK_TIPOS.length + 1 };
    MOCK_TIPOS.push(newItem);
    return newItem;
  },
  updateTipoEquipo: async (id: number, data: any) => {
    await simulateDelay();
    const idx = MOCK_TIPOS.findIndex(t => t.id === id);
    if (idx >= 0) MOCK_TIPOS[idx] = { ...MOCK_TIPOS[idx], ...data };
    return MOCK_TIPOS[idx];
  },
  deleteTipoEquipo: async (id: number) => {
    await simulateDelay();
    
    // VALIDACIÓN: No permitir eliminar si hay equipos asociados
    const hasLinkedEquipments = MOCK_EQUIPOS.some(e => e.tipo_equipo_id === id);
    if (hasLinkedEquipments) {
      throw new Error("No se puede eliminar este tipo de equipo porque existen activos asociados a él.");
    }

    MOCK_TIPOS = MOCK_TIPOS.filter(t => t.id !== id);
  },

  // Equipment
  getEquipos: async () => { await simulateDelay(); return [...MOCK_EQUIPOS]; },
  createEquipo: async (data: any) => {
    await simulateDelay();
    const tipo = MOCK_TIPOS.find(t => t.id === data.tipo_equipo_id);
    // Note: ubicacion_nombre should be passed from frontend or resolved here if we had a full location catalog
    const newEq = { 
        ...data, 
        id: MOCK_EQUIPOS.length + 1,
        tipo_nombre: tipo?.nombre,
    };
    MOCK_EQUIPOS.push(newEq);
    
    MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: newEq.id,
        equipo_codigo: newEq.codigo_activo,
        tipo_accion: 'CREACION',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Ingreso inicial (Loc: ${data.ubicacion_nombre || 'N/A'})`
    });
    return newEq;
  },
  updateEquipo: async (id: number, data: Partial<Equipo>) => {
    await simulateDelay();
    const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
    if (idx >= 0) {
        const oldData = MOCK_EQUIPOS[idx];
        MOCK_EQUIPOS[idx] = { ...oldData, ...data };
        
        MOCK_HISTORIAL.push({
            id: MOCK_HISTORIAL.length + 1,
            equipo_id: id,
            equipo_codigo: oldData.codigo_activo,
            tipo_accion: 'EDICION',
            fecha: new Date().toISOString().split('T')[0],
            usuario_responsable: 'Admin',
            detalle: 'Actualización de datos'
        });
        return MOCK_EQUIPOS[idx];
    }
    throw new Error("Equipo no encontrado");
  },

  // Actions
  asignarEquipo: async (id: number, usuarioId: number, ubicacion: string, observaciones: string) => {
    await simulateDelay();
    const eq = MOCK_EQUIPOS.find(e => e.id === id);
    const user = MOCK_USERS.find(u => u.id === usuarioId);
    if (!eq || !user) throw new Error("Equipo o Usuario no encontrado");

    // Close previous assignment if exists (though logic usually prevents assigning already assigned)
    // ...

    eq.estado = EstadoEquipo.ACTIVO;
    eq.responsable_id = user.id;
    eq.responsable_nombre = user.nombre_completo;
    eq.ubicacion_nombre = ubicacion; // Specific location
    eq.observaciones = observaciones;

    MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: eq.id,
        equipo_codigo: eq.codigo_activo,
        tipo_accion: 'ASIGNACION',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Asignado a ${user.nombre_completo}`
    });

    MOCK_ASIGNACIONES.push({
        id: MOCK_ASIGNACIONES.length + 1,
        equipo_codigo: eq.codigo_activo,
        equipo_modelo: eq.modelo,
        usuario_nombre: user.nombre_completo,
        usuario_departamento: user.departamento_nombre || '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: null,
        ubicacion: ubicacion,
        archivo_pdf: undefined
    });
    
    return eq;
  },

  recepcionarEquipo: async (id: number, observaciones: string, ubicacionId?: number, ubicacionNombre?: string) => {
    await simulateDelay();
    const eq = MOCK_EQUIPOS.find(e => e.id === id);
    if (!eq) throw new Error("Equipo no encontrado");

    // Close active assignment
    const activeAssign = MOCK_ASIGNACIONES.find(a => a.equipo_codigo === eq.codigo_activo && a.fecha_fin === null);
    if (activeAssign) {
        activeAssign.fecha_fin = new Date().toISOString().split('T')[0];
    }

    eq.estado = EstadoEquipo.DISPONIBLE;
    eq.responsable_id = undefined;
    eq.responsable_nombre = undefined;
    // Update location to warehouse
    eq.ubicacion_id = ubicacionId || eq.ubicacion_id; 
    eq.ubicacion_nombre = ubicacionNombre || 'Bodega IT';
    eq.observaciones = observaciones;

    MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: eq.id,
        equipo_codigo: eq.codigo_activo,
        tipo_accion: 'RECEPCION',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Reingreso a inventario (Loc: ${ubicacionNombre}). Obs: ${observaciones}`
    });

    return eq;
  },

  bajaEquipo: async (id: number, motivo: string) => {
    await simulateDelay();
    const eq = MOCK_EQUIPOS.find(e => e.id === id);
    if (!eq) throw new Error("Equipo no encontrado");

    eq.estado = EstadoEquipo.BAJA;
    eq.responsable_id = undefined;
    eq.responsable_nombre = undefined;
    eq.observaciones = motivo;

    MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: eq.id,
        equipo_codigo: eq.codigo_activo,
        tipo_accion: 'BAJA',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Baja definitiva: ${motivo}`
    });
    return eq;
  },

  enviarAMantenimiento: async (id: number, motivo: string) => {
    await simulateDelay();
    const eq = MOCK_EQUIPOS.find(e => e.id === id);
    if (!eq) throw new Error("Equipo no encontrado");

    // If assigned, close assignment or keep it? 
    // Usually maintenance implies temporary removal. Let's keep assignment info but change status
    // Or remove assignment. Let's assume removal for external repair.
    
    eq.estado = EstadoEquipo.EN_MANTENIMIENTO;
    eq.observaciones = motivo;
    
    MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: eq.id,
        equipo_codigo: eq.codigo_activo,
        tipo_accion: 'MANTENIMIENTO',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Enviado a mantenimiento: ${motivo}`
    });
    return eq;
  },

  finalizarMantenimiento: async (equipoId: number, data: any, nuevoEstado: 'DISPONIBLE' | 'BAJA') => {
    await simulateDelay();
    const eq = MOCK_EQUIPOS.find(e => e.id === equipoId);
    if (!eq) throw new Error("Equipo no encontrado");

    eq.estado = nuevoEstado === 'DISPONIBLE' ? EstadoEquipo.DISPONIBLE : EstadoEquipo.BAJA;
    
    // If it becomes available, set new location
    if (nuevoEstado === 'DISPONIBLE') {
        eq.ubicacion_id = data.ubicacionId;
        eq.ubicacion_nombre = data.ubicacionNombre;
        eq.responsable_id = undefined;
        eq.responsable_nombre = undefined;
    }

    // Update Charger Serial if provided
    if (data.serie_cargador) {
      eq.serie_cargador = data.serie_cargador;
    }

    MOCK_MANTENIMIENTOS.push({
        id: MOCK_MANTENIMIENTOS.length + 1,
        equipo_id: eq.id,
        equipo_codigo: eq.codigo_activo,
        equipo_modelo: eq.modelo,
        fecha: new Date().toISOString().split('T')[0],
        tipo_mantenimiento: data.tipo,
        proveedor: data.proveedor,
        costo: data.costo,
        descripcion: data.descripcion
    });

    MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: eq.id,
        equipo_codigo: eq.codigo_activo,
        tipo_accion: 'MANTENIMIENTO',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Fin mantenimiento (${nuevoEstado}). ${data.descripcion}`
    });

    return eq;
  },

  marcarParaBaja: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string) => {
    await simulateDelay();
    const eq = MOCK_EQUIPOS.find(e => e.id === id);
    if (!eq) throw new Error("Equipo no encontrado");

    // If it was assigned, close assignment
    const activeAssign = MOCK_ASIGNACIONES.find(a => a.equipo_codigo === eq.codigo_activo && a.fecha_fin === null);
    if (activeAssign) {
        activeAssign.fecha_fin = new Date().toISOString().split('T')[0];
    }

    eq.estado = EstadoEquipo.PARA_BAJA;
    eq.responsable_id = undefined;
    eq.responsable_nombre = undefined;
    eq.ubicacion_id = ubicacionId;
    eq.ubicacion_nombre = ubicacionNombre;
    eq.observaciones = observaciones;

    MOCK_HISTORIAL.push({
        id: MOCK_HISTORIAL.length + 1,
        equipo_id: eq.id,
        equipo_codigo: eq.codigo_activo,
        tipo_accion: 'PRE_BAJA',
        fecha: new Date().toISOString().split('T')[0],
        usuario_responsable: 'Admin',
        detalle: `Enviado a Pre-Baja (Bodega: ${ubicacionNombre}). Obs: ${observaciones}`
    });
    
    return eq;
  },

  // Upload file for assignment
  subirArchivoAsignacion: async (id: number, file: File) => {
    await simulateDelay();
    const assignment = MOCK_ASIGNACIONES.find(a => a.id === id);
    if (!assignment) throw new Error("Asignación no encontrada");
    
    // Simulate storing file name/path
    assignment.archivo_pdf = file.name;
    return assignment;
  },

  // Licenses
  getTipoLicencias: async () => { await simulateDelay(); return [...MOCK_TIPOS_LICENCIA]; },
  createTipoLicencia: async (data: any) => {
     await simulateDelay();
     const newItem = { ...data, id: MOCK_TIPOS_LICENCIA.length + 1 };
     MOCK_TIPOS_LICENCIA.push(newItem);
     return newItem;
  },
  getLicencias: async () => { await simulateDelay(); return [...MOCK_LICENCIAS]; },
  agregarStockLicencias: async (tipoId: number, cantidad: number, fechaVencimiento: string) => {
    await simulateDelay();
    const tipo = MOCK_TIPOS_LICENCIA.find(t => t.id === tipoId);
    if (!tipo) throw new Error("Tipo no encontrado");
    for(let i=0; i<cantidad; i++) {
        MOCK_LICENCIAS.push({
            id: MOCK_LICENCIAS.length + 1 + i,
            tipo_id: tipoId,
            tipo_nombre: tipo.nombre,
            clave: `KEY-${Math.floor(Math.random() * 10000)}`,
            fecha_compra: new Date().toISOString().split('T')[0],
            fecha_vencimiento: fechaVencimiento,
            usuario_id: null
        });
    }
  },
  asignarLicencia: async (licenciaId: number, usuarioId: number) => {
    await simulateDelay();
    const lic = MOCK_LICENCIAS.find(l => l.id === licenciaId);
    const user = MOCK_USERS.find(u => u.id === usuarioId);
    if (lic && user) {
        lic.usuario_id = user.id;
        lic.usuario_nombre = user.nombre_completo;
        lic.usuario_departamento = user.departamento_nombre;
        return lic;
    }
    throw new Error("Error al asignar");
  },
  liberarLicencia: async (licenciaId: number) => {
    await simulateDelay();
    const lic = MOCK_LICENCIAS.find(l => l.id === licenciaId);
    if (lic) {
        lic.usuario_id = undefined;
        lic.usuario_nombre = undefined;
        lic.usuario_departamento = undefined;
        return lic;
    }
    throw new Error("Licencia no encontrada");
  },

  // Stats
  getStats: async () => {
    await simulateDelay();
    return {
        total: MOCK_EQUIPOS.length,
        assigned: MOCK_EQUIPOS.filter(e => e.estado === EstadoEquipo.ACTIVO).length,
        available: MOCK_EQUIPOS.filter(e => e.estado === EstadoEquipo.DISPONIBLE).length,
        maintenance: MOCK_EQUIPOS.filter(e => e.estado === EstadoEquipo.EN_MANTENIMIENTO).length,
        retired: MOCK_EQUIPOS.filter(e => e.estado === EstadoEquipo.BAJA).length
    };
  },
  getWarrantyReport: async () => {
    await simulateDelay();
    // Mock logic for warranties expiring
    return MOCK_EQUIPOS
        .filter(e => e.estado === EstadoEquipo.ACTIVO)
        .slice(0, 5)
        .map(e => ({ equipo: e, dias_restantes: Math.floor(Math.random() * 90) + 1, fecha_vencimiento: '2025-01-01' }));
  },
  getReplacementCandidates: async () => {
      await simulateDelay();
      const currentYear = new Date().getFullYear();
      return MOCK_EQUIPOS.filter(e => (currentYear - new Date(e.fecha_compra).getFullYear()) >= 4);
  },
  getHistorial: async (tipoId?: number) => {
      await simulateDelay();
      let res = [...MOCK_HISTORIAL].sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      if (tipoId) {
          // Filter based on equipment type (need to join with Equipos)
          // For mock, simplified:
          res = res.filter(h => {
              const eq = MOCK_EQUIPOS.find(e => e.id === h.equipo_id);
              return eq && eq.tipo_equipo_id === tipoId;
          });
      }
      return res;
  },
  getHistorialAsignaciones: async () => {
      await simulateDelay();
      return [...MOCK_ASIGNACIONES].sort((a,b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime());
  },
  getHistorialMantenimiento: async (tipoId?: number) => {
      await simulateDelay();
      let res = [...MOCK_MANTENIMIENTOS];
       if (tipoId) {
           res = res.filter(m => {
              const eq = MOCK_EQUIPOS.find(e => e.id === m.equipo_id);
              return eq && eq.tipo_equipo_id === tipoId;
          });
       }
      return res;
  },
  getNotifications: async () => {
      await simulateDelay();
      return [...MOCK_NOTIFICACIONES];
  }
};

// Check if we should use the live API
if (USE_LIVE_API) {
    Object.assign(api, liveApi);
}
