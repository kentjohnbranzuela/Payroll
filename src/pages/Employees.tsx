
import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import EmployeeList from '@/components/Employee/EmployeeList';

const Employees = () => {
  return (
    <DashboardLayout>
      <EmployeeList />
    </DashboardLayout>
  );
};

export default Employees;
