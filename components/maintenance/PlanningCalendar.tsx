
import React, { useState, useEffect } from 'react';
import { DetallePlan, EstadoPlan, PlanMantenimiento } from '../../types';
import { ChevronLeft, Save, GripVertical, CheckCircle, Clock, AlertCircle, Wrench, Download, Printer } from 'lucide-react';
import { MaintenanceExecutionModal } from './MaintenanceExecutionModal';
import { maintenancePlanningService } from '../../services/maintenancePlanningService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { generateExcelFromData } from '../../utils/excelHelper';
import { printCustomHTML } from '../../utils/documentGenerator';

interface PlanningCalendarProps {
  plan: PlanMantenimiento;
  initialDetails: DetallePlan[];
  isNew: boolean;
  onSave?: (details: DetallePlan[]) => Promise<void>;
  onBack: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const PlanningCalendar: React.FC<PlanningCalendarProps> = ({ plan, initialDetails, isNew, onSave, onBack }) => {
  const [schedule, setSchedule] = useState<Record<number, DetallePlan[]>>({});
  const [draggedItem, setDraggedItem] = useState<DetallePlan | null>(null);
  const navigate = useNavigate();
  
  // Execution Modal
  const [executionTask, setExecutionTask] = useState<DetallePlan | null>(null);

  useEffect(() => {
    // Group details by month
    const grouped: Record<number, DetallePlan[]> = {};
    MONTH_NAMES.forEach((_, idx) => grouped[idx + 1] = []);
    
    initialDetails.forEach(d => {
      if (!grouped[d.mes_programado]) grouped[d.mes_programado] = [];
      grouped[d.mes_programado].push(d);
    });
    
    setSchedule(grouped);
  }, [initialDetails]);

  // --- Drag & Drop Logic ---

  const handleDragStart = (e: React.DragEvent, item: DetallePlan) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, monthIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetMonth: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedItem.mes_programado === targetMonth) return;

    // Update Local State
    const sourceMonth = draggedItem.mes_programado;
    
    // Remove from source
    const newSourceList = schedule[sourceMonth].filter(i => i.id !== draggedItem.id);
    
    // Add to target
    const newItem = { ...draggedItem, mes_programado: targetMonth };
    const newTargetList = [...schedule[targetMonth], newItem];

    setSchedule(prev => ({
      ...prev,
      [sourceMonth]: newSourceList,
      [targetMonth]: newTargetList
    }));

    setDraggedItem(null);

