
import React, { useState, useEffect } from 'react';
import { Save, Mail, Info, Plus, X } from 'lucide-react';
import { api } from '../../services/mockApi';
import { EmailConfig } from '../../types';
import Swal from 'sweetalert2';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<EmailConfig>({
    remitente: '',
    correos_copia: [],
    notificar_asignacion: true,
    notificar_mantenimiento: true,
    dias_anticipacion_alerta: 15,
    smtp_host: '',
    smtp_port: ''
  });

  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.getEmailConfig();
      setConfig(data);
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'No se pudo cargar la configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    if (!validateEmail(newEmail)) {
      Swal.fire('Error', 'Formato de correo inválido', 'error');
      return;
    }
    if (config.correos_copia.includes(newEmail.trim())) {
      setNewEmail('');
      return;
    }

    setConfig(prev => ({
      ...prev,
      correos_copia: [...prev.correos_copia, newEmail.trim()]
    }));
    setNewEmail('');
  };

  const removeEmail = (email: string) => {
    setConfig(prev => ({
      ...prev,
      correos_copia: prev.correos_copia.filter(e => e !== email)
    }));
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveEmailConfig(config);
      Swal.fire({
        title: 'Guardado',
        text: 'La configuración de correo ha sido actualizada.',
        icon: 'success',
        confirmButtonColor: '#2563eb'
      });
    } catch (e) {
      Swal.fire('Error', 'Error al guardar la configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Cargando configuración...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
          <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Configuración de Correo</h2>
          <p className="text-slate-500 dark:text-slate-400">Administra las notificaciones y copias de seguridad de los envíos.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Información General
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Estos correos se enviarán automáticamente a los usuarios responsables cuando ocurran eventos importantes.
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Remitente</label>
               <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                  placeholder="Ej. Sistema InvenTory"
                  value={config.remitente}
                  onChange={e => setConfig({...config, remitente: e.target.value})}
               />
               <p className="text-xs text-slate-400 mt-1">Nombre que aparecerá en la bandeja de entrada.</p>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Servidor SMTP (Host)</label>
               <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                  value={config.smtp_host || ''}
                  onChange={e => setConfig({...config, smtp_host: e.target.value})}
                  placeholder="Ej. smtp.office365.com"
               />
             </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Destinatarios en Copia (CC)</label>
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
               Estas direcciones recibirán una copia de <strong>todos</strong> los correos enviados. Si un equipo no tiene usuario asignado, el correo se enviará únicamente a estas direcciones.
             </p>
             
             <div className="flex gap-2 mb-3">
                <input 
                  type="email" 
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                  placeholder="ingrese.correo@empresa.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
                />
                <button 
                  onClick={handleAddEmail}
                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
             </div>

             <div className="flex flex-wrap gap-2">
                {config.correos_copia.map(email => (
                  <span key={email} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-100 dark:border-blue-800">
                    {email}
                    <button onClick={() => removeEmail(email)} className="hover:text-red-500 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {config.correos_copia.length === 0 && (
                  <span className="text-slate-400 text-sm italic">Sin correos en copia.</span>
                )}
             </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
             <h4 className="font-medium text-slate-800 dark:text-white mb-4">Eventos de Notificación</h4>
             <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                    checked={config.notificar_asignacion}
                    onChange={e => setConfig({...config, notificar_asignacion: e.target.checked})}
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Asignación de Equipos</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Enviar correo cuando un equipo es asignado a un usuario.</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                    checked={config.notificar_mantenimiento}
                    onChange={e => setConfig({...config, notificar_mantenimiento: e.target.checked})}
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Finalización de Mantenimiento</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Enviar correo cuando un mantenimiento finaliza y el equipo retorna al usuario.</div>
                  </div>
                </label>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Anticipación de Alerta (Mantenimiento Programado)</label>
                   <div className="flex items-center gap-3">
                       <input 
                          type="number" 
                          min="1"
                          max="30"
                          className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center bg-white dark:bg-slate-700 dark:text-white"
                          value={config.dias_anticipacion_alerta || 15}
                          onChange={e => setConfig({...config, dias_anticipacion_alerta: Number(e.target.value)})}
                       />
                       <span className="text-sm text-slate-600 dark:text-slate-400">días antes del inicio del mes.</span>
                   </div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      El sistema enviará un correo automático a los usuarios que tengan equipos en el plan de mantenimiento del mes siguiente.
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
           <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
           >
             <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Configuración'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
