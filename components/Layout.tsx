
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Laptop, FileText, LogOut, Bell, User as UserIcon, 
  Menu, X, Settings as SettingsIcon, Building2, Users, Wrench, Lock, 
  ChevronDown, Key, CalendarClock, Mail, Database, Sun, Moon, 
  ChevronLeft, RefreshCw, Menu as MenuIcon, ShieldCheck
} from 'lucide-react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const initData = async () => {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
        await api.verificarAlertasMantenimiento();
        const updatedNotifs = await api.getNotifications();
        setNotifications(updatedNotifs);
    };
    initData();
  }, []);

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

      <main className={`flex-1 ${mainMarginClass} flex flex-col min-h-screen transition-all duration-300 ease-in-out`}>
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm h-16">
          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-blue-900" />}
            </button>
            <div className="relative cursor-pointer group">
              <div className="p-2 rounded-full hover:bg-slate-100 relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-slate-800"></span>}
              </div>
            </div>
            <div className="relative pl-4 border-l border-slate-200 dark:border-slate-700">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.nombre_completo || 'Usuario'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.rol || 'Invitado'}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-800 dark:text-blue-200 font-bold">
                  {user?.nombres.charAt(0)}
                </div>
              </button>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
