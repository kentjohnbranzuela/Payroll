
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimeClock from '@/components/TimeClock/TimeClock';
import LeaveRequestComponent from '@/components/Leave/LeaveRequest';
import ScheduleView from '@/components/Schedule/ScheduleView';
import PayrollCalculator from '@/components/Payroll/PayrollCalculator';

export const EmployeeDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  // If no user is logged in, show a message
  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <p>Please log in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Welcome, {currentUser.name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="dashboard-card">
              <h3 className="font-medium mb-2">Position</h3>
              <p className="text-lg">{currentUser.position || 'Employee'}</p>
            </div>
            
            <div className="dashboard-card">
              <h3 className="font-medium mb-2">Department</h3>
              <p className="text-lg">{currentUser.department || 'General'}</p>
            </div>
            
            <div className="dashboard-card">
              <h3 className="font-medium mb-2">Hourly Rate</h3>
              <p className="text-lg">₱{currentUser.hourlyRate || 150}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main tabs */}
      <Tabs defaultValue="time-clock">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="time-clock" className="flex-1">Time Clock</TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1">Schedule</TabsTrigger>
          <TabsTrigger value="leave" className="flex-1">Leave Requests</TabsTrigger>
          <TabsTrigger value="payroll" className="flex-1">Payroll</TabsTrigger>
        </TabsList>
        
        <TabsContent value="time-clock">
          <TimeClock />
        </TabsContent>
        
        <TabsContent value="schedule">
          <ScheduleView />
        </TabsContent>
        
        <TabsContent value="leave">
          <LeaveRequestComponent />
        </TabsContent>
        
        <TabsContent value="payroll">
          <PayrollCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDashboard;
