import { useState, useEffect } from 'react';
import { useCreateTask, useUpdateTask, useGetTaskCategories, useGetSubCategories, useGetTaskStatuses, useGetPaymentStatuses, useGetAssigneeCaptainDirectory } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import type { Task } from '../backend';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  isAdmin: boolean;
  onTaskUpdated?: (updatedTask: Task) => void;
}

export default function TaskFormDialog({ open, onOpenChange, task, isAdmin, onTaskUpdated }: TaskFormDialogProps) {
  const [client, setClient] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [comment, setComment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignmentDate, setAssignmentDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [bill, setBill] = useState('');
  const [advanceReceived, setAdvanceReceived] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: categories = [] } = useGetTaskCategories();
  const { data: subCategories = [] } = useGetSubCategories();
  const { data: statuses = [] } = useGetTaskStatuses();
  const { data: paymentStatuses = [] } = useGetPaymentStatuses();
  const { data: assigneeDirectory = [] } = useGetAssigneeCaptainDirectory();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const formatDateForInput = (timestamp: bigint): string => {
    if (!timestamp || timestamp === BigInt(0)) return '';
    const date = new Date(Number(timestamp) / 1000000);
    return date.toISOString().split('T')[0];
  };

  const parseDateToTimestamp = (dateStr: string): bigint => {
    if (!dateStr) return BigInt(0);
    try {
      const date = new Date(dateStr);
      return BigInt(date.getTime() * 1000000);
    } catch {
      return BigInt(0);
    }
  };

  useEffect(() => {
    if (task) {
      setClient(task.client);
      setTaskCategory(task.taskCategory);
      setSubCategory(task.subCategory);
      setStatus(task.status);
      setPaymentStatus(task.paymentStatus);
      setAssigneeName(task.assigneeName);
      setCaptainName(task.captainName);
      setComment(task.comment || '');
      setDueDate(formatDateForInput(task.dueDate));
      setAssignmentDate(formatDateForInput(task.assignmentDate));
      setCompletionDate(formatDateForInput(task.completionDate));
      setBill(task.bill ? task.bill.toString() : '');
      setAdvanceReceived(task.advanceReceived ? task.advanceReceived.toString() : '');
      setOutstandingAmount(task.outstandingAmount ? task.outstandingAmount.toString() : '');
      setSelectedAssignee('');
    } else {
      setClient('');
      setTaskCategory('');
      setSubCategory('');
      setStatus('');
      setPaymentStatus('');
      setAssigneeName('');
      setCaptainName('');
      setComment('');
      setDueDate('');
      setAssignmentDate('');
      setCompletionDate('');
      setBill('');
      setAdvanceReceived('');
      setOutstandingAmount('');
      setSelectedAssignee('');
    }
    setSubmitError(null);
  }, [task, open]);

  useEffect(() => {
    setSubCategory('');
  }, [taskCategory]);

  const handleAssigneeSelect = (value: string) => {
    setSelectedAssignee(value);
    if (value && value !== 'manual') {
      const pair = assigneeDirectory.find(([assignee]) => assignee === value);
      if (pair) {
        setAssigneeName(pair[0]);
        setCaptainName(pair[1]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      const taskData = {
        client: client.trim(),
        taskCategory,
        subCategory,
        status: status || (task?.status || 'Pending'),
        paymentStatus: paymentStatus || (task?.paymentStatus || 'Unpaid'),
        assigneeName: assigneeName.trim(),
        captainName: captainName.trim(),
        comment: comment.trim(),
        dueDate: parseDateToTimestamp(dueDate),
        assignmentDate: parseDateToTimestamp(assignmentDate),
        completionDate: parseDateToTimestamp(completionDate),
        bill: bill ? BigInt(bill) : BigInt(0),
        advanceReceived: advanceReceived ? BigInt(advanceReceived) : BigInt(0),
        outstandingAmount: outstandingAmount ? BigInt(outstandingAmount) : BigInt(0),
      };

      if (task) {
        const updatedTask = await updateTask.mutateAsync({
          taskId: task.id,
          ...taskData,
        });
        
        if (onTaskUpdated && updatedTask) {
          onTaskUpdated(updatedTask);
        }
      } else {
        await createTask.mutateAsync({
          ownerPrincipal: null,
          ...taskData,
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save task. Please try again.');
    }
  };

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.category.name === taskCategory
  );

  const isFormValid = client.trim() && taskCategory && subCategory;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update the task details below' : 'Fill in the details to create a new task'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Input
              id="client"
              placeholder="Enter client name"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Task Category *</Label>
              <Select value={taskCategory} onValueChange={setTaskCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategory">Sub Category *</Label>
              <Select
                value={subCategory}
                onValueChange={setSubCategory}
                required
                disabled={!taskCategory}
              >
                <SelectTrigger id="subCategory">
                  <SelectValue placeholder={taskCategory ? "Select sub category" : "Select category first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubCategories.length === 0 ? (
                    <SelectItem value="no-subcategories" disabled>
                      {taskCategory ? "No sub categories available" : "Select a category first"}
                    </SelectItem>
                  ) : (
                    filteredSubCategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.name}>
                        {sub.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder={task ? `Current: ${task.status}` : "Select status (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  {statuses.length === 0 ? (
                    <SelectItem value="no-statuses" disabled>
                      No statuses available
                    </SelectItem>
                  ) : (
                    statuses.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger id="payment">
                  <SelectValue placeholder={task ? `Current: ${task.paymentStatus}` : "Select payment status (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.length === 0 ? (
                    <SelectItem value="no-payment-statuses" disabled>
                      No payment statuses available
                    </SelectItem>
                  ) : (
                    paymentStatuses.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              placeholder="Enter any comments or notes"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigneeSelect">Select Assignee (Optional)</Label>
            <Select value={selectedAssignee} onValueChange={handleAssigneeSelect}>
              <SelectTrigger id="assigneeSelect">
                <SelectValue placeholder="Select from directory or enter manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Enter manually</SelectItem>
                {assigneeDirectory.length === 0 ? (
                  <SelectItem value="no-assignees" disabled>
                    No saved assignees
                  </SelectItem>
                ) : (
                  assigneeDirectory.map(([assignee, captain]) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee} (Captain: {captain})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigneeName">Assignee Name</Label>
              <Input
                id="assigneeName"
                placeholder="Enter assignee name"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="captainName">Captain Name</Label>
              <Input
                id="captainName"
                placeholder="Enter captain name"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignmentDate">Assignment Date</Label>
              <Input
                id="assignmentDate"
                type="date"
                value={assignmentDate}
                onChange={(e) => setAssignmentDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completionDate">Completion Date</Label>
              <Input
                id="completionDate"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bill">Bill</Label>
              <Input
                id="bill"
                type="number"
                placeholder="0"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="advanceReceived">Advance Received</Label>
              <Input
                id="advanceReceived"
                type="number"
                placeholder="0"
                value={advanceReceived}
                onChange={(e) => setAdvanceReceived(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outstandingAmount">Outstanding Amount</Label>
              <Input
                id="outstandingAmount"
                type="number"
                placeholder="0"
                value={outstandingAmount}
                onChange={(e) => setOutstandingAmount(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTask.isPending || updateTask.isPending || !isFormValid}
            >
              {createTask.isPending || updateTask.isPending
                ? 'Saving...'
                : task
                ? 'Update Task'
                : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
