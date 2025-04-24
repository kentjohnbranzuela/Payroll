
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { EmployeePosition } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format time to HH:MM:SS
export function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0];
}

// Get current date and time in Philippines timezone
export function getPhilippinesTime(): Date {
  const options = { timeZone: 'Asia/Manila' };
  return new Date(new Date().toLocaleString('en-US', options));
}

// Calculate hours between two times
export function calculateHours(timeIn: string, timeOut: string): number {
  const startTime = new Date(`1970-01-01T${timeIn}`);
  const endTime = new Date(`1970-01-01T${timeOut}`);
  
  // If end time is earlier than start time, assume it's the next day
  let diff = endTime.getTime() - startTime.getTime();
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000; // Add 24 hours
  }
  
  return diff / (1000 * 60 * 60);
}

// Get hourly rate based on position
export function getHourlyRateByPosition(position: EmployeePosition): number {
  switch (position) {
    case 'Manager':
      return 500; // PHP 500 per hour
    case 'Supervisor':
      return 300; // PHP 300 per hour
    case 'Staff':
      return 150; // PHP 150 per hour
    default:
      return 150; // Default rate
  }
}

// Calculate SSS contribution
export function calculateSSS(monthlySalary: number): number {
  // This is a simplified calculation
  if (monthlySalary <= 3250) return 135;
  if (monthlySalary <= 3750) return 157.50;
  if (monthlySalary <= 4250) return 180;
  if (monthlySalary <= 4750) return 202.50;
  if (monthlySalary <= 5250) return 225;
  if (monthlySalary <= 5750) return 247.50;
  // Continue with more brackets as needed
  return monthlySalary * 0.045; // 4.5% for higher salaries
}

// Calculate PhilHealth contribution
export function calculatePhilHealth(monthlySalary: number): number {
  // PhilHealth contribution calculation (simplified)
  return Math.min(1800, Math.max(300, monthlySalary * 0.03)); // 3% with min of 300 and max of 1800
}

// Calculate Pag-IBIG contribution
export function calculatePagIbig(monthlySalary: number): number {
  // Pag-IBIG contribution (simplified)
  return Math.min(100, monthlySalary * 0.02); // 2% with max of 100
}

// Calculate withholding tax (simplified)
export function calculateWithholdingTax(monthlySalary: number): number {
  // This is a very simplified tax calculation
  if (monthlySalary <= 20833) return 0; // No tax for income up to 250k annually
  if (monthlySalary <= 33332) return (monthlySalary - 20833) * 0.15;
  if (monthlySalary <= 66666) return 1875 + (monthlySalary - 33332) * 0.20;
  if (monthlySalary <= 166666) return 8541.80 + (monthlySalary - 66666) * 0.25;
  if (monthlySalary <= 666666) return 33541.80 + (monthlySalary - 166666) * 0.30;
  return 183541.80 + (monthlySalary - 666666) * 0.35;
}

// Generate mock data for demo purposes
export function generateMockId(): string {
  return Math.random().toString(36).substring(2, 10);
}
