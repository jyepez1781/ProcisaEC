
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/mockApi';
import { TipoEquipo } from '../types';
import Swal from 'sweetalert2';

export const useEquipmentTypes = () => {
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTiposEquipo();
      setTipos(data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los tipos de equipo', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createType = async (data: { nombre: string; descripcion: string }) => {
    try {
      await api.createTipoEquipo(data);
      await loadData();
      Swal.fire('Creado', 'Tipo de equipo creado correctamente.', 'success');
      return true;
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
      return false;
    }
  };

  const updateType = async (id: number, data: { nombre: string; descripcion: string }) => {
    try {
      await api.updateTipoEquipo(id, data);
      await loadData();
      Swal.fire('Actualizado', 'Tipo de equipo actualizado correctamente.', 'success');
      return true;
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
      return false;
    }
  };

  const deleteType = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteTipoEquipo(id);
        await loadData();
        Swal.fire('Eliminado', 'El tipo de equipo ha sido eliminado.', 'success');
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  return {
    tipos,
    loading,
    actions: { createType, updateType, deleteType, refresh: loadData }
  };
};
