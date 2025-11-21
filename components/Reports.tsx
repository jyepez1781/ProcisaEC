
import React, { useEffect, useState } from 'react';
import { api } from '../services/mockApi';
import { Equipo, HistorialMovimiento, TipoEquipo, HistorialAsignacion, Usuario, RegistroMantenimiento, Licencia, TipoLicencia } from '../types';
import { Download, RefreshCw, History, FileText, CalendarRange, Wrench, Filter, Layers, User, Laptop, Key, ChevronLeft, ChevronRight, FileSpreadsheet, ChevronDown, Upload, X, Save, Eye } from 'lucide-react';

type ReportTab = 'REPLACEMENT' | 'HISTORY' | 'ASSIGNMENTS' | 'MAINTENANCE' | 'LICENSES';
type GroupingMode = 'NONE' | 'USER' | 'EQUIPMENT';
type LicenseGroupingMode = 'NONE' | 'TYPE';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('REPLACEMENT');
  
  // Data state
  const [candidates, setCandidates] = useState<Equipo[]>([]);
  const [historial, setHistorial] = useState<HistorialMovimiento[]>([]);
  const [asignaciones, setAsignaciones] = useState<HistorialAsignacion[]>([]);
  const [mantenimientos, setMantenimientos] = useState<RegistroMantenimiento[]>([]);
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  
  // Catalogs for Filters
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [allUsuarios, setAllUsuarios] = useState<Usuario[]>([]);
  const [allEquipos, setAllEquipos] = useState<Equipo[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<TipoLicencia[]>([]);

  // Filter States
  const [selectedTipoId, setSelectedTipoId] = useState<number | string>('');
  
  // Assignment Report Specific States
  const [assignFilterUser, setAssignFilterUser] = useState<string>('');
  const [assignFilterEquipo, setAssignFilterEquipo] = useState<string>('');
  const [assignGrouping, setAssignGrouping] = useState<GroupingMode>('NONE');
  const [currentAssignPage, setCurrentAssignPage] = useState(1);
  const ASSIGN_ITEMS_PER_PAGE = 10;

  // Assignment File Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedAssignmentForUpload, setSelectedAssignmentForUpload] = useState<HistorialAsignacion | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // Assignment File Viewer Modal
  const [fileToView, setFileToView] = useState<string | null>(null);

  // License Report Specific States
  const [licenseFilterUser, setLicenseFilterUser] = useState<string>('');
  const [licenseFilterType, setLicenseFilterType] = useState<string>('');
  const [licenseGrouping, setLicenseGrouping] = useState<LicenseGroupingMode>('NONE');
  
  // License Pagination
  const [currentLicensePage, setCurrentLicensePage] = useState(1);
  const LICENSE_ITEMS_PER_PAGE = 10;

  // Export Menu State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      const [candData, tiposData, userData, equipData, licTypesData] = await Promise.all([
        api.getReplacementCandidates(),
        api.getTiposEquipo(),
        api.getUsuarios(),
        api.getEquipos(),
        api.getTipoLicencias()
      ]);
      setCandidates(candData);
      setTipos(tiposData);
      setAllUsuarios(userData);
      setAllEquipos(equipData);
      setLicenseTypes(licTypesData);
      setLoading(false);
    };
    loadInitial();
  }, []);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetchHistorial();
    } else if (activeTab === 'ASSIGNMENTS') {
      fetchAsignaciones();
    } else if (activeTab === 'MAINTENANCE') {
      fetchMantenimientos();
    } else if (activeTab === 'LICENSES') {
      fetchLicencias();
    }
  }, [activeTab, selectedTipoId]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentLicensePage(1);
  }, [licenseFilterUser, licenseFilterType, licenseGrouping, activeTab]);

  useEffect(() => {
    setCurrentAssignPage(1);
  }, [assignFilterUser, assignFilterEquipo, assignGrouping, activeTab]);

  const fetchHistorial = async () => {
    setLoading(true);
    const data = await api.getHistorial(selectedTipoId ? Number(selectedTipoId) : undefined);
    setHistorial(data);
    setLoading(false);
  };

  const fetchAsignaciones = async () => {
    setLoading(true);
    const data = await api.getHistorialAsignaciones();
    setAsignaciones(data);
    setLoading(false);
  }

  const fetchMantenimientos = async () => {
    setLoading(true);
    const data = await api.getHistorialMantenimiento(selectedTipoId ? Number(selectedTipoId) : undefined);
    setMantenimientos(data);
    setLoading(false);
  }

  const fetchLicencias = async () => {
    setLoading(true);
    const data = await api.getLicencias();
    setLicencias(data);
    setLoading(false);
  }

  const calculateAge = (dateStr: string) => {
    const years = new Date().getFullYear() - new Date(dateStr).getFullYear();
    return years;
  };

  const calculateDays = (start: string, end: string | null) => {
    const d1 = new Date(start);
    const d2 = end ? new Date(end) : new Date();
    const diff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // --- Logic for Assignments Filtering & Grouping & Pagination ---
  
  const getFilteredAssignments = () => {
    return asignaciones.filter(item => {
      const matchesUser = assignFilterUser ? item.usuario_nombre === assignFilterUser : true;
      const matchesEquip = assignFilterEquipo ? item.equipo_codigo === assignFilterEquipo : true;
      return matchesUser && matchesEquip;
    });
  };

  const filteredAssignmentsList = getFilteredAssignments();
  const totalAssignPages = Math.ceil(filteredAssignmentsList.length / ASSIGN_ITEMS_PER_PAGE);
  const paginatedAssignments = filteredAssignmentsList.slice(
    (currentAssignPage - 1) * ASSIGN_ITEMS_PER_PAGE,
    currentAssignPage * ASSIGN_ITEMS_PER_PAGE
  );

  const getGroupedAssignments = (items: HistorialAsignacion[]) => {
    if (assignGrouping === 'NONE') return { 'Todas las Asignaciones': items };

    return items.reduce((groups, item) => {
      const key = assignGrouping === 'USER' ? item.usuario_nombre : `${item.equipo_codigo} - ${item.equipo_modelo}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, HistorialAsignacion[]>);
  };

  const groupedData = getGroupedAssignments(paginatedAssignments);

  // File Upload Handlers
  const handleOpenUpload = (item: HistorialAsignacion) => {
      setSelectedAssignmentForUpload(item);
      setFileToUpload(null);
      setIsUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFileToUpload(e.target.files[0]);
      }
  };

  const handleSubmitFile = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAssignmentForUpload || !fileToUpload) return;

      try {
          await api.subirArchivoAsignacion(selectedAssignmentForUpload.id, fileToUpload);
          alert('Archivo subido correctamente');
          setIsUploadModalOpen(false);
          fetchAsignaciones(); // Refresh list
      } catch (error: any) {
          alert('Error al subir archivo: ' + error.message);
      }
  };

  const handleViewFile = (fileName: string) => {
    setFileToView(fileName);
  };

  // --- Logic for Licenses Filtering & Grouping ---

  const getFilteredLicenses = () => {
    return licencias.filter(l => {
      // Only show assigned licenses in this report
      const isAssigned = l.usuario_id !== null && l.usuario_id !== undefined;
      const matchesUser = licenseFilterUser ? l.usuario_nombre === licenseFilterUser : true;
      const matchesType = licenseFilterType ? l.tipo_id === Number(licenseFilterType) : true;
      return isAssigned && matchesUser && matchesType;
    });
  };

  const filteredLicensesList = getFilteredLicenses();
  const totalLicensePages = Math.ceil(filteredLicensesList.length / LICENSE_ITEMS_PER_PAGE);
  const paginatedLicenses = filteredLicensesList.slice(
    (currentLicensePage - 1) * LICENSE_ITEMS_PER_PAGE,
    currentLicensePage * LICENSE_ITEMS_PER_PAGE
  );

  const getGroupedLicenses = (items: Licencia[]) => {
    if (licenseGrouping === 'NONE') return { 'Todas las Licencias Asignadas': items };

    return items.reduce((groups, item) => {
      const key = item.tipo_nombre;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, Licencia[]>);
  };

  const groupedLicenses = getGroupedLicenses(paginatedLicenses);

  // --- Helper: Print Preview Window ---
  const openPrintPreview = (data: any[], title: string) => {
    if (data.length === 0) {
      alert("No hay datos para generar la vista previa.");
      return;
    }

    const headers = Object.keys(data[0]);
    const printWindow = window.open('', '_blank', 'width=1000,height=800');

    if (!printWindow) {
      alert("Por favor habilita las ventanas emergentes para ver el reporte.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vista Previa - ${title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; padding: 40px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .header-content h1 { margin: 0; color: #0f172a; font-size: 24px; margin-bottom: 4px; }
            .header-content p { margin: 0; color: #64748b; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { text-align: left; padding: 10px; background-color: #f1f5f9; color: #475569; border-bottom: 2px solid #cbd5e1; font-weight: 600; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
            tr:nth-child(even) { background-color: #f8fafc; }
            tr:hover { background-color: #f1f5f9; }
            .btn-print { padding: 10px 20px; background-color: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 8px; font-size: 14px; }
            .btn-print:hover { background-color: #1d4ed8; }
            @media print {
              .btn-print { display: none; }
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-content">
              <h1>Reporte: ${title.replace(/_/g, ' ')}</h1>
              <p>Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
            </div>
            <button class="btn-print" onclick="window.print()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2-2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Imprimir / Guardar PDF
            </button>
          </div>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${data.map(row => `<tr>${headers.map(header => `<td>${row[header] ?? ''}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- Export Logic ---
  const convertToCSV = (objArray: any[]) => {
    if (objArray.length === 0) return '';
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    
    // Header
    str += Object.keys(array[0]).join(',') + '\r\n';
    
    // Rows
    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (const index in array[i]) {
            if (line !== '') line += ',';
            // Handle commas inside fields
            const val = array[i][index];
            const stringVal = val === null || val === undefined ? '' : val.toString();
            // Escape quotes and handle commas
            const escapedVal = stringVal.replace(/"/g, '""');
            line += `"${escapedVal}"`;
        }
        str += line + '\r\n';
    }
    return str;
  };

  const downloadCSV = (data: any[], filename: string) => {
    const csvData = convertToCSV(data);
    // Add BOM for Excel to recognize UTF-8 (fix for accents)
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format: 'excel' | 'pdf') => {
      setIsExportMenuOpen(false);
      const timestamp = new Date().toISOString().split('T')[0];

      // 1. Prepare Data based on Active Tab and Filters
      let dataToExport: any[] = [];
      let reportTitle = '';

      switch (activeTab) {
          case 'REPLACEMENT':
              reportTitle = 'Candidatos_Reemplazo';
              dataToExport = candidates.map(c => ({
                  Codigo: c.codigo_activo,
                  Marca: c.marca,
                  Modelo: c.modelo,
                  'Fecha Compra': c.fecha_compra,
                  Antiguedad: `${calculateAge(c.fecha_compra)} Años`,
                  Observaciones: c.observaciones
              }));
              break;
          case 'HISTORY':
              reportTitle = 'Historial_Movimientos';
              dataToExport = historial.map(h => ({
                  Fecha: h.fecha,
                  Equipo: h.equipo_codigo,
                  Accion: h.tipo_accion,
                  Responsable: h.usuario_responsable,
                  Detalle: h.detalle
              }));
              break;
          case 'ASSIGNMENTS':
              reportTitle = 'Historial_Asignaciones';
              dataToExport = filteredAssignmentsList.map(a => ({
                  Usuario: a.usuario_nombre,
                  Departamento: a.usuario_departamento,
                  Equipo: a.equipo_codigo,
                  Modelo: a.equipo_modelo,
                  'Fecha Inicio': a.fecha_inicio,
                  'Fecha Fin': a.fecha_fin || 'Vigente',
                  Ubicacion: a.ubicacion
              }));
              break;
          case 'MAINTENANCE':
              reportTitle = 'Historial_Mantenimientos';
              dataToExport = mantenimientos.map(m => ({
                  Fecha: m.fecha,
                  Equipo: m.equipo_codigo,
                  Modelo: m.equipo_modelo,
                  Tipo: m.tipo_mantenimiento,
                  Proveedor: m.proveedor,
                  Costo: formatCurrency(m.costo),
                  Descripcion: m.descripcion
              }));
              break;
          case 'LICENSES':
              reportTitle = 'Reporte_Licencias';
              dataToExport = filteredLicensesList.map(l => ({
                  Licencia: l.tipo_nombre,
                  Clave: l.clave,
                  Usuario: l.usuario_nombre,
                  Departamento: l.usuario_departamento,
                  Vencimiento: l.fecha_vencimiento
              }));
              break;
      }

      if (dataToExport.length === 0) {
          alert("No hay datos para exportar con los filtros actuales.");
          return;
      }

      // 2. Handle Output Format
      if (format === 'pdf') {
          openPrintPreview(dataToExport, reportTitle);
      } else {
          const filename = `${reportTitle}_${timestamp}`;
          downloadCSV(dataToExport, filename);
      }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Reportes del Sistema</h2>
        
        <div className="relative">
            <button 
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                <Download className="w-4 h-4" />
                Exportar
                <ChevronDown className="w-3 h-3 ml-1" />
            </button>

            {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <button 
                        onClick={() => handleExport('excel')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-green-50 flex items-center gap-2 hover:text-green-700"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Excel (CSV)
                    </button>
                    <button 
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-red-50 flex items-center gap-2 hover:text-red-700"
                    >
                        <FileText className="w-4 h-4" /> Vista Previa / PDF
                    </button>
                </div>
            )}
            
            {/* Overlay to close menu when clicking outside */}
            {isExportMenuOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setIsExportMenuOpen(false)}></div>
            )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('REPLACEMENT')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'REPLACEMENT' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Reemplazos
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'HISTORY' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          Movimientos
        </button>
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'ASSIGNMENTS' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          Asignaciones
        </button>
        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'MAINTENANCE' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Mantenimiento
        </button>
        <button
          onClick={() => setActiveTab('LICENSES')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'LICENSES' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Key className="w-4 h-4" />
          Licencias
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        
        {/* -- Tab: Replacement Candidates -- */}
        {activeTab === 'REPLACEMENT' && (
          <div className="p-0">
             <div className="p-4 bg-blue-50 border-b border-blue-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <RefreshCw className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Este reporte muestra el 20% de los equipos con mayor antigüedad (≥ 4 años) sugeridos para reemplazo inmediato.
                    </p>
                  </div>
                </div>
              </div>
              
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Activo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha Compra</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Antigüedad</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center">Cargando...</td></tr>
                  ) : candidates.map((equipo) => (
                    <tr key={equipo.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{equipo.codigo_activo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{equipo.marca} {equipo.modelo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{equipo.fecha_compra}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                          {calculateAge(equipo.fecha_compra)} Años
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{equipo.observaciones || '-'}</td>
                    </tr>
                  ))}
                  {!loading && candidates.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No hay candidatos críticos.</td></tr>
                  )}
                </tbody>
              </table>
          </div>
        )}

        {/* -- Tab: History by Type -- */}
        {activeTab === 'HISTORY' && (
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Filtrar por Tipo de Equipo:</span>
              <select 
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                value={selectedTipoId}
                onChange={(e) => setSelectedTipoId(e.target.value)}
              >
                <option value="">Todos los Tipos</option>
                {tipos.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalle</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center">Cargando historial...</td></tr>
                  ) : historial.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.equipo_codigo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold 
                        ${item.tipo_accion === 'CREACION' ? 'bg-green-100 text-green-800' : ''}
                        ${item.tipo_accion === 'ASIGNACION' ? 'bg-blue-100 text-blue-800' : ''}
                        ${item.tipo_accion === 'BAJA' ? 'bg-red-100 text-red-800' : ''}
                        ${item.tipo_accion === 'RECEPCION' ? 'bg-purple-100 text-purple-800' : ''}
                      `}>
                        {item.tipo_accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.usuario_responsable}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.detalle}</td>
                  </tr>
                ))}
                {!loading && historial.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No hay registros de historial.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* -- Tab: Assignments History -- */}
        {activeTab === 'ASSIGNMENTS' && (
          <div>
            {/* Filters and Grouping Controls */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Filtrar Usuario</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select 
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={assignFilterUser}
                      onChange={(e) => setAssignFilterUser(e.target.value)}
                    >
                      <option value="">Todos los Usuarios</option>
                      {allUsuarios.map(u => (
                        <option key={u.id} value={u.nombre_completo}>{u.nombre_completo}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Filtrar Equipo</label>
                   <div className="relative">
                    <Laptop className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select 
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={assignFilterEquipo}
                      onChange={(e) => setAssignFilterEquipo(e.target.value)}
                    >
                      <option value="">Todos los Equipos</option>
                      {allEquipos.map(e => (
                        <option key={e.id} value={e.codigo_activo}>{e.codigo_activo} - {e.modelo}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                <button 
                  onClick={() => setAssignGrouping('NONE')}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${assignGrouping === 'NONE' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Layers className="w-4 h-4" /> Plano
                </button>
                <div className="w-px h-8 bg-slate-200"></div>
                <button 
                   onClick={() => setAssignGrouping('USER')}
                   className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${assignGrouping === 'USER' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <User className="w-4 h-4" /> Agrupar Usuario
                </button>
                <div className="w-px h-8 bg-slate-200"></div>
                <button 
                   onClick={() => setAssignGrouping('EQUIPMENT')}
                   className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${assignGrouping === 'EQUIPMENT' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Laptop className="w-4 h-4" /> Agrupar Equipo
                </button>
              </div>
            </div>

            {/* Grouped Content Rendering */}
            {loading ? (
               <div className="p-12 text-center text-slate-500">Cargando asignaciones...</div>
            ) : (
               <div>
                 {Object.entries(groupedData).length === 0 && (
                    <div className="p-12 text-center text-slate-500">No se encontraron registros con los filtros actuales.</div>
                 )}

                 {Object.entries(groupedData).map(([groupKey, items]) => (
                   <div key={groupKey} className="border-b border-slate-200 last:border-0">
                      {assignGrouping !== 'NONE' && (
                        <div className="px-6 py-3 bg-slate-50 font-semibold text-slate-700 border-b border-slate-100 flex items-center gap-2">
                          {assignGrouping === 'USER' ? <User className="w-4 h-4 text-blue-500" /> : <Laptop className="w-4 h-4 text-blue-500" />}
                          {groupKey} <span className="text-slate-400 font-normal text-sm">({items.length} asignaciones)</span>
                        </div>
                      )}
                      
                      <table className="min-w-full divide-y divide-slate-200">
                        {assignGrouping === 'NONE' && (
                           <thead className="bg-white">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Usuario</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Departamento</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Equipo</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Periodo</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Duración</th>
                              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Documento</th>
                            </tr>
                          </thead>
                        )}
                        <tbody className="bg-white divide-y divide-slate-100">
                          {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              {/* Conditionally hide columns based on grouping to avoid redundancy */}
                              {assignGrouping !== 'USER' && (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.usuario_nombre}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.usuario_departamento}</td>
                                </>
                              )}
                              
                              {assignGrouping !== 'EQUIPMENT' && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-blue-600">{item.equipo_codigo}</span>
                                    <span className="text-xs text-slate-500">{item.equipo_modelo}</span>
                                  </div>
                                </td>
                              )}

                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-slate-600">
                                    <span className="text-green-600 font-medium">{item.fecha_inicio}</span>
                                    <span className="mx-2 text-slate-300">→</span>
                                    <span className={item.fecha_fin ? 'text-slate-600' : 'text-blue-600 font-medium'}>
                                        {item.fecha_fin || 'Actual'}
                                    </span>
                                 </div>
                              </td>
                              
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                 {calculateDays(item.fecha_inicio, item.fecha_fin)} días
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                {item.archivo_pdf ? (
                                   <div 
                                      onClick={() => handleViewFile(item.archivo_pdf!)}
                                      className="flex flex-col items-center justify-center text-red-600 group cursor-pointer hover:bg-red-50 p-1 rounded transition-colors relative"
                                      title="Ver Documento"
                                   >
                                     <div className="relative">
                                        <FileText className="w-5 h-5" />
                                        <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Eye className="w-2 h-2 text-white" />
                                        </div>
                                     </div>
                                     <span className="text-[10px] text-slate-500 max-w-[80px] truncate group-hover:text-slate-800">{item.archivo_pdf}</span>
                                   </div>
                                ) : (
                                   <button 
                                     onClick={() => handleOpenUpload(item)}
                                     className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors flex flex-col items-center"
                                     title="Subir Acta de Entrega/Recepción"
                                   >
                                     <Upload className="w-4 h-4" />
                                     <span className="text-[10px] mt-0.5">Subir</span>
                                   </button>
                                )}
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                 ))}
               </div>
            )}

            {/* Pagination Controls */}
            {filteredAssignmentsList.length > 0 && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-500">
                    Mostrando <span className="font-medium">{((currentAssignPage - 1) * ASSIGN_ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium">{Math.min(currentAssignPage * ASSIGN_ITEMS_PER_PAGE, filteredAssignmentsList.length)}</span> de <span className="font-medium">{filteredAssignmentsList.length}</span> asignaciones
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                    onClick={() => setCurrentAssignPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentAssignPage === 1}
                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                    <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="hidden sm:flex gap-1">
                    {Array.from({ length: totalAssignPages }).map((_, idx) => (
                        <button
                        key={idx}
                        onClick={() => setCurrentAssignPage(idx + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            currentAssignPage === idx + 1 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                        >
                        {idx + 1}
                        </button>
                    ))}
                    </div>

                    <button
                    onClick={() => setCurrentAssignPage(prev => Math.min(prev + 1, totalAssignPages))}
                    disabled={currentAssignPage === totalAssignPages}
                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                    <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                </div>
            )}
          </div>
        )}

        {/* -- Tab: Maintenance History -- */}
        {activeTab === 'MAINTENANCE' && (
             <div>
               <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
                <span className="text-sm font-medium text-slate-700">Filtrar por Tipo de Equipo:</span>
                <select 
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                    value={selectedTipoId}
                    onChange={(e) => setSelectedTipoId(e.target.value)}
                >
                    <option value="">Todos los Tipos</option>
                    {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                </select>
                </div>
                <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-white">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Proveedor / Costo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center">Cargando mantenimientos...</td></tr>
                    ) : mantenimientos.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.fecha}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex flex-col">
                             <span className="text-sm font-medium text-blue-600">{item.equipo_codigo}</span>
                             <span className="text-xs text-slate-500">{item.equipo_modelo}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold 
                            ${item.tipo_mantenimiento === 'Preventivo' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                        `}>
                            {item.tipo_mantenimiento}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{item.proveedor}</div>
                            <div className="text-xs font-medium text-slate-500">{formatCurrency(item.costo)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={item.descripcion}>{item.descripcion}</td>
                    </tr>
                    ))}
                     {!loading && mantenimientos.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No hay registros de mantenimiento.</td></tr>
                    )}
                </tbody>
                </table>
             </div>
        )}

        {/* -- Tab: Licenses Report -- */}
        {activeTab === 'LICENSES' && (
             <div>
                 {/* Filter Controls */}
                 <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                     <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Filtrar Usuario</label>
                             <div className="relative">
                                 <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                 <select 
                                     className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                     value={licenseFilterUser}
                                     onChange={e => setLicenseFilterUser(e.target.value)}
                                 >
                                     <option value="">Todos los Usuarios</option>
                                     {allUsuarios.map(u => <option key={u.id} value={u.nombre_completo}>{u.nombre_completo}</option>)}
                                 </select>
                             </div>
                        </div>
                         <div>
                             <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo de Licencia</label>
                             <div className="relative">
                                 <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                 <select 
                                     className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                     value={licenseFilterType}
                                     onChange={e => setLicenseFilterType(e.target.value)}
                                 >
                                     <option value="">Todos los Tipos</option>
                                     {licenseTypes.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                 </select>
                             </div>
                        </div>
                     </div>
                     <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                        <button 
                           onClick={() => setLicenseGrouping('NONE')}
                           className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${licenseGrouping === 'NONE' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                           <Layers className="w-4 h-4" /> Plano
                        </button>
                         <div className="w-px h-8 bg-slate-200"></div>
                        <button 
                           onClick={() => setLicenseGrouping('TYPE')}
                           className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${licenseGrouping === 'TYPE' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                           <Key className="w-4 h-4" /> Agrupar Tipo
                        </button>
                     </div>
                 </div>

                 {/* Render Licenses */}
                 {loading ? (
                     <div className="p-12 text-center text-slate-500">Cargando licencias...</div>
                 ) : (
                     <div>
                         {Object.entries(groupedLicenses).length === 0 && (
                             <div className="p-12 text-center text-slate-500">No se encontraron licencias asignadas con los filtros actuales.</div>
                         )}

                         {Object.entries(groupedLicenses).map(([groupKey, items]) => (
                             <div key={groupKey} className="border-b border-slate-200 last:border-0">
                                 {licenseGrouping !== 'NONE' && (
                                     <div className="px-6 py-3 bg-slate-50 font-semibold text-slate-700 border-b border-slate-100 flex items-center gap-2">
                                         <Key className="w-4 h-4 text-purple-500" />
                                         {groupKey} <span className="text-slate-400 font-normal text-sm">({items.length})</span>
                                     </div>
                                 )}
                                 <table className="min-w-full divide-y divide-slate-200">
                                     <thead className={licenseGrouping === 'NONE' ? 'bg-white' : 'bg-slate-50/50'}>
                                         <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Licencia</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Clave / ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Usuario Asignado</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Departamento</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Vencimiento</th>
                                         </tr>
                                     </thead>
                                     <tbody className="bg-white divide-y divide-slate-100">
                                         {items.map(lic => (
                                             <tr key={lic.id} className="hover:bg-slate-50">
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-700">{lic.tipo_nombre}</td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">{lic.clave}</td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{lic.usuario_nombre}</td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{lic.usuario_departamento}</td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{lic.fecha_vencimiento}</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         ))}
                     </div>
                 )}
                 
                  {/* Pagination Controls for Licenses */}
                    {filteredLicensesList.length > 0 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500">
                        Mostrando <span className="font-medium">{((currentLicensePage - 1) * LICENSE_ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium">{Math.min(currentLicensePage * LICENSE_ITEMS_PER_PAGE, filteredLicensesList.length)}</span> de <span className="font-medium">{filteredLicensesList.length}</span> licencias
                        </div>
                        
                        <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentLicensePage(prev => Math.max(prev - 1, 1))}
                            disabled={currentLicensePage === 1}
                            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <div className="hidden sm:flex gap-1">
                            {Array.from({ length: totalLicensePages }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentLicensePage(idx + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                currentLicensePage === idx + 1 
                                    ? 'bg-purple-600 text-white' 
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {idx + 1}
                            </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentLicensePage(prev => Math.min(prev + 1, totalLicensePages))}
                            disabled={currentLicensePage === totalLicensePages}
                            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        </div>
                    </div>
                    )}
             </div>
        )}

      </div>

      {/* Upload Assignment File Modal */}
      {isUploadModalOpen && selectedAssignmentForUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsUploadModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-slate-800">Subir Acta de Asignación</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-900 font-semibold">Asignación: {selectedAssignmentForUpload.equipo_codigo}</p>
              <p className="text-sm text-blue-800">Usuario: {selectedAssignmentForUpload.usuario_nombre}</p>
              <p className="text-xs text-blue-600 mt-1">Fecha: {selectedAssignmentForUpload.fecha_inicio}</p>
            </div>

            <form onSubmit={handleSubmitFile} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <input 
                  type="file" 
                  accept=".pdf"
                  required
                  onChange={handleFileChange}
                  className="hidden" 
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-700">
                    {fileToUpload ? fileToUpload.name : 'Seleccionar archivo PDF'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">Solo formato .pdf</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!fileToUpload}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Subir Archivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View File Modal */}
      {fileToView && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setFileToView(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <FileText className="w-5 h-5 text-red-600" /> 
                     Vista Previa: {fileToView}
                  </h3>
                  <button onClick={() => setFileToView(null)} className="text-slate-400 hover:text-slate-600">
                     <X className="w-6 h-6" />
                  </button>
               </div>
               <div className="flex-1 bg-slate-100 p-4 overflow-hidden flex items-center justify-center relative">
                  {/* 
                    Note: In a real application, `fileToView` would be a URL (Blob URL or Server URL).
                    If it is a URL, we use an iframe. If it is a mock name (string without http), we show a placeholder.
                  */}
                  {fileToView.startsWith('http') || fileToView.startsWith('blob') ? (
                      <iframe 
                         src={fileToView} 
                         className="w-full h-full rounded bg-white shadow-sm" 
                         title="Document Viewer"
                      />
                  ) : (
                      <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
                         <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                         <h4 className="text-lg font-semibold text-slate-700 mb-2">Simulación de Visualización</h4>
                         <p className="text-slate-500 text-sm mb-4">
                            En un entorno de producción, aquí se mostraría el contenido del archivo PDF: 
                            <br/><span className="font-mono bg-slate-50 px-2 py-1 rounded mt-1 inline-block text-slate-800">{fileToView}</span>
                         </p>
                         <div className="p-3 bg-amber-50 border border-amber-100 rounded text-xs text-amber-800">
                            Nota: Al estar en modo Demo/Mock, los archivos no se guardan físicamente en un servidor, por lo que no se pueden previsualizar realmente.
                         </div>
                      </div>
                  )}
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default Reports;
