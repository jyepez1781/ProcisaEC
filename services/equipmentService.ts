
import { api } from './mockApi';
import { Equipo } from '../types';

export const equipmentService = {
  create: async (data: any): Promise<Equipo> => api.createEquipo(data),
  
  update: async (id: number, data: Partial<Equipo>): Promise<Equipo> => api.updateEquipo(id, data),
  
  assign: async (id: number, usuarioId: number, ubicacion: string, observaciones: string, archivo?: File) => 
    api.asignarEquipo(id, usuarioId, ubicacion, observaciones, archivo),
  
  return: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string, liberarLicencias?: boolean, archivo?: File) => 
    api.recepcionarEquipo(id, observaciones, ubicacionId, ubicacionNombre, liberarLicencias, archivo),
  
  markForDisposal: async (id: number, observaciones: string, ubicacionId: number, ubicacionNombre: string) => 
    api.marcarParaBaja(id, observaciones, ubicacionId, ubicacionNombre),
  
  dispose: async (id: number, motivo: string, archivo?: File) => api.bajaEquipo(id, motivo, archivo),
  
  sendToMaintenance: async (id: number, motivo: string) => api.enviarAMantenimiento(id, motivo)
};
