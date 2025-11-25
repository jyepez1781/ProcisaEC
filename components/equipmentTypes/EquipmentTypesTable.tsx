
import React from 'react';
import { TipoEquipo } from '../../types';
import { Edit, Trash2 } from 'lucide-react';

interface EquipmentTypesTableProps {
  tipos: TipoEquipo[];
  loading: boolean;
  onEdit: (tipo: TipoEquipo) => void;
  onDelete: (id: number) => void;
}

export const EquipmentTypesTable: React.FC<EquipmentTypesTableProps> = ({ tipos, loading, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {loading ? (
        <div className="p-8 text-center text-slate-500">Cargando tipos...</div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {tipos.map((tipo) => (
              <tr key={tipo.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{tipo.id}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{tipo.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{tipo.descripcion}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onEdit(tipo)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => onDelete(tipo.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
             {tipos.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No hay tipos de equipo registrados.</td>
                </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
