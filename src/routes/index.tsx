
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import { ProfileManager } from '@/components/Profile/ProfileManager';
import { ScheduleManager } from '@/components/Schedule/ScheduleManager';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Employees from '@/pages/Employees';
import EmployeeList from '@/components/Employee/EmployeeList'; // Add this import

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout><Dashboard /></DashboardLayout>,
  },
  {
    path: "/employees",
    element: <DashboardLayout><EmployeeList /></DashboardLayout>, // Use EmployeeList here
  },
  {
    path: "/profile",
    element: <DashboardLayout><ProfileManager /></DashboardLayout>,
  },
  {
    path: "/schedule",
    element: <DashboardLayout><ScheduleManager /></DashboardLayout>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
