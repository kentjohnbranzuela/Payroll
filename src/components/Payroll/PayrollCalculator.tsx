import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  AttendanceRecord, 
  EmployeePosition, 
  PayrollItem, 
  User 
} from '@/lib/types';
import { 
  calculateHours, 
  calculatePagIbig, 
  calculatePhilHealth, 
  calculateSSS, 
  calculateWithholdingTax,
  formatDate,
  generateMockId,
  getHourlyRateByPosition 
} from '@/lib/utils';
import { toast } from 'sonner';

const getCurrentPayPeriod = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  
  let startDate: Date, endDate: Date;
  
  if (day <= 15) {
    startDate = new Date(year, month, 1);
    endDate = new Date(year, month, 15);
  } else {
    startDate = new Date(year, month, 16);
    endDate = new Date(year, month + 1, 0);
  }
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate)
  };
};

const generatePayPeriods = () => {
  const periods = [];
  const today = new Date();
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);
    
    periods.push({
      label: `${date.toLocaleDateString('en-US', { month: 'short' })} 1-15, ${date.getFullYear()}`,
      value: `${formatDate(new Date(date.getFullYear(), date.getMonth(), 1))}_${formatDate(new Date(date.getFullYear(), date.getMonth(), 15))}`
    });
    
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    periods.push({
      label: `${date.toLocaleDateString('en-US', { month: 'short' })} 16-${lastDay}, ${date.getFullYear()}`,
      value: `${formatDate(new Date(date.getFullYear(), date.getMonth(), 16))}_${formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 0))}`
    });
  }
  
  return periods;
};

