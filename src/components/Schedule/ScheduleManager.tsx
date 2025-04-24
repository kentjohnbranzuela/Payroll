
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScheduleShift } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export const ScheduleManager = () => {
  const { currentUser, allUsers } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [schedules, setSchedules] = useState<ScheduleShift[]>([]);
  
  useEffect(() => {
    loadSchedules();
  }, [selectedDate]);

  const loadSchedules = () => {
    const savedSchedules = localStorage.getItem(`schedules_${selectedDate}`);
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  };

  const getEmployeeName = (id: string) => {
    const employee = allUsers.find(user => user.id === id);
    return employee?.name || 'Unknown';
  };

  const handleAddShift = () => {
    if (!currentUser?.id) return;
    
    const newShift: ScheduleShift = {
      id: Math.random().toString(36).substring(7),
      employeeId: currentUser.id,
      date: selectedDate,
      startTime: '09:00',
      endTime: '17:00',
    };

    const updatedSchedules = [...schedules, newShift];
    setSchedules(updatedSchedules);
    localStorage.setItem(`schedules_${selectedDate}`, JSON.stringify(updatedSchedules));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full max-w-xs border rounded-md p-2"
            />
          </div>

          {schedules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left">Employee</th>
                    <th className="py-2 px-2 text-left">Date</th>
                    <th className="py-2 px-2 text-left">Start Time</th>
                    <th className="py-2 px-2 text-left">End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((shift) => (
                    <tr key={shift.id} className="border-b">
                      <td className="py-2 px-2">{getEmployeeName(shift.employeeId)}</td>
                      <td className="py-2 px-2">{shift.date}</td>
                      <td className="py-2 px-2">{shift.startTime}</td>
                      <td className="py-2 px-2">{shift.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No schedules found for this date.</p>
            </div>
          )}

          {currentUser?.role === 'admin' && (
            <Button onClick={handleAddShift} className="mt-4">
              Add Shift
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleManager;
