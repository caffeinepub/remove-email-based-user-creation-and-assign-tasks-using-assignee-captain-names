import { useState, useEffect } from 'react';
import { useCreateTask, useGetTaskCategories, useGetSubCategories, useGetTaskStatuses, useGetPaymentStatuses, useGetAssigneeCaptainDirectory } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface AdminTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminTaskDialog({ open, onOpenChange }: AdminTaskDialogProps) {
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
  const [validationError, setValidationError] = useState('');

  const { data: categories = [], isLoading: categoriesLoading } = useGetTaskCategories();
  const { data: subCategories = [], isLoading: subCategoriesLoading } = useGetSubCategories();
  const { data: statuses = [], isLoading: statusesLoading } = useGetTaskStatuses();
  const { data: paymentStatuses = [], isLoading: paymentStatusesLoading } = useGetPaymentStatuses();
  const { data: assigneeDirectory = [] } = useGetAssigneeCaptainDirectory();

  const createTask = useCreateTask();

  const parseDateToTimestamp = (dateStr: string): bigint => {
    if (!dateStr) return BigInt(0);
    try {
      const date = new Date(dateStr);
      return BigInt(date.getTime() * 1000000);
    } catch {
      return BigInt(0);
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
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
      setValidationError('');
    }
  }, [open]);

  // Reset subcategory when category changes
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
    setValidationError('');

    // Validate required fields
    if (!client.trim()) {
      setValidationError('Client name is required');
      return;
    }
    if (!taskCategory) {
      setValidationError('Task Category is required');
      return;
    }
    if (!subCategory) {
      setValidationError('Sub Category is required');
      return;
    }

    try {
      await createTask.mutateAsync({
        ownerPrincipal: null,
        client: client.trim(),
        taskCategory,
        subCategory,
        status: status || 'Pending',
        paymentStatus: paymentStatus || 'Unpaid',
        assigneeName: assigneeName.trim(),
        captainName: captainName.trim(),
        comment: comment.trim(),
        dueDate: parseDateToTimestamp(dueDate),
        assignmentDate: parseDateToTimestamp(assignmentDate),
        completionDate: parseDateToTimestamp(completionDate),
        bill: bill ? BigInt(bill) : BigInt(0),
        advanceReceived: advanceReceived ? BigInt(advanceReceived) : BigInt(0),
        outstandingAmount: outstandingAmount ? BigInt(outstandingAmount) : BigInt(0),
      });

      // Close dialog on success
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      setValidationError('Failed to create task. Please try again.');
    }
  };

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.category.name === taskCategory
  );

  const isLoading = categoriesLoading || subCategoriesLoading || statusesLoading || paymentStatusesLoading;
  const isFormValid = client.trim() && taskCategory && subCategory;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the required details to create a new task. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="client">
                Client <span className="text-destructive">*</span>
              </Label>
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
                <Label htmlFor="category">
                  Task Category <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="subCategory">
                  Sub Category <span className="text-destructive">*</span>
                </Label>
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
                    <SelectValue placeholder="Select status (optional)" />
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
                    <SelectValue placeholder="Select payment status (optional)" />
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
                disabled={createTask.isPending || !isFormValid}
              >
                {createTask.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
