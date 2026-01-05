
import React, { useState } from 'react';
import { PlanningConfig } from './PlanningConfig';
import { PlanningCalendar } from './PlanningCalendar';
import { PlanMantenimiento, DetallePlan } from '../../types';
import { maintenancePlanningService } from '../../services/maintenancePlanningService';
import { api } from '../../services/mockApi';
import Swal from 'sweetalert2';

const MaintenancePlanning: React.FC = () => {
  const [view, setView] = useState<'CONFIG' | 'CALENDAR'>('CONFIG');
  const [currentPlan, setCurrentPlan] = useState<PlanMantenimiento | null>(null);
  const [planDetails, setPlanDetails] = useState<DetallePlan[]>([]);
  const [isNewPlan, setIsNewPlan] = useState(false);

  const handleGeneratePlan = async (year: number, cityId: number, cityName: string, detalles?: DetallePlan[]) => {
    try {
        // If details were provided by the PlanningConfig (backend proposal), use them directly
        if (detalles && detalles.length > 0) {
            const header: PlanMantenimiento = {
                id: Date.now(),
                anio: year,
                nombre: `Plan Maestro ${year} - ${cityName}`,
                creado_por: '',
                fecha_creacion: new Date().toISOString(),
                estado: 'ACTIVO',
                ciudad_id: cityId,
                ciudad_nombre: cityName
            };
            // Ensure each detalle in a new (draft) plan has a unique temporary id
            const base = Date.now();
            const detallesWithUniqueIds = detalles.map((d, idx) => ({ ...d, id: (d.id ?? (base + idx)) }));
            setCurrentPlan(header);
            setPlanDetails(detallesWithUniqueIds);
            setIsNewPlan(true);
            setView('CALENDAR');
            return;
        }

        // Fallback: previous local-generation behavior (keeps offline/mock flow)
        const [allEquipos, departamentos] = await Promise.all([
          api.getEquipos(),
          api.getDepartamentos()
        ]);
        
        // 2. Filter Equipment by City
        // First, find which departments belong to the selected city
        const departamentosEnCiudad = departamentos.filter(d => d.ciudad_id === cityId);
        // Map departamentos a ubicaciones (preferir bodega_ubicacion_id si existe)
        const cityUbicacionIds = departamentosEnCiudad
            .map(d => (d.bodega_ubicacion_id !== undefined && d.bodega_ubicacion_id !== null) ? d.bodega_ubicacion_id : d.id)
            .filter(Boolean);

        if (cityUbicacionIds.length === 0) {
            Swal.fire('Atención', `No hay departamentos registrados en ${cityName}.`, 'warning');
            return;
        }

        // Then filter equipment that are located in those ubicaciones (ubicacion_id)
        const filteredEquipos = allEquipos.filter(e => {
            const isActive = e.estado !== 'Baja' && e.estado !== 'Para Baja';
            const isInCity = cityUbicacionIds.includes(e.ubicacion_id);
            return isActive && isInCity;
        });

        if (filteredEquipos.length === 0) {
            Swal.fire('Sin Equipos', `No se encontraron equipos activos en ${cityName} para generar un plan.`, 'info');
            return;
        }

        // 3. Generate Plan
        const generated = await maintenancePlanningService.generatePlan(year, filteredEquipos, cityId, cityName);

        // Generated details from algorithm may reuse ids; ensure temporary unique ids for draft
        const baseGen = Date.now();
        const genDetailsUnique = generated.details.map((d, idx) => ({ ...d, id: (d.id ?? (baseGen + idx)) }));

        setCurrentPlan(generated.header);
        setPlanDetails(genDetailsUnique);
        setIsNewPlan(true);
        setView('CALENDAR');
    } catch (e: any) {
        Swal.fire('Error', e.message, 'error');
    }
  };

  const handleViewPlan = async (planId: number) => {
      try {
          const { plan, details } = await maintenancePlanningService.getPlanDetails(planId);
          setCurrentPlan(plan);
          setPlanDetails(details);
          setIsNewPlan(false);
          setView('CALENDAR');
      } catch (e: any) {
          Swal.fire('Error', 'No se pudo cargar el plan', 'error');
      }
  };

  const handleSavePlan = async (details: DetallePlan[]) => {
      if (!currentPlan) return;

      const result = await Swal.fire({
          title: '¿Guardar Plan?',
          text: `Se registrará el plan "${currentPlan.nombre}" con ${details.length} tareas programadas.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#2563eb',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Sí, guardar plan',
          cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
          try {
              await maintenancePlanningService.savePlan(currentPlan, details);
              Swal.fire('Éxito', 'Plan guardado correctamente', 'success');
              setView('CONFIG'); // Go back to list
          } catch (e: any) {
              Swal.fire('Error', 'Error al guardar el plan', 'error');
          }
      }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
       {view === 'CONFIG' && (
           <div className="flex-1 overflow-auto">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Planificación de Mantenimiento</h2>
                <PlanningConfig 
                    onGenerate={handleGeneratePlan}
                    onViewPlan={handleViewPlan}
                />
           </div>
       )}

       {view === 'CALENDAR' && currentPlan && (
           <PlanningCalendar 
              plan={currentPlan}
              initialDetails={planDetails}
              isNew={isNewPlan}
              onSave={handleSavePlan}
              onBack={() => setView('CONFIG')}
           />
       )}
    </div>
  );
};

export default MaintenancePlanning;
