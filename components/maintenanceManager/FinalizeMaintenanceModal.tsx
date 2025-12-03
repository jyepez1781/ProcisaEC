
import React from 'react';
import { X, Save, Zap, CheckCircle, Warehouse, AlertTriangle, Printer, Upload, FileText, UserCheck } from 'lucide-react';
import { Equipo, Departamento } from '../../types';
import { MaintenanceFormData } from '../../hooks/useMaintenanceManager';
import { generateServiceOrder } from '../../utils/documentGenerator';

interface FinalizeMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: Equipo | null;
  bodegas: Departamento[];
  formData: MaintenanceFormData;
  reportFile?: File | null;
  onFormChange: (updates: Partial<MaintenanceFormData>) => void;
  onFileChange?: (file: File | null) => void;
  onSubmit: () => void;
}

export const FinalizeMaintenanceModal: React.FC<FinalizeMaintenanceModalProps> = ({
  isOpen, onClose, equipo, bodegas, formData, reportFile, onFormChange, onFileChange, onSubmit
}) => {
  if (!isOpen || !equipo) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handlePrintReport = () => {
      generateServiceOrder(equipo, formData);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          if (onFileChange) onFileChange(e.target.files[0]);
      }
  };

  const isLaptop = () => {
    if (!equipo || !equipo.tipo_nombre) return false;
    const typeName = equipo.tipo_nombre.toLowerCase();
    return typeName.includes('laptop') || typeName.includes('portatil') || typeName.includes('notebook');
  };

  // Determinar si el equipo tenía un usuario asignado antes del mantenimiento
  const hasResponsible = !!equipo.responsable_id;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full flex flex-col max-h-[90vh] transition-colors" onClick={e => e.stopPropagation()}>
        {/* Header Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800 rounded-t-xl">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Finalizar Mantenimiento</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Equipo: {equipo.codigo_activo}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-800">
            <form id="finalize-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo Mantenimiento</label>
                    <select 
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                        value={formData.tipo}
                        onChange={e => onFormChange({ tipo: e.target.value as any })}
                    >
                        <option value="Correctivo">Correctivo</option>
                        <option value="Preventivo">Preventivo</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Costo ($)</label>
                    <input 
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                        value={formData.costo}
                        onChange={e => onFormChange({ costo: Number(e.target.value) })}
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proveedor</label>
                    <input 
                    type="text"
                    required
                    placeholder="Ej. Taller Interno, HP Services..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                    value={formData.proveedor}
                    onChange={e => onFormChange({ proveedor: e.target.value })}
                    />
                </div>

                {/* Conditional Charger Field for Laptops */}
                {isLaptop() && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Serie del Cargador
                    </label>
                    <input 
                        type="text"
                        placeholder="Ingrese o verifique la serie del cargador"
                        className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                        value={formData.serie_cargador}
                        onChange={e => onFormChange({ serie_cargador: e.target.value })}
                    />
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Verifique si el cargador fue reemplazado.</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detalle del Trabajo</label>
                    <textarea 
                    required
                    rows={3}
                    placeholder="Describe qué reparaciones o cambios se realizaron..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                    value={formData.descripcion}
                    onChange={e => onFormChange({ descripcion: e.target.value })}
                    />
                </div>

                {/* Service Order Logic */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Documentación Obligatoria</label>
                    <div className="flex gap-4 items-start">
                        <button 
                            type="button"
                            onClick={handlePrintReport}
                            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600"
                        >
                            <Printer className="w-4 h-4" /> 1. Imprimir Orden
                        </button>

                        <div className="flex-1">
                            {!reportFile ? (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                        <Upload className="w-5 h-5 mb-1 text-slate-400" />
                                        <p className="text-xs text-slate-500 dark:text-slate-400"><span className="font-semibold">2. Subir Firmado</span></p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileSelect} />
                                </label>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate">{reportFile.name}</p>
                                        <p className="text-xs text-green-600 dark:text-green-400">Listo para guardar</p>
                                    </div>
                                    <button type="button" onClick={() => onFileChange && onFileChange(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mt-4">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">Resolución Final</label>
                    <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                        <input 
                        type="radio" 
                        name="accion_final" 
                        value="DISPONIBLE"
                        checked={formData.accion_final === 'DISPONIBLE'}
                        onChange={() => onFormChange({ accion_final: 'DISPONIBLE' })}
                        className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            Equipo Operativo
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            El equipo regresará a su estado previo.
                        </p>
                        </div>
                    </label>

                    {/* Lógica de Destino: Si tiene responsable vuelve a él, si no, a bodega */}
                    {formData.accion_final === 'DISPONIBLE' && (
                        <div className="ml-7 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            {hasResponsible ? (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-blue-800 dark:text-blue-200">Retorno a Usuario</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-300">
                                            El equipo regresará a estado <strong>ACTIVO</strong> asignado a: <br/>
                                            {equipo.responsable_nombre} ({equipo.ubicacion_nombre})
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                        <Warehouse className="w-3 h-3" /> Ubicación de Recepción (Bodega IT)
                                    </label>
                                    <select 
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
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
                        </div>
                    )}

                    <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-red-400 transition-colors">
                        <input 
                        type="radio" 
                        name="accion_final" 
                        value="BAJA"
                        checked={formData.accion_final === 'BAJA'}
                        onChange={() => onFormChange({ accion_final: 'BAJA' })}
                        className="w-4 h-4 text-red-600"
                        />
                        <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            Equipo Irreparable / Obsoleto
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Dar de baja definitiva del inventario</p>
                        </div>
                    </label>
                    </div>
                </div>
            </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-xl shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
                Cancelar
            </button>
            <button 
                form="finalize-form" 
                type="submit" 
                disabled={!reportFile}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                title={!reportFile ? 'Debe subir la orden firmada' : ''}
            >
                <Save className="w-4 h-4" /> Finalizar Mantenimiento
            </button>
        </div>
      </div>
    </div>
  );
};
