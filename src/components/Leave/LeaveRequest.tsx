
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LeaveRequest, LeaveStatus, LeaveType } from '@/lib/types';
import { formatDate, generateMockId } from '@/lib/utils';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

const formSchema = z.object({
  type: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(5, 'Please provide a reason with at least 5 characters')
});

export const LeaveRequestComponent: React.FC = () => {
  const { currentUser } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '',
      startDate: formatDate(new Date()),
      endDate: formatDate(new Date()),
      reason: ''
    }
  });

  useEffect(() => {
    if (!currentUser) return;
    
    // Load leave requests from localStorage
    const savedRequests = localStorage.getItem(`leave_requests_${currentUser.id}`);
    if (savedRequests) {
      setLeaveRequests(JSON.parse(savedRequests));
    }
  }, [currentUser]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!currentUser) return;
    
    const newRequest: LeaveRequest = {
      id: generateMockId(),
      employeeId: currentUser.id,
      startDate: values.startDate,
      endDate: values.endDate,
      type: values.type as LeaveType,
      reason: values.reason,
      status: 'pending'
    };
    
    // Update state and localStorage
    const updatedRequests = [...leaveRequests, newRequest];
    setLeaveRequests(updatedRequests);
    localStorage.setItem(`leave_requests_${currentUser.id}`, JSON.stringify(updatedRequests));
    
    // Reset form
    form.reset();
    
    toast.success('Leave request submitted successfully!');
  };

  const getStatusBadgeClass = (status: LeaveStatus) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Leave</CardTitle>
          <CardDescription>Submit a new leave request</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="vacation">Vacation Leave</SelectItem>
                          <SelectItem value="emergency">Emergency Leave</SelectItem>
                          <SelectItem value="maternity">Maternity Leave</SelectItem>
                          <SelectItem value="paternity">Paternity Leave</SelectItem>
                          <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide details about your leave request" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Submit Request</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {leaveRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left">Type</th>
                    <th className="py-2 px-2 text-left">From</th>
                    <th className="py-2 px-2 text-left">To</th>
                    <th className="py-2 px-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((request) => (
                    <tr key={request.id} className="border-b">
                      <td className="py-2 px-2 capitalize">{request.type}</td>
                      <td className="py-2 px-2">{request.startDate}</td>
                      <td className="py-2 px-2">{request.endDate}</td>
                      <td className="py-2 px-2">
                        <span className={getStatusBadgeClass(request.status)}>
                          {request.status}
                        </span>
                      </td>
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

export default LeaveRequestComponent;