export const PayrollCalculator: React.FC = () => {
  const { currentUser, allUsers } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string>(currentUser?.role === 'admin' ? '' : (currentUser?.id || ''));
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [payrollData, setPayrollData] = useState<PayrollItem | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const payPeriods = generatePayPeriods();
  
  useEffect(() => {
    if (!selectedPeriod) {
      const currentPeriod = getCurrentPayPeriod();
      setSelectedPeriod(`${currentPeriod.start}_${currentPeriod.end}`);
    }
  }, [selectedPeriod]);
  
  useEffect(() => {
    if (selectedEmployee && selectedPeriod) {
      loadPayrollData();
    }
  }, [selectedEmployee, selectedPeriod]);
  
  const loadAttendanceRecords = (employeeId: string, start: string, end: string): AttendanceRecord[] => {
    let records: AttendanceRecord[] = [];
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = formatDate(currentDate);
      const key = `attendance_${employeeId}_${dateString}`;
      const savedRecords = localStorage.getItem(key);
      
      if (savedRecords) {
        records = [...records, ...JSON.parse(savedRecords)];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return records;
  };
  
  const loadPayrollData = () => {
    if (!selectedEmployee || !selectedPeriod) {
      return;
    }
    
    const [startDate, endDate] = selectedPeriod.split('_');
    
    const existingPayroll = localStorage.getItem(`payroll_${selectedEmployee}_${selectedPeriod}`);
    if (existingPayroll) {
      setPayrollData(JSON.parse(existingPayroll));
      return;
    }
    
    const records = loadAttendanceRecords(selectedEmployee, startDate, endDate);
    setAttendanceRecords(records);
    
    if (records.length > 0) {
      calculatePayroll(records, startDate, endDate);
    }
  };
  
  const calculatePayroll = (records: AttendanceRecord[], startDate: string, endDate: string) => {
    const employee = allUsers.find(user => user.id === selectedEmployee);
    if (!employee) return;
    
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    
    records.forEach(record => {
      if (record.timeIn && record.timeOut) {
        const hoursWorked = record.hoursWorked || calculateHours(record.timeIn, record.timeOut);
        
        const regularHours = Math.min(8, hoursWorked);
        const overtimeHours = Math.max(0, hoursWorked - 8);
        
        totalRegularHours += regularHours;
        totalOvertimeHours += overtimeHours;
      }
    });
    
    const hourlyRate = employee.hourlyRate || getHourlyRateByPosition(employee.position as EmployeePosition);
    const overtimeRate = hourlyRate * 1.25;
    
    const regularPay = totalRegularHours * hourlyRate;
    const overtimePay = totalOvertimeHours * overtimeRate;
    const grossPay = regularPay + overtimePay;
    
    const monthlySalary = grossPay * 2;
    
    const sssContribution = calculateSSS(monthlySalary);
    const philhealthContribution = calculatePhilHealth(monthlySalary);
    const pagibigContribution = calculatePagIbig(monthlySalary);
    const taxWithholding = calculateWithholdingTax(monthlySalary);
    
    const sss = sssContribution / 2;
    const philhealth = philhealthContribution / 2;
    const pagibig = pagibigContribution / 2;
    const tax = taxWithholding / 2;
    
    const totalDeductions = sss + philhealth + pagibig + tax;
    const netPay = grossPay - totalDeductions;
    
    const payrollItem: PayrollItem = {
      id: generateMockId(),
      employeeId: employee.id,
      periodStart: startDate,
      periodEnd: endDate,
      regularHours: totalRegularHours,
      overtimeHours: totalOvertimeHours,
      grossPay,
      deductions: {
        sss,
        pagibig,
        philhealth,
        tax
      },
      netPay,
      status: 'processed'
    };
    
    setPayrollData(payrollItem);
    localStorage.setItem(`payroll_${selectedEmployee}_${selectedPeriod}`, JSON.stringify(payrollItem));
  };
  
  const processPayout = () => {
    if (payrollData) {
      const updatedPayroll: PayrollItem = {
        ...payrollData,
        status: 'paid' as const
      };
      
      setPayrollData(updatedPayroll);
      localStorage.setItem(`payroll_${selectedEmployee}_${selectedPeriod}`, JSON.stringify(updatedPayroll));
      toast.success('Payroll processed successfully!');
    }
  };
  
  const getEmployeeNameById = (id: string) => {
    const employee = allUsers.find(user => user.id === id);
    return employee?.name || 'Unknown Employee';
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Calculator</CardTitle>
          <CardDescription>Calculate and process employee payroll</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {currentUser?.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium mb-1">Select Employee</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers
                      .filter(user => user.role === 'employee')
                      .map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Pay Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pay period" />
                </SelectTrigger>
                <SelectContent>
                  {payPeriods.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {payrollData ? (
            <div>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-xl mb-4">
                  Payroll Summary for {getEmployeeNameById(payrollData.employeeId)}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Earnings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Regular Hours ({payrollData.regularHours.toFixed(2)})</span>
                        <span>{formatCurrency(payrollData.grossPay - (payrollData.overtimeHours * (payrollData.grossPay / payrollData.regularHours) * 1.25))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overtime Hours ({payrollData.overtimeHours.toFixed(2)})</span>
                        <span>{formatCurrency(payrollData.overtimeHours * (payrollData.grossPay / payrollData.regularHours) * 1.25)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Gross Pay</span>
                        <span>{formatCurrency(payrollData.grossPay)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Deductions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>SSS Contribution</span>
                        <span>{formatCurrency(payrollData.deductions.sss)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PhilHealth</span>
                        <span>{formatCurrency(payrollData.deductions.philhealth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pag-IBIG</span>
                        <span>{formatCurrency(payrollData.deductions.pagibig)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Withholding Tax</span>
                        <span>{formatCurrency(payrollData.deductions.tax)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total Deductions</span>
                        <span>{formatCurrency(
                          payrollData.deductions.sss + 
                          payrollData.deductions.philhealth + 
                          payrollData.deductions.pagibig + 
                          payrollData.deductions.tax + 
                          (payrollData.deductions.others || 0)
                        )}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t-2 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg">Net Pay</h4>
                    <p className="text-gray-600 text-sm">
                      Period: {payrollData.periodStart} to {payrollData.periodEnd}
                    </p>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(payrollData.netPay)}
                  </div>
                </div>
                
                {currentUser?.role === 'admin' && payrollData.status !== 'paid' && (
                  <div className="mt-6">
                    <Button onClick={processPayout}>Process Payout</Button>
                  </div>
                )}
                
                {payrollData.status === 'paid' && (
                  <div className="mt-6 p-3 bg-green-100 text-green-700 rounded-md">
                    This payroll has been processed and paid.
                  </div>
                )}
              </div>
              
              {attendanceRecords.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Attendance Records</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-2 text-left">Date</th>
                          <th className="py-2 px-2 text-left">Time In</th>
                          <th className="py-2 px-2 text-left">Time Out</th>
                          <th className="py-2 px-2 text-left">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((record) => (
                          <tr key={record.id} className="border-b">
                            <td className="py-2 px-2">{record.date}</td>
                            <td className="py-2 px-2">{record.timeIn || '-'}</td>
                            <td className="py-2 px-2">{record.timeOut || '-'}</td>
                            <td className="py-2 px-2">{record.hoursWorked?.toFixed(2) || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {selectedEmployee && selectedPeriod ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payroll data available for this period.</p>
                  <p className="text-sm mt-2">
                    {attendanceRecords.length === 0 
                      ? "No attendance records found." 
                      : "Please calculate payroll based on the attendance records."}
                  </p>
                  {attendanceRecords.length > 0 && currentUser?.role === 'admin' && (
                    <Button 
                      onClick={() => calculatePayroll(attendanceRecords, selectedPeriod.split('_')[0], selectedPeriod.split('_')[1])}
                      className="mt-4"
                    >
                      Calculate Payroll
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Select {currentUser?.role === 'admin' ? 'an employee and ' : ''}a pay period to view payroll information.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollCalculator;
