
import React from 'react';
import { Calendar, AlertCircle, Wrench } from 'lucide-react';
import { DetallePlan, EstadoPlan } from '../../types';

interface MaintenanceDueListProps {
  tasks: DetallePlan[];
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MaintenanceDueList: React.FC<MaintenanceDueListProps> = ({ tasks }) => {
  const currentMonthName = MONTH_NAMES[new Date().getMonth()];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">Mantenimiento Programado - {currentMonthName}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Equipos pendientes de revisión en el plan actual</p>
        </div>
        <div className="ml-auto">
          <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
            {tasks.length} Pendientes
          </span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
            <CheckCircleIcon />
            <p className="mt-2">¡Todo al día! No hay mantenimientos pendientes para este mes.</p>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium sticky top-0">
              <tr>
                <th className="px-4 py-2">Equipo</th>
                <th className="px-4 py-2">Modelo</th>
                <th className="px-4 py-2">Ubicación</th>
                <th className="px-4 py-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{task.equipo_codigo}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{task.equipo_modelo}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{task.equipo_ubicacion}</td>
                  <td className="px-4 py-3 text-center">
                    {task.estado === EstadoPlan.EN_PROCESO ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <Wrench className="w-3 h-3" /> En Taller
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                           <AlertCircle className="w-3 h-3" /> Pendiente
                        </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg className="w-10 h-10 mx-auto text-green-200 dark:text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
