
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
        headers = [
          'Codigo Activo', 
          'Serie', 
          'Marca', 
          'Modelo', 
          'Tipo Equipo', 
          'Fecha Compra', 
          'Valor',
          'Procesador',
          'RAM',
          'Capacidad Disco',
          'Tipo Disco',
          'Sistema Operativo'
        ];
        filename = 'plantilla_equipos_tecnica';
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
        try {
            const equipos = await api.getEquipos();
            const aptosParaAsignar = equipos.filter(e => 
                e.estado === EstadoEquipo.DISPONIBLE || 
                e.estado === EstadoEquipo.ACTIVO
            );
            
            if (aptosParaAsignar.length === 0) {
                headers = ['Codigo Activo', 'Modelo (Referencia)', 'Correo Usuario', 'Fecha Asignacion', 'Ubicacion Fisica', 'Observaciones'];
                filename = 'plantilla_asignaciones';
                break; 
            }

            aptosParaAsignar.sort((a, b) => {
                if (a.estado === EstadoEquipo.DISPONIBLE && b.estado !== EstadoEquipo.DISPONIBLE) return -1;
                if (a.estado !== EstadoEquipo.DISPONIBLE && b.estado === EstadoEquipo.DISPONIBLE) return 1;
                return 0;
            });

            const data = aptosParaAsignar.map(e => ({
                'Codigo Activo': e.codigo_activo,
                'Estado Actual': e.estado,
                'Modelo (Referencia)': `${e.tipo_nombre} - ${e.marca} ${e.modelo}`,
                'Usuario Actual (Ref)': e.responsable_nombre || 'Ninguno',
                'Correo Usuario': '',
                'Fecha Asignacion': new Date().toISOString().split('T')[0],
                'Ubicacion Fisica': '',
                'Observaciones': ''
            }));

            generateExcelFromData(data, 'plantilla_asignaciones_inventario');
            return;
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
    const rawData = await parseExcel(file);
    
    if (rawData.length === 0) {
      throw new Error("El archivo está vacío o tiene un formato incorrecto.");
    }

    // Mapeo de datos para EQUIPOS (Excel Headers -> Model Properties)
    let processedData = rawData;
    if (type === 'EQUIPOS') {
        processedData = rawData.map(row => ({
            codigo_activo: row['Codigo Activo'],
            numero_serie: row['Serie'],
            marca: row['Marca'],
            modelo: row['Modelo'],
            tipo_equipo: row['Tipo Equipo'],
            fecha_compra: row['Fecha Compra'],
            valor_compra: row['Valor'],
            procesador: row['Procesador'],
            ram: row['RAM'],
            disco_capacidad: row['Capacidad Disco'],
            disco_tipo: row['Tipo Disco'] || 'SSD',
            sistema_operativo: row['Sistema Operativo']
        }));
    }

    const processResponse = (res: any) => {
        if (res && typeof res === 'object' && 'count' in res) {
            return res.count;
        }
        return res;
    };

    switch (type) {
      case 'EQUIPOS':
        return processResponse(await api.bulkCreateEquipos(processedData));
      case 'USUARIOS':
        return processResponse(await api.bulkCreateUsuarios(rawData));
      case 'LICENCIAS':
        return processResponse(await api.bulkCreateLicencias(rawData));
      case 'DEPARTAMENTOS':
        return processResponse(await api.bulkCreateDepartamentos(rawData));
      case 'PUESTOS':
        return processResponse(await api.bulkCreatePuestos(rawData));
      case 'ASIGNACIONES':
        return processResponse(await api.bulkCreateAsignaciones(rawData));
      default:
        throw new Error("Tipo de migración no soportado");
    }
  }
};
