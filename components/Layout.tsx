import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Laptop, FileText, LogOut, Bell, User as UserIcon, Menu, X, Settings as SettingsIcon, Building2, Users, Wrench, Lock, ChevronDown, Key, CalendarClock, Mail, Database, Sun, Moon } from 'lucide-react';
import { api } from '../services/mockApi';
import { Usuario, Notificacion } from '../types';
import Swal from 'sweetalert2';
import { useTheme } from '../hooks/useTheme';

interface LayoutProps {
  children: React.ReactNode;
  user: Usuario | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  
  // Header Menu State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPass: '', confirmPass: '' });

  useEffect(() => {
    const initData = async () => {
        // Load initial notifications
        const notifs = await api.getNotifications();
        setNotifications(notifs);

        // Check for automatic maintenance alerts (Simulated Cron Job)
        await api.verificarAlertasMantenimiento();
        
        // Refresh notifications in case alerts generated new ones
        const updatedNotifs = await api.getNotifications();
        setNotifications(updatedNotifs);
    };
    initData();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirmPass) return;
    if (!user) return;

    try {
      await api.changePassword(user.id, passwordForm.newPass);
      Swal.fire({
        title: '¡Éxito!',
        text: 'Contraseña actualizada correctamente',
        icon: 'success',
        confirmButtonColor: '#1e3a8a'
      });
      setIsPasswordModalOpen(false);
      setPasswordForm({ newPass: '', confirmPass: '' });
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#1e3a8a'
      });
    }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive 
              ? 'bg-orange-600 text-white shadow-md font-medium' 
              : 'text-blue-100 hover:bg-blue-800 hover:text-white dark:hover:bg-slate-800'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
        <span>{label}</span>
      </Link>
    );
  };

  const passwordsMatch = passwordForm.newPass === passwordForm.confirmPass;
  const isFormValid = passwordForm.newPass.length > 0 && passwordsMatch;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar Desktop - Azul Institucional (Mantiene identidad en Dark Mode o cambia a Slate oscuro) */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 dark:bg-slate-950 border-r border-blue-800 dark:border-slate-800 fixed h-full z-20 shadow-lg transition-colors">
        <div className="p-6 border-b border-blue-800 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
              <Laptop className="w-6 h-6 text-blue-900 dark:text-orange-500" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              <span className="text-orange-500">I</span>
              <span>nven</span>
              <span className="text-orange-500">T</span>
              <span>ory</span>
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/organizacion" icon={Building2} label="Organización" />
          <NavItem to="/usuarios" icon={Users} label="Usuarios" />
          <NavItem to="/tipos" icon={SettingsIcon} label="Tipos de Equipo" />
          <NavItem to="/equipos" icon={Laptop} label="Equipos" />
          <NavItem to="/mantenimiento" icon={Wrench} label="Mantenimiento" />
          <NavItem to="/planificacion" icon={CalendarClock} label="Planificación" />
          <NavItem to="/licencias" icon={Key} label="Licencias" />
          <NavItem to="/reportes" icon={FileText} label="Reportes" />
          <div className="pt-4 mt-4 border-t border-blue-800 dark:border-slate-800">
            <p className="px-4 text-xs font-semibold text-blue-400 dark:text-slate-500 uppercase tracking-wider mb-2">Sistema</p>
            <NavItem to="/migracion" icon={Database} label="Migración" />
            <NavItem to="/configuracion" icon={Mail} label="Config. Correo" />
          </div>
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-blue-900 dark:bg-slate-950 z-40 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center border-b border-blue-800 dark:border-slate-800">
          <span className="text-2xl font-bold tracking-tight text-white">
              <span className="text-orange-500">I</span>
              <span>nven</span>
              <span className="text-orange-500">T</span>
              <span>ory</span>
          </span>
          <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-blue-200" /></button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto">
          {/* Mismos items que desktop */}
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/organizacion" icon={Building2} label="Organización" />
          <NavItem to="/usuarios" icon={Users} label="Usuarios" />
          <NavItem to="/tipos" icon={SettingsIcon} label="Tipos de Equipo" />
          <NavItem to="/equipos" icon={Laptop} label="Equipos" />
          <NavItem to="/mantenimiento" icon={Wrench} label="Mantenimiento" />
          <NavItem to="/planificacion" icon={CalendarClock} label="Planificación" />
          <NavItem to="/licencias" icon={Key} label="Licencias" />
          <NavItem to="/reportes" icon={FileText} label="Reportes" />
          <NavItem to="/migracion" icon={Database} label="Migración" />
          <NavItem to="/configuracion" icon={Mail} label="Config. Correo" />
        </nav>
        <div className="p-4 border-t border-blue-800 dark:border-slate-800">
             <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 w-full text-blue-100 hover:bg-red-600 hover:text-white rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-200">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm h-16">
          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
          
          <div className="flex-1 md:flex-none"></div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-blue-900" />}
            </button>

            <div className="relative cursor-pointer group">
              <div className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                )}
              </div>
              {/* Dropdown Notifs */}
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 hidden group-hover:block p-2">
                <h4 className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Notificaciones</h4>
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.titulo}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.mensaje}</p>
                  </div>
                )) : <div className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">Sin notificaciones</div>}
              </div>
            </div>
            
            {/* User Profile */}
            <div className="relative pl-4 border-l border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.nombre_completo || 'Usuario'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.rol || 'Invitado'}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-800 dark:text-blue-200 font-bold border border-blue-200 dark:border-blue-800">
                  <UserIcon className="w-5 h-5" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 z-20 py-1">
                    <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700 md:hidden">
                       <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.nombre_completo}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400">{user?.rol}</p>
                    </div>
                    <button 
                        onClick={() => { setIsPasswordModalOpen(true); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Cambiar Contraseña
                    </button>
                    <button 
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
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
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b dark:border-slate-700 pb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Cambiar Contraseña</h3>
                    <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nueva Contraseña</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                            value={passwordForm.newPass}
                            onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar Contraseña</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                            value={passwordForm.confirmPass}
                            onChange={e => setPasswordForm({...passwordForm, confirmPass: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-slate-700">
                        <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium">Cancelar</button>
                        <button 
                          type="submit" 
                          disabled={!isFormValid}
                          className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                            isFormValid 
                              ? 'bg-blue-900 hover:bg-blue-800' 
                              : 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed'
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