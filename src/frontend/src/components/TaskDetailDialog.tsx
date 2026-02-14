import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, X } from 'lucide-react';
import type { Task } from '../backend';
import TaskFormDialog from './TaskFormDialog';
import TaskDetailsTab from './TaskDetailsTab';
import { useTaskDetailTabs } from '../hooks/useTaskDetailTabs';
import { useState } from 'react';

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  title: string;
  description: string;
  isAdmin: boolean;
  isLoading?: boolean;
  onTaskUpdated?: (updatedTask: Task) => void;
}

export default function TaskDetailDialog({
  open,
  onOpenChange,
  tasks,
  title,
  description,
  isAdmin,
  isLoading = false,
  onTaskUpdated,
}: TaskDetailDialogProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { activeTab, setActiveTab, openTabs, openTaskTab, closeTab, updateTabTask } = useTaskDetailTabs();

  const handleRowClick = (task: Task) => {
    openTaskTab(task);
  };

  const handleCloseTab = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(taskId);
  };

  const handleEditClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
  };

  const handleEditClose = () => {
    setEditingTask(null);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    // Update the tab with the latest task data
    updateTabTask(updatedTask);
    
    // Notify parent component
    if (onTaskUpdated) {
      onTaskUpdated(updatedTask);
    }
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[1600px] h-[92vh] max-h-[92vh] flex flex-col p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full justify-start overflow-x-auto flex-shrink-0">
              <TabsTrigger value="list">Task List</TabsTrigger>
              {openTabs.map(tab => (
                <TabsTrigger key={tab.id} value={`task-${tab.id}`} className="gap-2">
                  <span className="max-w-[120px] truncate">{truncateText(tab.task.client)}</span>
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="ml-1 rounded-sm hover:bg-muted p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="list" className="flex-1 mt-4 min-h-0">
              <ScrollArea className="h-full w-full">
                <div className="pr-4">
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
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[150px]">Client</TableHead>
                            <TableHead className="min-w-[120px]">Category</TableHead>
                            <TableHead className="min-w-[140px]">Sub Category</TableHead>
                            <TableHead className="min-w-[120px]">Status</TableHead>
                            <TableHead className="min-w-[140px]">Payment Status</TableHead>
                            <TableHead className="min-w-[120px]">Assignee</TableHead>
                            <TableHead className="min-w-[120px]">Captain</TableHead>
                            {isAdmin && <TableHead className="text-right min-w-[100px]">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tasks.map((task) => (
                            <TableRow 
                              key={task.id} 
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleRowClick(task)}
                            >
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
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleEditClick(task, e)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {openTabs.map(tab => (
              <TabsContent key={tab.id} value={`task-${tab.id}`} className="flex-1 mt-4 min-h-0">
                <ScrollArea className="h-full w-full">
                  <div className="pr-4">
                    <TaskDetailsTab 
                      task={tab.task} 
                      isAdmin={isAdmin}
                      onTaskUpdated={handleTaskUpdated}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
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
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </>
  );
}
