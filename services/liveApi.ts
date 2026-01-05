

import { 
  Equipo, Usuario, Departamento, Puesto, TipoEquipo, HistorialMovimiento, 
  HistorialAsignacion, RegistroMantenimiento, TipoLicencia, Licencia, 
  ReporteGarantia, Notificacion, Ciudad, PlanMantenimiento, DetallePlan, 
  EmailConfig, EvidenciaMantenimiento 
} from '../types';

// URL base de tu API Laravel (ajusta el puerto si es necesario)
const API_URL = 'http://localhost:8000/api';
// const API_URL = 'http://10.68.104.57:8000/api';

// Helper para headers con Token (Asumiendo Laravel Sanctum)
const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error en la petición al servidor');
  }
  const body = await response.json().catch(() => ({}));
  // Si la API usa paginación de Laravel, devolver solo el array de datos
  if (body && Array.isArray(body.data)) return body.data;
  return body;
};

export const liveApi = {
  // --- Auth ---
  login: async (email: string, password?: string): Promise<Usuario> => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response);
    // Guardar token
    if (data.token) {
        localStorage.setItem('auth_token', data.token);
    }
    return data.user;
  },

  changePassword: async (userId: number, newPass: string): Promise<void> => {
    await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ user_id: userId, password: newPass })
    });
  },

  // --- Organization ---
  getDepartamentos: async (): Promise<Departamento[]> => {
    const response = await fetch(`${API_URL}/departamentos`, { headers: getHeaders() });
    return handleResponse(response);
  },
  createDepartamento: async (data: any): Promise<Departamento> => {
    const response = await fetch(`${API_URL}/departamentos`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updateDepartamento: async (id: number, data: any): Promise<Departamento> => {
    const response = await fetch(`${API_URL}/departamentos/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  deleteDepartamento: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/departamentos/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  getPuestos: async (): Promise<Puesto[]> => {
    const response = await fetch(`${API_URL}/puestos`, { headers: getHeaders() });
    return handleResponse(response);
  },
  createPuesto: async (nombre: string): Promise<Puesto> => {
    const response = await fetch(`${API_URL}/puestos`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ nombre })
    });
    return handleResponse(response);
  },
  updatePuesto: async (id: number, nombre: string): Promise<Puesto> => {
    const response = await fetch(`${API_URL}/puestos/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify({ nombre })
    });
    return handleResponse(response);
  },
  deletePuesto: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/puestos/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // --- PAISES (live) ---
  getPaises: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/paises`, { headers: getHeaders() });
    return handleResponse(response);
  },
  createPais: async (data: any): Promise<any> => {
    const response = await fetch(`${API_URL}/paises`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updatePais: async (id: number, data: any): Promise<any> => {
    const response = await fetch(`${API_URL}/paises/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  deletePais: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/paises/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  getCiudades: async (): Promise<Ciudad[]> => {
    const response = await fetch(`${API_URL}/ciudades`, { headers: getHeaders() });
    return handleResponse(response);
  },
  createCiudad: async (data: any): Promise<Ciudad> => {
    const response = await fetch(`${API_URL}/ciudades`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updateCiudad: async (id: number, data: any): Promise<Ciudad> => {
    const response = await fetch(`${API_URL}/ciudades/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  deleteCiudad: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/ciudades/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // --- Users ---
  getUsuarios: async (): Promise<Usuario[]> => {
    const response = await fetch(`${API_URL}/users`, { headers: getHeaders() });
    return handleResponse(response);
  },
  createUsuario: async (data: any): Promise<Usuario> => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updateUsuario: async (id: number, data: Partial<Usuario>): Promise<Usuario> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  deleteUsuario: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // --- Equipment Types ---
  getTiposEquipo: async (): Promise<TipoEquipo[]> => {
    const response = await fetch(`${API_URL}/tipos-equipo`, { headers: getHeaders() });
    return handleResponse(response);
  },
  createTipoEquipo: async (data: any): Promise<TipoEquipo> => {
    const response = await fetch(`${API_URL}/tipos-equipo`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updateTipoEquipo: async (id: number, data: any): Promise<TipoEquipo> => {
    const response = await fetch(`${API_URL}/tipos-equipo/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  deleteTipoEquipo: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/tipos-equipo/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // --- Equipment ---
  getEquipos: async (): Promise<Equipo[]> => {
    const response = await fetch(`${API_URL}/equipos`, { headers: getHeaders() });
    return handleResponse(response);
  },
  createEquipo: async (data: any): Promise<Equipo> => {
    const response = await fetch(`${API_URL}/equipos`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updateEquipo: async (id: number, data: Partial<Equipo>): Promise<Equipo> => {
    const response = await fetch(`${API_URL}/equipos/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  // --- Actions ---
  asignarEquipo: async (id: number, usuarioId: number, ubicacion: string, observaciones: string, archivo?: File): Promise<Equipo> => {
    const token = localStorage.getItem('auth_token');
    const fd = new FormData();
    fd.append('usuario_id', String(usuarioId));
    fd.append('ubicacion', ubicacion || '');
    fd.append('observaciones', observaciones || '');
    if (archivo) fd.append('archivo', archivo);

    const response = await fetch(`${API_URL}/equipos/${id}/asignar`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, // no Content-Type
      body: fd
    });
    return handleResponse(response);
  },

  recepcionarEquipo: async (id: number, observaciones: string, ubicacionId?: number, ubicacionNombre?: string, liberarLicencias: boolean = false, archivo?: File): Promise<Equipo> => {
    const token = localStorage.getItem('auth_token');
    const fd = new FormData();
    fd.append('observaciones', observaciones || '');
    if (ubicacionId) fd.append('ubicacion_id', String(ubicacionId));
    if (ubicacionNombre) fd.append('ubicacion_nombre', ubicacionNombre);
    fd.append('liberar_licencias', liberarLicencias ? '1' : '0');
    if (archivo) fd.append('archivo', archivo);

    const response = await fetch(`${API_URL}/equipos/${id}/recepcionar`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, // no Content-Type
      body: fd
    });
    return handleResponse(response);
  },
  bajaEquipo: async (id: number, motivo: string, archivo?: File): Promise<Equipo> => {
    const token = localStorage.getItem('auth_token');
    if (archivo) {
      const fd = new FormData();
      fd.append('observaciones', motivo || '');
      fd.append('archivo', archivo);
      const response = await fetch(`${API_URL}/equipos/${id}/baja`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd
      });
      return handleResponse(response);
    }

    const response = await fetch(`${API_URL}/equipos/${id}/baja`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ observaciones: motivo })
    });
    return handleResponse(response);
  },
  enviarAMantenimiento: async (id: number, motivo: string): Promise<Equipo> => {
    const response = await fetch(`${API_URL}/equipos/${id}/mantenimiento`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ motivo })
    });
    return handleResponse(response);
  },
  finalizarMantenimiento: async (equipoId: number, data: any, nuevoEstado: string, archivo?: File): Promise<any> => {
  const url = `${API_URL}/equipos/${equipoId}/finalizar-mantenimiento`;
  const token = localStorage.getItem('auth_token');

  // Si hay archivo, enviar multipart/form-data (dejar que el navegador ponga Content-Type con boundary)
  if (archivo) {
    const fd = new FormData();
    if (data.tipo !== undefined) fd.append('tipo', data.tipo);
    if (data.proveedor !== undefined) fd.append('proveedor', data.proveedor);
    if (data.costo !== undefined) fd.append('costo', String(data.costo));
    if (data.descripcion !== undefined) fd.append('descripcion', data.descripcion);
    if (data.ubicacionId !== undefined) fd.append('ubicacion_id', String(data.ubicacionId));
    if (data.ubicacionNombre !== undefined) fd.append('ubicacion_nombre', String(data.ubicacionNombre));
    if (data.serie_cargador !== undefined) fd.append('serie_cargador', String(data.serie_cargador));
    fd.append('nuevo_estado', nuevoEstado);
    fd.append('archivo_orden', archivo, (archivo as File).name);

    const headers: Record<string,string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: fd
    });
    return handleResponse(response);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...data, nuevo_estado: nuevoEstado })
  });
  return handleResponse(response);
},
  marcarParaBaja: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string): Promise<Equipo> => {
    const response = await fetch(`${API_URL}/equipos/${id}/pre-baja`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ observaciones, ubicacion_id: ubicacionId, ubicacion_nombre: ubicacionNombre })
    });
    return handleResponse(response);
  },
  subirArchivoAsignacion: async (id: number, file: File): Promise<HistorialAsignacion> => {
    const formData = new FormData();
    formData.append('archivo', file);
    const response = await fetch(`${API_URL}/asignaciones/${id}/archivo`, {
        method: 'POST',
        // Do NOT set Content-Type header for FormData, let browser set it with boundary
        headers: { ...(localStorage.getItem('auth_token') ? { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } : {}) },
        body: formData
    });
    return handleResponse(response);
  },

  // --- Licenses ---
  getTipoLicencias: async (): Promise<TipoLicencia[]> => {
    const response = await fetch(`${API_URL}/tipos-licencia`, { headers: getHeaders() });
    return handleResponse(response);
  },
  createTipoLicencia: async (data: any): Promise<TipoLicencia> => {
    const response = await fetch(`${API_URL}/tipos-licencia`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  updateTipoLicencia: async (id: number, data: any): Promise<TipoLicencia> => {
    const response = await fetch(`${API_URL}/tipos-licencia/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  deleteTipoLicencia: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/tipos-licencia/${id}`, { method: 'DELETE', headers: getHeaders() });
  },
  getLicencias: async (): Promise<Licencia[]> => {
    const response = await fetch(`${API_URL}/licencias`, { headers: getHeaders() });
    return handleResponse(response);
  },

agregarStockLicencias: async (tipoId: number, cantidad: number, fechaVencimiento: string): Promise<any> => {
  const response = await fetch(`${API_URL}/tipos-licencia/${tipoId}/add-stock`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ cantidad, fecha_vencimiento: fechaVencimiento })
 
  });
  return handleResponse(response);
},

  asignarLicencia: async (licenciaId: number, usuarioId: number): Promise<Licencia> => {
    const response = await fetch(`${API_URL}/licencias/${licenciaId}/asignar`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ usuario_id: usuarioId })
    });
    return handleResponse(response);
  },
  liberarLicencia: async (licenciaId: number): Promise<Licencia> => {
    const response = await fetch(`${API_URL}/licencias/${licenciaId}/liberar`, {
      method: 'POST', headers: getHeaders()
    });
    return handleResponse(response);
  },

  // --- Stats & Reports ---
  getStats: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/stats/dashboard`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getWarrantyReport: async (): Promise<ReporteGarantia[]> => {
    const response = await fetch(`${API_URL}/stats/garantias`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getReplacementCandidates: async (): Promise<Equipo[]> => {
    const response = await fetch(`${API_URL}/stats/reemplazos`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getHistorial: async (tipoId?: number): Promise<HistorialMovimiento[]> => {
    let url = `${API_URL}/historial/movimientos`;
    if (tipoId) url += `?tipo_id=${tipoId}`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },
  getHistorialAsignaciones: async (): Promise<HistorialAsignacion[]> => {
    const response = await fetch(`${API_URL}/historial/asignaciones`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getHistorialMantenimiento: async (tipoId?: number): Promise<RegistroMantenimiento[]> => {
     let url = `${API_URL}/historial/mantenimientos`;
    if (tipoId) url += `?tipo_id=${tipoId}`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },
  getNotifications: async (): Promise<Notificacion[]> => {
    const response = await fetch(`${API_URL}/notificaciones`, { headers: getHeaders() });
    return handleResponse(response);
  },

  // Fix: Added missing methods for parity with internalMockApi
 // --- Maintenance Planning ---
  getMaintenancePlans: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/planes-mantenimiento`, { headers: getHeaders() });
    return handleResponse(response);
  },
  getPlanDetails: async (planId: number): Promise<any> => {
    const response = await fetch(`${API_URL}/planes-mantenimiento/${planId}`, { headers: getHeaders() });
    return handleResponse(response);
  },
  
  generateProposal: async (payload: { ciudad_id: number, mes?: number }) => {
    const response = await fetch(`${API_URL}/planes-mantenimiento/propuesta`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },
  
  // Create a new maintenance plan
  createMaintenancePlan: async (plan: any, details: any[]) : Promise<any> => {
    const response = await fetch(`${API_URL}/planes-mantenimiento`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ ...plan, details })
    });
    return handleResponse(response);
  },

  // Update detail month
  updatePlanDetailMonth: async (detailId: number, month: number): Promise<any> => {
    const response = await fetch(`${API_URL}/detalles-planes-mantenimiento/${detailId}/mes`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify({ month })
    });
    return handleResponse(response);
  },

  // Start maintenance from plan detail
  iniciarMantenimientoDesdePlan: async (detailId: number, motivo: string): Promise<any> => {
    const response = await fetch(`${API_URL}/detalles-planes-mantenimiento/${detailId}/iniciar`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ motivo })
    });
    return handleResponse(response);
  },

  // Register execution for a detail
  registerMaintenanceExecution: async (detailId: number, data: any): Promise<any> => {
    const url = `${API_URL}/ejecuciones-mantenimiento/${detailId}`;
    // handle multipart if archivo is present
    if (data && data.archivo) {
      const fd = new FormData();
      if (data.fecha) fd.append('fecha', data.fecha);
      if (data.tecnico) fd.append('tecnico', data.tecnico);
      if (data.observaciones) fd.append('observaciones', data.observaciones || '');
      fd.append('archivo', data.archivo);
      const headers: any = {};
      if (localStorage.getItem('auth_token')) headers['Authorization'] = `Bearer ${localStorage.getItem('auth_token')}`;
      const response = await fetch(url, { method: 'POST', headers, body: fd });
      return handleResponse(response);
    }
    const response = await fetch(url, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(response);
  },

  // Get executions for a detail
  getExecutions: async (detailId: number): Promise<any[]> => {
    const response = await fetch(`${API_URL}/ejecuciones-mantenimiento/${detailId}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  // Fix: Added missing getEvidence method for parity
  getEvidence: async (detailId: number): Promise<any[]> => {
    const response = await fetch(`${API_URL}/evidencias-mantenimiento/${detailId}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  // --- Email Config ---
  getEmailConfig: async (): Promise<EmailConfig> => {
    const response = await fetch(`${API_URL}/settings/email`, { headers: getHeaders() });
    return handleResponse(response);
  },
  saveEmailConfig: async (config: EmailConfig): Promise<void> => {
    await fetch(`${API_URL}/settings/email`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(config)
    });
  },

  // --- Alerts ---
  verificarAlertasMantenimiento: async (): Promise<void> => {
    await fetch(`${API_URL}/stats/verify-alerts`, { method: 'POST', headers: getHeaders() });
  },

  // --- Bulk migrations ---
  bulkCreateEquipos: async (rows: any[]): Promise<any> => {
    const response = await fetch(`${API_URL}/migrations/equipos`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(rows)
    });
    return handleResponse(response);
  },
  bulkCreateUsuarios: async (rows: any[]): Promise<any> => {
    const response = await fetch(`${API_URL}/migrations/usuarios`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(rows)
    });
    return handleResponse(response);
  },
  bulkCreateLicencias: async (rows: any[]): Promise<any> => {
    const response = await fetch(`${API_URL}/migrations/licencias`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(rows)
    });
    return handleResponse(response);
  },
  bulkCreateDepartamentos: async (rows: any[]): Promise<any> => {
    const response = await fetch(`${API_URL}/migrations/departamentos`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(rows)
    });
    return handleResponse(response);
  },
  bulkCreatePuestos: async (rows: any[]): Promise<any> => {
    const response = await fetch(`${API_URL}/migrations/puestos`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(rows)
    });
    return handleResponse(response);
  },
  bulkCreateAsignaciones: async (rows: any[]): Promise<any> => {
    const response = await fetch(`${API_URL}/migrations/asignaciones`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(rows)
    });
    return handleResponse(response);
  }
};