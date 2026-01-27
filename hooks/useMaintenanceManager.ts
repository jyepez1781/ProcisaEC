
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
  procesador: string;
  ram: string;
  disco_capacidad: string;
  disco_tipo: 'SSD' | 'HDD' | 'NVMe';
  sistema_operativo: string;
}

const INITIAL_FORM_STATE: MaintenanceFormData = {
  tipo: 'Correctivo',
  proveedor: '',
  costo: 0,
  descripcion: '',
  accion_final: 'DISPONIBLE',
  ubicacion_id: '',
  serie_cargador: '',
  procesador: '',
  ram: '',
  disco_capacidad: '',
  disco_tipo: 'SSD',
  sistema_operativo: ''
};

export const useMaintenanceManager = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [bodegas, setBodegas] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    const interval = setInterval(() => loadData(true), 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const openModal = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setFormData({
      ...INITIAL_FORM_STATE,
      ubicacion_id: (!equipo.responsable_id) ? (equipo.ubicacion_id || (bodegas[0]?.id || '')) : '',
      serie_cargador: equipo.serie_cargador || '',
      procesador: equipo.procesador || '',
      ram: equipo.ram || '',
      disco_capacidad: equipo.disco_capacidad || '',
      disco_tipo: equipo.disco_tipo || 'SSD',
      sistema_operativo: equipo.sistema_operativo || ''
    });
    setReportFile(null);
  };

  const closeModal = () => {
    setSelectedEquipo(null);
    setFormData(INITIAL_FORM_STATE);
    setReportFile(null);
  };

  const submitMaintenance = async () => {
    if (!selectedEquipo || !reportFile) {
        Swal.fire('Atención', 'Debe subir la Orden de Servicio firmada antes de finalizar.', 'warning');
        return;
    }

    try {
      let nuevoEstado = EstadoEquipo.DISPONIBLE;
      let uId = Number(formData.ubicacion_id) || undefined;
      let uNom = '';

      if (formData.accion_final === 'BAJA') {
        nuevoEstado = EstadoEquipo.BAJA;
      } else {
        if (selectedEquipo.responsable_id) {
           nuevoEstado = EstadoEquipo.ACTIVO;
           uId = undefined; 
        } else {
           nuevoEstado = EstadoEquipo.DISPONIBLE;
           const b = bodegas.find(x => x.id === uId);
           if (b) uNom = b.nombre;
        }
      }

      await api.finalizarMantenimiento(selectedEquipo.id, { ...formData, ubicacionId: uId, ubicacionNombre: uNom || undefined }, nuevoEstado, reportFile);
      
      const emailConfig = await api.getEmailConfig();
      let successMessage = 'Mantenimiento registrado correctamente.';

      if (emailConfig.notificar_mantenimiento) {
          if (nuevoEstado === EstadoEquipo.ACTIVO && selectedEquipo.responsable_nombre) {
              const u = (await api.getUsuarios()).find(x => x.id === selectedEquipo.responsable_id);
              successMessage += ` Se ha enviado una notificación automática a ${u?.correo}.`;
          } else if (emailConfig.correos_copia.length > 0) {
              successMessage += ` Se ha enviado una copia a las cuentas de soporte configuradas.`;
          }
      }

      closeModal();
      await loadData();
      Swal.fire({ title: 'Éxito', text: successMessage, icon: 'success', confirmButtonColor: '#2563eb' });
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  return {
    equipos, bodegas, loading, selectedEquipo, formData, reportFile,
    actions: { openModal, closeModal, updateForm: (u: any) => setFormData(p => ({...p, ...u})), setFile: setReportFile, submitMaintenance, refresh: loadData }
  };
};
