
import { api } from './mockApi';
import { generateExcelTemplate, generateExcelFromData, parseExcel } from '../utils/excelHelper';
import { EstadoEquipo } from '../types';

type MigrationType = 'EQUIPOS' | 'USUARIOS' | 'LICENCIAS' | 'DEPARTAMENTOS' | 'PUESTOS' | 'ASIGNACIONES';

export const migrationService = {
  
  downloadTemplate: async (type: MigrationType) => {
    let headers: string[] = [];
    let filename = '';

    switch (type) {
      case 'EQUIPOS':
        headers = ['Codigo Activo', 'Serie', 'Marca', 'Modelo', 'Tipo Equipo', 'Fecha Compra', 'Valor'];
        filename = 'plantilla_equipos';
        break;
      case 'USUARIOS':
        headers = ['Nombres', 'Apellidos', 'Usuario', 'Email', 'Numero Empleado', 'Rol'];
        filename = 'plantilla_usuarios';
        break;
      case 'LICENCIAS':
        headers = ['Tipo Software', 'Proveedor', 'Clave', 'Fecha Compra', 'Fecha Vencimiento'];
        filename = 'plantilla_licencias';
        break;
      case 'DEPARTAMENTOS':
        headers = ['Nombre Departamento', 'Ciudad', 'Es Bodega (SI/NO)'];
        filename = 'plantilla_departamentos';
        break;
      case 'PUESTOS':
        headers = ['Nombre Cargo'];
        filename = 'plantilla_puestos';
        break;
      case 'ASIGNACIONES':
        // Lógica especial: Pre-llenar con códigos de equipos existentes
        try {
            const equipos = await api.getEquipos();
            
            // Filtramos equipos aptos para asignar (Disponibles) o re-asignar (Activos)
            // Excluimos Bajas, Para Baja y En Mantenimiento
            const aptosParaAsignar = equipos.filter(e => 
                e.estado === EstadoEquipo.DISPONIBLE || 
                e.estado === EstadoEquipo.ACTIVO
            );
            
            if (aptosParaAsignar.length === 0) {
                // Si no hay equipos, plantilla vacía
                headers = ['Codigo Activo', 'Modelo (Referencia)', 'Correo Usuario', 'Fecha Asignacion', 'Ubicacion Fisica', 'Observaciones'];
                filename = 'plantilla_asignaciones';
                break; 
            }

            // Ordenar: Primero Disponibles, luego Activos
            aptosParaAsignar.sort((a, b) => {
                if (a.estado === EstadoEquipo.DISPONIBLE && b.estado !== EstadoEquipo.DISPONIBLE) return -1;
                if (a.estado !== EstadoEquipo.DISPONIBLE && b.estado === EstadoEquipo.DISPONIBLE) return 1;
                return 0;
            });

            const data = aptosParaAsignar.map(e => ({
                'Codigo Activo': e.codigo_activo,
                'Estado Actual': e.estado, // Columna informativa
                'Modelo (Referencia)': `${e.tipo_nombre} - ${e.marca} ${e.modelo}`,
                'Usuario Actual (Ref)': e.responsable_nombre || 'Ninguno',
                'Correo Usuario': '', // Campo a llenar para asignar/reasignar
                'Fecha Asignacion': new Date().toISOString().split('T')[0],
                'Ubicacion Fisica': '',
                'Observaciones': ''
            }));

            // Usar generador de Excel con datos
            generateExcelFromData(data, 'plantilla_asignaciones_inventario');
            return; // Salir, ya se descargó
        } catch (e) {
            console.error(e);
            headers = ['Codigo Activo', 'Correo Usuario', 'Fecha Asignacion', 'Ubicacion Fisica', 'Observaciones'];
            filename = 'plantilla_asignaciones_error';
        }
        break;
    }

    if (headers.length > 0) {
      generateExcelTemplate(headers, filename);
    }
  },

  uploadData: async (type: MigrationType, file: File) => {
    // Usar parser de Excel
    const data = await parseExcel(file);
    
    if (data.length === 0) {
      throw new Error("El archivo está vacío o tiene un formato incorrecto.");
    }

    // Helper to process response regardless of API version (mock returns number, live returns object)
    const processResponse = (res: any) => {
        if (res && typeof res === 'object' && 'count' in res) {
            return res.count;
        }
        return res;
    };

    switch (type) {
      case 'EQUIPOS':
        return processResponse(await api.bulkCreateEquipos(data));
      case 'USUARIOS':
        return processResponse(await api.bulkCreateUsuarios(data));
      case 'LICENCIAS':
        return processResponse(await api.bulkCreateLicencias(data));
      case 'DEPARTAMENTOS':
        return processResponse(await api.bulkCreateDepartamentos(data));
      case 'PUESTOS':
        return processResponse(await api.bulkCreatePuestos(data));
      case 'ASIGNACIONES':
        return processResponse(await api.bulkCreateAsignaciones(data));
      default:
        throw new Error("Tipo de migración no soportado");
    }
  }
};
