
import React from 'react';
import { Modal } from './Modal';
import { FileText, Download, X } from 'lucide-react';

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  title?: string;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ 
  isOpen, 
  onClose, 
  fileUrl,
  title = "Documento Adjunto"
}) => {
  if (!isOpen || !fileUrl) return null;

  const isPdf = fileUrl.toLowerCase().endsWith('.pdf') || 
                fileUrl.startsWith('blob:') || // Asumimos blob como PDF en contextos de reporte si no se especifica
                fileUrl.includes('application/pdf');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-5xl">
      <div className="flex flex-col h-[80vh] bg-slate-100 dark:bg-slate-900 rounded-b-xl overflow-hidden">
        <div className="flex-1 relative w-full h-full flex items-center justify-center p-4">
          {isPdf ? (
            <iframe 
              src={fileUrl} 
              className="w-full h-full rounded-lg shadow-sm bg-white" 
              title="Vista Previa PDF" 
            />
          ) : (
            <img 
              src={fileUrl} 
              alt="Vista Previa" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="flex flex-col items-center text-slate-400 dark:text-slate-500">
                    <div class="p-4 bg-slate-200 dark:bg-slate-800 rounded-full mb-3">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <p class="font-medium">No se pudo cargar la imagen</p>
                    <p class="text-xs mt-1 opacity-70 break-all max-w-md text-center">${fileUrl}</p>
                  </div>
                `;
              }}
            />
          )}
        </div>
        
        {/* Footer estandarizado con acciones */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center shrink-0">
            <a 
              href={fileUrl} 
              download 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline flex items-center gap-2"
            >
                <Download className="w-4 h-4" /> Descargar Original
            </a>
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
                Cerrar
            </button>
        </div>
      </div>
    </Modal>
  );
};
