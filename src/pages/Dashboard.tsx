
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import EmployeeDashboard from '@/components/Employee/EmployeeDashboard';
import AdminDashboard from '@/components/Admin/AdminDashboard';

const Dashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <DashboardLayout>
      {currentUser?.role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <EmployeeDashboard />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
