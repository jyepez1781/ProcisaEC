
import React, { useState } from 'react';
import { Equipo, TipoEquipo, Usuario, Departamento, EstadoEquipo } from '../../types';
import { Save } from 'lucide-react';
import { ModalAction } from '../../hooks/useEquipment';

interface EquipmentFormProps {
  action: ModalAction;
  equipo: Equipo | null;
  tipos: TipoEquipo[];
  usuarios: Usuario[];
  bodegas: Departamento[];
  onSubmit: (data: any) => Promise<boolean>;
  onCancel: () => void;
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({ 
  action, equipo, tipos, usuarios, bodegas, onSubmit, onCancel 
}) => {
  const [formData, setFormData] = useState<any>(() => {
    // Initial State Logic based on Action
    if (action === 'CREATE') {
      return {
        codigo_activo: '', numero_serie: '', marca: '', modelo: '', 
        tipo_equipo_id: tipos[0]?.id || '', serie_cargador: '', 
        fecha_compra: new Date().toISOString().split('T')[0], 
        valor_compra: 0, anos_garantia: 1, estado: EstadoEquipo.DISPONIBLE, observaciones: '',
        ubicacion_id: bodegas.length > 0 ? bodegas[0].id : ''
      };
    }
    if (action === 'EDIT' && equipo) return { ...equipo };
    if (action === 'ASSIGN') return { usuario_id: usuarios[0]?.id || '', ubicacion: '', observaciones: '' };
    if (['RETURN', 'MARK_DISPOSAL'].includes(action || '')) return { observaciones: '', ubicacion_id: bodegas[0]?.id || '' };
    return { observaciones: '' };
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await onSubmit(formData);
    if (!success) setLoading(false);
  };

  const isLaptop = () => {
    const selected = tipos.find(t => t.id === Number(formData.tipo_equipo_id));
    return selected?.nombre.toLowerCase().includes('laptop');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* --- CREATE / EDIT --- */}
      {(action === 'CREATE' || action === 'EDIT') && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código Activo</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.codigo_activo} onChange={e => setFormData({...formData, codigo_activo: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Serie</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.numero_serie} onChange={e => setFormData({...formData, numero_serie: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Equipo</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.tipo_equipo_id} onChange={e => setFormData({...formData, tipo_equipo_id: Number(e.target.value)})}>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
            </div>
            {action === 'CREATE' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación Inicial</label>
                    <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.ubicacion_id} onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}>
                        {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                    </select>
                </div>
            )}
          </div>
          {isLaptop() && (
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Serie Cargador</label>
               <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.serie_cargador} onChange={e => setFormData({...formData, serie_cargador: e.target.value})} />
             </div>
          )}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Compra</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                   value={formData.fecha_compra} onChange={e => setFormData({...formData, fecha_compra: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Años Garantía</label>
                <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                   value={formData.anos_garantia} onChange={e => setFormData({...formData, anos_garantia: Number(e.target.value)})} />
             </div>
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Compra</label>
              <input type="number" step="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                 value={formData.valor_compra} onChange={e => setFormData({...formData, valor_compra: Number(e.target.value)})} />
          </div>
        </>
      )}

      {/* --- ASSIGN --- */}
      {action === 'ASSIGN' && (
        <>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
              <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                 value={formData.usuario_id} onChange={e => setFormData({...formData, usuario_id: Number(e.target.value)})}>
                 <option value="">Seleccione...</option>
                 {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación Física</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                 value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
              <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows={3}
                 value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
           </div>
        </>
      )}

      {/* --- RETURN / DISPOSAL --- */}
      {['RETURN', 'MARK_DISPOSAL'].includes(action || '') && (
        <>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación (Bodega)</label>
              <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                 value={formData.ubicacion_id} onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}>
                 {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
              <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows={3}
                 value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
           </div>
        </>
      )}

      {/* --- BAJA / MAINTENANCE --- */}
      {['BAJA', 'TO_MAINTENANCE'].includes(action || '') && (
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Motivo / Falla</label>
           <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" rows={3}
              value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
         <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
         <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar'}
         </button>
      </div>
    </form>
  );
};
