
import React, { useState } from 'react';
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
import { Usuario } from './types';

const App: React.FC = () => {
  // Initialize user state from localStorage to persist session
  const [user, setUser] = useState<Usuario | null>(() => {
    const savedUser = localStorage.getItem('app_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Error parsing user from storage", e);
      return null;
    }
  });

  const handleLogin = (u: Usuario) => {
    localStorage.setItem('app_user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('app_user');
    localStorage.removeItem('auth_token'); // Clear API token if exists
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
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
