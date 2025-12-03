
import React from 'react';
import { Database, Users, Laptop, Key, Building2, Briefcase, UserCheck } from 'lucide-react';
import { MigrationCard } from './MigrationCard';

const MigrationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <Database className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Módulo de Migración</h2>
          <p className="text-slate-500 dark:text-slate-400">Carga masiva de datos desde plantillas Excel/CSV.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MigrationCard 
          title="Carga de Equipos"
          description="Importar inventario inicial o lotes de nuevos activos."
          type="EQUIPOS"
          icon={<Laptop className="w-6 h-6" />}
        />
        
        <MigrationCard 
          title="Carga de Usuarios"
          description="Importar listado de empleados y usuarios del sistema."
          type="USUARIOS"
          icon={<Users className="w-6 h-6" />}
        />

        <MigrationCard 
          title="Carga de Licencias"
          description="Subir stock de licencias de software por tipo y clave."
          type="LICENCIAS"
          icon={<Key className="w-6 h-6" />}
        />

        <MigrationCard 
          title="Departamentos / Sedes"
          description="Estructura organizacional y bodegas físicas."
          type="DEPARTAMENTOS"
          icon={<Building2 className="w-6 h-6" />}
        />

        <MigrationCard 
          title="Cargos / Puestos"
          description="Catálogo de puestos de trabajo de la empresa."
          type="PUESTOS"
          icon={<Briefcase className="w-6 h-6" />}
        />

        <MigrationCard 
          title="Asignaciones Masivas"
          description="Vincular equipos a usuarios existentes por lote."
          type="ASIGNACIONES"
          icon={<UserCheck className="w-6 h-6" />}
        />
      </div>
    </div>
  );
};

export default MigrationPage;
