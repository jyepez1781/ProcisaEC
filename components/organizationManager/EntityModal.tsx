
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Save, Warehouse, Globe } from 'lucide-react';
import { EntityBase } from '../../hooks/useEntityManager';
import { Ciudad, Pais } from '../../types';
import Swal from 'sweetalert2';
import { api } from '../../services/mockApi';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // "Departamento", "Puesto", "Ciudad", "País"
  editingItem: EntityBase | null;
  withWarehouseOption?: boolean;
  cities?: Ciudad[];
  onSubmit: (data: any) => Promise<boolean>;
}

export const EntityModal: React.FC<EntityModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  editingItem, 
  withWarehouseOption = false, 
  cities = [],
  onSubmit 
}) => {
  const [formData, setFormData] = useState<{nombre: string, abreviatura: string, es_bodega: boolean, ciudad_id: string, pais_id: string}>({ 
    nombre: '', 
    abreviatura: '',
    es_bodega: false, 
    ciudad_id: '',
    pais_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [paises, setPaises] = useState<Pais[]>([]);

  useEffect(() => {
    // Cargar países si es necesario (para modal ciudad)
    if (isOpen && title === 'Ciudad') {
        api.getPaises().then(setPaises);
    }
  }, [isOpen, title]);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({ 
          nombre: editingItem.nombre, 
          abreviatura: editingItem.abreviatura || '',
          es_bodega: !!editingItem.es_bodega,
          ciudad_id: editingItem.ciudad_id ? String(editingItem.ciudad_id) : '',
          pais_id: editingItem.pais_id ? String(editingItem.pais_id) : ''
        });
      } else {
        setFormData({ nombre: '', abreviatura: '', es_bodega: false, ciudad_id: '', pais_id: '' });
      }
    }
  }, [isOpen, editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    const dataToSend: any = { nombre: formData.nombre };

    if (title === 'País') {
        dataToSend.abreviatura = formData.abreviatura;
    }
    if (title === 'Ciudad') {
        dataToSend.abreviatura = formData.abreviatura;
        dataToSend.pais_id = formData.pais_id ? Number(formData.pais_id) : undefined;
    }
    if (withWarehouseOption) {
        dataToSend.es_bodega = formData.es_bodega;
        dataToSend.ciudad_id = formData.ciudad_id ? Number(formData.ciudad_id) : undefined;
    }

    setLoading(true);
    try {
      await onSubmit(dataToSend);
      // Modal closes via parent if successful
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', error.message || 'Error al guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? `Editar ${title}` : `Nuevo ${title}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del {title}</label>
          <input 
            required 
            autoFocus
            type="text" 
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
            value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
            placeholder={`Ej. ${title === 'Departamento' ? 'Marketing' : 'Nombre'}`}
          />
        </div>

        {/* Campo Abreviatura (País y Ciudad) */}
        {(title === 'País' || title === 'Ciudad') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Abreviatura / Siglas</label>
              <input 
                type="text" 
                maxLength={5}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase bg-white dark:bg-slate-700 dark:text-white"
                value={formData.abreviatura}
                onChange={e => setFormData({...formData, abreviatura: e.target.value.toUpperCase()})}
                placeholder="Ej. EC, GYE"
              />
            </div>
        )}

        {/* Selector de País (Solo para Ciudad) */}
        {title === 'Ciudad' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">País</label>
              <select 
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                value={formData.pais_id}
                onChange={e => setFormData({...formData, pais_id: e.target.value})}
              >
                <option value="">Seleccione un país...</option>
                {paises.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
        )}

        {/* Campos para Departamento (Ciudad y Bodega) */}
        {withWarehouseOption && cities.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ciudad</label>
            <select 
              required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
              value={formData.ciudad_id}
              onChange={e => setFormData({...formData, ciudad_id: e.target.value})}
            >
              <option value="">Seleccione una ciudad...</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {withWarehouseOption && (
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                  checked={formData.es_bodega}
                  onChange={e => setFormData({...formData, es_bodega: e.target.checked})}
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-200">
                      <Warehouse className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      Funciona como Bodega de Sistemas
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Habilitar para áreas donde se almacenan equipos de IT.</p>
                </div>
              </label>
            </div>
        )}
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
