
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { PackagePlus, AlertCircle, AlertTriangle, Unplug } from 'lucide-react';
import { Licencia, TipoLicencia, Usuario } from '../../types';

// --- CREATE TYPE MODAL ---
interface CreateTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
}

export const CreateTypeModal: React.FC<CreateTypeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    nombre: '', proveedor: '', descripcion: '', stockInicial: 0,
    fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await onSubmit(form)) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Tipo de Licencia">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
          <input required type="text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 dark:text-white"
            value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Microsoft 365 Business" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Proveedor</label>
          <input required type="text" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 dark:text-white"
            value={form.proveedor} onChange={e => setForm({ ...form, proveedor: e.target.value })} placeholder="Ej. Microsoft" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
          <textarea className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 dark:text-white" rows={2}
            value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <PackagePlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stock Inicial (Opcional)</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Cantidad</label>
              <input type="number" min="0" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 dark:text-white"
                value={form.stockInicial} onChange={e => setForm({ ...form, stockInicial: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Vencimiento</label>
              <input type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 dark:text-white"
                disabled={form.stockInicial <= 0} required={form.stockInicial > 0}
                value={form.fechaVencimiento} onChange={e => setForm({ ...form, fechaVencimiento: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancelar</button>
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">Crear</button>
        </div>
      </form>
    </Modal>
  );
};

// --- ADD STOCK MODAL ---
interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoId: number;
  onSubmit: (tipoId: number, cantidad: number, fecha: string) => Promise<boolean>;
}

export const StockModal: React.FC<StockModalProps> = ({ isOpen, onClose, tipoId, onSubmit }) => {
  const [form, setForm] = useState({
    cantidad: 1,
    fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await onSubmit(tipoId, form.cantidad, form.fechaVencimiento)) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Stock" maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label>
          <input required type="number" min="1" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 dark:text-white"
            value={form.cantidad} onChange={e => setForm({ ...form, cantidad: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha Vencimiento</label>
          <input required type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 dark:text-white"
            value={form.fechaVencimiento} onChange={e => setForm({ ...form, fechaVencimiento: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancelar</button>
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">Agregar</button>
        </div>
      </form>
    </Modal>
  );
};

// --- ASSIGN MODAL ---
interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: Licencia | null;
  usuarios: Usuario[];
  onAssign: (licId: number, userId: number, tipoId: number) => Promise<boolean>;
}

export const AssignModal: React.FC<AssignModalProps> = ({ isOpen, onClose, license, usuarios, onAssign }) => {
  const [userId, setUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
      setUserId('');
      setError(null);
  }, [isOpen, license]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!license || !userId) return;
    setError(null);

    try {
      await onAssign(license.id, Number(userId), license.tipo_id);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isOpen || !license) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Licencia">
       <div className="mb-6 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800">
          <p className="text-sm font-medium text-purple-800 dark:text-purple-300">{license.tipo_nombre}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-mono mt-1">ID: {license.clave}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuario Destino</label>
          <select required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 dark:text-white"
            value={userId} onChange={e => { setUserId(e.target.value); setError(null); }}>
            <option value="">Seleccionar Usuario...</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.nombre_completo} - {u.departamento_nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">Cancelar</button>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Asignar</button>
        </div>
      </form>
    </Modal>
  );
};

// --- UNASSIGN MODAL ---
interface UnassignModalProps {
    isOpen: boolean;
    onClose: () => void;
    license: Licencia | null;
    onConfirm: (licId: number) => Promise<boolean>;
}

export const UnassignModal: React.FC<UnassignModalProps> = ({ isOpen, onClose, license, onConfirm }) => {
    if (!isOpen || !license) return null;

    const handleConfirm = async () => {
        const success = await onConfirm(license.id);
        if (success) onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Liberar Licencia" maxWidth="max-w-md">
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Liberar Licencia</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                        ¿Estás seguro de que deseas liberar esta licencia asignada a <span className="font-semibold text-slate-800 dark:text-white">{license.usuario_nombre}</span>?
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                        El usuario perderá el acceso asociado a esta licencia de forma inmediata.
                    </p>
                </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
                    Cancelar
                </button>
                <button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Unplug className="w-4 h-4" /> Confirmar Liberación
                </button>
            </div>
        </Modal>
    );
};
