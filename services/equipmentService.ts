
import { api } from './mockApi';
import { Equipo, TipoEquipo, Usuario, Departamento } from '../types';

export const equipmentService = {
  getAll: async () => api.getEquipos(),
  getTypes: async () => api.getTiposEquipo(),
  create: async (data: any) => api.createEquipo(data),
  update: async (id: number, data: Partial<Equipo>) => api.updateEquipo(id, data),
  assign: async (id: number, usuarioId: number, ubicacion: string, observaciones: string) => 
    api.asignarEquipo(id, usuarioId, ubicacion, observaciones),
  return: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string) => 
    api.recepcionarEquipo(id, observaciones, ubicacionId, ubicacionNombre),
  markForDisposal: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string) =>
    api.marcarParaBaja(id, observaciones, ubicacionId, ubicacionNombre),
  dispose: async (id: number, motivo: string) => api.bajaEquipo(id, motivo),
  sendToMaintenance: async (id: number, motivo: string) => api.enviarAMantenimiento(id, motivo),
};

export const catalogService = {
  getUsers: async () => api.getUsuarios(),
  getDepartments: async () => api.getDepartamentos(),
  getWarehouses: async () => {
    const depts = await api.getDepartamentos();
    return depts.filter(d => d.es_bodega);
  }
};
