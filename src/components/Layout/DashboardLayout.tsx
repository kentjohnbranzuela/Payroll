
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Calendar, Clock, FileText, User, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="px-6 py-4">
            <h1 className="text-xl font-bold text-white">
              Filipino Payroll
            </h1>
          </SidebarHeader>

          <SidebarContent>
            <div className="space-y-2 px-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => navigate('/dashboard')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Time Clock
              </Button>
              
              {currentUser?.role === 'admin' && (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => navigate('/employees')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Employees
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => navigate('/payroll')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Payroll
                  </Button>
                </>
              )}
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => navigate('/schedule')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => navigate('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </div>
          </SidebarContent>

          <SidebarFooter className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback>{currentUser?.name ? getInitials(currentUser.name) : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">{currentUser?.name}</p>
                  <p className="text-xs text-sidebar-foreground/70">{currentUser?.role}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm border-b p-4 flex items-center justify-between">
            <SidebarTrigger />
            <h2 className="text-lg font-medium">Filipino Payroll & Attendance System</h2>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-PH', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </header>

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
