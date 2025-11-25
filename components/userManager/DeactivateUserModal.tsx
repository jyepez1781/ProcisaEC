
import React from 'react';
import { AlertTriangle, UserX } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Usuario } from '../../types';

interface DeactivateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario | null;
  onConfirm: () => void;
}

export const DeactivateUserModal: React.FC<DeactivateUserModalProps> = ({ 
  isOpen, onClose, user, onConfirm 
}) => {
  if (!isOpen || !user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inactivar Usuario" maxWidth="max-w-md">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-amber-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Inactivar Usuario</h3>
          <p className="text-slate-600 text-sm mt-2">
            ¿Realmente desea inactivar al usuario <span className="font-semibold text-slate-900">{user.nombre_usuario}</span>?
          </p>
          <p className="text-slate-500 text-xs mt-2">
            El usuario perderá acceso al sistema y se liberarán sus licencias asignadas. El historial se conservará.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button 
          onClick={onClose} 
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
        >
          Cancelar
        </button>
        <button 
          onClick={onConfirm} 
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <UserX className="w-4 h-4" /> Sí, Inactivar
        </button>
      </div>
    </Modal>
  );
};
