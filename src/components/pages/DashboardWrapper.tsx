import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dashboard } from './Dashboard';
import { OwnerDashboard } from './OwnerDashboard';

export function DashboardWrapper() {
  const { user } = useAuth();
  
  // Показываем OwnerDashboard для Admin, обычный Dashboard для остальных
  if (user?.role === 'Admin') {
    return <OwnerDashboard key="owner-dashboard-v2" />;
  }
  
  return <Dashboard key="dashboard-v2" />;
}

