
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScheduleShift } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// Generate a week of dates starting from a given date
const generateWeekDates = (startDate: Date): Date[] => {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Mock schedule data
const generateMockSchedule = (employeeId: string, weekStart: Date): ScheduleShift[] => {
  const shifts: ScheduleShift[] = [];
  const weekDates = generateWeekDates(weekStart);
  
  // Generate random shifts for the week (excluding Sunday)
  weekDates.forEach((date, index) => {
    // Skip Sunday (index 0 if week starts on Sunday)
    if (date.getDay() !== 0) {
      shifts.push({
        id: `shift-${employeeId}-${formatDate(date)}`,
        employeeId,
        date: formatDate(date),
        startTime: '08:00:00',
        endTime: '17:00:00',
      });
    }
  });
  
  return shifts;
};

export const ScheduleView: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    // Set to previous Sunday
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  });
  const [schedule, setSchedule] = useState<ScheduleShift[]>([]);
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Try to load schedule from localStorage
    const savedSchedule = localStorage.getItem(`schedule_${currentUser.id}_${formatDate(currentWeekStart)}`);
    
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    } else {
      // Generate mock schedule if not found
      const mockSchedule = generateMockSchedule(currentUser.id, currentWeekStart);
      setSchedule(mockSchedule);
      
      // Save to localStorage
      localStorage.setItem(
        `schedule_${currentUser.id}_${formatDate(currentWeekStart)}`, 
        JSON.stringify(mockSchedule)
      );
    }
  }, [currentUser, currentWeekStart]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const formatShiftTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Week of {currentWeekStart.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => navigateWeek('prev')}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Previous
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {generateWeekDates(currentWeekStart).map((date) => (
                    <th key={date.toISOString()} className="py-2 px-4 text-center border bg-gray-50">
                      <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="font-normal text-sm">{date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {generateWeekDates(currentWeekStart).map((date) => {
                    const dateStr = formatDate(date);
                    const shift = schedule.find(s => s.date === dateStr);
                    
                    return (
                      <td key={dateStr} className="py-4 px-2 text-center border h-32 align-top">
                        {shift ? (
                          <div className="bg-blue-100 p-2 rounded text-left h-full">
                            <div className="font-medium">Work Shift</div>
                            <div className="text-sm mt-1">
                              {formatShiftTime(shift.startTime)} - {formatShiftTime(shift.endTime)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400">Day Off</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedule
              .filter(shift => new Date(shift.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3)
              .map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {new Date(shift.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatShiftTime(shift.startTime)} - {formatShiftTime(shift.endTime)}
                    </div>
                  </div>
                  <div className="text-blue-600 font-medium">
                    {new Date(shift.date).toLocaleDateString('en-US', { 
                      month: 'numeric', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              ))}
              
            {schedule.filter(shift => new Date(shift.date) >= new Date()).length === 0 && (
              <div className="text-center p-4 text-muted-foreground">
                No upcoming shifts scheduled.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleView;
