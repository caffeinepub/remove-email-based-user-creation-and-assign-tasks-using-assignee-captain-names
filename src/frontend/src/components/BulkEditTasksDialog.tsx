import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TaskStatus, PaymentStatus } from '../backend';

interface BulkEditTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  statuses: TaskStatus[];
  paymentStatuses: PaymentStatus[];
  onSave: (updates: { status?: string; paymentStatus?: string }) => void;
  isSaving: boolean;
}

export default function BulkEditTasksDialog({
  open,
  onOpenChange,
  selectedCount,
  statuses,
  paymentStatuses,
  onSave,
  isSaving,
}: BulkEditTasksDialogProps) {
  const [status, setStatus] = useState<string>('no-change');
  const [paymentStatus, setPaymentStatus] = useState<string>('no-change');

  const handleSave = () => {
    const updates: { status?: string; paymentStatus?: string } = {};
    
    if (status !== 'no-change') {
      updates.status = status;
    }
    
    if (paymentStatus !== 'no-change') {
      updates.paymentStatus = paymentStatus;
    }

    onSave(updates);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSaving) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset form
        setStatus('no-change');
        setPaymentStatus('no-change');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Edit Tasks</DialogTitle>
          <DialogDescription>
            Update {selectedCount} selected {selectedCount === 1 ? 'task' : 'tasks'}. 
            Fields set to "No change" will remain unchanged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-status">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={isSaving}>
              <SelectTrigger id="bulk-status">
                <SelectValue placeholder="No change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-change">No change</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-payment">Payment Status</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus} disabled={isSaving}>
              <SelectTrigger id="bulk-payment">
                <SelectValue placeholder="No change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-change">No change</SelectItem>
                {paymentStatuses.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
