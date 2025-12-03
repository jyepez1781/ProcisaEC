
import React, { useState, useRef } from 'react';
import { DetallePlan, EvidenciaMantenimiento } from '../../types';
import { Modal } from '../common/Modal';
import { Upload, Eye, FileText, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import { maintenancePlanningService } from '../../services/maintenancePlanningService';
import Swal from 'sweetalert2';

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: DetallePlan | null;
  onSuccess: () => void;
}

export const MaintenanceExecutionModal: React.FC<ExecutionModalProps> = ({ isOpen, onClose, task, onSuccess }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tecnico: '',
    observaciones: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !task) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validation: Size < 5MB, Type: Image or PDF
      if (selectedFile.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'El archivo no debe superar los 5MB', 'error');
        return;
      }
      
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tecnico || !formData.fecha) return;
    
    setLoading(true);
    try {
      await maintenancePlanningService.registerExecution(task.id, {
        ...formData,
        archivo: file || undefined
      });
      Swal.fire('Registrado', 'Mantenimiento registrado con éxito', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Ejecución de Mantenimiento" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-6">
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
               <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase font-bold">Equipo</span>
               <span className="text-slate-900 dark:text-white font-medium">{task.equipo_codigo} - {task.equipo_modelo}</span>
            </div>
            <div>
               <span className="text-slate-500 dark:text-slate-400 block text-xs uppercase font-bold">Ubicación</span>
               <span className="text-slate-700 dark:text-slate-300">{task.equipo_ubicacion}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha Ejecución</label>
                <input required type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                  value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Técnico Responsable</label>
                <input required type="text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                  placeholder="Nombre del técnico"
                  value={formData.tecnico} onChange={e => setFormData({...formData, tecnico: e.target.value})} />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observaciones / Hallazgos</label>
             <textarea required rows={3} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                placeholder="Describa el trabajo realizado..."
                value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
          </div>

          {/* Evidence Section */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Evidencia (Foto o PDF)</label>
            
            {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-400 transition-colors"
                >
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Click para subir archivo</p>
                    <p className="text-xs text-slate-400">PDF, JPG, PNG (Max 5MB)</p>
                </div>
            ) : (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex items-start gap-4 bg-slate-50 dark:bg-slate-700/50 relative">
                    <button type="button" onClick={clearFile} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded flex items-center justify-center overflow-hidden shrink-0">
                        {file.type.includes('image') ? (
                            <img src={previewUrl!} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <FileText className="w-8 h-8 text-red-500" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                        {file.type.includes('image') && (
                            <a href={previewUrl!} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1">
                                <Eye className="w-3 h-3" /> Ver Imagen Completa
                            </a>
                        )}
                    </div>
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileChange} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
               <CheckCircle className="w-4 h-4" /> {loading ? 'Guardando...' : 'Registrar Ejecución'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
