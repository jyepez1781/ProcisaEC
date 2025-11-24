
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EquipmentList from './components/EquipmentList';
import EquipmentTypes from './components/EquipmentTypes';
import Reports from './components/Reports';
import OrganizationManager from './components/OrganizationManager';
import UserManager from './components/UserManager';
import MaintenanceManager from './components/MaintenanceManager';
import LicenseManager from './components/LicenseManager';
import Login from './components/Login';
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
          <Route path="/tipos" element={<EquipmentTypes />} />
          <Route path="/usuarios" element={<UserManager currentUser={user} />} />
          <Route path="/organizacion" element={<OrganizationManager />} />
          <Route path="/licencias" element={<LicenseManager />} />
          <Route path="/reportes" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
