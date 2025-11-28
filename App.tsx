
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import EquipmentList from './components/equipmentList/EquipmentList';
import EquipmentTypes from './components/equipmentTypes/EquipmentTypes';
import Reports from './components/reports/Reports';
import OrganizationManager from './components/organizationManager/OrganizationManager';
import UserManager from './components/userManager/UserManager';
import MaintenanceManager from './components/maintenanceManager/MaintenanceManager';
import MaintenancePlanning from './components/maintenance/MaintenancePlanning';
import LicenseManager from './components/licenseManager/LicenseManager';
import Settings from './components/settings/Settings';
import Login from './components/login/Login';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, login, logout } = useAuth();

  if (!user) {
    return <Login onLogin={login} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={logout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipos" element={<EquipmentList />} />
          <Route path="/mantenimiento" element={<MaintenanceManager />} />
          <Route path="/planificacion" element={<MaintenancePlanning />} />
          <Route path="/tipos" element={<EquipmentTypes />} />
          <Route path="/usuarios" element={<UserManager currentUser={user} />} />
          <Route path="/organizacion" element={<OrganizationManager />} />
          <Route path="/licencias" element={<LicenseManager />} />
          <Route path="/reportes" element={<Reports />} />
          <Route path="/configuracion" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
