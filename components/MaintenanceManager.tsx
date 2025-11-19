
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';
import { Equipo, EstadoEquipo } from '../types';
import { Wrench, CheckCircle, AlertTriangle, X, Save, ArrowRight, User } from 'lucide-react';

const MaintenanceManager: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [formData, setFormData] = useState({
    tipo: 'Correctivo' as 'Correctivo' | 'Preventivo',
    proveedor: '',
    costo: 0,
    descripcion: '',
    accion_final: 'DISPONIBLE' as 'DISPONIBLE' | 'BAJA'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Get all equipment and filter client-side for EN_MANTENIMIENTO
    const allEquipos = await api.getEquipos();
    setEquipos(allEquipos.filter(e => e.estado === EstadoEquipo.EN_MANTENIMIENTO));
    setLoading(false);
  };

  const handleOpenModal = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setFormData({
      tipo: 'Correctivo',
      proveedor: '',
      costo: 0,
      descripcion: '',
      accion_final: 'DISPONIBLE'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipo) return;

    try {
      await api.finalizarMantenimiento(
        selectedEquipo.id, 
        {
          tipo: formData.tipo,
          proveedor: formData.proveedor,
          costo: formData.costo,
          descripcion: formData.descripcion
        },
        formData.accion_final
      );
      setSelectedEquipo(null);
      loadData();
      alert("Mantenimiento registrado correctamente.");
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Wrench className="w-6 h-6 text-amber-600" /> 
          Gestión de Mantenimiento
        </h2>
        <div className="text-sm text-slate-500">
          Equipos en taller: <span className="font-bold text-slate-800">{equipos.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Cargando equipos en mantenimiento...</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Equipo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Responsable (Previo)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase">Problema Reportado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-amber-800 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {equipos.map(e => (
                <tr key={e.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{e.codigo_activo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{e.marca} {e.modelo}</div>
                    <div className="text-xs text-slate-500">{e.tipo_nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                     {e.responsable_nombre ? (
                        <div className="flex items-center gap-1 text-blue-600">
                            <User className="w-3 h-3" /> {e.responsable_nombre}
                        </div>
                     ) : <span className="text-slate-400 italic">Sin asignar</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{e.observaciones}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleOpenModal(e)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-600 text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Finalizar
                    </button>
                  </td>
                </tr>
              ))}
              {equipos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-12 h-12 mb-2 text-green-100" />
                        <p>No hay equipos pendientes de mantenimiento.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Finalize Modal */}
      {selectedEquipo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEquipo(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Finalizar Mantenimiento</h3>
                <p className="text-sm text-slate-500">Equipo: {selectedEquipo.codigo_activo}</p>
              </div>
              <button onClick={() => setSelectedEquipo(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Mantenimiento</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value as any})}
                  >
                    <option value="Correctivo">Correctivo</option>
                    <option value="Preventivo">Preventivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Costo ($)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.costo}
                    onChange={e => setFormData({...formData, costo: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Taller Interno, HP Services..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.proveedor}
                  onChange={e => setFormData({...formData, proveedor: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Detalle del Trabajo</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Describe qué reparaciones o cambios se realizaron..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-sm font-semibold text-slate-800 mb-3">Resolución Final</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                    <input 
                      type="radio" 
                      name="accion_final" 
                      value="DISPONIBLE"
                      checked={formData.accion_final === 'DISPONIBLE'}
                      onChange={() => setFormData({...formData, accion_final: 'DISPONIBLE'})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Equipo Operativo
                      </div>
                      <p className="text-xs text-slate-500">
                        {selectedEquipo.responsable_id 
                           ? `El equipo retornará al usuario: ${selectedEquipo.responsable_nombre}`
                           : `El equipo retornará a Bodega IT (Disponible)`
                        }
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-red-400 transition-colors">
                    <input 
                      type="radio" 
                      name="accion_final" 
                      value="BAJA"
                      checked={formData.accion_final === 'BAJA'}
                      onChange={() => setFormData({...formData, accion_final: 'BAJA'})}
                      className="w-4 h-4 text-red-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Equipo Irreparable / Obsoleto
                      </div>
                      <p className="text-xs text-slate-500">Dar de baja definitiva del inventario</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setSelectedEquipo(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <Save className="w-4 h-4" /> Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManager;
