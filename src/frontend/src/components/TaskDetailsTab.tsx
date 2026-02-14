import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Pencil, Calendar, User, DollarSign, Briefcase } from 'lucide-react';
import type { Task } from '../backend';
import { useState } from 'react';
import TaskFormDialog from './TaskFormDialog';

interface TaskDetailsTabProps {
  task: Task;
  isAdmin: boolean;
  onTaskUpdated?: (updatedTask: Task) => void;
}

export default function TaskDetailsTab({ task, isAdmin, onTaskUpdated }: TaskDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('complete') || lowerStatus.includes('done')) return 'default';
    if (lowerStatus.includes('progress') || lowerStatus.includes('active')) return 'secondary';
    if (lowerStatus.includes('pending') || lowerStatus.includes('waiting')) return 'outline';
    return 'outline';
  };

  const getPaymentColor = (payment: string) => {
    const lowerPayment = payment.toLowerCase();
    if (lowerPayment.includes('paid') || lowerPayment.includes('complete')) return 'default';
    if (lowerPayment.includes('pending') || lowerPayment.includes('processing')) return 'secondary';
    if (lowerPayment.includes('unpaid') || lowerPayment.includes('overdue')) return 'destructive';
    return 'outline';
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{task.client}</h3>
          <p className="text-sm text-muted-foreground mt-1">Task ID: {task.id}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Task
          </Button>
        )}
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5" />
              Task Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="text-base font-semibold mt-1">{task.taskCategory}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sub Category</p>
              <p className="text-base font-semibold mt-1">{task.subCategory}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={getStatusColor(task.status)} className="mt-1">
                {task.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assignee</p>
              <p className="text-base font-semibold mt-1">{task.assigneeName || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Captain</p>
              <p className="text-base font-semibold mt-1">{task.captainName || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
              <Badge variant={getPaymentColor(task.paymentStatus)} className="mt-1">
                {task.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm mt-1">{formatDate(task.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm mt-1">{formatDate(task.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditing && (
        <TaskFormDialog
          open={isEditing}
          onOpenChange={setIsEditing}
          task={task}
          isAdmin={isAdmin}
          onTaskUpdated={onTaskUpdated}
        />
      )}
    </div>
  );
}
