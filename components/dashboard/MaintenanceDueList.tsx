
import React from 'react';
import { Calendar, AlertCircle, Wrench, Clock, History } from 'lucide-react';
import { DetallePlan, EstadoPlan } from '../../types';

interface MaintenanceDueListProps {
  tasks: DetallePlan[];
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MaintenanceDueList: React.FC<MaintenanceDueListProps> = ({ tasks }) => {
  const currentMonthIdx = new Date().getMonth();
  const currentMonth = currentMonthIdx + 1;

  // Group tasks by month
  const groupedTasks = tasks.reduce((acc, task) => {
      const month = task.mes_programado;
      if (!acc[month]) acc[month] = [];
      acc[month].push(task);
      return acc;
  }, {} as Record<number, DetallePlan[]>);

  // Get sorted list of months that have pending tasks
  const sortedPendingMonths = Object.keys(groupedTasks)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">Mantenimiento Programado</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Backlog y equipos pendientes del mes actual</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${tasks.length > 0 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300' : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'}`}>
            {tasks.length} {tasks.length === 1 ? 'Pendiente' : 'Pendientes'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
            <CheckCircleIcon />
            <p className="mt-2 font-medium">¡Todo al día!</p>
            <p className="text-xs">No hay mantenimientos pendientes acumulados.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedPendingMonths.map(monthNum => {
                const monthTasks = groupedTasks[monthNum];
                const isPreviousMonth = monthNum < currentMonth;
                const monthLabel = MONTH_NAMES[monthNum - 1];

                return (
                    <div key={monthNum} className="space-y-2">
                        {/* Month Section Header */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider ${isPreviousMonth ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'}`}>
                            {isPreviousMonth ? <History className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            {monthLabel} {isPreviousMonth && <span className="ml-auto text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full">Atrasado</span>}
                        </div>

                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 w-1/4">Equipo</th>
                                    <th className="px-4 py-2 w-1/4">Modelo</th>
                                    <th className="px-4 py-2 w-1/4">Ubicación</th>
                                    <th className="px-4 py-2 text-center w-1/4">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {monthTasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-slate-700 dark:text-slate-200 block">{task.equipo_codigo}</span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{task.equipo_tipo}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">{task.equipo_modelo}</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[150px]" title={task.equipo_ubicacion}>{task.equipo_ubicacion}</td>
                                        <td className="px-4 py-3 text-center">
                                            {task.estado === EstadoPlan.EN_PROCESO ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                                    <Wrench className="w-3 h-3 animate-pulse" /> En Taller
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isPreviousMonth ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>
                                                    <AlertCircle className="w-3 h-3" /> Pendiente
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg className="w-10 h-10 mx-auto text-green-200 dark:text-green-900 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
