
import React, { useState, useEffect } from 'react';
import { Equipo, TipoEquipo, Usuario, Departamento, EstadoEquipo, Ciudad, Pais } from '../../types';
import { Save, Upload, X, FileText, RefreshCw } from 'lucide-react';
import { ModalAction } from '../../hooks/useEquipment';

interface EquipmentFormProps {
  action: ModalAction;
  equipo: Equipo | null;
  tipos: TipoEquipo[];
  usuarios: Usuario[];
  bodegas: Departamento[];
  cities?: Ciudad[];
  countries?: Pais[];
  onSubmit: (data: any) => Promise<boolean>;
  onCancel: () => void;
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({ 
  action, equipo, tipos, usuarios, bodegas, cities = [], countries = [], onSubmit, onCancel 
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

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-generate Asset Code Logic
  useEffect(() => {
    if (action === 'CREATE') {
      // 1. Encontrar Bodega seleccionada
      const selectedBodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
      if (!selectedBodega) return;

      // 2. Encontrar Ciudad de la Bodega
      const selectedCity = cities.find(c => c.id === selectedBodega.ciudad_id);
      if (!selectedCity) return;

      // 3. Encontrar País de la Ciudad
      const selectedCountry = countries.find(p => p.id === selectedCity.pais_id);
      
      const serie = formData.numero_serie ? formData.numero_serie.trim().toUpperCase() : '';
      
      if (serie && selectedCountry && selectedCity) {
        // Formato: PAISCIUDADSERIE (ej: ECGYESN123456) - Sin guiones
        const newCode = `${selectedCountry.abreviatura}${selectedCity.abreviatura}${serie}`.toUpperCase();
        setFormData((prev: any) => ({ ...prev, codigo_activo: newCode }));
      }
    }
  }, [formData.ubicacion_id, formData.numero_serie, action, bodegas, cities, countries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Merge file into data if exists
    const dataToSubmit = { ...formData, evidenceFile };
    const success = await onSubmit(dataToSubmit);
    if (!success) setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
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
          {/* Fila 1: Ubicación y Tipo (Definen el contexto) */}
          <div className="grid grid-cols-2 gap-4">
            {action === 'CREATE' ? (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación Inicial</label>
                    <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                        value={formData.ubicacion_id} onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}>
                        {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                    </select>
                </div>
            ) : (
                // En edición la ubicación suele ser informativa o se maneja por movimientos
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación Actual</label>
                    <input type="text" disabled className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400"
                        value={formData.ubicacion_nombre || ''} />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo Equipo</label>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                  value={formData.tipo_equipo_id} onChange={e => setFormData({...formData, tipo_equipo_id: Number(e.target.value)})}>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
            </div>
          </div>

          {/* Fila 2: Serie y Código (Serie detona código) */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Número de Serie</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" 
                placeholder="Ingrese serie..."
                value={formData.numero_serie} onChange={e => setFormData({...formData, numero_serie: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-400 mb-1 flex items-center gap-1">
                 Código Activo 
                 {action === 'CREATE' && <RefreshCw className="w-3 h-3 text-blue-500 animate-pulse" />}
              </label>
              <input required type="text" className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-700" 
                placeholder="Autogenerado..."
                value={formData.codigo_activo} 
                onChange={e => setFormData({...formData, codigo_activo: e.target.value})} 
                // En CREATE es semi-automático (se puede editar pero se sugiere), en EDIT es editable
              />
              {action === 'CREATE' && <p className="text-[10px] text-blue-500 mt-1">Formato: PAISCIUDADSERIE</p>}
            </div>
          </div>

          {/* Fila 3: Marca y Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marca</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" 
                value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Modelo</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" 
                value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} />
            </div>
          </div>

          {/* Fila 4: Detalles Específicos */}
          {isLaptop() && (
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Serie Cargador</label>
               <input type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                  value={formData.serie_cargador} onChange={e => setFormData({...formData, serie_cargador: e.target.value})} />
             </div>
          )}

          {/* Fila 5: Compra y Garantía */}
          <div className="grid grid-cols-3 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha Compra</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white"
                   value={formData.fecha_compra} onChange={e => setFormData({...formData, fecha_compra: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Garantía (Años)</label>
                <input type="number" min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white"
                   value={formData.anos_garantia} onChange={e => setFormData({...formData, anos_garantia: Number(e.target.value)})} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor ($)</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white"
                   value={formData.valor_compra} onChange={e => setFormData({...formData, valor_compra: Number(e.target.value)})} />
             </div>
          </div>
        </>
      )}

      {/* --- ASSIGN --- */}
      {action === 'ASSIGN' && (
        <>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuario</label>
              <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                 value={formData.usuario_id} onChange={e => setFormData({...formData, usuario_id: Number(e.target.value)})}>
                 <option value="">Seleccione...</option>
                 {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación Física</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                 value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observaciones</label>
              <textarea className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" rows={3}
                 value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
           </div>
        </>
      )}

      {/* --- RETURN / DISPOSAL --- */}
      {['RETURN', 'MARK_DISPOSAL'].includes(action || '') && (
        <>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación (Bodega)</label>
              <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                 value={formData.ubicacion_id} onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}>
                 {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observaciones</label>
              <textarea required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" rows={3}
                 value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
           </div>
        </>
      )}

      {/* --- BAJA / MAINTENANCE --- */}
      {['BAJA', 'TO_MAINTENANCE'].includes(action || '') && (
        <>
          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo / Falla</label>
             <textarea required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" rows={3}
                value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
          </div>
          
          {action === 'BAJA' && (
            <div className="pt-2">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Evidencia de Baja (Opcional)</label>
               {!evidenceFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <p className="text-xs text-slate-500 dark:text-slate-400">Subir Informe Técnico / Foto</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                  </label>
               ) : (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">{evidenceFile.name}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-300">{(evidenceFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button type="button" onClick={() => setEvidenceFile(null)} className="text-slate-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                      </button>
                  </div>
               )}
            </div>
          )}
        </>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
         <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancelar</button>
         <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar'}
         </button>
      </div>
    </form>
  );
};
