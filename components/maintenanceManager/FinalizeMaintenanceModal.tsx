
import React from 'react';
import { X, Save, Zap, CheckCircle, Warehouse, AlertTriangle } from 'lucide-react';
import { Equipo, Departamento } from '../../types';
import { MaintenanceFormData } from '../../hooks/useMaintenanceManager';

interface FinalizeMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: Equipo | null;
  bodegas: Departamento[];
  formData: MaintenanceFormData;
  onFormChange: (updates: Partial<MaintenanceFormData>) => void;
  onSubmit: () => void;
}

export const FinalizeMaintenanceModal: React.FC<FinalizeMaintenanceModalProps> = ({
  isOpen, onClose, equipo, bodegas, formData, onFormChange, onSubmit
}) => {
  if (!isOpen || !equipo) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isLaptop = () => {
    if (!equipo || !equipo.tipo_nombre) return false;
    const typeName = equipo.tipo_nombre.toLowerCase();
    return typeName.includes('laptop') || typeName.includes('portatil') || typeName.includes('notebook');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Finalizar Mantenimiento</h3>
            <p className="text-sm text-slate-500">Equipo: {equipo.codigo_activo}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Mantenimiento</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.tipo}
                onChange={e => onFormChange({ tipo: e.target.value as any })}
              >
                <option value="Correctivo">Correctivo</option>
                <option value="Preventivo">Preventivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Costo ($)</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.costo}
                onChange={e => onFormChange({ costo: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
            <input 
              type="text"
              required
              placeholder="Ej. Taller Interno, HP Services..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.proveedor}
              onChange={e => onFormChange({ proveedor: e.target.value })}
            />
          </div>

          {/* Conditional Charger Field for Laptops */}
          {isLaptop() && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
               <label className="block text-sm font-medium text-blue-800 mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Serie del Cargador
               </label>
               <input 
                 type="text"
                 placeholder="Ingrese o verifique la serie del cargador"
                 className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                 value={formData.serie_cargador}
                 onChange={e => onFormChange({ serie_cargador: e.target.value })}
               />
               <p className="text-xs text-blue-500 mt-1">Verifique si el cargador fue reemplazado.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Detalle del Trabajo</label>
            <textarea 
              required
              rows={3}
              placeholder="Describe qué reparaciones o cambios se realizaron..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.descripcion}
              onChange={e => onFormChange({ descripcion: e.target.value })}
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label className="block text-sm font-semibold text-slate-800 mb-3">Resolución Final</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <input 
                  type="radio" 
                  name="accion_final" 
                  value="DISPONIBLE"
                  checked={formData.accion_final === 'DISPONIBLE'}
                  onChange={() => onFormChange({ accion_final: 'DISPONIBLE' })}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Equipo Operativo
                  </div>
                  <p className="text-xs text-slate-500">
                    {equipo.responsable_id 
                       ? `El equipo retornará al usuario: ${equipo.responsable_nombre}`
                       : `El equipo retornará a Inventario (Disponible)`
                    }
                  </p>
                </div>
              </label>

              {/* Reception Location Selector - Visible when Operativo is selected */}
              {formData.accion_final === 'DISPONIBLE' && (
                <div className="ml-7 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                   <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Warehouse className="w-3 h-3" /> Ubicación de Recepción (Bodega IT)
                   </label>
                   <select 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={formData.ubicacion_id}
                      onChange={e => onFormChange({ ubicacion_id: e.target.value })}
                      required
                   >
                      {bodegas.length === 0 && <option value="">Sin bodegas definidas</option>}
                      {bodegas.map(b => (
                         <option key={b.id} value={b.id}>{b.nombre}</option>
                      ))}
                   </select>
                </div>
              )}

              <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-red-400 transition-colors">
                <input 
                  type="radio" 
                  name="accion_final" 
                  value="BAJA"
                  checked={formData.accion_final === 'BAJA'}
                  onChange={() => onFormChange({ accion_final: 'BAJA' })}
                  className="w-4 h-4 text-red-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Equipo Irreparable / Obsoleto
                  </div>
                  <p className="text-xs text-slate-500">Dar de baja definitiva del inventario</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Save className="w-4 h-4" /> Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
