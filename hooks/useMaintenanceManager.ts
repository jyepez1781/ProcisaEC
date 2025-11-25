
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/mockApi';
import { Equipo, EstadoEquipo, Departamento } from '../types';
import Swal from 'sweetalert2';

export interface MaintenanceFormData {
  tipo: 'Correctivo' | 'Preventivo';
  proveedor: string;
  costo: number;
  descripcion: string;
  accion_final: 'DISPONIBLE' | 'BAJA';
  ubicacion_id: number | string;
  serie_cargador: string;
}

const INITIAL_FORM_STATE: MaintenanceFormData = {
  tipo: 'Correctivo',
  proveedor: '',
  costo: 0,
  descripcion: '',
  accion_final: 'DISPONIBLE',
  ubicacion_id: '',
  serie_cargador: ''
};

export const useMaintenanceManager = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [bodegas, setBodegas] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [formData, setFormData] = useState<MaintenanceFormData>(INITIAL_FORM_STATE);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allEquipos, deptData] = await Promise.all([
        api.getEquipos(),
        api.getDepartamentos()
      ]);
      
      setEquipos(allEquipos.filter(e => e.estado === EstadoEquipo.EN_MANTENIMIENTO));
      setBodegas(deptData.filter(d => d.es_bodega));
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los datos de mantenimiento', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openModal = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setFormData({
      ...INITIAL_FORM_STATE,
      ubicacion_id: bodegas.length > 0 ? bodegas[0].id : '',
      serie_cargador: equipo.serie_cargador || ''
    });
  };

  const closeModal = () => {
    setSelectedEquipo(null);
    setFormData(INITIAL_FORM_STATE);
  };

  const updateForm = (updates: Partial<MaintenanceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const submitMaintenance = async () => {
    if (!selectedEquipo) return;

    try {
      // Find location name if ID is selected
      let ubicacionNombre = '';
      if (formData.ubicacion_id) {
        const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
        if (bodega) ubicacionNombre = bodega.nombre;
      }

      await api.finalizarMantenimiento(
        selectedEquipo.id, 
        {
          tipo: formData.tipo,
          proveedor: formData.proveedor,
          costo: formData.costo,
          descripcion: formData.descripcion,
          ubicacionId: Number(formData.ubicacion_id) || undefined,
          ubicacionNombre: ubicacionNombre || undefined,
          serie_cargador: formData.serie_cargador
        },
        formData.accion_final
      );
      
      closeModal();
      await loadData();
      
      Swal.fire({
        title: 'Registrado',
        text: 'Mantenimiento registrado correctamente.',
        icon: 'success',
        confirmButtonColor: '#2563eb'
      });
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#2563eb'
      });
    }
  };

  return {
    equipos,
    bodegas,
    loading,
    selectedEquipo,
    formData,
    actions: {
      openModal,
      closeModal,
      updateForm,
      submitMaintenance,
      refresh: loadData
    }
  };
};
