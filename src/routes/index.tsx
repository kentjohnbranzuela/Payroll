
import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import { ProfileManager } from '@/components/Profile/ProfileManager';
import { ScheduleManager } from '@/components/Schedule/ScheduleManager';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/profile",
    element: <ProfileManager />,
  },
  {
    path: "/schedule",
    element: <ScheduleManager />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
