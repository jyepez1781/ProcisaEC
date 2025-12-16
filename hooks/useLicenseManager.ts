
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/mockApi';
import { TipoLicencia, Licencia, Usuario, Equipo } from '../types';
import Swal from 'sweetalert2';

export const useLicenseManager = () => {
  const [tipos, setTipos] = useState<TipoLicencia[]>([]);
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [t, l, u, e] = await Promise.all([
        api.getTipoLicencias(),
        api.getLicencias(),
        api.getUsuarios(),
        api.getEquipos()
      ]);
      setTipos(t);
      setLicencias(l);
      setUsuarios(u.filter(user => user.activo));
      setEquipos(e);
    } catch (e) {
      console.error("Error loading license data", e);
      Swal.fire('Error', 'No se pudieron cargar los datos de licencias', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Hot Reload every 10 seconds for licenses
    const interval = setInterval(() => loadData(false), 10000);
    return () => clearInterval(interval);
  }, [loadData]);

 const createType = async (data: { nombre: string, proveedor: string, descripcion: string, stockInicial: number, fechaVencimiento: string }) => {
    try {
      const newType = await api.createTipoLicencia({
        nombre: data.nombre,
        proveedor: data.proveedor,
        descripcion: data.descripcion
      });

      if (data.stockInicial > 0) {
        await api.agregarStockLicencias(
          newType.id, 
          data.stockInicial, 
          data.fechaVencimiento
        );
      }
      await loadData(false);
      Swal.fire('Creado', 'Tipo de licencia creado correctamente', 'success');
      return true;
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
      return false;
    }
  };

  const addStock = async (tipoId: number, cantidad: number, fechaVencimiento: string) => {
    try {
      await api.agregarStockLicencias(tipoId, cantidad, fechaVencimiento);
      await loadData(false);
      Swal.fire('Stock Agregado', 'Licencias generadas correctamente', 'success');
      return true;
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
      return false;
    }
  };

  const assignLicense = async (licenciaId: number, usuarioId: number, tipoId: number) => {
    // Validation: Check if user already has this license type
    const existingAssignment = licencias.find(l => 
      l.usuario_id === usuarioId && 
      l.tipo_id === tipoId
    );

    if (existingAssignment) {
      throw new Error(`El usuario ya tiene asignada una licencia de este tipo.`);
    }

    try {
      await api.asignarLicencia(licenciaId, usuarioId);
      await loadData(false);
      return true;
    } catch (error: any) {
      throw error;
    }
  };

  const unassignLicense = async (licenciaId: number) => {
    try {
      await api.liberarLicencia(licenciaId);
      await loadData(false);
      return true;
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
      return false;
    }
  };

  return {
    data: { tipos, licencias, usuarios, equipos, loading },
    actions: { createType, addStock, assignLicense, unassignLicense, refresh: loadData }
  };
};
