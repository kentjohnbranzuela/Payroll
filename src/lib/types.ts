
export type UserRole = 'admin' | 'employee';

export type EmployeePosition = 'Manager' | 'Supervisor' | 'Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  position?: EmployeePosition;
  hourlyRate?: number;
  department?: string;
  avatar?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'holiday';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  status: AttendanceStatus;
  hoursWorked?: number;
  overtimeHours?: number;
}

export type LeaveType = 'sick' | 'vacation' | 'emergency' | 'maternity' | 'paternity' | 'bereavement';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ScheduleShift {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  isOvertime?: boolean;
}

export interface PayrollItem {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  regularHours: number;
  overtimeHours: number;
  grossPay: number;
  deductions: {
    sss: number;
    pagibig: number;
    philhealth: number;
    tax: number;
    others?: number;
  };
  netPay: number;
  status: 'draft' | 'processed' | 'paid';
}
