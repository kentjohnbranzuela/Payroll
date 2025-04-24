
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, UserX } from 'lucide-react';
import { toast } from 'sonner';

export const EmployeeList = () => {
  const { allUsers } = useAuth();
  const employees = allUsers.filter(user => user.role === 'employee');

  const handleAddEmployee = () => {
    toast.info("This feature will be implemented soon!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Employee Management</CardTitle>
          <Button onClick={handleAddEmployee}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Position</th>
                  <th className="py-2 px-4 text-left">Department</th>
                  <th className="py-2 px-4 text-left">Hourly Rate</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b">
                    <td className="py-2 px-4">{employee.name}</td>
                    <td className="py-2 px-4">{employee.position || 'N/A'}</td>
                    <td className="py-2 px-4">{employee.department || 'N/A'}</td>
                    <td className="py-2 px-4">₱{employee.hourlyRate || 0}</td>
                    <td className="py-2 px-4">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        <UserX className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {employees.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No employees found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeList;
