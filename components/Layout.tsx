
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Laptop, FileText, LogOut, Bell, User as UserIcon, Menu, X, Settings, Building2, Users, Wrench, Lock, ChevronDown, Key } from 'lucide-react';
import { api } from '../services/mockApi';
import { Usuario, Notificacion } from '../types';
import Swal from 'sweetalert2';

interface LayoutProps {
  children: React.ReactNode;
  user: Usuario | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  
  // Header Menu State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPass: '', confirmPass: '' });

  useEffect(() => {
    api.getNotifications().then(setNotifications);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      // Although button is disabled, keep this as safety
      return;
    }
    if (!user) return;

    try {
      await api.changePassword(user.id, passwordForm.newPass);
      Swal.fire({
        title: '¡Éxito!',
        text: 'Contraseña actualizada correctamente',
        icon: 'success',
        confirmButtonColor: '#2563eb'
      });
      setIsPasswordModalOpen(false);
      setPasswordForm({ newPass: '', confirmPass: '' });
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#2563eb'
      });
    }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
        <span>{label}</span>
      </Link>
    );
  };

  const passwordsMatch = passwordForm.newPass === passwordForm.confirmPass;
  const isFormValid = passwordForm.newPass.length > 0 && passwordsMatch;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-orange-500">I</span>
              <span className="text-blue-600">nven</span>
              <span className="text-orange-500">T</span>
              <span className="text-blue-600">ory</span>
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/organizacion" icon={Building2} label="Organización" />
          <NavItem to="/usuarios" icon={Users} label="Usuarios" />
          <NavItem to="/tipos" icon={Settings} label="Tipos de Equipo" />
          <NavItem to="/equipos" icon={Laptop} label="Equipos" />
          <NavItem to="/mantenimiento" icon={Wrench} label="Mantenimiento" />
          <NavItem to="/licencias" icon={Key} label="Licencias" />
          <NavItem to="/reportes" icon={FileText} label="Reportes" />
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-40 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center border-b border-slate-100">
          <span className="text-2xl font-bold tracking-tight">
              <span className="text-orange-500">I</span>
              <span className="text-blue-600">nven</span>
              <span className="text-orange-500">T</span>
              <span className="text-blue-600">ory</span>
          </span>
          <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-slate-500" /></button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/organizacion" icon={Building2} label="Organización" />
          <NavItem to="/usuarios" icon={Users} label="Usuarios" />
          <NavItem to="/tipos" icon={Settings} label="Tipos de Equipo" />
          <NavItem to="/equipos" icon={Laptop} label="Equipos" />
          <NavItem to="/mantenimiento" icon={Wrench} label="Mantenimiento" />
          <NavItem to="/licencias" icon={Key} label="Licencias" />
          <NavItem to="/reportes" icon={FileText} label="Reportes" />
        </nav>
        <div className="p-4 border-t border-slate-100">
             <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          
          <div className="flex-1 md:flex-none"></div>

          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group">
              <div className="p-2 rounded-full hover:bg-slate-100 relative">
                <Bell className="w-5 h-5 text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              {/* Simple Dropdown for Notifs */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 hidden group-hover:block p-2">
                <h4 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Notificaciones</h4>
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 hover:bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-800">{n.titulo}</p>
                    <p className="text-xs text-slate-500 mt-1">{n.mensaje}</p>
                  </div>
                )) : <div className="p-4 text-sm text-slate-500 text-center">Sin notificaciones</div>}
              </div>
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative pl-4 border-l border-slate-200">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-800">{user?.nombre_completo || 'Usuario'}</p>
                  <p className="text-xs text-slate-500">{user?.rol || 'Invitado'}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <UserIcon className="w-5 h-5" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-slate-50 md:hidden">
                       <p className="text-sm font-medium text-slate-800">{user?.nombre_completo}</p>
                       <p className="text-xs text-slate-500">{user?.rol}</p>
                    </div>
                    <button 
                        onClick={() => { setIsPasswordModalOpen(true); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Cambiar Contraseña
                    </button>
                    <button 
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsPasswordModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-xl font-bold text-slate-800">Cambiar Contraseña</h3>
                    <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={passwordForm.newPass}
                            onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                        <input 
                            type="password" 
                            required 
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
                              !passwordsMatch && passwordForm.confirmPass 
                                ? 'border-red-300 focus:ring-red-200' 
                                : 'border-slate-300 focus:ring-blue-500'
                            }`}
                            value={passwordForm.confirmPass}
                            onChange={e => setPasswordForm({...passwordForm, confirmPass: e.target.value})}
                        />
                        {!passwordsMatch && passwordForm.confirmPass && (
                          <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
                        <button 
                          type="submit" 
                          disabled={!isFormValid}
                          className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                            isFormValid 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-slate-300 cursor-not-allowed'
                          }`}
                        >
                          Actualizar
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
