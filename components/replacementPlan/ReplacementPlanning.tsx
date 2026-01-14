
import React, { useState, useEffect } from 'react';
/* Added Laptop and CheckCircle to lucide-react imports to fix 'Cannot find name' errors */
import { RefreshCw, Play, List, Eye, Save, Plus, X, Trash2, TrendingUp, DollarSign, Calendar, ChevronLeft, Printer, Download, Laptop, CheckCircle, Edit3 } from 'lucide-react';
import { api } from '../../services/mockApi';
import { PlanRecambio, DetallePlanRecambio, Equipo } from '../../types';
import { formatCurrency, calculateAge } from '../../utils/formatters';
import { generateExcelFromData } from '../../utils/excelHelper';
import { generateReplacementPlanPDF } from '../../utils/documentGenerator';
import Swal from 'sweetalert2';

const ReplacementPlanning: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'EDITOR'>('LIST');
  const [plans, setPlans] = useState<PlanRecambio[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [currentPlan, setCurrentPlan] = useState<PlanRecambio | null>(null);
  const [details, setDetails] = useState<DetallePlanRecambio[]>([]);
  const [isNewPlan, setIsNewPlan] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await api.getReplacementPlans();
      setPlans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    setLoading(true);
    try {
      const candidates = await api.getReplacementCandidates();
      
      if (candidates.length === 0) {
        Swal.fire('Sin Candidatos', 'No se encontraron equipos que cumplan los criterios para recambio este año o ya han sido planificados.', 'info');
        return;
      }

      const year = new Date().getFullYear() + 1;
      const newPlan: PlanRecambio = {
        id: Date.now(),
        anio: year,
        nombre: `Propuesta Recambio IT ${year}`,
        creado_por: 'Admin',
        fecha_creacion: new Date().toISOString().split('T')[0],
        estado: 'PROYECTO',
        total_equipos: candidates.length,
        presupuesto_estimado: candidates.reduce((acc, c) => acc + c.valor_compra, 0)
      };

      const newDetails: DetallePlanRecambio[] = candidates.map(c => ({
        id: Math.random(),
        plan_id: newPlan.id,
        equipo_id: c.id,
        equipo_codigo: c.codigo_activo,
        equipo_modelo: c.modelo,
        equipo_marca: c.marca,
        equipo_antiguedad: calculateAge(c.fecha_compra),
        valor_reposicion: c.valor_compra
      }));

      setCurrentPlan(newPlan);
      setDetails(newDetails);
      setIsNewPlan(true);
      setView('EDITOR');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlan = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getReplacementPlanDetails(id);
      setCurrentPlan(data.plan);
      setDetails(data.details);
      setIsNewPlan(false);
      setView('EDITOR');
    } catch (e) {
      Swal.fire('Error', 'No se pudo cargar el plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeDetail = (id: number) => {
    const updated = details.filter(d => d.id !== id);
    setDetails(updated);
    if (currentPlan) {
      setCurrentPlan({
        ...currentPlan,
        total_equipos: updated.length,
        presupuesto_estimado: updated.reduce((acc, curr) => acc + curr.valor_reposicion, 0)
      });
    }
  };

  const handleSavePlan = async () => {
    if (!currentPlan) return;

    if (!currentPlan.nombre.trim()) {
        Swal.fire('Atención', 'El plan debe tener un nombre descriptivo.', 'warning');
        return;
    }

    const result = await Swal.fire({
      title: '¿Guardar Plan de Recambio?',
      text: `Se registrará el plan "${currentPlan.nombre}" con ${details.length} equipos para el periodo ${currentPlan.anio}. Estos equipos ya no aparecerán en futuras propuestas.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'Sí, guardar y marcar equipos',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.saveReplacementPlan({ ...currentPlan, estado: 'ACTIVO' }, details);
        Swal.fire('Éxito', 'Plan de recambio guardado y equipos vinculados.', 'success');
        setView('LIST');
        loadPlans();
      } catch (e) {
        Swal.fire('Error', 'No se pudo guardar el plan', 'error');
      }
    }
  };

  const handleExportExcel = () => {
    if (!currentPlan) return;
    const data = details.map(d => ({
        'Código Activo': d.equipo_codigo,
        'Marca': d.equipo_marca,
        'Modelo': d.equipo_modelo,
        'Antigüedad (Años)': d.equipo_antiguedad,
        'Costo Reposición (Est)': formatCurrency(d.valor_reposicion)
    }));
    generateExcelFromData(data, `Plan_Recambio_${currentPlan.anio}`);
  };

  const handleExportPDF = () => {
    if (!currentPlan) return;
    generateReplacementPlanPDF(currentPlan, details);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-orange-600" /> Planificación de Recambio
        </h2>
        {view === 'EDITOR' && (
            <button onClick={() => setView('LIST')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <ChevronLeft className="w-4 h-4" /> Volver al Listado
            </button>
        )}
      </div>

      {view === 'LIST' ? (
        <div className="space-y-8">
            {/* Header / Generator Card */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                        <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Nueva Propuesta Anual</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Genera una propuesta basada en la antigüedad crítica de los activos informáticos (+4 años).
                            Podrás refinar la lista antes de guardarla definitivamente.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={handleGenerateProposal}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md"
                    >
                        <Play className="w-5 h-5 fill-current" /> Generar Propuesta
                    </button>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                <div className="flex items-center gap-2 mb-6 text-slate-400">
                    <List className="w-5 h-5" />
                    <h3 className="font-bold text-slate-700 dark:text-white">Planes de Recambio Registrados</h3>
                </div>

                {loading ? <div className="text-center py-8">Cargando...</div> : (
                    <div className="overflow-hidden border border-slate-100 dark:border-slate-700 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nombre / Año</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Equipos</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Presupuesto</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {plans.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-slate-800 dark:text-white">{p.nombre}</div>
                                            <div className="text-xs text-slate-500 uppercase">{p.anio}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{p.total_equipos} activos</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(p.presupuesto_estimado)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{p.fecha_creacion}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button onClick={() => handleViewPlan(p.id)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {plans.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No hay planes registrados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
      ) : (
        /* EDITOR VIEW */
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 mr-4">
                            {isNewPlan ? (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
                                        <Edit3 className="w-3 h-3" /> Nombre del Plan
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full text-lg font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                        value={currentPlan?.nombre || ''}
                                        onChange={(e) => setCurrentPlan(prev => prev ? {...prev, nombre: e.target.value} : null)}
                                        placeholder="Ej. Plan de Renovación 2025"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{currentPlan?.nombre}</h3>
                                    <p className="text-sm text-slate-500">Plan registrado el {currentPlan?.fecha_creacion}</p>
                                </div>
                            )}
                            <p className="text-xs text-slate-400 mt-2">Revisa la lista de equipos y ajusta la propuesta antes de guardar.</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleExportPDF} 
                                className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" 
                                title="Exportar PDF"
                            >
                                <Printer className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={handleExportExcel} 
                                className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" 
                                title="Exportar Excel"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Activo</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Edad</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Costo Est.</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {details.map(d => (
                                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{d.equipo_codigo}</div>
                                            <div className="text-xs text-slate-500">{d.equipo_marca} {d.equipo_modelo}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-[10px] font-bold">{d.equipo_antiguedad} años</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">{formatCurrency(d.valor_reposicion)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {isNewPlan && (
                                                <button onClick={() => removeDetail(d.id)} className="text-red-400 hover:text-red-600 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Panel */}
                <div className="space-y-4">
                    <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-800 opacity-50" />
                        <h4 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Presupuesto Estimado</h4>
                        <p className="text-4xl font-bold">{formatCurrency(currentPlan?.presupuesto_estimado || 0)}</p>
                        <div className="mt-4 flex items-center gap-2 text-indigo-200 text-sm">
                            <Laptop className="w-4 h-4" />
                            <span>{currentPlan?.total_equipos} equipos en el plan</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-4">Finalizar Propuesta</h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs text-slate-500">
                                <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                                <span>Periodo de ejecución sugerido: {currentPlan?.anio}.</span>
                            </div>
                            {isNewPlan ? (
                                <button 
                                    onClick={handleSavePlan}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all shadow-md"
                                >
                                    <Save className="w-5 h-5" /> Guardar Plan Anual
                                </button>
                            ) : (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium rounded-lg flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Este plan ya está vigente
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ReplacementPlanning;
