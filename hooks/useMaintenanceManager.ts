
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
  const [reportFile, setReportFile] = useState<File | null>(null);

  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
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
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Hot Reload every 5 seconds
    const interval = setInterval(() => loadData(true), 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const openModal = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setFormData({
      ...INITIAL_FORM_STATE,
      // Si el equipo NO tiene responsable, intentamos pre-seleccionar su ubicación actual (si es bodega) o la primera bodega.
      // Si TIENE responsable, dejamos vacío (la UI lo ocultará).
      ubicacion_id: (!equipo.responsable_id) 
         ? (equipo.ubicacion_id || (bodegas.length > 0 ? bodegas[0].id : '')) 
         : '',
      serie_cargador: equipo.serie_cargador || ''
    });
    setReportFile(null);
  };

  const closeModal = () => {
    setSelectedEquipo(null);
    setFormData(INITIAL_FORM_STATE);
    setReportFile(null);
  };

  const updateForm = (updates: Partial<MaintenanceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const setFile = (file: File | null) => {
    setReportFile(file);
  };

  const submitMaintenance = async () => {
    if (!selectedEquipo) return;
    if (!reportFile) {
        Swal.fire('Atención', 'Debe subir la Orden de Servicio firmada antes de finalizar.', 'warning');
        return;
    }

    try {
      // Determine final status and location
      let nuevoEstado = EstadoEquipo.DISPONIBLE;
      let ubicacionIdToSend = Number(formData.ubicacion_id) || undefined;
      let ubicacionNombreToSend = '';

      if (formData.accion_final === 'BAJA') {
        nuevoEstado = EstadoEquipo.BAJA;
      } else {
        // Opción: Equipo Operativo (DISPONIBLE en el form visualmente)
        // Logica: Si tenía responsable, vuelve a Activo (Usuario). Si no, vuelve a Disponible (Bodega).
        if (selectedEquipo.responsable_id) {
           nuevoEstado = EstadoEquipo.ACTIVO;
           // Al volver a Activo, ignoramos la ubicación del formulario y enviamos undefined
           // para que el backend/mock mantenga la ubicación y responsable previos.
           ubicacionIdToSend = undefined; 
        } else {
           nuevoEstado = EstadoEquipo.DISPONIBLE;
           // Si va a bodega, buscamos el nombre de la ubicación seleccionada
           if (formData.ubicacion_id) {
             const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
             if (bodega) ubicacionNombreToSend = bodega.nombre;
           }
        }
      }

      await api.finalizarMantenimiento(
        selectedEquipo.id, 
        {
          tipo: formData.tipo,
          proveedor: formData.proveedor,
          costo: formData.costo,
          descripcion: formData.descripcion,
          ubicacionId: ubicacionIdToSend,
          ubicacionNombre: ubicacionNombreToSend || undefined,
          serie_cargador: formData.serie_cargador
        },
        nuevoEstado,
        reportFile
      );
      
      // Preparar mensaje de éxito personalizado
      const emailConfig = await api.getEmailConfig();
      let successMessage = 'Mantenimiento registrado correctamente.';

      if (emailConfig.notificar_mantenimiento) {
          if (nuevoEstado === EstadoEquipo.ACTIVO && selectedEquipo.responsable_nombre) {
              successMessage += ` Se ha enviado un correo con el detalle al usuario: ${selectedEquipo.responsable_nombre}.`;
          } else if (emailConfig.correos_copia.length > 0) {
              successMessage += ` Se ha notificado por correo a las cuentas configuradas (Soporte/Administración).`;
          }
      }

      closeModal();
      await loadData();
      
      Swal.fire({
        title: 'Mantenimiento Finalizado',
        text: successMessage,
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
    reportFile,
    actions: {
      openModal,
      closeModal,
      updateForm,
      setFile,
      submitMaintenance,
      refresh: loadData
    }
  };
};
