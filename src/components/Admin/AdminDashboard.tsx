
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceRecord, LeaveRequest, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PayrollCalculator from '@/components/Payroll/PayrollCalculator';

export const AdminDashboard: React.FC = () => {
  const { currentUser, allUsers } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{
    [key: string]: AttendanceRecord[];
  }>({});

  useEffect(() => {
    loadAllLeaveRequests();
    loadTodaysAttendance();
  }, []);

  // Load all leave requests for all employees
  const loadAllLeaveRequests = () => {
    const allRequests: LeaveRequest[] = [];
    
    allUsers
      .filter(user => user.role === 'employee')
      .forEach(employee => {
        const savedRequests = localStorage.getItem(`leave_requests_${employee.id}`);
        if (savedRequests) {
          const employeeRequests = JSON.parse(savedRequests) as LeaveRequest[];
          allRequests.push(...employeeRequests);
        }
      });
    
    // Sort by status (pending first) then by start date
    allRequests.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    
    setLeaveRequests(allRequests);
  };

  // Load today's attendance records for all employees
  const loadTodaysAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    const records: { [key: string]: AttendanceRecord[] } = {};
    
    allUsers
      .filter(user => user.role === 'employee')
      .forEach(employee => {
        const savedRecords = localStorage.getItem(`attendance_${employee.id}_${today}`);
        if (savedRecords) {
          records[employee.id] = JSON.parse(savedRecords);
        } else {
          records[employee.id] = [];
        }
      });
    
    setAttendanceRecords(records);
  };

  const handleLeaveAction = (requestId: string, action: 'approve' | 'reject') => {
    // Find the request
    const requestIndex = leaveRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return;
    
    const request = leaveRequests[requestIndex];
    
    // Update the request
    const updatedRequest: LeaveRequest = {
      ...request,
      status: action === 'approve' ? 'approved' : 'rejected',
      approvedBy: currentUser?.id,
      approvedAt: new Date().toISOString()
    };
    
    // Update state
    const updatedRequests = [...leaveRequests];
    updatedRequests[requestIndex] = updatedRequest;
    setLeaveRequests(updatedRequests);
    
    // Update localStorage
    const employeeRequests = JSON.parse(localStorage.getItem(`leave_requests_${request.employeeId}`) || '[]');
    const updatedEmployeeRequests = employeeRequests.map((req: LeaveRequest) => 
      req.id === requestId ? updatedRequest : req
    );
    localStorage.setItem(`leave_requests_${request.employeeId}`, JSON.stringify(updatedEmployeeRequests));
    
    toast.success(`Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
  };

  // Get employee name by ID
  const getEmployeeName = (id: string): string => {
    const employee = allUsers.find(user => user.id === id);
    return employee?.name || 'Unknown Employee';
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs';
      case 'rejected':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs';
    }
  };

  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get employee clock in status
  const getEmployeeStatus = (employeeId: string) => {
    const records = attendanceRecords[employeeId] || [];
    if (records.length === 0) return 'Not clocked in';
    
    const lastRecord = records[records.length - 1];
    if (lastRecord.timeIn && !lastRecord.timeOut) {
      return `Clocked in at ${lastRecord.timeIn}`;
    } else if (lastRecord.timeIn && lastRecord.timeOut) {
      return `Clocked out at ${lastRecord.timeOut}`;
    }
    
    return 'Not clocked in';
  };

  // Render employee cards
  const renderEmployeeCards = () => {
    return allUsers
      .filter(user => user.role === 'employee')
      .map(employee => (
        <Card key={employee.id} className="flex-1 min-w-[300px]">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{employee.name}</h3>
              <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                {employee.position}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span>{employee.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hourly Rate:</span>
                <span>₱{employee.hourlyRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span>{getEmployeeStatus(employee.id)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ));
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="dashboard-card">
              <h3 className="font-medium mb-2">Total Employees</h3>
              <p className="text-2xl font-semibold">
                {allUsers.filter(user => user.role === 'employee').length}
              </p>
            </div>
            
            <div className="dashboard-card">
              <h3 className="font-medium mb-2">Pending Leave Requests</h3>
              <p className="text-2xl font-semibold">
                {leaveRequests.filter(req => req.status === 'pending').length}
              </p>
            </div>
            
            <div className="dashboard-card">
              <h3 className="font-medium mb-2">Clocked In Today</h3>
              <p className="text-2xl font-semibold">
                {Object.values(attendanceRecords).filter(records => 
                  records.length > 0 && records[records.length - 1]?.timeIn && !records[records.length - 1]?.timeOut
                ).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="employees">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="employees" className="flex-1">Employees</TabsTrigger>
          <TabsTrigger value="leave-requests" className="flex-1">Leave Requests</TabsTrigger>
          <TabsTrigger value="payroll" className="flex-1">Payroll</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees">
          <div className="flex flex-wrap gap-4">
            {renderEmployeeCards()}
          </div>
        </TabsContent>
        
        <TabsContent value="leave-requests">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {leaveRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-2 text-left">Employee</th>
                        <th className="py-2 px-2 text-left">Type</th>
                        <th className="py-2 px-2 text-left">From</th>
                        <th className="py-2 px-2 text-left">To</th>
                        <th className="py-2 px-2 text-left">Status</th>
                        <th className="py-2 px-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.map(request => (
                        <tr key={request.id} className="border-b">
                          <td className="py-2 px-2">
                            {getEmployeeName(request.employeeId)}
                          </td>
                          <td className="py-2 px-2 capitalize">
                            {request.type}
                          </td>
                          <td className="py-2 px-2">
                            {formatDateDisplay(request.startDate)}
                          </td>
                          <td className="py-2 px-2">
                            {formatDateDisplay(request.endDate)}
                          </td>
                          <td className="py-2 px-2">
                            <span className={getStatusBadgeClass(request.status)}>
                              {request.status}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            {request.status === 'pending' ? (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                  onClick={() => handleLeaveAction(request.id, 'approve')}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                  onClick={() => handleLeaveAction(request.id, 'reject')}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">
                                {request.approvedBy ? `By ${getEmployeeName(request.approvedBy)}` : 'Processed'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No leave requests found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payroll">
          <PayrollCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
