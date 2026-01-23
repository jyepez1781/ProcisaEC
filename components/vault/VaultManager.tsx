
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/mockApi';
import { EntradaBoveda, CategoriaBoveda } from '../../types';
import { 
    ShieldCheck, Plus, Search, Eye, EyeOff, Copy, 
    ExternalLink, Trash2, Edit3, Globe, Server, 
    Network, Database, Layers, Check, MoreVertical
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Modal } from '../common/Modal';

const CATEGORIES: CategoriaBoveda[] = ['Servidor', 'Redes', 'Software', 'Base de Datos', 'Panel Admin', 'Otros'];

const VaultManager: React.FC = () => {
    const [entries, setEntries] = useState<EntradaBoveda[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<EntradaBoveda | null>(null);
    const [formData, setFormData] = useState<Partial<EntradaBoveda>>({
        servicio: '', usuario: '', password_hash: '', url: '', categoria: 'Servidor', notas: ''
    });

    // Visibility state per entry
    const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getBoveda();
            setEntries(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            const matchText = e.servicio.toLowerCase().includes(searchText.toLowerCase()) || 
                             e.usuario.toLowerCase().includes(searchText.toLowerCase()) ||
                             (e.url && e.url.toLowerCase().includes(searchText.toLowerCase()));
            const matchCat = filterCategory === 'ALL' || e.categoria === filterCategory;
            return matchText && matchCat;
        });
    }, [entries, searchText, filterCategory]);

    const handleOpenModal = (entry?: EntradaBoveda) => {
        if (entry) {
            setEditingEntry(entry);
            setFormData(entry);
        } else {
            setEditingEntry(null);
            setFormData({ servicio: '', usuario: '', password_hash: '', url: '', categoria: 'Servidor', notas: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingEntry) {
                await api.updateEntradaBoveda(editingEntry.id, formData);
            } else {
                await api.createEntradaBoveda(formData);
            }
            setIsModalOpen(false);
            loadData();
            Swal.fire('Éxito', 'Registro guardado correctamente', 'success');
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar la credencial', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Eliminar credencial?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar'
        });
        if (result.isConfirmed) {
            await api.deleteEntradaBoveda(id);
            loadData();
        }
    };

    const toggleVisibility = (id: number) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (id: number, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getCategoryIcon = (cat: CategoriaBoveda) => {
        switch(cat) {
            case 'Servidor': return <Server className="w-4 h-4" />;
            case 'Redes': return <Network className="w-4 h-4" />;
            case 'Software': return <Layers className="w-4 h-4" />;
            case 'Base de Datos': return <Database className="w-4 h-4" />;
            case 'Panel Admin': return <Globe className="w-4 h-4" />;
            default: return <ShieldCheck className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-7 h-7 text-green-600" /> Baúl de Claves TI
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Centralización segura de credenciales operativas del departamento.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Nuevo Registro
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 transition-colors">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text"
                        placeholder="Buscar por servicio, usuario o host..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>
                <select 
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                >
                    <option value="ALL">Todas las Categorías</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Grid de Tarjetas */}
            {loading ? (
                <div className="p-12 text-center text-slate-400">Accediendo a la bóveda...</div>
            ) : filteredEntries.length === 0 ? (
                <div className="p-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No se encontraron credenciales que coincidan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEntries.map(entry => (
                        <div key={entry.id} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-blue-600 dark:text-blue-400">
                                        {getCategoryIcon(entry.categoria)}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{entry.categoria}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(entry)} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" title="Editar"><Edit3 className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-slate-400 hover:text-red-500" title="Eliminar"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 truncate" title={entry.servicio}>{entry.servicio}</h3>
                            
                            <div className="space-y-3 flex-1">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Usuario</span>
                                        <button onClick={() => copyToClipboard(entry.id * 1000, entry.usuario)} className="text-slate-400 hover:text-blue-500">
                                            {copiedId === entry.id * 1000 ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
                                        </button>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 break-all">{entry.usuario}</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Contraseña</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleVisibility(entry.id)} className="text-slate-400 hover:text-blue-500">
                                                {visiblePasswords[entry.id] ? <EyeOff className="w-3 h-3"/> : <Eye className="w-3 h-3"/>}
                                            </button>
                                            <button onClick={() => copyToClipboard(entry.id, entry.password_hash)} className="text-slate-400 hover:text-blue-500">
                                                {copiedId === entry.id ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm font-mono tracking-widest text-slate-700 dark:text-slate-200">
                                        {visiblePasswords[entry.id] ? entry.password_hash : '••••••••••••'}
                                    </p>
                                </div>
                            </div>

                            {(entry.url || entry.notas) && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                                    {entry.url && (
                                        <a href={entry.url.startsWith('http') ? entry.url : `http://${entry.url}`} target="_blank" rel="noreferrer" 
                                           className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                            <ExternalLink className="w-3 h-3" /> {entry.url}
                                        </a>
                                    )}
                                    {entry.notas && (
                                        <p className="text-[11px] text-slate-500 italic line-clamp-2" title={entry.notas}>{entry.notas}</p>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 text-[9px] text-slate-400 flex justify-end uppercase tracking-tighter">
                                Actualizado: {entry.fecha_actualizacion}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Registro */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEntry ? "Editar Credencial" : "Nueva Credencial"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Servicio / App</label>
                        <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.servicio} onChange={e => setFormData({...formData, servicio: e.target.value})} placeholder="Ej. Servidor Correo Office 365" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value as any})}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Host / URL</label>
                            <input type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="Ej. 10.0.0.1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuario</label>
                            <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.usuario} onChange={e => setFormData({...formData, usuario: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                            <input required type="text" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                value={formData.password_hash} onChange={e => setFormData({...formData, password_hash: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas adicionales</label>
                        <textarea rows={2} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.notas} onChange={e => setFormData({...formData, notas: e.target.value})} placeholder="Detalles extra..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium">Cancelar</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold">Guardar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default VaultManager;
