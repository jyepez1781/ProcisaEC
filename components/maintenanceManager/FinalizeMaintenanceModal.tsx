import React, { useState } from 'react';
import { X, Save, Zap, CheckCircle, Warehouse, AlertTriangle, Printer, Upload, FileText, UserCheck, Sparkles, Loader2, Cpu, Database, HardDrive, LayoutGrid, RefreshCw } from 'lucide-react';
import { Equipo, Departamento } from '../../types';
import { MaintenanceFormData } from '../../hooks/useMaintenanceManager';
import { generateServiceOrder } from '../../utils/documentGenerator';
import { GoogleGenAI } from "@google/genai";

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
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  /* Fix: Use correct model 'gemini-3-flash-preview' and ensure new instance for each call */
  const handleAIAssist = async () => {
    if (!formData.descripcion.trim()) return;
    setIsAiLoading(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Eres un supervisor de mantenimiento IT. Mejora la redacción del siguiente detalle de trabajo realizado para un reporte técnico oficial. Hazlo profesional, conciso y corrige cualquier error ortográfico. Texto: "${formData.descripcion}"`,
        });
        const text = response.text;
        if (text) {
            onFormChange({ descripcion: text.trim() });
        }
    } catch (error) {
        console.error("AI Error", error);
    } finally {
        setIsAiLoading(false);
    }
  };

  const isComputingType = () => {
    if (!equipo || !equipo.tipo_nombre) return false;
    const typeName = equipo.tipo_nombre.toLowerCase();
    return typeName.includes('laptop') || typeName.includes('desktop') || typeName.includes('servidor') || typeName.includes('workstation');
  };

  const hasResponsible = !!equipo.responsable_id;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full flex flex-col max-h-[95vh] transition-colors" onClick={e => e.stopPropagation()}>
        {/* Header Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800 rounded-t-xl">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Finalizar Mantenimiento</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Equipo: {equipo.codigo_activo} ({equipo.marca} {equipo.modelo})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-800 custom-scrollbar">
            <form id="finalize-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Sección 1: Datos de Costo y Proveedor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm"
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
                            type="number" min="0" step="0.01" required
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm font-bold"
                            value={formData.costo}
                            onChange={e => onFormChange({ costo: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proveedor</label>
                        <input 
                            type="text" required placeholder="Taller / Externo"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm"
                            value={formData.proveedor}
                            onChange={e => onFormChange({ proveedor: e.target.value })}
                        />
                    </div>
                </div>

                {/* Sección 2: ACTUALIZACIÓN DE ESPECIFICACIONES (SOLO CÓMPUTO) */}
                {isComputingType() && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm uppercase tracking-wider">
                                <RefreshCw className="w-4 h-4" /> Actualizar Ficha Técnica
                            </div>
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200 px-2 py-0.5 rounded font-bold">Cambios se reflejarán en el equipo</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                    <Cpu className="w-3 h-3" /> Procesador
                                </label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                                    value={formData.procesador} onChange={e => onFormChange({ procesador: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                    {/* Fix: Changed Layout to LayoutGrid to avoid potential name collisions */}
                                    <LayoutGrid className="w-3 h-3" /> Memoria RAM
                                </label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                                    value={formData.ram} onChange={e => onFormChange({ ram: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                    <HardDrive className="w-3 h-3" /> Capacidad de Disco
                                </label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                                    value={formData.disco_capacidad} onChange={e => onFormChange({ disco_capacidad: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tipo Disco</label>
                                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                                    value={formData.disco_tipo} onChange={e => onFormChange({ disco_tipo: e.target.value as any })}>
                                    <option value="SSD">SSD</option>
                                    <option value="NVMe">NVMe</option>
                                    <option value="HDD">HDD</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                <Database className="w-3 h-3" /> Sistema Operativo
                            </label>
                            <input type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                                value={formData.sistema_operativo} onChange={e => onFormChange({ sistema_operativo: e.target.value })} />
                        </div>
                    </div>
                )}

                {/* Sección 3: Detalle del trabajo */}
                <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detalle del Trabajo Realizado</label>
                    <textarea 
                        required rows={3} placeholder="Describe reparaciones, cambios de piezas, etc..."
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm pr-10"
                        value={formData.descripcion}
                        onChange={e => onFormChange({ descripcion: e.target.value })}
                    />
                    {formData.descripcion.length > 5 && (
                        <button type="button" onClick={handleAIAssist} disabled={isAiLoading}
                            className="absolute right-2 bottom-3 p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-200 transition-colors disabled:opacity-50"
                            title="Mejorar con AI">
                            {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {/* Sección 4: Documentación y Cargador */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-slate-800 dark:text-white">Documentación Obligatoria</label>
                        <div className="flex flex-col gap-2">
                            <button type="button" onClick={handlePrintReport}
                                className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600"
                            >
                                <Printer className="w-4 h-4" /> 1. Generar Orden
                            </button>

                            <div className="relative">
                                {!reportFile ? (
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors text-xs">
                                        <Upload className="w-5 h-5 mb-1 text-slate-400" />
                                        <span className="font-semibold">2. Subir Firmado</span>
                                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileSelect} />
                                    </label>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                                        <FileText className="w-5 h-5 text-green-600" />
                                        <span className="text-[10px] font-medium text-green-800 dark:text-green-300 truncate flex-1">{reportFile.name}</span>
                                        <button type="button" onClick={() => onFileChange && onFileChange(null)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {equipo.tipo_nombre?.toLowerCase().includes('laptop') && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                            <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Serie del Cargador
                            </label>
                            <input type="text" placeholder="Serie actual o nueva"
                                className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white"
                                value={formData.serie_cargador} onChange={e => onFormChange({ serie_cargador: e.target.value })} />
                        </div>
                    )}
                </div>

                {/* Sección 5: Resolución */}
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">Resolución del Activo</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <label className={`flex-1 flex items-center gap-3 p-3 bg-white dark:bg-slate-700 border rounded-lg cursor-pointer transition-all ${formData.accion_final === 'DISPONIBLE' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-600'}`}>
                            <input type="radio" name="accion_final" checked={formData.accion_final === 'DISPONIBLE'} onChange={() => onFormChange({ accion_final: 'DISPONIBLE' })} className="hidden" />
                            <CheckCircle className={`w-5 h-5 ${formData.accion_final === 'DISPONIBLE' ? 'text-blue-600' : 'text-slate-300'}`} />
                            <div className="flex-1 text-sm">
                                <p className="font-bold text-slate-800 dark:text-white">Operativo</p>
                                <p className="text-[10px] text-slate-500">Retorna a uso</p>
                            </div>
                        </label>
                        <label className={`flex-1 flex items-center gap-3 p-3 bg-white dark:bg-slate-700 border rounded-lg cursor-pointer transition-all ${formData.accion_final === 'BAJA' ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-600'}`}>
                            <input type="radio" name="accion_final" checked={formData.accion_final === 'BAJA'} onChange={() => onFormChange({ accion_final: 'BAJA' })} className="hidden" />
                            <AlertTriangle className={`w-5 h-5 ${formData.accion_final === 'BAJA' ? 'text-red-600' : 'text-slate-300'}`} />
                            <div className="flex-1 text-sm">
                                <p className="font-bold text-slate-800 dark:text-white">Dar de Baja</p>
                                <p className="text-[10px] text-slate-500">Activo irreparable</p>
                            </div>
                        </label>
                    </div>

                    {formData.accion_final === 'DISPONIBLE' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-600 animate-in fade-in slide-in-from-top-2 duration-300">
                            {hasResponsible ? (
                                <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300 text-xs">
                                    <UserCheck className="w-4 h-4" />
                                    <span>El equipo regresará a <strong>{equipo.responsable_nombre}</strong> automáticamente.</span>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Bodega de Recepción</label>
                                    <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white"
                                        value={formData.ubicacion_id} onChange={e => onFormChange({ ubicacion_id: e.target.value })}>
                                        {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-xl shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-lg font-medium transition-colors">Cancelar</button>
            <button form="finalize-form" type="submit" disabled={!reportFile}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-md"
            >
                <Save className="w-4 h-4" /> Finalizar y Guardar
            </button>
        </div>
      </div>
    </div>
  );
};