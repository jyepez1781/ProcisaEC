

export enum RolUsuario {
  ADMIN = 'Administrador',
  TECNICO = 'Técnico',
  USUARIO = 'Usuario'
}

export enum EstadoEquipo {
  ACTIVO = 'Activo',
  EN_MANTENIMIENTO = 'En Mantenimiento',
  BAJA = 'Baja',
  DISPONIBLE = 'Disponible',
  PARA_BAJA = 'Para Baja'
}

export enum FrecuenciaMantenimiento {
  MENSUAL = 'Mensual',
  BIMESTRAL = 'Bimestral',
  TRIMESTRAL = 'Trimestral',
  SEMESTRAL = 'Semestral',
  ANUAL = 'Anual'
}

export enum EstadoPlan {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En Proceso',
  REALIZADO = 'Realizado',
  RETRASADO = 'Retrasado'
}

// --- Organization ---

export interface Pais {
  id: number;
  nombre: string;
  abreviatura: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
  abreviatura?: string;
  pais_id?: number;
  pais_nombre?: string;
}

export interface Departamento {
  id: number;
  nombre: string;
  es_bodega?: boolean; 
  ciudad_id?: number; 
  ciudad_nombre?: string;
  // Fix: Adding missing property used in planning and equipment mapping
  bodega_ubicacion_id?: number;
}

export interface Puesto {
  id: number;
  nombre: string;
}

export interface Usuario {
  id: number;
  nombre_usuario: string;
  numero_empleado?: string; 
  nombres: string;
  apellidos: string;
  nombre_completo: string; 
  correo: string;
  password?: string; 
  rol: RolUsuario;
  departamento_id?: number;
  departamento_nombre?: string;
  puesto_id?: number;
  puesto_nombre?: string;
  activo: boolean;
}

export interface TipoEquipo {
  id: number;
  nombre: string; 
  descripcion: string;
  frecuencia_anual?: number; // Cantidad de mantenimientos al año (0 = excluido)
}

export interface Ubicacion {
  id: number;
  nombre: string; 
}

export interface Equipo {
  id: number;
  codigo_activo: string;
  numero_serie: string;
  modelo: string;
  marca: string;
  tipo_equipo_id: number;
  tipo_nombre?: string;
  serie_cargador?: string; 
  fecha_compra: string; 
  valor_compra: number;
  anos_garantia: number;
  estado: EstadoEquipo;
  ubicacion_id: number;
  ubicacion_nombre?: string;
  responsable_id?: number;
  responsable_nombre?: string;
  observaciones: string;
  frecuencia_mantenimiento?: FrecuenciaMantenimiento; // Legacy field, now preferred to use Type frequency
  ultimo_mantenimiento?: string; // New field
}

export interface HistorialMovimiento {
  id: number;
  equipo_id: number;
  equipo_codigo: string;
  tipo_accion: 'CREACION' | 'EDICION' | 'ASIGNACION' | 'RECEPCION' | 'BAJA' | 'MANTENIMIENTO' | 'PRE_BAJA';
  fecha: string;
  usuario_responsable: string; 
  detalle: string;
  archivo?: string; // Nombre del archivo de evidencia
}

export interface HistorialAsignacion {
  id: number;
  equipo_codigo: string;
  equipo_modelo: string;
  usuario_nombre: string;
  usuario_departamento: string;
  fecha_inicio: string;
  fecha_fin: string | null; 
  ubicacion: string;
  archivo_pdf?: string; 
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
  archivo_orden?: string; // URL or name of the signed PDF
}

// --- New License Interfaces ---
export interface TipoLicencia {
  id: number;
  nombre: string; 
  proveedor: string;
  descripcion: string;
}

export interface Licencia {
  id: number;
  tipo_id: number;
  tipo_nombre: string;
  clave: string; 
  fecha_compra: string;
  fecha_vencimiento: string;
  usuario_id?: number | null; 
  usuario_nombre?: string;
  usuario_departamento?: string; 
}

// --- New Planning Interfaces ---

export interface PlanMantenimiento {
  id: number;
  anio: number;
  nombre: string;
  creado_por: string;
  fecha_creacion: string;
  estado: 'ACTIVO' | 'CERRADO';
  ciudad_id?: number;     // Optional to support legacy plans or global plans
  ciudad_nombre?: string;
}

export interface DetallePlan {
  id: number; // Unique ID for the schedule item
  plan_id: number;
  equipo_id: number;
  equipo_codigo: string;
  equipo_tipo: string;
  equipo_modelo: string;
  equipo_ubicacion: string;
  mes_programado: number; // 1-12
  estado: EstadoPlan;
  fecha_ejecucion?: string;
  tecnico_responsable?: string;
}

export interface EvidenciaMantenimiento {
  id: number;
  detalle_plan_id: number;
  plan_id: number;
  equipo_id: number;
  fecha_subida: string;
  archivo_url: string;
  tipo_archivo: 'imagen' | 'pdf';
  observaciones: string;
}

// --- Email Config Interface ---
export interface EmailConfig {
  remitente: string; // Nombre a mostrar
  correos_copia: string[]; // Array de emails para CC
  notificar_asignacion: boolean;
  notificar_mantenimiento: boolean;
  dias_anticipacion_alerta?: number; // Días antes del mes para avisar
  smtp_host?: string; 
  smtp_port?: string;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_encryption?: 'SSL' | 'TLS' | 'NONE';
}