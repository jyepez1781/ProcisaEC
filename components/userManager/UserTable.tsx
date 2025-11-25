
import React from 'react';
import { Edit, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Usuario } from '../../types';

interface UserTableProps {
  users: Usuario[];
  currentUser: Usuario | null;
  loading: boolean;
  onEdit: (user: Usuario) => void;
  onStatusAction: (user: Usuario) => void;
  
  // Pagination
  totalFiltered: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export const UserTable: React.FC<UserTableProps> = ({ 
  users, currentUser, loading, onEdit, onStatusAction,
  totalFiltered, currentPage, totalPages, onPageChange, itemsPerPage
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {loading ? (
        <div className="p-8 text-center text-slate-500">Cargando usuarios...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">N° Empleado / Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre Completo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Departamento / Puesto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map(u => {
                  const isSelf = currentUser?.id === u.id;
                  const isInactive = !u.activo;
                  const isDisabled = isSelf || isInactive;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded w-fit mb-1">
                            {u.numero_empleado || 'S/N'}
                          </span>
                          <span className="font-medium text-slate-900">{u.nombre_usuario}</span>
                          <span className="text-xs text-slate-500">{u.correo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700">{u.nombre_completo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{u.departamento_nombre || '-'}</div>
                        <div className="text-xs text-slate-500">{u.puesto_nombre || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{u.rol}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.activo ? 
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Activo</span> : 
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Inactivo</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); onEdit(u); }} 
                          className="text-blue-600 hover:text-blue-900 mr-3" 
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onStatusAction(u);
                          }}
                          disabled={isDisabled}
                          className={`${!isDisabled ? 'text-amber-600 hover:text-amber-900 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                          title={isSelf ? "No puedes desactivar tu propio usuario" : (isInactive ? "Usuario ya inactivo" : "Desactivar Usuario")}
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No se encontraron usuarios.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {users.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalFiltered)}</span> de <span className="font-medium">{totalFiltered}</span> usuarios
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => onPageChange(idx + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        currentPage === idx + 1 
                          ? 'bg-blue-600 text-white' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
