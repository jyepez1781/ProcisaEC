
import React from 'react';
import { Edit, Trash2, Warehouse } from 'lucide-react';
import { EntityBase } from '../../hooks/useEntityManager';

interface EntityTableProps {
  items: EntityBase[];
  withWarehouseOption?: boolean;
  onEdit: (item: EntityBase) => void;
  onDelete: (id: number) => void;
}

export const EntityTable: React.FC<EntityTableProps> = ({ items, withWarehouseOption, onEdit, onDelete }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
            {withWarehouseOption && (
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Tipo</th>
            )}
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 w-20">#{item.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.nombre}</td>
              {withWarehouseOption && (
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {item.es_bodega ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      <Warehouse className="w-3 h-3" /> Bodega IT
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Administrativo
                    </span>
                  )}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => onEdit(item)} 
                  className="text-blue-600 hover:text-blue-800 mr-3 p-1 hover:bg-blue-50 rounded transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); onDelete(item.id); }} 
                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={withWarehouseOption ? 4 : 3} className="px-6 py-8 text-center text-slate-500 text-sm">
                No hay registros creados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
