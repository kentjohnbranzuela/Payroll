
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime, getPhilippinesTime, generateMockId } from '@/lib/utils';
import { AttendanceRecord } from '@/lib/types';
import { toast } from 'sonner';

export const TimeClock: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date>(getPhilippinesTime());
  const [clockedIn, setClockedIn] = useState<boolean>(false);
  const [lastRecord, setLastRecord] = useState<Partial<AttendanceRecord> | null>(null);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getPhilippinesTime());
    }, 1000);

    // Check localStorage for today's records
    const today = formatDate(getPhilippinesTime());
    const savedRecords = localStorage.getItem(`attendance_${currentUser?.id}_${today}`);
    
    if (savedRecords) {
      const records = JSON.parse(savedRecords) as AttendanceRecord[];
      setTodayRecords(records);
      
      // Check if user is currently clocked in
      const lastRec = records[records.length - 1];
      if (lastRec && !lastRec.timeOut) {
        setClockedIn(true);
        setLastRecord(lastRec);
      }
    }

    return () => clearInterval(timer);
  }, [currentUser?.id]);

  const handleClockIn = () => {
    if (!currentUser) return;
    
    const now = getPhilippinesTime();
    const timeInStr = formatTime(now);
    const today = formatDate(now);
    
    const newRecord: AttendanceRecord = {
      id: generateMockId(),
      employeeId: currentUser.id,
      date: today,
      timeIn: timeInStr,
      status: 'present',
    };
    
    // Update state
    setClockedIn(true);
    setLastRecord(newRecord);
    
    // Update local storage
    const updatedRecords = [...todayRecords, newRecord];
    setTodayRecords(updatedRecords);
    localStorage.setItem(`attendance_${currentUser.id}_${today}`, JSON.stringify(updatedRecords));
    
    toast.success('You have successfully clocked in!');
  };

  const handleClockOut = () => {
    if (!currentUser || !lastRecord) return;
    
    const now = getPhilippinesTime();
    const timeOutStr = formatTime(now);
    const today = formatDate(now);
    
    // Update the last record with clock out time
    const updatedRecord: AttendanceRecord = {
      ...lastRecord as AttendanceRecord,
      timeOut: timeOutStr,
      hoursWorked: lastRecord.timeIn 
        ? Number(((now.getTime() - new Date(`${today}T${lastRecord.timeIn}`).getTime()) / (1000 * 60 * 60)).toFixed(2))
        : 0
    };
    
    // Update state
    setClockedIn(false);
    setLastRecord(null);
    
    // Update local storage
    const updatedRecords = todayRecords.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    
    setTodayRecords(updatedRecords);
    localStorage.setItem(`attendance_${currentUser.id}_${today}`, JSON.stringify(updatedRecords));
    
    toast.success('You have successfully clocked out!');
  };

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Time Clock</CardTitle>
          <CardDescription>Record your work hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="text-4xl font-bold mb-2">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true,
                timeZone: 'Asia/Manila'
              })}
            </div>
            <div className="text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'Asia/Manila'
              })}
            </div>
          </div>

          <div className="flex justify-center space-x-8">
            {!clockedIn ? (
              <button 
                onClick={handleClockIn} 
                className="time-clock-button time-in-button animate-pulse-scale"
              >
                <span className="text-2xl">IN</span>
                <span className="mt-2">Clock In</span>
              </button>
            ) : (
              <button 
                onClick={handleClockOut} 
                className="time-clock-button time-out-button animate-pulse-scale"
              >
                <span className="text-2xl">OUT</span>
                <span className="mt-2">Clock Out</span>
              </button>
            )}
          </div>

          {clockedIn && lastRecord?.timeIn && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p>You clocked in at <strong>{lastRecord.timeIn}</strong></p>
              <p className="text-sm text-muted-foreground">Don't forget to clock out at the end of your shift.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {todayRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">#</th>
                    <th className="py-2 px-4 text-left">Time In</th>
                    <th className="py-2 px-4 text-left">Time Out</th>
                    <th className="py-2 px-4 text-left">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {todayRecords.map((record, index) => (
                    <tr key={record.id} className="border-b">
                      <td className="py-2 px-4">{index + 1}</td>
                      <td className="py-2 px-4">{record.timeIn}</td>
                      <td className="py-2 px-4">{record.timeOut || "-"}</td>
                      <td className="py-2 px-4">{record.hoursWorked?.toFixed(2) || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimeClock;
