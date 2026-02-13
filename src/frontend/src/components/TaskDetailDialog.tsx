import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit } from 'lucide-react';
import type { Task } from '../backend';
import TaskFormDialog from './TaskFormDialog';

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  title: string;
  description: string;
  isAdmin: boolean;
  isLoading?: boolean;
}

export default function TaskDetailDialog({
  open,
  onOpenChange,
  tasks,
  title,
  description,
  isAdmin,
  isLoading = false,
}: TaskDetailDialogProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
  };

  const handleEditClose = () => {
    setEditingTask(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(85vh-120px)] pr-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                No tasks found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sub Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Captain</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{task.client}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.taskCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{task.subCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{task.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.assigneeName || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {task.captainName || '-'}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {editingTask && (
        <TaskFormDialog
          open={!!editingTask}
          onOpenChange={(open) => {
            if (!open) handleEditClose();
          }}
          task={editingTask}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}
