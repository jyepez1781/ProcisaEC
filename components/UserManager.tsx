
import React from 'react';
import { Usuario } from '../types';
import { useUserManager } from '../hooks/useUserManager';
import { UserToolbar } from './userManager/UserToolbar';
import { UserTable } from './userManager/UserTable';
import { UserFormModal } from './userManager/UserFormModal';
import { DeactivateUserModal } from './userManager/DeactivateUserModal';

interface UserManagerProps {
  currentUser: Usuario | null;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUser }) => {
  const {
    users, totalFiltered, loading, depts, puestos,
    filterText, setFilterText,
    currentPage, totalPages, setCurrentPage, ITEMS_PER_PAGE,
    
    isModalOpen, editingId, formData, setFormData,
    handleOpenModal, handleCloseModal, handleSubmit,

    isDeactivateModalOpen, setIsDeactivateModalOpen, userToDeactivate,
    handleStatusAction, handleConfirmDeactivation
  } = useUserManager(currentUser);

  return (
    <div className="space-y-6">
        <UserToolbar 
          filterText={filterText}
          onFilterChange={setFilterText}
          onNewUser={() => handleOpenModal()}
        />

        <UserTable 
          users={users}
          currentUser={currentUser}
          loading={loading}
          onEdit={handleOpenModal}
          onStatusAction={handleStatusAction}
          totalFiltered={totalFiltered}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
        />

        <DeactivateUserModal 
          isOpen={isDeactivateModalOpen}
          onClose={() => setIsDeactivateModalOpen(false)}
          user={userToDeactivate}
          onConfirm={handleConfirmDeactivation}
        />

        <UserFormModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isEditing={!!editingId}
          formData={formData}
          setFormData={setFormData}
          departments={depts}
          puestos={puestos}
          currentUser={currentUser}
          onSubmit={handleSubmit}
        />
    </div>
  );
};

export default UserManager;
