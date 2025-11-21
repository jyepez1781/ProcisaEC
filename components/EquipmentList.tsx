
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { Equipo, EstadoEquipo, TipoEquipo, Usuario, Departamento } from '../types';
import { Search, Filter, Plus, MoreVertical, Edit, UserCheck, RotateCcw, Trash2, X, Save, Wrench, Archive } from 'lucide-react';

type ModalAction = 'CREATE' | 'EDIT' | 'ASSIGN' | 'RETURN' | 'BAJA' | 'TO_MAINTENANCE' | 'MARK_DISPOSAL' | null;

const EquipmentList: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [filteredEquipos, setFilteredEquipos] = useState<Equipo[]>([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Catalogs for forms
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [bodegas, setBodegas] = useState<Departamento[]>([]);

  // Modal State
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Menu Dropdown State
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [eqData, tipoData, userData, deptData] = await Promise.all([
      api.getEquipos(),
      api.getTiposEquipo(),
      api.getUsuarios(),
      api.getDepartamentos()
    ]);
    setEquipos(eqData);
    setTipos(tipoData);
    setUsuarios(userData);
    setBodegas(deptData.filter(d => d.es_bodega));
    setFilteredEquipos(eqData);
  };

  useEffect(() => {
    let res = equipos;
    
    if (filterText) {
      res = res.filter(e => 
        e.codigo_activo.toLowerCase().includes(filterText.toLowerCase()) ||
        e.modelo.toLowerCase().includes(filterText.toLowerCase()) ||
        e.numero_serie.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      res = res.filter(e => e.estado === statusFilter);
    }

    setFilteredEquipos(res);
  }, [filterText, statusFilter, equipos]);

  const getStatusColor = (estado: EstadoEquipo) => {
    switch (estado) {
      case EstadoEquipo.ACTIVO: return 'bg-green-100 text-green-800';
      case EstadoEquipo.DISPONIBLE: return 'bg-blue-100 text-blue-800';
      case EstadoEquipo.EN_MANTENIMIENTO: return 'bg-amber-100 text-amber-800';
      case EstadoEquipo.BAJA: return 'bg-red-100 text-red-800';
      case EstadoEquipo.PARA_BAJA: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  // Document Generation Logic
  const generateAssignmentDocument = (usuario: Usuario, equipo: Equipo) => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Por favor permita ventanas emergentes para ver el reporte.');
      return;
    }

    const today = new Date();
    const fechaAsignacion = `${today.getDate()} de ${today.toLocaleString('es-ES', { month: 'long' })} del ${today.getFullYear()}`;
    const fechaCorta = today.toLocaleDateString('es-ES'); // DD/MM/YYYY

    // Variables for logic
    const serieCargador = equipo.serie_cargador || 'N/A';
    const observacionesEquipo = equipo.observaciones || 'Sin observaciones';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Documentos de Asignación</title>
          <style>
            @page { size: A4 portrait; margin: 1.5cm; }
            body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.3; color: #000; margin: 0; }
            
            /* General Helper Classes */
            .page-break { page-break-after: always; }
            .text-center { text-align: center; }
            .text-justify { text-align: justify; }
            .text-bold { font-weight: bold; }
            .mb-2 { margin-bottom: 10px; }
            .mb-4 { margin-bottom: 20px; }
            .mt-4 { margin-top: 20px; }
            
            /* --- ANEXO 1 STYLES --- */
            .anexo-container { padding: 10px; }
            .anexo-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
            .logo-img { max-height: 60px; width: auto; } 
            .anexo-label { font-weight: bold; font-size: 10pt; margin-top: 10px; text-align: right;}
            .anexo-title { text-align: center; font-weight: bold; text-decoration: underline; margin: 20px 0; font-size: 11pt; text-transform: uppercase; }
            .anexo-footer { margin-top: 60px; }
            .signature-line { border-top: 1px solid #000; width: 250px; padding-top: 5px; font-weight: bold; margin-bottom: 5px;}

            /* --- CARTA RESPONSIVA STYLES --- */
            .responsiva-container { padding: 10px; }
            
            /* Header Table */
            table.header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            table.header-table td { border: 1px solid #000; padding: 5px; text-align: center; vertical-align: middle; }
            .header-logo-cell { width: 20%; }
            .header-title-cell { width: 50%; font-weight: bold; font-size: 11pt; }
            .header-info-cell { width: 30%; font-size: 9pt; text-align: left; }

            /* Equipment Table */
            table.eq-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9pt; }
            table.eq-table th { border: 1px solid #000; background-color: #f0f0f0; padding: 5px; font-weight: bold; text-align: center; }
            table.eq-table td { border: 1px solid #000; padding: 5px; text-align: center; vertical-align: top; }

            .responsiva-section-title { font-weight: bold; margin-top: 10px; margin-bottom: 5px; }
            ul.responsiva-list { padding-left: 20px; margin: 5px 0 15px 0; }
            ul.responsiva-list li { margin-bottom: 4px; text-align: justify; }

            .footer-note { font-size: 8pt; text-align: center; margin-top: 40px; font-style: italic; }
          </style>
        </head>
        <body>
          
          <!-- ================= PAGE 1: CARTA RESPONSIVA ================= -->
          <div class="responsiva-container">
            
            <!-- Header Table -->
            <table class="header-table">
              <tr>
                <td class="header-logo-cell">
                   <img src="/logoAnexoCarso.png" style="max-width:100px; max-height:50px;" alt="Logo" />
                </td>
                <td class="header-title-cell">
                  SISTEMA DE GESTIÓN<br>
                  PROCISA ECUADOR S.A<br><br>
                  <span style="font-weight:normal; font-size:10pt;">FORMATO PARA CARTA RESPONSIVA DE EQUIPO</span>
                </td>
                <td class="header-info-cell">
                  <strong>Código:</strong> FR-SI-12<br>
                  <strong>Fecha de Emisión:</strong> ${fechaCorta}<br>
                  <strong>Página 1 de 1</strong>
                </td>
              </tr>
            </table>

            <p class="text-justify mb-4" style="font-size: 9pt;">
              Recibí el siguiente equipo de cómputo propiedad de PROCISA ECUADOR S.A. para su uso durante la jornada laboral y actividades competentes a mi trabajo, dentro y fuera de las instalaciones de la empresa.
            </p>

            <!-- Equipment Details Table -->
            <table class="eq-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Descripción</th>
                  <th>No. De Serie</th>
                  <th>Cargador</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${equipo.tipo_nombre}</td>
                  <td>
                    ${equipo.marca} ${equipo.modelo}<br>
                    <span style="font-size:8pt; color:#333;">${observacionesEquipo}</span>
                  </td>
                  <td>${equipo.numero_serie}</td>
                  <td>${serieCargador}</td>
                </tr>
              </tbody>
            </table>

            <div class="mb-4" style="font-size: 9pt;">
              Con la presente el usuario: <strong>${usuario.nombre_completo}</strong> con No. de empleado: <strong>${usuario.numero_empleado || 'S/N'}</strong><br>
              Perteneciente al área de: <strong>${usuario.departamento_nombre || 'General'}</strong> se responsabiliza de su correcto uso y cuidado. Además de aplicar las siguientes recomendaciones:
            </div>

            <div class="responsiva-section-title">Para equipos de cómputo</div>
            <ul class="responsiva-list">
              <li>Cuidar el uso del equipo en lugares públicos, bloqueando la sesión cuando esté desatendido.</li>
              <li>Antes de ingresar a un dispositivo de almacenamiento deberá ser analizado por el antivirus, el cual en ningún caso se podrá desactivar.</li>
              <li>Se deberá utilizar ONEDRIVE para respaldar la información.</li>
              <li>Se deberá minimizar la conexión en redes públicas o inseguras.</li>
              <li>El equipo conferido debe ser cuidado de cualquier daño físico, lógico y/o extravío.</li>
              <li>Está prohibida la instalación de cualquier software gratuito o de origen desconocido.</li>
              <li>La información que sea procesada en el equipo deberá estar exclusivamente relacionada con las actividades conferidas y podrá ser sujeta de auditoría en cualquier momento.</li>
              <li>Será necesario que el mantenimiento del equipo sea solicitado al área de Tecnología.</li>
            </ul>

            <div class="responsiva-section-title">Otros activos</div>
            <ul class="responsiva-list">
              <li>Cuidar el uso del activo en lugares públicos.</li>
              <li>El activo conferido debe ser cuidado de cualquier daño físico, lógico y/o extravío.</li>
              <li>En el caso de activos que procesen o almacenen información deberá estar exclusivamente relacionada con las actividades conferidas y podrá ser sujeta de auditoría en cualquier momento.</li>
            </ul>

            <div class="anexo-footer">
               <div style="border-top: 1px solid #000; width: 250px; padding-top: 5px; margin-top:40px;"></div>
               <div class="text-bold">${usuario.nombre_completo}</div>
               <div>${usuario.departamento_nombre || ''}</div>
            </div>

            <div class="footer-note">
              COPIA NO CONTROLADA UNA VEZ IMPRESA
            </div>

          </div>

          <div class="page-break"></div>

          <!-- ================= PAGE 2: ANEXO 1 ================= -->
          <div class="anexo-container">
            <div class="anexo-header">
              <img src="/logoAnexoCarso.png" class="logo-img" alt="Logo" onerror="this.style.display='none'; document.body.insertAdjacentHTML('afterbegin', '<p style=\'color:red\'>Error: logoAnexoCarso.png no encontrado</p>');" />
              <div class="anexo-label">Anexo 1</div>
            </div>

            <div class="anexo-title">
              CARTA DE NO INCLUSION DE SOFTWARE<br>
              DECLARACION DEL EMPLEADO
            </div>

            <div class="mb-4">
              Guayaquil., ${fechaAsignacion}
            </div>

            <div class="mb-4 text-bold">
              Sr./ Sra./ Srita.: ${usuario.nombre_completo}
            </div>

            <div class="text-justify">
              <p>PRESENTE.</p>
              <p>Con motivo de los conocimientos de que usted dispone en materia de uso de equipo y programas de cómputo y en virtud de que esta empresa posee su propio equipo y frecuentemente adquiere ó desarrolla programas y material diverso de cómputo, a los cuales usted tiene ó puede llegar a tener acceso en el desempeño de sus funciones dentro de la empresa, hacemos de su conocimiento lo siguiente:</p>
              <p>1. Las leyes de la materia y los tratados internacionales prohíben el uso de los programas de cómputo y de cualquier información al respecto, sin el consentimiento de su legítimo propietario ó licenciatario.</p>
              <p>2. Lo anterior implica que usted deberá utilizar única y exclusivamente los equipos y programas de cómputo que la empresa proporcione para el desempeño de sus funciones dentro de la misma empresa.</p>
              <p>3. En consecuencia, deberá usted abstenerse de utilizar y/o ingresar a las instalaciones y/o equipo de cómputo de la empresa programas de cómputo propiedad de terceros que no hayan sido adquiridos por la empresa, así como copiar al equipo de cómputo de la Empresa, archivos no utilizables en el desempeño de sus funciones, por ejemplo: protectores de pantalla, mp3, videojuegos, fotografías, etc.</p>
              <p>4. Asimismo, deberá usted abstenerse de copiar y sustraer cualquier programa adquirido ó desarrollado por la empresa, ya que estos son propiedad exclusiva de la misma.</p>
              <p>5.- Deberá mantener estricta confidencialidad de la información de la Empresa que en el desempeño de sus funciones conozca y en ningún caso y bajo ningún concepto podrá usted divulgarla.</p>
              <p>6. Igualmente, le está prohibido permitir que terceras personas realicen las conductas anteriores ó tengan acceso, de cualquier manera, al equipo de programas de propiedad de la empresa.</p>
              <p>7. La contravención de estas disposiciones será causa de rescisión al contrato de trabajo celebrado entre la empresa y usted, sin que tal medida le exonere de la responsabilidad personal en que llegará a incurrir de acuerdo con las leyes y tratados internacionales aplicables.</p>
            </div>

            <div class="anexo-footer">
              <div class="signature-line">Nombre y Firma de Conformidad</div>
              <div>${usuario.nombre_completo}</div>
              <div>${usuario.departamento_nombre || 'Departamento no asignado'}</div>
            </div>
          </div>

          <script>
             window.onload = function() { setTimeout(function(){ window.print(); }, 800); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Action Handlers
  const openModal = (action: ModalAction, equipo: Equipo | null = null) => {
    // Validation: Strict check for Assignment
    if (action === 'ASSIGN' && equipo) {
      // Allow assignment if Available OR Pre-Disposal (Para Baja)
      if (equipo.estado !== EstadoEquipo.DISPONIBLE && equipo.estado !== EstadoEquipo.PARA_BAJA) {
        alert("Solo se pueden asignar equipos que se encuentren en estado 'Disponible' o 'Para Baja'.");
        return;
      }
    }

    setModalAction(action);
    setSelectedEquipo(equipo);
    setOpenMenuId(null); // Close menu if open

    // Init form data
    if (action === 'CREATE') {
      setFormData({
        codigo_activo: '', numero_serie: '', marca: '', modelo: '', 
        tipo_equipo_id: tipos[0]?.id || '', serie_cargador: '', 
        fecha_compra: new Date().toISOString().split('T')[0], 
        valor_compra: 0, anos_garantia: 1, estado: EstadoEquipo.DISPONIBLE, observaciones: '',
        ubicacion_id: bodegas.length > 0 ? bodegas[0].id : ''
      });
    } else if (action === 'EDIT' && equipo) {
      setFormData({ ...equipo });
    } else if (action === 'ASSIGN') {
      setFormData({ usuario_id: usuarios[0]?.id || '', ubicacion: '', observaciones: '' });
    } else if (action === 'RETURN' || action === 'MARK_DISPOSAL') {
      // Initialize with first warehouse if available
      setFormData({ observaciones: '', ubicacion_id: bodegas.length > 0 ? bodegas[0].id : '' });
    } else if (action === 'BAJA' || action === 'TO_MAINTENANCE') {
      setFormData({ observaciones: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAction(true);
    try {
      if (modalAction === 'CREATE') {
        // Ensure we send the location name if an ID is selected
        let locationName = '';
        if (formData.ubicacion_id) {
           const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
           if (bodega) locationName = bodega.nombre;
        }
        
        await api.createEquipo({
            ...formData,
            ubicacion_nombre: locationName // Pass explicit location name
        });
      } else if (modalAction === 'EDIT' && selectedEquipo) {
        await api.updateEquipo(selectedEquipo.id, formData);
      } else if (modalAction === 'ASSIGN' && selectedEquipo) {
        // Backend double-check simulated
        await api.asignarEquipo(selectedEquipo.id, formData.usuario_id, formData.ubicacion, formData.observaciones);
        
        // Generate Assignment Reports (Anexo 1 & Responsiva)
        const assignedUser = usuarios.find(u => u.id === Number(formData.usuario_id));
        if (assignedUser) {
           generateAssignmentDocument(assignedUser, selectedEquipo);
        }

      } else if (modalAction === 'RETURN' && selectedEquipo) {
        // Resolve location name from ID
        const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
        const nombreBodega = bodega ? bodega.nombre : 'Bodega General';
        await api.recepcionarEquipo(selectedEquipo.id, formData.observaciones, Number(formData.ubicacion_id), nombreBodega);
      } else if (modalAction === 'MARK_DISPOSAL' && selectedEquipo) {
         // Resolve location name from ID
         const bodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
         const nombreBodega = bodega ? bodega.nombre : 'Bodega IT';
         await api.marcarParaBaja(selectedEquipo.id, formData.observaciones, Number(formData.ubicacion_id), nombreBodega);
      } else if (modalAction === 'BAJA' && selectedEquipo) {
        await api.bajaEquipo(selectedEquipo.id, formData.observaciones);
      } else if (modalAction === 'TO_MAINTENANCE' && selectedEquipo) {
        await api.enviarAMantenimiento(selectedEquipo.id, formData.observaciones);
      }
      await loadData(); // Refresh list
      setModalAction(null);
    } catch (error: any) {
      console.error("Error processing action", error);
      alert(error.message || "Error al procesar la solicitud");
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6 relative" onClick={() => setOpenMenuId(null)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Inventario de Equipos</h2>
        <button 
          onClick={(e) => { e.stopPropagation(); openModal('CREATE'); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Equipo
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Buscar por código, serie o modelo..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos los Estados</option>
            <option value={EstadoEquipo.ACTIVO}>{EstadoEquipo.ACTIVO}</option>
            <option value={EstadoEquipo.DISPONIBLE}>{EstadoEquipo.DISPONIBLE}</option>
            <option value={EstadoEquipo.EN_MANTENIMIENTO}>{EstadoEquipo.EN_MANTENIMIENTO}</option>
            <option value={EstadoEquipo.PARA_BAJA}>{EstadoEquipo.PARA_BAJA}</option>
            <option value={EstadoEquipo.BAJA}>{EstadoEquipo.BAJA}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Código / Serie</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Compra</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ubicación / Responsable</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredEquipos.map((equipo) => (
                <tr key={equipo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{equipo.codigo_activo}</span>
                      <span className="text-xs text-slate-500">{equipo.numero_serie}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-slate-900">{equipo.marca} {equipo.modelo}</span>
                      <span className="text-xs text-slate-500">{equipo.tipo_nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-medium">{formatCurrency(equipo.valor_compra)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex flex-col">
                      <span>{equipo.ubicacion_nombre || '-'}</span>
                      {equipo.responsable_nombre && <span className="text-xs text-blue-600 font-medium">{equipo.responsable_nombre}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(equipo.estado)}`}>
                      {equipo.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === equipo.id ? null : equipo.id); }}
                      className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-slate-100"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {/* Action Menu */}
                    {openMenuId === equipo.id && (
                      <div className="absolute right-8 top-0 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                        <button onClick={() => openModal('EDIT', equipo)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Edit className="w-4 h-4" /> Editar
                        </button>
                        {(equipo.estado === EstadoEquipo.DISPONIBLE || equipo.estado === EstadoEquipo.PARA_BAJA) && (
                           <button onClick={() => openModal('ASSIGN', equipo)} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2">
                             <UserCheck className="w-4 h-4" /> Asignar
                           </button>
                        )}
                        {equipo.estado === EstadoEquipo.ACTIVO && (
                           <button onClick={() => openModal('RETURN', equipo)} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2">
                             <RotateCcw className="w-4 h-4" /> Recepcionar
                           </button>
                        )}
                        {/* Allow sending to Maintenance if available or active (will be unassigned) */}
                        {(equipo.estado === EstadoEquipo.ACTIVO || equipo.estado === EstadoEquipo.DISPONIBLE || equipo.estado === EstadoEquipo.PARA_BAJA) && (
                          <button onClick={() => openModal('TO_MAINTENANCE', equipo)} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                            <Wrench className="w-4 h-4" /> Mantenimiento
                          </button>
                        )}
                        
                        {/* Mark for Disposal - Available if not already Baja or Para Baja */}
                        {(equipo.estado !== EstadoEquipo.BAJA && equipo.estado !== EstadoEquipo.PARA_BAJA) && (
                          <button onClick={() => openModal('MARK_DISPOSAL', equipo)} className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2">
                            <Archive className="w-4 h-4" /> Enviar a Pre-Baja
                          </button>
                        )}

                        {equipo.estado !== EstadoEquipo.BAJA && (
                          <button onClick={() => openModal('BAJA', equipo)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Dar de Baja
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredEquipos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron equipos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
           <p className="text-xs text-slate-500 text-center sm:text-right">
             Total registros: <span className="font-medium text-slate-700">{filteredEquipos.length}</span>
           </p>
        </div>
      </div>

      {/* Modal */}
      {modalAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalAction(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {modalAction === 'CREATE' && 'Nuevo Equipo'}
                {modalAction === 'EDIT' && 'Editar Equipo'}
                {modalAction === 'ASSIGN' && 'Asignar Equipo'}
                {modalAction === 'RETURN' && 'Recepcionar Equipo'}
                {modalAction === 'BAJA' && 'Dar de Baja Equipo'}
                {modalAction === 'TO_MAINTENANCE' && 'Enviar a Mantenimiento'}
                {modalAction === 'MARK_DISPOSAL' && 'Enviar a Pre-Baja (Bodega)'}
              </h3>
              <button onClick={() => setModalAction(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* CREATE / EDIT Fields */}
              {(modalAction === 'CREATE' || modalAction === 'EDIT') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Código Activo</label>
                      <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.codigo_activo || ''} onChange={e => setFormData({...formData, codigo_activo: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Serie</label>
                      <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.numero_serie || ''} onChange={e => setFormData({...formData, numero_serie: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                      <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.marca || ''} onChange={e => setFormData({...formData, marca: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                      <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.modelo || ''} onChange={e => setFormData({...formData, modelo: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Equipo</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.tipo_equipo_id || ''} onChange={e => setFormData({...formData, tipo_equipo_id: Number(e.target.value)})}>
                        {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>
                    
                     {/* New Location Select for Create Action */}
                     {modalAction === 'CREATE' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación Inicial (Bodega)</label>
                            <select 
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.ubicacion_id || ''} 
                                onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}
                            >
                                {bodegas.length === 0 && <option value="">Sin bodegas definidas</option>}
                                {bodegas.map(b => (
                                    <option key={b.id} value={b.id}>{b.nombre}</option>
                                ))}
                            </select>
                        </div>
                     )}
                  </div>

                  {/* Charger Serial for Laptops */}
                  {(() => {
                    const selectedType = tipos.find(t => t.id === Number(formData.tipo_equipo_id));
                    if (selectedType?.nombre.toLowerCase().includes('laptop')) {
                      return (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Serie del Cargador</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={formData.serie_cargador || ''} 
                            onChange={e => setFormData({...formData, serie_cargador: e.target.value})} 
                            placeholder="S/N Cargador"
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Compra</label>
                      <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.fecha_compra || ''} onChange={e => setFormData({...formData, fecha_compra: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Años Garantía</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.anos_garantia || ''} onChange={e => setFormData({...formData, anos_garantia: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor de Compra</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400">$</span>
                      <input type="number" step="0.01" className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.valor_compra || 0} onChange={e => setFormData({...formData, valor_compra: Number(e.target.value)})} />
                    </div>
                  </div>
                </>
              )}

              {/* ASSIGN Fields */}
              {modalAction === 'ASSIGN' && (
                <>
                  <p className="text-sm text-slate-500 mb-4">Asignando equipo <b>{selectedEquipo?.codigo_activo}</b></p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Usuario Responsable</label>
                    <select required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.usuario_id || ''} onChange={e => setFormData({...formData,usuario_id: Number(e.target.value)})}>
                      <option value="">Seleccione un usuario...</option>
                      {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo} ({u.departamento_nombre})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación Física</label>
                    <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Oficina 305, Edificio A"
                      value={formData.ubicacion || ''} onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                    <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                      value={formData.observaciones || ''} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
                  </div>
                </>
              )}

              {/* RETURN Fields */}
              {modalAction === 'RETURN' && (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Devolviendo equipo <b>{selectedEquipo?.codigo_activo}</b> a Bodega.
                  </p>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación de Recepción (Bodega)</label>
                      <select 
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={formData.ubicacion_id || ''} 
                          onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}
                      >
                          {bodegas.length === 0 && <option value="">Sin bodegas definidas</option>}
                          {bodegas.map(b => (
                              <option key={b.id} value={b.id}>{b.nombre}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Observaciones de reingreso
                    </label>
                    <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                      value={formData.observaciones || ''} onChange={e => setFormData({...formData, observaciones: e.target.value})} 
                      placeholder='Estado físico, accesorios devueltos...' />
                  </div>
                </>
              )}

              {/* MARK FOR DISPOSAL Fields (PRE_BAJA) */}
              {modalAction === 'MARK_DISPOSAL' && (
                <>
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg mb-4">
                     <p className="text-sm text-orange-800">
                        El equipo <b>{selectedEquipo?.codigo_activo}</b> pasará a estado <b>Pre-Baja</b>. 
                        Debe seleccionar la bodega donde permanecerá hasta su disposición final.
                     </p>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación (Bodega IT)</label>
                      <select 
                          required
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={formData.ubicacion_id || ''} 
                          onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}
                      >
                          {bodegas.length === 0 && <option value="">Sin bodegas definidas</option>}
                          {bodegas.map(b => (
                              <option key={b.id} value={b.id}>{b.nombre}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Observaciones / Motivo
                    </label>
                    <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                      value={formData.observaciones || ''} onChange={e => setFormData({...formData, observaciones: e.target.value})} 
                      placeholder='Describa el motivo (obsoleto, dañado irrep.) y ubicación en estantería...' />
                  </div>
                </>
              )}

              {/* BAJA / TO_MAINTENANCE Fields */}
              {(modalAction === 'BAJA' || modalAction === 'TO_MAINTENANCE') && (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    {modalAction === 'BAJA' && `Dando de baja definitiva al equipo ${selectedEquipo?.codigo_activo}.`}
                    {modalAction === 'TO_MAINTENANCE' && `Enviando equipo ${selectedEquipo?.codigo_activo} a mantenimiento.`}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {modalAction === 'BAJA' && 'Motivo de Baja'}
                      {modalAction === 'TO_MAINTENANCE' && 'Falla reportada / Motivo'}
                    </label>
                    <textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={3}
                      value={formData.observaciones || ''} onChange={e => setFormData({...formData, observaciones: e.target.value})} 
                      placeholder={
                        modalAction === 'BAJA' ? 'Razon de baja, destino final...' :
                        'Describa el problema técnico...'
                      } />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setModalAction(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoadingAction} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {isLoadingAction ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
