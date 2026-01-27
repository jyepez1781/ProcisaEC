
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Laptop, FileText, LogOut, Bell, User as UserIcon, 
  Menu, X, Settings as SettingsIcon, Building2, Users, Wrench, Lock, 
  ChevronDown, Key, CalendarClock, Mail, Database, Sun, Moon, 
  ChevronLeft, RefreshCw, Menu as MenuIcon, ShieldCheck, Maximize, Minimize,
  ChevronRight, Save
} from 'lucide-react';
import { api } from '../services/mockApi';
import { Usuario, Notificacion } from '../types';
import Swal from 'sweetalert2';
import { useTheme } from '../hooks/useTheme';
import { Modal } from './common/Modal';

interface LayoutProps {
  children: React.ReactNode;
  user: Usuario | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // User Menu & Password Modal States
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passFormData, setPassFormData] = useState({ old: '', new: '', confirm: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = async () => {
        try {
          const notifs = await api.getNotifications();
          setNotifications(notifs);
          await api.verificarAlertasMantenimiento();
          const updatedNotifs = await api.getNotifications();
          setNotifications(updatedNotifs);
        } catch (error) {
          console.error('Error cargando notificaciones', error);
        }
    };
    initData();

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error al intentar modo pantalla completa: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passFormData.new !== passFormData.confirm) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }
    if (passFormData.new.length < 4) {
      Swal.fire('Error', 'La contraseña debe tener al menos 4 caracteres', 'warning');
      return;
    }

    setIsChangingPass(true);
    try {
      if (user) {
        await api.changePassword(user.id, passFormData.old, passFormData.new, passFormData.confirm);
        Swal.fire('Éxito', 'Contraseña actualizada correctamente', 'success');
        setIsPasswordModalOpen(false);
        setPassFormData({ old: '', new: '', confirm: '' });
      }
    } catch (error: any) {
      Swal.fire('Error', error.message || 'No se pudo cambiar la contraseña', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        title={isSidebarCollapsed ? label : ''}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group relative ${
            isActive 
              ? 'bg-orange-600 text-white shadow-md font-medium' 
              : 'text-blue-100 hover:bg-blue-800 hover:text-white dark:hover:bg-slate-800'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'} shrink-0`} />
        {!isSidebarCollapsed && <span className="whitespace-nowrap overflow-hidden transition-opacity duration-300">{label}</span>}
      </Link>
    );
  };

  const sidebarWidthClass = isSidebarCollapsed ? 'w-20' : 'w-64';
  const mainMarginClass = isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col ${sidebarWidthClass} bg-blue-900 dark:bg-slate-950 border-r border-blue-800 dark:border-slate-800 fixed h-full z-20 shadow-lg transition-all duration-300 ease-in-out`}>
        <div className={`p-4 border-b border-blue-800 dark:border-slate-800 flex ${isSidebarCollapsed ? 'flex-col justify-center gap-4' : 'flex-row justify-between items-center'}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <Laptop className="w-6 h-6 text-blue-900 dark:text-orange-500" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-2xl font-bold tracking-tight text-white whitespace-nowrap">
                <span className="text-orange-500">I</span>nven<span className="text-orange-500">T</span>ory
              </span>
            )}
          </div>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800 transition-colors">
              {isSidebarCollapsed ? <MenuIcon className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/organizacion" icon={Building2} label="Organización" />
          <NavItem to="/usuarios" icon={Users} label="Usuarios" />
          <NavItem to="/tipos" icon={SettingsIcon} label="Tipos de Equipo" />
          <NavItem to="/equipos" icon={Laptop} label="Equipos" />
          <NavItem to="/mantenimiento" icon={Wrench} label="Mantenimiento" />
          <NavItem to="/planificacion" icon={CalendarClock} label="Planificación" />
          <NavItem to="/plan-recambio" icon={RefreshCw} label="Plan de Recambio" />
          <NavItem to="/licencias" icon={Key} label="Licencias" />
          <NavItem to="/baul" icon={ShieldCheck} label="Baúl de Claves" />
          <NavItem to="/reportes" icon={FileText} label="Reportes" />
          <div className={`pt-4 mt-4 border-t border-blue-800 dark:border-slate-800 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
            {!isSidebarCollapsed && <p className="px-4 text-xs font-semibold text-blue-400 dark:text-slate-500 uppercase tracking-wider mb-2">Sistema</p>}
            <NavItem to="/migracion" icon={Database} label="Migración" />
            <NavItem to="/configuracion" icon={Mail} label="Config. Correo" />
          </div>
        </nav>
        <div className="p-4 border-t border-blue-800 dark:border-slate-800">
           <button onClick={onLogout} className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 w-full rounded-lg text-red-300 hover:bg-red-900/40 hover:text-white transition-colors`}>
              <LogOut className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Cerrar Sesión</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 ${mainMarginClass} flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm h-16 transition-colors">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
               {location.pathname === '/' ? 'Vista General' : location.pathname.substring(1).replace('-', ' ')}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Pantalla Completa Toggle */}
            <button 
              onClick={toggleFullscreen} 
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-blue-900" />}
            </button>
            
            <div className="relative cursor-pointer group">
              <div className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 relative transition-colors">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>}
              </div>
            </div>
            
            {/* User Dropdown Profile */}
            <div className="relative pl-2 md:pl-4 border-l border-slate-200 dark:border-slate-700" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.nombre_completo || 'Usuario'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.rol || 'Invitado'}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-800 dark:text-blue-200 font-bold border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-active:scale-95">
                  {user?.nombres?.charAt(0) ?? 'U'}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Actual Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mi Perfil</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.correo}</p>
                  </div>
                  
                  <button 
                    onClick={() => { setIsPasswordModalOpen(true); setIsUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Key className="w-4 h-4" /> Cambiar Contraseña
                  </button>
                  
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Change Password Modal */}
      <Modal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        title="Cambiar Contraseña de Acceso"
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-2">
             <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
               Por seguridad, tu nueva contraseña debe tener al menos 4 caracteres y ser difícil de adivinar.
             </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña Actual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required 
                type="password" 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={passFormData.old}
                onChange={e => setPassFormData({...passFormData, old: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nueva Contraseña</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required 
                type="password" 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={passFormData.new}
                onChange={e => setPassFormData({...passFormData, new: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required 
                type="password" 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={passFormData.confirm}
                onChange={e => setPassFormData({...passFormData, confirm: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button 
              type="button" 
              onClick={() => setIsPasswordModalOpen(false)} 
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isChangingPass}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isChangingPass ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Layout;
