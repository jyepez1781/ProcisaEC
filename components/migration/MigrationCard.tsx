
import React, { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { migrationService } from '../../services/migrationService';
import Swal from 'sweetalert2';

interface MigrationCardProps {
  title: string;
  description: string;
  type: 'EQUIPOS' | 'USUARIOS' | 'LICENCIAS' | 'DEPARTAMENTOS' | 'PUESTOS' | 'ASIGNACIONES';
  icon: React.ReactNode;
}

export const MigrationCard: React.FC<MigrationCardProps> = ({ title, description, type, icon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await migrationService.downloadTemplate(type);
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo generar la plantilla: ' + error.message,
        icon: 'error',
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      try {
        const count = await migrationService.uploadData(type, file);
        Swal.fire({
          title: 'Carga Exitosa',
          text: `Se han procesado ${count} registros correctamente.`,
          icon: 'success',
          confirmButtonColor: '#2563eb'
        });
      } catch (error: any) {
        console.error(error);
        Swal.fire({
          title: 'Error en la Carga',
          text: error.message || 'Ocurrió un error al procesar el archivo Excel.',
          icon: 'error',
          confirmButtonColor: '#2563eb'
        });
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
          <p className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Instrucciones:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Descarga la plantilla <strong>Excel (.xlsx)</strong>.</li>
            <li>Llena los datos respetando el orden de las columnas.</li>
            <li>No modifiques los encabezados.</li>
            <li>Sube el archivo Excel para procesar la carga.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {downloading ? 'Generando...' : <><Download className="w-4 h-4" /> Descargar Plantilla</>}
        </button>
        
        <label className={`flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors cursor-pointer ${loading ? 'opacity-70 pointer-events-none' : ''}`}>
          {loading ? (
             <span>Procesando...</span>
          ) : (
             <>
               <Upload className="w-4 h-4" /> Subir Excel
             </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".xlsx, .xls" 
            onChange={handleUpload}
            disabled={loading}
          />
        </label>
      </div>
    </div>
  );
};
