
import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/mockApi';
import { Usuario, Departamento, Puesto, RolUsuario } from '../types';
import Swal from 'sweetalert2';

export const useUserManager = (currentUser: Usuario | null) => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [depts, setDepts] = useState<Departamento[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filterText, setFilterText] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Edit/Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Usuario>>({});

  // Deactivate Confirmation Modal State
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<Usuario | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, d, p] = await Promise.all([
        api.getUsuarios(),
        api.getDepartamentos(),
        api.getPuestos()
      ]);
      setUsers(u);
      setDepts(d);
      setPuestos(p);
    } catch (error) {
      console.error("Error loading data", error);
      Swal.fire('Error', 'No se pudieron cargar los datos de usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
        if (!filterText) return true;
        const searchText = filterText.toLowerCase();
        return (
          user.nombre_completo.toLowerCase().includes(searchText) ||
          user.nombre_usuario.toLowerCase().includes(searchText) ||
          user.correo.toLowerCase().includes(searchText) ||
          (user.numero_empleado && user.numero_empleado.toLowerCase().includes(searchText))
        );
      });
  }, [users, filterText]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (user?: Usuario) => {
    if (user) {
      setEditingId(user.id);
      setFormData({ ...user, password: '' }); // Don't show existing password
    } else {
      setEditingId(null);
      setFormData({
        nombres: '', apellidos: '', nombre_usuario: '', numero_empleado: '', correo: '', password: '',
        rol: RolUsuario.USUARIO, departamento_id: undefined, puesto_id: undefined, activo: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (editingId && !dataToSend.password) {
        delete dataToSend.password;
      }

      if (editingId) {
        await api.updateUsuario(editingId, dataToSend);
      } else {
        await api.createUsuario(dataToSend as any);
      }
      handleCloseModal();
      loadData();
      Swal.fire('Guardado', 'Usuario guardado correctamente', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al guardar usuario', 'error');
    }
  };

  const handleStatusAction = async (user: Usuario) => {
    // Validation 1: Prevent self-deactivation
    if (currentUser && currentUser.id === user.id) {
      Swal.fire('Acción no permitida', 'No puedes desactivar tu propio usuario mientras estás conectado.', 'warning');
      return;
    }

    // Validation 2: If already inactive, do nothing
    if (!user.activo) {
      return;
    }

    // Proceed to Deactivation Modal
    setUserToDeactivate(user);
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivation = async () => {
    if (!userToDeactivate) return;
    
    try {
      setIsDeactivateModalOpen(false);
      setLoading(true);
      
      await api.updateUsuario(userToDeactivate.id, { activo: false });
      
      await loadData();
      setUserToDeactivate(null);
      Swal.fire('Usuario Desactivado', 'El usuario ha sido desactivado correctamente.', 'success');
    } catch (error: any) {
      setLoading(false);
      Swal.fire('Error', error.message, 'error');
    }
  };

  return {
    users: paginatedUsers,
    totalFiltered: filteredUsers.length,
    loading,
    depts,
    puestos,
    filterText,
    setFilterText,
    currentPage,
    setCurrentPage,
    totalPages,
    ITEMS_PER_PAGE,
    
    // Modal & Form State
    isModalOpen,
    editingId,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,

    // Deactivate State
    isDeactivateModalOpen,
    setIsDeactivateModalOpen,
    userToDeactivate,
    handleStatusAction,
    handleConfirmDeactivation
  };
};
