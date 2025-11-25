
import { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { EstadoEquipo, ReporteGarantia } from '../types';

export interface LicenseSummary {
  name: string;
  total: number;
  available: number;
  assigned: number;
}

export interface TypeGroupStats {
  total: Record<string, number>;
  assigned: Record<string, number>;
  maintenance: Record<string, number>;
  warranty: Record<string, number>;
  available: Record<string, number>;
  pre_baja: Record<string, number>;
  grandTotals: {
    total: number;
    assigned: number;
    maintenance: number;
    warranty: number;
    available: number;
    pre_baja: number;
  }
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [warrantyData, setWarrantyData] = useState<ReporteGarantia[]>([]);
  const [licenseStats, setLicenseStats] = useState<LicenseSummary[]>([]);
  const [equipmentBreakdown, setEquipmentBreakdown] = useState<Record<string, Record<string, number>>>({});
  
  const [groupedStats, setGroupedStats] = useState<TypeGroupStats>({
    total: {},
    assigned: {},
    maintenance: {},
    warranty: {},
    available: {},
    pre_baja: {},
    grandTotals: { total: 0, assigned: 0, maintenance: 0, warranty: 0, available: 0, pre_baja: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warranties, licencias, equiposData] = await Promise.all([
          api.getWarrantyReport(),
          api.getLicencias(),
          api.getEquipos()
        ]);
        
        setWarrantyData(warranties);
        
        // --- 1. Calcular Agrupaciones por Tipo para las Tarjetas (Excluyendo BAJA) ---
        const gStats: TypeGroupStats = {
            total: {},
            assigned: {},
            maintenance: {},
            warranty: {},
            available: {},
            pre_baja: {},
            grandTotals: { total: 0, assigned: 0, maintenance: 0, warranty: 0, available: 0, pre_baja: 0 }
        };

        // Procesar Equipos
        equiposData.forEach(e => {
            // FILTRO GLOBAL: Ignorar equipos dados de baja
            if (e.estado === EstadoEquipo.BAJA) return;

            const tipo = e.tipo_nombre || 'Otros';
            
            // Total General (Sin bajas)
            gStats.total[tipo] = (gStats.total[tipo] || 0) + 1;
            gStats.grandTotals.total++;

            // Clasificación por estado
            if (e.estado === EstadoEquipo.ACTIVO) {
                gStats.assigned[tipo] = (gStats.assigned[tipo] || 0) + 1;
                gStats.grandTotals.assigned++;
            } else if (e.estado === EstadoEquipo.EN_MANTENIMIENTO) {
                gStats.maintenance[tipo] = (gStats.maintenance[tipo] || 0) + 1;
                gStats.grandTotals.maintenance++;
            } else if (e.estado === EstadoEquipo.DISPONIBLE) {
                gStats.available[tipo] = (gStats.available[tipo] || 0) + 1;
                gStats.grandTotals.available++;
            } else if (e.estado === EstadoEquipo.PARA_BAJA) {
                gStats.pre_baja[tipo] = (gStats.pre_baja[tipo] || 0) + 1;
                gStats.grandTotals.pre_baja++;
            }
        });

        // Procesar Garantías
        warranties.forEach(w => {
            if (w.equipo.estado === EstadoEquipo.BAJA) return; // Ignorar garantías de equipos dados de baja
            const tipo = w.equipo.tipo_nombre || 'Otros';
            gStats.warranty[tipo] = (gStats.warranty[tipo] || 0) + 1;
            gStats.grandTotals.warranty++;
        });

        setGroupedStats(gStats);

        // --- 2. Calcular Licencias Agrupadas ---
        const summaryMap: Record<string, LicenseSummary> = {};
        licencias.forEach(l => {
          if (!summaryMap[l.tipo_nombre]) {
            summaryMap[l.tipo_nombre] = { name: l.tipo_nombre, total: 0, available: 0, assigned: 0 };
          }
          summaryMap[l.tipo_nombre].total++;
          if (l.usuario_id) {
            summaryMap[l.tipo_nombre].assigned++;
          } else {
            summaryMap[l.tipo_nombre].available++;
          }
        });
        setLicenseStats(Object.values(summaryMap));

        // --- 3. Calcular Breakdown para Gráficos y Lista Detallada (Excluyendo BAJA) ---
        const eqMap: Record<string, Record<string, number>> = {};
        equiposData.forEach(e => {
            if (e.estado === EstadoEquipo.BAJA) return; // Ignorar bajas

            const t = e.tipo_nombre || 'Otros';
            const s = e.estado;
            if(!eqMap[t]) eqMap[t] = {};
            if(!eqMap[t][s]) eqMap[t][s] = 0;
            eqMap[t][s]++;
        });
        setEquipmentBreakdown(eqMap);

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return {
    loading,
    groupedStats,
    warrantyData,
    licenseStats,
    equipmentBreakdown
  };
};
