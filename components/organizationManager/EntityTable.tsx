
import React from 'react';
import { Edit, Trash2, Warehouse, MapPin, Globe } from 'lucide-react';
import { EntityBase } from '../../hooks/useEntityManager';

interface EntityTableProps {
  items: EntityBase[];
  withWarehouseOption?: boolean;
  onEdit: (item: EntityBase) => void;
  onDelete: (id: number) => void;
}

export const EntityTable: React.FC<EntityTableProps> = ({ items, withWarehouseOption, onEdit, onDelete }) => {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-colors">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nombre</th>
            {/* Columnas Dinámicas */}
            {items.some(i => i.abreviatura) && (
               <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Abreviatura</th>
            )}
            {items.some(i => i.pais_nombre) && (
               <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">País</th>
            )}
            {/* Fin Columnas Dinámicas */}
            
            {withWarehouseOption && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ciudad</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tipo</th>
                </>
            )}
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 w-20">#{item.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.nombre}</td>
              
              {/* Celda Abreviatura */}
              {items.some(i => i.abreviatura) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-mono">
                      {item.abreviatura || '-'}
                  </td>
              )}

              {/* Celda País */}
              {items.some(i => i.pais_nombre) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {item.pais_nombre}
                      </div>
                  </td>
              )}

              {withWarehouseOption && (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                    {item.ciudad_nombre ? (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.ciudad_nombre}
                        </div>
                    ) : (
                        <span className="text-slate-400 italic text-xs">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.es_bodega ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Warehouse className="w-3 h-3" /> Bodega IT
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        Administrativo
                      </span>
                    )}
                  </td>
                </>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => onEdit(item)} 
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); onDelete(item.id); }} 
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={10} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No hay registros creados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
