import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/mockApi';
import { equipmentService } from '../services/equipmentService';
import { Equipo, TipoEquipo, Usuario, Departamento, Ciudad, Pais } from '../types';
import Swal from 'sweetalert2';

export type ModalAction = 'CREATE' | 'EDIT' | 'ASSIGN' | 'RETURN' | 'BAJA' | 'TO_MAINTENANCE' | 'MARK_DISPOSAL' | null;

export const useEquipment = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [bodegas, setBodegas] = useState<Departamento[]>([]);
  const [cities, setCities] = useState<Ciudad[]>([]);
  const [countries, setCountries] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    text: '',
    status: 'ALL',
    type: 'ALL',
    user: 'ALL'
  });

  // Grouping State
  const [grouping, setGrouping] = useState<'NONE' | 'TYPE' | 'USER'>('NONE');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const loadData = async () => {
    setLoading(true);
    try {
      const [eq, tp, us, dp, ci, co] = await Promise.all([
        api.getEquipos(),
        api.getTiposEquipo(),
        api.getUsuarios(),
        api.getDepartamentos(),
        api.getCiudades(),
        api.getPaises()
      ]);
      setEquipos(eq);
      setTipos(tp);
      setUsuarios(us.filter(u => u.activo));
      setBodegas(dp.filter(d => d.es_bodega));
      setCities(ci);
      setCountries(co);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Hot Reload every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter Logic
  const filteredEquipos = useMemo(() => {
    return equipos.filter(e => {
      const matchText = !filters.text || 
        e.codigo_activo.toLowerCase().includes(filters.text.toLowerCase()) || 
        e.numero_serie.toLowerCase().includes(filters.text.toLowerCase());
      
      const matchStatus = filters.status === 'ALL' || e.estado === filters.status;
      const matchType = filters.type === 'ALL' || e.tipo_equipo_id === Number(filters.type);
      const matchUser = filters.user === 'ALL' || e.responsable_id === Number(filters.user);

      return matchText && matchStatus && matchType && matchUser;
    });
  }, [equipos, filters]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination Logic
  const totalItems = filteredEquipos.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedEquipos = filteredEquipos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Grouping Logic applied to paginated items
  const groupedEquipos = useMemo(() => {
    if (grouping === 'NONE') return { 'Todos': paginatedEquipos };

    return paginatedEquipos.reduce((acc, item) => {
      let key = '';
      if (grouping === 'TYPE') key = item.tipo_nombre || 'Sin Tipo';
      else if (grouping === 'USER') key = item.responsable_nombre || 'Sin Asignar';

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, Equipo[]>);
  }, [paginatedEquipos, grouping]);

  const handleAction = async (action: ModalAction, equipo: Equipo | null, formData: any) => {
    try {
      if (action === 'CREATE') {
        await equipmentService.create(formData);
      } else if (action === 'EDIT' && equipo) {
        await equipmentService.update(equipo.id, formData);
      } else if (action === 'ASSIGN' && equipo) {
        await equipmentService.assign(
            equipo.id, 
            Number(formData.usuario_id), 
            formData.ubicacion, 
            formData.observaciones, 
            formData.evidenceFile
        );
      } else if (action === 'RETURN' && equipo) {
        const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
        await equipmentService.return(
            equipo.id, 
            formData.observaciones, 
            Number(formData.ubicacion_id), 
            bodega?.nombre || 'Bodega',
            formData.releaseLicenses,
            formData.evidenceFile
        );
      } else if (action === 'BAJA' && equipo) {
        await equipmentService.dispose(equipo.id, formData.observaciones, formData.evidenceFile);
      } else if (action === 'TO_MAINTENANCE' && equipo) {
        await equipmentService.sendToMaintenance(equipo.id, formData.observaciones);
      } else if (action === 'MARK_DISPOSAL' && equipo) {
        const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
        await equipmentService.markForDisposal(
            equipo.id, 
            formData.observaciones,
            Number(formData.ubicacion_id),
            bodega?.nombre || 'Bodega'
        );
      }
      
      await loadData();
      Swal.fire('Éxito', 'Operación realizada correctamente', 'success');
      return true;
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', error.message || 'Ocurrió un error', 'error');
      return false;
    }
  };

  return {
    groupedEquipos,
    tipos, usuarios, bodegas, cities, countries,
    filters, setFilters,
    grouping, setGrouping,
    handleAction,
    // Pagination props
    currentPage, totalPages, setCurrentPage, totalItems, ITEMS_PER_PAGE
  };
};