    // If not new plan, update backend immediately (rescheduling)
    if (!isNew) {
      try {
        await maintenancePlanningService.updateScheduleItem(draggedItem.id, targetMonth);
      } catch (error) {
        console.error("Failed to update schedule", error);
      }
    }
  };

  // --- Export Actions ---

  const handleExportExcel = () => {
    const flatData: any[] = [];
    MONTH_NAMES.forEach((month, idx) => {
        const items = schedule[idx + 1] || [];
        items.forEach(task => {
            flatData.push({
                'Mes': month,
                'Código': task.equipo_codigo,
                'Tipo Equipo': task.equipo_tipo,
                'Modelo': task.equipo_modelo,
                'Ubicación': task.equipo_ubicacion,
                'Estado': task.estado,
                'Fecha Ejecución': task.fecha_ejecucion || '-',
                'Técnico': task.tecnico_responsable || '-'
            });
        });
    });
    generateExcelFromData(flatData, `Plan_Mantenimiento_${plan.anio}_${plan.ciudad_nombre || 'General'}`);
  };

  const handleExportPDF = () => {
    let html = `
      <style>
        @page { size: A4 landscape; margin: 1cm; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .header h1 { font-size: 18px; margin: 0; color: #0f172a; text-transform: uppercase; }
        .header p { font-size: 12px; color: #64748b; margin: 5px 0 0 0; }
        
        /* Layout de cuadrícula similar a pantalla: 6 columnas x 2 filas */
        .grid-container { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; row-gap: 15px; }
        
        .month-col { border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; overflow: hidden; break-inside: avoid; display: flex; flex-direction: column; }
        .month-header { background: #f8fafc; padding: 6px; text-align: center; font-weight: 700; border-bottom: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; color: #475569; }
        .task-list { padding: 4px; flex: 1; min-height: 40px; }
        
        /* Estilos de tarjeta replicando la UI */
        .task-card { 
            padding: 5px; 
            border: 1px solid; 
            border-radius: 4px; 
            margin-bottom: 4px; 
            font-size: 9px; 
            box-shadow: 0 1px 1px rgba(0,0,0,0.05);
        }
        
        /* Colores de Estado */
        .status-REALIZADO { background-color: #f0fdf4; border-color: #bbf7d0; opacity: 0.9; } /* bg-green-50 */
        .status-EN_PROCESO { background-color: #fffbeb; border-color: #fde68a; } /* bg-amber-50 */
        .status-PENDIENTE { background-color: #ffffff; border-color: #e2e8f0; } /* bg-white */
        .status-RETRASADO { background-color: #fef2f2; border-color: #fecaca; }
        
        .task-code { font-weight: 700; color: #334155; font-size: 9px; display: flex; justify-content: space-between; align-items: center; }
        .task-model { color: #475569; font-size: 8px; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .task-loc { color: #94a3b8; font-size: 7px; margin-top: 2px; font-style: italic; display: flex; align-items: center; gap: 2px; }
        
        .status-icon { font-size: 9px; font-weight: bold; line-height: 1; }
        .icon-ok { color: #16a34a; }
        .icon-clock { color: #94a3b8; }
        .icon-wrench { color: #d97706; }
        .icon-alert { color: #dc2626; }

        .summary { margin-top: 20px; font-size: 9px; color: #64748b; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 5px; }
      </style>
      
      <div class="header">
         <h1>${plan.nombre}</h1>
         <p>Planificación Anual ${plan.anio} - ${plan.ciudad_nombre || 'General'}</p>
      </div>
      
      <div class="grid-container">
    `;

    let totalTasks = 0;

    MONTH_NAMES.forEach((monthName, idx) => {
        const monthNum = idx + 1;
        const tasks = schedule[monthNum] || [];
        totalTasks += tasks.length;
        
        html += `
          <div class="month-col">
             <div class="month-header">${monthName} <span style="font-weight:normal; color:#94a3b8;">(${tasks.length})</span></div>
             <div class="task-list">
        `;
        
        tasks.forEach(t => {
            let statusClass = 'status-PENDIENTE';
            let iconHtml = '<span class="status-icon icon-clock">●</span>'; 
            
            if (t.estado === EstadoPlan.REALIZADO) {
                statusClass = 'status-REALIZADO';
                iconHtml = '<span class="status-icon icon-ok">✓</span>';
            } else if (t.estado === EstadoPlan.EN_PROCESO) {
                statusClass = 'status-EN_PROCESO';
                iconHtml = '<span class="status-icon icon-wrench">⚙</span>';
            } else if (t.estado === EstadoPlan.RETRASADO) {
                statusClass = 'status-RETRASADO';
                iconHtml = '<span class="status-icon icon-alert">!</span>';
            }

            html += `
              <div class="task-card ${statusClass}">
                 <div class="task-code">
                    ${t.equipo_codigo}
                    ${iconHtml}
                 </div>
                 <div class="task-model">${t.equipo_modelo}</div>
                 <div class="task-loc">📍 ${t.equipo_ubicacion}</div>
              </div>
            `;
        });
        
        html += `
             </div>
          </div>
        `;
    });

    html += `</div>
      <div class="summary">Total Equipos Programados: <strong>${totalTasks}</strong> | Generado el ${new Date().toLocaleDateString()}</div>
    `;
    
    printCustomHTML(html, `Plan Mantenimiento ${plan.anio}`);
  };

  // --- Actions ---

  const handleSavePlan = async () => {
    if (onSave) {
      // Flatten schedule back to array
      const flatDetails = Object.values(schedule).flat();
      await onSave(flatDetails);
    }
  };

  const handleTaskClick = async (task: DetallePlan) => {
    if (isNew) return; // Editing draft, no action
    
    if (task.estado === EstadoPlan.REALIZADO) {
        Swal.fire('Mantenimiento Realizado', 'Esta tarea ya ha sido completada.', 'success');
        return;
    }
    
    if (task.estado === EstadoPlan.EN_PROCESO) {
         Swal.fire('En Proceso', 'Este equipo ya se encuentra en el taller.', 'info');
         return;
    }

    const result = await Swal.fire({
        title: 'Iniciar Mantenimiento',
        text: `¿Desea enviar el equipo ${task.equipo_codigo} a mantenimiento? Se marcará como "En Proceso".`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, enviar a taller',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await maintenancePlanningService.sendToMaintenance(task.id, "Mantenimiento Programado");
            
            // Update local state to show 'EN_PROCESO'
            setSchedule(prev => {
                const monthList = prev[task.mes_programado];
                const updatedList = monthList.map(t => 
                    t.id === task.id ? { ...t, estado: EstadoPlan.EN_PROCESO } : t
                );
                return { ...prev, [task.mes_programado]: updatedList };
            });

            const navResult = await Swal.fire({
                title: 'Enviado',
                text: 'El equipo ha sido enviado a la cola de mantenimiento. ¿Desea ir a la gestión de mantenimientos ahora?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Ir a Mantenimientos',
                cancelButtonText: 'Permanecer aquí'
            });

            if (navResult.isConfirmed) {
                navigate('/mantenimiento');
            }

        } catch (e: any) {
            Swal.fire('Error', e.message, 'error');
        }
    }
  };

  const refreshTask = async () => {
    // In a real app, fetch just the task or whole plan.
    // Here we'll just toggle state locally for the mock
    if (executionTask) {
       setSchedule(prev => {
         const monthList = prev[executionTask.mes_programado];
         const updatedList = monthList.map(t => 
             t.id === executionTask.id ? { ...t, estado: EstadoPlan.REALIZADO } : t
         );
         return { ...prev, [executionTask.mes_programado]: updatedList };
       });
    }
  };

  // --- Render Helpers ---

  const getStatusIcon = (status: EstadoPlan) => {
      switch(status) {
          case EstadoPlan.REALIZADO: return <CheckCircle className="w-4 h-4 text-green-600" />;
          case EstadoPlan.EN_PROCESO: return <Wrench className="w-4 h-4 text-amber-500 animate-pulse" />;
          case EstadoPlan.PENDIENTE: return <Clock className="w-4 h-4 text-slate-400" />;
          case EstadoPlan.RETRASADO: return <AlertCircle className="w-4 h-4 text-red-500" />;
          default: return null;
      }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">{plan.nombre}</h2>
             <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{isNew ? 'Borrador' : plan.estado}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                title="Exportar listado a Excel"
            >
                <Download className="w-4 h-4" /> Excel
            </button>
            <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                title="Imprimir vista de calendario"
            >
                <Printer className="w-4 h-4" /> PDF
            </button>
            {isNew && (
                <button 
                    onClick={handleSavePlan}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Save className="w-4 h-4" /> Guardar Plan
                </button>
            )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-x-auto border border-slate-200 dark:border-slate-700 custom-scrollbar">
         <div className="min-w-[1200px] h-full grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 divide-x divide-slate-200 dark:divide-slate-700">
            {MONTH_NAMES.map((monthName, idx) => {
                const monthIndex = idx + 1;
                const items = schedule[monthIndex] || [];
                
                return (
                    <div 
                        key={monthIndex} 
                        className="flex flex-col h-full min-h-[500px] bg-white dark:bg-slate-800"
                        onDragOver={(e) => handleDragOver(e, monthIndex)}
                        onDrop={(e) => handleDrop(e, monthIndex)}
                    >
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-center font-bold text-slate-700 dark:text-slate-200 text-sm uppercase sticky top-0 z-10">
                            {monthName} <span className="text-xs text-slate-400 font-normal ml-1">({items.length})</span>
                        </div>
                        <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
                            {items.map(task => (
                                <div 
                                    key={task.id}
                                    draggable={task.estado === EstadoPlan.PENDIENTE}
                                    onDragStart={(e) => handleDragStart(e, task)}
                                    onClick={() => handleTaskClick(task)}
                                    className={`
                                        p-2 rounded border text-xs shadow-sm cursor-pointer hover:shadow-md transition-all relative group
                                        ${task.estado === EstadoPlan.REALIZADO ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-75' : ''}
                                        ${task.estado === EstadoPlan.EN_PROCESO ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 ring-1 ring-amber-300 dark:ring-amber-700' : ''}
                                        ${task.estado === EstadoPlan.PENDIENTE ? 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200' : ''}
                                        ${task.estado === EstadoPlan.RETRASADO ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{task.equipo_codigo}</span>
                                        {getStatusIcon(task.estado)}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 truncate mb-1">{task.equipo_modelo}</p>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                        {task.equipo_ubicacion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
         </div>
      </div>

      <MaintenanceExecutionModal 
        isOpen={!!executionTask}
        onClose={() => setExecutionTask(null)}
        task={executionTask}
        onSuccess={refreshTask}
      />
    </div>
  );
};
