
import { Equipo, Usuario, Departamento, Puesto, TipoEquipo, HistorialMovimiento, HistorialAsignacion, RegistroMantenimiento, TipoLicencia, Licencia, ReporteGarantia, Notificacion } from '../types';

// URL base de tu API Laravel (ajusta el puerto si es necesario)
const API_URL = 'http://localhost:8000/api';

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
  return response.json();
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
  createDepartamento: async (nombre: string): Promise<Departamento> => {
    const response = await fetch(`${API_URL}/departamentos`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ nombre })
    });
    return handleResponse(response);
  },
  updateDepartamento: async (id: number, nombre: string): Promise<Departamento> => {
    const response = await fetch(`${API_URL}/departamentos/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify({ nombre })
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
  asignarEquipo: async (id: number, usuarioId: number, ubicacion: string, observaciones: string): Promise<Equipo> => {
    const response = await fetch(`${API_URL}/equipos/${id}/asignar`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ usuario_id: usuarioId, ubicacion, observaciones })
    });
    return handleResponse(response);
  },
  recepcionarEquipo: async (id: number, observaciones: string): Promise<Equipo> => {
    const response = await fetch(`${API_URL}/equipos/${id}/recepcionar`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ observaciones })
    });
    return handleResponse(response);
  },
  bajaEquipo: async (id: number, motivo: string): Promise<Equipo> => {
    const response = await fetch(`${API_URL}/equipos/${id}/baja`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ motivo })
    });
    return handleResponse(response);
  },
  enviarAMantenimiento: async (id: number, motivo: string): Promise<Equipo> => {
    const response = await fetch(`${API_URL}/equipos/${id}/mantenimiento`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ motivo })
    });
    return handleResponse(response);
  },
  finalizarMantenimiento: async (equipoId: number, data: any, nuevoEstado: string): Promise<Equipo> => {
    const response = await fetch(`${API_URL}/equipos/${equipoId}/finalizar-mantenimiento`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ ...data, nuevo_estado: nuevoEstado })
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
  agregarStockLicencias: async (tipoId: number, cantidad: number, fechaVencimiento: string): Promise<void> => {
    await fetch(`${API_URL}/licencias/stock`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ tipo_id: tipoId, cantidad, fecha_vencimiento: fechaVencimiento })
    });
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
  }
};
