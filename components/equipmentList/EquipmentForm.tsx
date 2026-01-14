import React, { useState, useEffect } from 'react';
import { Equipo, TipoEquipo, Usuario, Departamento, EstadoEquipo, Ciudad, Pais } from '../../types';
import { Save, Upload, X, FileText, RefreshCw, Sparkles, Loader2, Unplug, Printer, AlertCircle, Lock, Cpu, Database, HardDrive, Layout } from 'lucide-react';
import { ModalAction } from '../../hooks/useEquipment';
import { GoogleGenAI } from "@google/genai";
import { generateReceptionDocument, generateDisposalDocument, generateAssignmentDocument } from '../../utils/documentGenerator';
import { api } from '../../services/mockApi';
import Swal from 'sweetalert2';

interface EquipmentFormProps {
  action: ModalAction;
  equipo: Equipo | null;
  tipos: TipoEquipo[];
  usuarios: Usuario[];
  bodegas: Departamento[];
  cities?: Ciudad[];
  countries?: Pais[];
  onSubmit: (data: any) => Promise<boolean>;
  onCancel: () => void;
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({ 
  action, equipo, tipos, usuarios, bodegas, cities = [], countries = [], onSubmit, onCancel 
}) => {
  const [formData, setFormData] = useState<any>(() => {
    // Initial State Logic based on Action
    if (action === 'CREATE') {
      return {
        codigo_activo: '', numero_serie: '', marca: '', modelo: '', 
        tipo_equipo_id: tipos[0]?.id || '', serie_cargador: '', 
        fecha_compra: new Date().toISOString().split('T')[0], 
        valor_compra: 0, anos_garantia: 1, estado: EstadoEquipo.DISPONIBLE, observaciones: '',
        ubicacion_id: bodegas.length > 0 ? bodegas[0].id : '',
        procesador: '', ram: '', disco_capacidad: '', disco_tipo: 'SSD', sistema_operativo: ''
      };
    }
    if (action === 'EDIT' && equipo) return { 
        ...equipo, 
        disco_tipo: equipo.disco_tipo || 'SSD',
        procesador: equipo.procesador || '',
        ram: equipo.ram || '',
        disco_capacidad: equipo.disco_capacidad || '',
        sistema_operativo: equipo.sistema_operativo || ''
    };
    if (action === 'ASSIGN') return { usuario_id: '', ubicacion: '', observaciones: '' };
    if (action === 'RETURN') return { observaciones: '', ubicacion_id: bodegas[0]?.id || '', releaseLicenses: false };
    if (['MARK_DISPOSAL'].includes(action || '')) return { observaciones: '', ubicacion_id: bodegas[0]?.id || '' };
    return { observaciones: '' };
  });

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [userLicenses, setUserLicenses] = useState<string[]>([]);
  const [hasGeneratedDoc, setHasGeneratedDoc] = useState(false); // State to track document generation

  const canEditLocation = action === 'EDIT' && equipo?.estado === EstadoEquipo.DISPONIBLE;

  // Detectar si el equipo es de computo (Laptop, Desktop, Servidor)
  const isComputingEquipment = () => {
    const selected = tipos.find(t => t.id === Number(formData.tipo_equipo_id));
    if (!selected) return false;
    const name = selected.nombre.toLowerCase();
    return name.includes('laptop') || name.includes('desktop') || name.includes('servidor') || name.includes('notebook') || name.includes('portatil');
  };

  // Auto-generate Asset Code Logic
  useEffect(() => {
    if (action === 'CREATE' || canEditLocation) {
      // 1. Encontrar Bodega seleccionada
      const selectedBodega = bodegas.find(b => b.id === Number(formData.ubicacion_id));
      if (!selectedBodega) return;

      // 2. Encontrar Ciudad de la Bodega
      const selectedCity = cities.find(c => c.id === selectedBodega.ciudad_id);
      if (!selectedCity) return;

      // 3. Encontrar País de la Ciudad
      const selectedCountry = countries.find(p => p.id === selectedCity.pais_id);
      
      const serie = formData.numero_serie ? formData.numero_serie.trim().toUpperCase() : '';
      
      if (serie && selectedCountry && selectedCity) {
        // Formato: PAISCIUDADSERIE (ej: ECGYESN123456) - Sin guiones
        const newCode = `${selectedCountry.abreviatura}${selectedCity.abreviatura}${serie}`.toUpperCase();
        
        // Evitamos bucle infinito: solo actualizamos si el código es realmente diferente
        if (formData.codigo_activo !== newCode) {
            setFormData((prev: any) => ({ ...prev, codigo_activo: newCode }));
        }
      }
    }
  }, [formData.ubicacion_id, formData.numero_serie, action, bodegas, cities, countries, canEditLocation]);

  // Fetch licenses for the responsible user if action is RETURN
  useEffect(() => {
    if (action === 'RETURN' && equipo?.responsable_id) {
        api.getLicencias().then(all => {
            const userLics = all
                .filter(l => l.usuario_id === equipo.responsable_id)
                .map(l => `${l.tipo_nombre} (Key: ${l.clave})`);
            setUserLicenses(userLics);
        });
    }
  }, [action, equipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones específicas para RECEPCIÓN
    if (action === 'RETURN') {
        if (!hasGeneratedDoc) {
            Swal.fire('Acción Requerida', 'Debe generar y descargar el Acta de Recepción antes de guardar.', 'warning');
            return;
        }
        if (!evidenceFile) {
            Swal.fire('Documento Faltante', 'Es obligatorio subir el Acta de Recepción firmada.', 'warning');
            return;
        }
    }

    // Validaciones específicas para BAJA
    if (action === 'BAJA') {
        if (!hasGeneratedDoc) {
            Swal.fire('Acción Requerida', 'Debe generar el Acta de Baja antes de continuar.', 'warning');
            return;
        }
        if (!evidenceFile) {
            Swal.fire('Evidencia Faltante', 'Es obligatorio subir el Acta de Baja firmada/aprobada.', 'warning');
            return;
        }
    }

    // Validaciones específicas para ASIGNACIÓN
    if (action === 'ASSIGN') {
        if (!hasGeneratedDoc) {
            Swal.fire('Acción Requerida', 'Debe generar el Acta de Entrega antes de completar la asignación.', 'warning');
            return;
        }
        if (!evidenceFile) {
            Swal.fire('Documento Faltante', 'Es obligatorio subir el Acta de Entrega firmada para completar la asignación.', 'warning');
            return;
        }
    }

    setLoading(true);
    // Merge file into data if exists
    const dataToSubmit = { ...formData, evidenceFile };
    const success = await onSubmit(dataToSubmit);
    if (!success) setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
      const isReturn = action === 'RETURN';
      const isBaja = action === 'BAJA';
      const isAssign = action === 'ASSIGN';
      
      let docName = 'el documento';
      if(isReturn) docName = 'Acta de Recepción';
      if(isBaja) docName = 'Acta de Baja';
      if(isAssign) docName = 'Acta de Entrega';
      
      if ((isReturn || isBaja || isAssign) && !hasGeneratedDoc) {
          e.preventDefault(); 
          Swal.fire({
              title: 'Paso Bloqueado',
              text: `Primero debe generar el ${docName}. Una vez generada, se habilitará la carga del documento.`,
              icon: 'info',
              confirmButtonColor: '#2563eb'
          });
      }
  };

  const handlePrintAssignment = () => {
      // Validación: Campos obligatorios
      if (!formData.usuario_id || !formData.ubicacion) {
          Swal.fire('Campos incompletos', 'Debe seleccionar un usuario y una ubicación física antes de generar el acta.', 'warning');
          return;
      }

      if (!equipo) return;
      const user = usuarios.find(u => u.id === Number(formData.usuario_id));
      if (user) {
          // Inyectamos observaciones temporales si existen para que salgan en el acta
          const equipoParaActa = { ...equipo, observaciones: formData.observaciones || equipo.observaciones };
          generateAssignmentDocument(user, equipoParaActa);
          setHasGeneratedDoc(true);
      }
  };

  const handlePrintReception = () => {
      if (!formData.observaciones || formData.observaciones.trim().length === 0) {
          Swal.fire('Campos incompletos', 'Debe ingresar las observaciones antes de generar el acta.', 'warning');
          return;
      }

      if (!equipo || !equipo.responsable_id) return;
      const user = usuarios.find(u => u.id === equipo.responsable_id);
      if (user) {
          const licsToPrint = formData.releaseLicenses ? userLicenses : [];
          generateReceptionDocument(user, equipo, formData.observaciones, licsToPrint);
          setHasGeneratedDoc(true);
      }
  };

  const handlePrintDisposal = () => {
      if (!formData.observaciones || formData.observaciones.trim().length < 5) {
          Swal.fire('Descripción Insuficiente', 'Debe ingresar una descripción detallada del motivo de la baja antes de generar el acta.', 'warning');
          return;
      }

      if (!equipo) return;
      generateDisposalDocument(equipo, formData.observaciones);
      setHasGeneratedDoc(true);
  };

  /* Fix: Use gemini-3-flash-preview for text improvement tasks */
  const handleAIAssist = async () => {
    if (!formData.observaciones.trim()) return;
    setIsAiLoading(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const promptContext = action === 'BAJA' ? 'justificación técnica de baja de activo' : 'motivo de envío a mantenimiento técnico o recepción';
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Actúa como un técnico de IT. Mejora la redacción de esta ${promptContext} de un equipo informático. Hazla formal, clara y técnica. Corrige errores. Texto: "${formData.observaciones}"`,
        });
        const text = response.text;
        if (text) {
            setFormData((prev: any) => ({ ...prev, observaciones: text.trim() }));
        }
    } catch (error) {
        console.error("AI Error", error);
    } finally {
        setIsAiLoading(false);
    }
  };

  const isRestrictedAction = action === 'RETURN' || action === 'BAJA' || action === 'ASSIGN';

  const getGenerateButtonLabel = () => {
      if (action === 'BAJA') return 'Acta de Baja';
      if (action === 'RETURN') return 'Acta de Recepción';
      if (action === 'ASSIGN') return 'Acta de Entrega';
      return 'Documento';
  };

  const handleGenerateClick = () => {
      if (action === 'BAJA') handlePrintDisposal();
      else if (action === 'RETURN') handlePrintReception();
      else if (action === 'ASSIGN') handlePrintAssignment();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* --- CREATE / EDIT --- */}
      {(action === 'CREATE' || action === 'EDIT') && (
        <>
          {/* Fila 1: Ubicación y Tipo (Definen el contexto) */}
          <div className="grid grid-cols-2 gap-4">
            {(action === 'CREATE' || canEditLocation) ? (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {action === 'CREATE' ? 'Ubicación Inicial' : 'Cambiar Bodega'}
                    </label>
                    <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                        value={formData.ubicacion_id} onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}>
                        {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                    </select>
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación Actual</label>
                    <input type="text" disabled className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        value={formData.ubicacion_nombre || ''} />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo Equipo</label>
                <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                  value={formData.tipo_equipo_id} onChange={e => setFormData({...formData, tipo_equipo_id: Number(e.target.value)})}>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
            </div>
          </div>

          {/* Fila 2: Serie y Código (Serie detona código) */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Número de Serie</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" 
                placeholder="Ingrese serie..."
                value={formData.numero_serie} onChange={e => setFormData({...formData, numero_serie: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-400 mb-1 flex items-center gap-1">
                 Código Activo 
                 {(action === 'CREATE' || canEditLocation) && <RefreshCw className="w-3 h-3 text-blue-500 animate-pulse" />}
              </label>
              <input required type="text" className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-700" 
                placeholder="Autogenerado..."
                value={formData.codigo_activo} 
                onChange={e => setFormData({...formData, codigo_activo: e.target.value})} 
              />
            </div>
          </div>

          {/* Fila 3: Marca y Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marca</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" 
                value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Modelo</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white" 
                value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} />
            </div>
          </div>

          {/* --- NUEVA SECCIÓN: ESPECIFICACIONES TÉCNICAS (SOLO PARA CÓMPUTO) --- */}
          {isComputingEquipment() && (
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm uppercase tracking-wider mb-2">
                    <Database className="w-4 h-4" /> Especificaciones Técnicas
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> Procesador
                        </label>
                        <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                            placeholder="Ej. Intel Core i7-12700"
                            value={formData.procesador} onChange={e => setFormData({...formData, procesador: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                            <Layout className="w-3 h-3" /> Memoria RAM
                        </label>
                        <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                            placeholder="Ej. 16 GB DDR4"
                            value={formData.ram} onChange={e => setFormData({...formData, ram: e.target.value})} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                            <HardDrive className="w-3 h-3" /> Capacidad de Disco
                        </label>
                        <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                            placeholder="Ej. 512 GB o 1 TB"
                            value={formData.disco_capacidad} onChange={e => setFormData({...formData, disco_capacidad: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tipo Disco</label>
                        <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                            value={formData.disco_tipo} onChange={e => setFormData({...formData, disco_tipo: e.target.value})}>
                            <option value="SSD">SSD</option>
                            <option value="NVMe">NVMe</option>
                            <option value="HDD">HDD</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Sistema Operativo
                    </label>
                    <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                        placeholder="Ej. Windows 11 Pro 64-bit"
                        value={formData.sistema_operativo} onChange={e => setFormData({...formData, sistema_operativo: e.target.value})} />
                </div>
            </div>
          )}

          {/* Fila: Detalles Específicos Adicionales */}
          {tipos.find(t => t.id === Number(formData.tipo_equipo_id))?.nombre.toLowerCase().includes('laptop') && (
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Serie Cargador</label>
               <input type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                  value={formData.serie_cargador} onChange={e => setFormData({...formData,serie_cargador: e.target.value})} />
             </div>
          )}

          {/* Fila 5: Compra y Garantía */}
          <div className="grid grid-cols-3 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha Compra</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white"
                   value={formData.fecha_compra} onChange={e => setFormData({...formData, fecha_compra: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Garantía (Años)</label>
                <input type="number" min="0" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white"
                   value={formData.anos_garantia} onChange={e => setFormData({...formData, anos_garantia: Number(e.target.value)})} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor ($)</label>
                <input type="number" step="0.01" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-700 dark:text-white"
                   value={formData.valor_compra} onChange={e => setFormData({...formData, valor_compra: Number(e.target.value)})} />
             </div>
          </div>
        </>
      )}

      {/* --- ASSIGN --- */}
      {action === 'ASSIGN' && (
        <>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuario</label>
              <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                 value={formData.usuario_id} onChange={e => setFormData({...formData, usuario_id: Number(e.target.value)})}>
                 <option value="">Seleccione...</option>
                 {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre_completo}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación Física</label>
              <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                 placeholder="Ej. Oficina Contabilidad Piso 2"
                 value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
           </div>
           
           <div className="relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">Observaciones (Opcional)</label>
              <textarea className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white pr-10" rows={3}
                 value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
              
              {formData.observaciones.length > 5 && (
                 <button
                    type="button"
                    onClick={handleAIAssist}
                    disabled={isAiLoading}
                    className="absolute right-2 bottom-3 p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors disabled:opacity-50"
                    title="Mejorar redacción con AI"
                 >
                    {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 </button>
              )}
           </div>
        </>
      )}

      {/* --- RETURN / DISPOSAL (PART 1: FIELDS) --- */}
      {['RETURN', 'MARK_DISPOSAL', 'BAJA', 'TO_MAINTENANCE'].includes(action || '') && (
        <>
           {['RETURN', 'MARK_DISPOSAL'].includes(action || '') && (
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ubicación (Bodega)</label>
                  <select required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                     value={formData.ubicacion_id} onChange={e => setFormData({...formData, ubicacion_id: Number(e.target.value)})}>
                     {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                  </select>
               </div>
           )}

           <div className="relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {action === 'BAJA' ? 'Justificación Técnica / Motivo' : 'Observaciones / Estado del Equipo'}
              </label>
              <textarea required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white pr-10" rows={3}
                 value={formData.observaciones} 
                 onChange={e => setFormData({...formData, observaciones: e.target.value})} 
                 placeholder={action === 'BAJA' ? 'Explique detalladamente por qué se da de baja...' : ''}
              />
              
              {formData.observaciones.length > 5 && (
                 <button
                    type="button"
                    onClick={handleAIAssist}
                    disabled={isAiLoading}
                    className="absolute right-2 bottom-3 p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors disabled:opacity-50"
                    title="Mejorar redacción con AI"
                 >
                    {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 </button>
              )}
           </div>

           {action === 'RETURN' && (
               <div className="pt-2 mb-2">
                   <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors bg-red-50 dark:bg-red-900/20">
                       <input 
                           type="checkbox" 
                           className="w-4 h-4 text-red-600 rounded focus:ring-red-500 dark:bg-slate-700 dark:border-slate-600"
                           checked={formData.releaseLicenses}
                           onChange={e => setFormData({...formData, releaseLicenses: e.target.checked})}
                       />
                       <div className="flex-1">
                           <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                               <Unplug className="w-4 h-4 text-red-600 dark:text-red-400" />
                               Liberar Licencias Asignadas
                           </div>
                       </div>
                   </label>
               </div>
           )}
        </>
      )}

      {/* --- SECCIÓN DE DOCUMENTOS (RETURN, BAJA y ASSIGN) --- */}
      {isRestrictedAction && (
           <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mt-3">
               <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Documentación Obligatoria</p>
               <div className="flex gap-3 mb-3">
                   <button 
                       type="button" 
                       onClick={handleGenerateClick}
                       className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${hasGeneratedDoc ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                   >
                       <Printer className="w-4 h-4" /> {hasGeneratedDoc ? 'Documento Generado' : `Generar ${getGenerateButtonLabel()}`}
                   </button>
               </div>

               <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subir Acta Firmada (Requerido)</label>
               {!evidenceFile ? (
                   <label 
                       onClick={handleUploadClick}
                       className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg transition-colors ${
                           hasGeneratedDoc 
                               ? 'border-slate-300 dark:border-slate-600 cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700' 
                               : 'border-slate-200 dark:border-slate-700 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 opacity-60'
                       }`}
                   >
                       <div className="flex flex-col items-center justify-center pt-2 pb-2">
                           {hasGeneratedDoc ? <Upload className="w-5 h-5 text-slate-400 mb-1" /> : <Lock className="w-5 h-5 text-slate-400 mb-1" />}
                           <p className="text-xs text-slate-500 dark:text-slate-400">{hasGeneratedDoc ? "PDF o Imagen" : "Genere el acta primero"}</p>
                       </div>
                       <input 
                           type="file" 
                           className="hidden" 
                           accept="image/*,application/pdf" 
                           onChange={handleFileChange} 
                           disabled={!hasGeneratedDoc}
                       />
                   </label>
               ) : (
                   <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                       <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                       <div className="flex-1 min-w-0">
                           <p className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate">{evidenceFile.name}</p>
                       </div>
                       <button type="button" onClick={() => setEvidenceFile(null)} className="text-slate-400 hover:text-red-500">
                           <X className="w-4 h-4" />
                       </button>
                   </div>
               )}
           </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
         <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancelar</button>
         <button 
            type="submit" 
            disabled={loading || (isRestrictedAction && (!hasGeneratedDoc || !evidenceFile))} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         >
            <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'Guardar'}
         </button>
      </div>
    </form>
  );
};