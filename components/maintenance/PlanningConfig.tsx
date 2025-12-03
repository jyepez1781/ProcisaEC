
import React, { useState, useEffect } from 'react';
import { Play, List, CalendarRange, Eye, MapPin } from 'lucide-react';
import { PlanMantenimiento, Equipo, Ciudad } from '../../types';
import { maintenancePlanningService } from '../../services/maintenancePlanningService';
import { api } from '../../services/mockApi';
import Swal from 'sweetalert2';

interface PlanningConfigProps {
  onGenerate: (year: number, cityId: number, cityName: string) => void;
  onViewPlan: (planId: number) => void;
}

export const PlanningConfig: React.FC<PlanningConfigProps> = ({ onGenerate, onViewPlan }) => {
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [cities, setCities] = useState<Ciudad[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  
  const [history, setHistory] = useState<PlanMantenimiento[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [plans, ciudadesData] = await Promise.all([
          maintenancePlanningService.getPlans(),
          api.getCiudades()
      ]);
      setHistory(plans);
      setCities(ciudadesData);
      
      // Select first city by default if available
      if (ciudadesData.length > 0) {
          setSelectedCityId(String(ciudadesData[0].id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedCityId) {
        Swal.fire('Atención', 'Por favor seleccione una ciudad para generar el plan.', 'warning');
        return;
    }
    const city = cities.find(c => c.id === Number(selectedCityId));
    if (city) {
        // Generación directa del borrador sin confirmación (la confirmación va al Guardar)
        onGenerate(year, city.id, city.nombre);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* --- Generar Nuevo Plan --- */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <CalendarRange className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Generador de Plan Anual</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Seleccione la ciudad y el año. El sistema analizará los equipos ubicados en dicha ciudad
                    y distribuirá la carga de mantenimiento automáticamente.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-100 dark:border-slate-700">
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Año del Plan</label>
                <input 
                    type="number" 
                    min={2024} 
                    max={2030}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-center text-lg font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ciudad / Sede</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 font-medium appearance-none"
                        value={selectedCityId}
                        onChange={e => setSelectedCityId(e.target.value)}
                    >
                        {cities.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg h-[46px]"
            >
                <Play className="w-5 h-5 fill-current" /> Generar Propuesta
            </button>
        </div>
      </div>

      {/* --- Historial --- */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
         <div className="flex items-center gap-3 mb-6">
            <List className="w-6 h-6 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Historial de Planes</h3>
         </div>
         
         {loadingHistory ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">Cargando historial...</div>
         ) : history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                No hay planes registrados.
            </div>
         ) : (
            <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ciudad</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Año</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Creado Por</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {history.map(plan => (
                            <tr key={plan.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800 dark:text-white">{plan.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        {plan.ciudad_nombre || 'General'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{plan.anio}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${plan.estado === 'ACTIVO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                        {plan.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{plan.creado_por}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button 
                                        onClick={() => onViewPlan(plan.id)}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="Ver Plan"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         )}
      </div>

    </div>
  );
};
