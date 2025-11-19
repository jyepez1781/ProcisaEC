
export enum RolUsuario {
  ADMIN = 'Administrador',
  TECNICO = 'Técnico',
  USUARIO = 'Usuario'
}

export enum EstadoEquipo {
  ACTIVO = 'Activo',
  EN_MANTENIMIENTO = 'En Mantenimiento',
  BAJA = 'Baja',
  DISPONIBLE = 'Disponible'
}

export interface Departamento {
  id: number;
  nombre: string;
}

export interface Puesto {
  id: number;
  nombre: string;
}

export interface Usuario {
  id: number;
  nombre_usuario: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string; // Computed or combined
  correo: string;
  password?: string; // Added for authentication
  rol: RolUsuario;
  departamento_id?: number;
  departamento_nombre?: string;
  puesto_id?: number;
  puesto_nombre?: string;
  activo: boolean;
}

export interface TipoEquipo {
  id: number;
  nombre: string; // Laptop, Monitor, etc.
  descripcion: string;
}

export interface Ubicacion {
  id: number;
  nombre: string; // Bodega 1, Piso 2, etc.
}

export interface Equipo {
  id: number;
  codigo_activo: string;
  numero_serie: string;
  modelo: string;
  marca: string;
  tipo_equipo_id: number;
  tipo_nombre?: string;
  fecha_compra: string; // ISO Date
  valor_compra: number;
  anos_garantia: number;
  estado: EstadoEquipo;
  ubicacion_id: number;
  ubicacion_nombre?: string;
  responsable_id?: number;
  responsable_nombre?: string;
  observaciones: string;
}

export interface HistorialMovimiento {
  id: number;
  equipo_id: number;
  equipo_codigo: string;
  tipo_accion: 'CREACION' | 'EDICION' | 'ASIGNACION' | 'RECEPCION' | 'BAJA' | 'MANTENIMIENTO';
  fecha: string;
  usuario_responsable: string; // Who performed the action
  detalle: string;
}

export interface HistorialAsignacion {
  id: number;
  equipo_codigo: string;
  equipo_modelo: string;
  usuario_nombre: string;
  usuario_departamento: string;
  fecha_inicio: string;
  fecha_fin: string | null; // null indica asignación actual (vigente)
  ubicacion: string;
}

export interface ReporteGarantia {
  equipo: Equipo;
  dias_restantes: number;
  fecha_vencimiento: string;
}

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  leido: boolean;
  fecha: string;
  tipo: 'info' | 'warning' | 'alert';
}

export interface RegistroMantenimiento {
  id: number;
  equipo_id: number;
  equipo_codigo: string;
  equipo_modelo: string;
  fecha: string;
  tipo_mantenimiento: 'Preventivo' | 'Correctivo';
  proveedor: string;
  costo: number;
  descripcion: string;
}
