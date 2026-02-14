import { useState, useMemo } from 'react';
import { useGetTasks, useDeleteTask, useGetTaskCategories, useGetSubCategories, useGetTaskStatuses, useGetPaymentStatuses } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Pencil, Trash2, Filter, Plus, X } from 'lucide-react';
import TaskFormDialog from '../components/TaskFormDialog';
import AdminTaskDialog from '../components/AdminTaskDialog';
import TaskDetailsTab from '../components/TaskDetailsTab';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTaskDetailTabs } from '../hooks/useTaskDetailTabs';
import type { Task } from '../backend';
import { formatCurrency } from '../utils/currency';

interface TasksPageProps {
  isAdmin: boolean;
}

export default function TasksPage({ isAdmin }: TasksPageProps) {
  const { data: tasks = [], isLoading } = useGetTasks();
  const { data: categories = [] } = useGetTaskCategories();
  const { data: subCategories = [] } = useGetSubCategories();
  const { data: statuses = [] } = useGetTaskStatuses();
  const { data: paymentStatuses = [] } = useGetPaymentStatuses();
  const deleteTask = useDeleteTask();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  
  const { activeTab, setActiveTab, openTabs, openTaskTab, closeTab, updateTabTask } = useTaskDetailTabs();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery === '' ||
        task.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.taskCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.captainName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || task.taskCategory === categoryFilter;
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || task.paymentStatus === paymentFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesPayment;
    });
  }, [tasks, searchQuery, categoryFilter, statusFilter, paymentFilter]);

  const handleDelete = async () => {
    if (deletingTask) {
      await deleteTask.mutateAsync(deletingTask.id);
      // Close the tab if it's open
      closeTab(deletingTask.id);
      setDeletingTask(null);
    }
  };

  const handleTaskClick = (task: Task) => {
    openTaskTab(task);
  };

  const handleCloseTab = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(taskId);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    // Update the tab with the latest task data
    updateTabTask(updatedTask);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground mt-1">Manage and track your tasks</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreatingTask(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="list">Task List</TabsTrigger>
          {openTabs.map(tab => (
            <TabsTrigger key={tab.id} value={`task-${tab.id}`} className="gap-2">
              <span className="max-w-[120px] truncate">{tab.task.client}</span>
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="ml-1 rounded-sm hover:bg-muted p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filter Tasks</CardTitle>
              <CardDescription>Search and filter your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.name}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Payment Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Statuses</SelectItem>
                    {paymentStatuses.map((payment) => (
                      <SelectItem key={payment.id} value={payment.name}>
                        {payment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task List</CardTitle>
              <CardDescription>
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-center">
                  <Filter className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No tasks found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Sub Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Captain</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TableRow 
                          key={task.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleTaskClick(task)}
                        >
                          <TableCell className="font-medium">{task.client}</TableCell>
                          <TableCell>{task.taskCategory}</TableCell>
                          <TableCell>{task.subCategory}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPaymentColor(task.paymentStatus)}>{task.paymentStatus}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{task.assigneeName || '-'}</TableCell>
                          <TableCell className="text-sm">{task.captainName || '-'}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(task.bill)}</TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTask(task);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingTask(task);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {openTabs.map(tab => (
          <TabsContent key={tab.id} value={`task-${tab.id}`}>
            <TaskDetailsTab 
              task={tab.task} 
              isAdmin={isAdmin}
              onTaskUpdated={handleTaskUpdated}
            />
          </TabsContent>
        ))}
      </Tabs>

      {isAdmin && (
        <AdminTaskDialog
          open={isCreatingTask}
          onOpenChange={setIsCreatingTask}
        />
      )}

      {editingTask && (
        <TaskFormDialog
          open={!!editingTask}
          onOpenChange={(open) => {
            if (!open) setEditingTask(null);
          }}
          task={editingTask}
          isAdmin={isAdmin}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      <AlertDialog open={!!deletingTask} onOpenChange={(open) => !open && setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the task for "{deletingTask?.client}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
