
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage 
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    // Si hay 8 páginas o menos, mostrar todas (3 inicio + 3 fin + 2 gap = 8)
    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 1. Siempre mostrar las 3 primeras
      pages.push(1, 2, 3);

      // 2. Lógica para el medio
      // Si la página actual está lejos del inicio (> 4), poner puntos suspensivos antes
      if (currentPage > 4) {
        pages.push('...');
      }

      // Si la página actual no está en las 3 primeras ni en las 3 últimas, mostrarla
      if (currentPage > 3 && currentPage < totalPages - 2) {
        pages.push(currentPage);
      }

      // Si la página actual está lejos del final (< total - 3), poner puntos suspensivos después
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      // 3. Siempre mostrar las 3 últimas
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    }

    return pages.map((page, index) => {
      if (page === '...') {
        // Usar index como parte de la key para permitir múltiples '...'
        return (
          <span key={`ellipsis-${index}`} className="px-2 text-slate-400 self-center">...</span>
        );
      }

      const pageNum = page as number;
      return (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            currentPage === pageNum
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-b-xl">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {totalItems !== undefined && itemsPerPage !== undefined ? (
            <>Mostrando <span className="font-medium text-slate-700 dark:text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> a <span className="font-medium text-slate-700 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="font-medium text-slate-700 dark:text-white">{totalItems}</span> registros</>
        ) : (
            <>Página {currentPage} de {totalPages}</>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mr-2"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex gap-1">
          {renderPageNumbers()}
        </div>
        
        {/* Mobile View Simple */}
        <div className="sm:hidden flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
            {currentPage} / {totalPages}
        </div>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-2"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
