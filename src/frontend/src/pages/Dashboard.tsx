import { useState } from 'react';
import { useGetTaskCountsPerCategory, useGetTaskCountsPerStatus, useGetTaskCountsPerPaymentStatus, useGetTasks, useFilterTasksByCategory, useFilterTasksByStatus, useFilterTasksByPaymentStatus } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ListTodo, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import TaskDetailDialog from '../components/TaskDetailDialog';
import type { Task } from '../backend';

interface DashboardProps {
  isAdmin: boolean;
}

export default function Dashboard({ isAdmin }: DashboardProps) {
  const { data: tasks = [] } = useGetTasks();
  const { data: categoryData = [] } = useGetTaskCountsPerCategory();
  const { data: statusData = [] } = useGetTaskCountsPerStatus();
  const { data: paymentData = [] } = useGetTaskCountsPerPaymentStatus();

  const filterByCategory = useFilterTasksByCategory();
  const filterByStatus = useFilterTasksByStatus();
  const filterByPaymentStatus = useFilterTasksByPaymentStatus();

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    tasks: Task[];
    title: string;
    description: string;
    isLoading: boolean;
  }>({
    open: false,
    tasks: [],
    title: '',
    description: '',
    isLoading: false,
  });

  const categoryChartData = categoryData.map(([name, count]) => ({
    name,
    value: Number(count),
  }));

  const statusChartData = statusData.map(([name, count]) => ({
    name,
    value: Number(count),
  }));

  const paymentChartData = paymentData.map(([name, count]) => ({
    name,
    value: Number(count),
  }));

  const COLORS = ['oklch(var(--chart-1))', 'oklch(var(--chart-2))', 'oklch(var(--chart-3))', 'oklch(var(--chart-4))', 'oklch(var(--chart-5))'];

  const handleCategoryClick = async (categoryName: string) => {
    setDetailDialog({
      open: true,
      tasks: [],
      title: `Tasks in ${categoryName}`,
      description: `Loading tasks...`,
      isLoading: true,
    });

    try {
      const filteredTasks = await filterByCategory.mutateAsync(categoryName);
      setDetailDialog({
        open: true,
        tasks: filteredTasks,
        title: `Tasks in ${categoryName}`,
        description: `Showing ${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''} in this category`,
        isLoading: false,
      });
    } catch (error) {
      setDetailDialog({
        open: true,
        tasks: [],
        title: `Tasks in ${categoryName}`,
        description: 'Error loading tasks',
        isLoading: false,
      });
    }
  };

  const handleStatusClick = async (statusName: string) => {
    setDetailDialog({
      open: true,
      tasks: [],
      title: `Tasks with ${statusName} status`,
      description: `Loading tasks...`,
      isLoading: true,
    });

    try {
      const filteredTasks = await filterByStatus.mutateAsync(statusName);
      setDetailDialog({
        open: true,
        tasks: filteredTasks,
        title: `Tasks with ${statusName} status`,
        description: `Showing ${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''} with this status`,
        isLoading: false,
      });
    } catch (error) {
      setDetailDialog({
        open: true,
        tasks: [],
        title: `Tasks with ${statusName} status`,
        description: 'Error loading tasks',
        isLoading: false,
      });
    }
  };

  const handlePaymentStatusClick = async (paymentStatusName: string) => {
    setDetailDialog({
      open: true,
      tasks: [],
      title: `Tasks with ${paymentStatusName} payment status`,
      description: `Loading tasks...`,
      isLoading: true,
    });

    try {
      const filteredTasks = await filterByPaymentStatus.mutateAsync(paymentStatusName);
      setDetailDialog({
        open: true,
        tasks: filteredTasks,
        title: `Tasks with ${paymentStatusName} payment status`,
        description: `Showing ${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''} with this payment status`,
        isLoading: false,
      });
    } catch (error) {
      setDetailDialog({
        open: true,
        tasks: [],
        title: `Tasks with ${paymentStatusName} payment status`,
        description: 'Error loading tasks',
        isLoading: false,
      });
    }
  };

  const handleSummaryCardClick = (type: 'category' | 'status' | 'payment') => {
    let title = '';
    let description = '';
    
    if (type === 'category') {
      title = 'All Categories';
      description = `Showing ${categoryData.length} active categories`;
    } else if (type === 'status') {
      title = 'All Statuses';
      description = `Showing ${statusData.length} different statuses`;
    } else {
      title = 'All Payment Types';
      description = `Showing ${paymentData.length} payment statuses`;
    }

    setDetailDialog({
      open: true,
      tasks: tasks,
      title,
      description,
      isLoading: false,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? 'System-wide analytics and insights' : 'Your task analytics and insights'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isAdmin ? 'All tasks in system' : 'Your tasks'}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
          onClick={() => handleSummaryCardClick('category')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active categories</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
          onClick={() => handleSummaryCardClick('status')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statuses</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Different statuses</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
          onClick={() => handleSummaryCardClick('payment')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Types</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Payment statuses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
            <CardDescription>Distribution of tasks across categories (click bars to view details)</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(var(--popover))',
                      border: '1px solid oklch(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    cursor={{ fill: 'oklch(var(--muted))' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="oklch(var(--chart-1))" 
                    radius={[8, 8, 0, 0]}
                    onClick={(data) => handleCategoryClick(data.name)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
            <CardDescription>Current status distribution (click segments to view details)</CardDescription>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="oklch(var(--chart-1))"
                    dataKey="value"
                    onClick={(data) => handleStatusClick(data.name)}
                    className="cursor-pointer"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(var(--popover))',
                      border: '1px solid oklch(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
            <CardDescription>Overview of payment statuses (click bars to view details)</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(var(--popover))',
                      border: '1px solid oklch(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    cursor={{ fill: 'oklch(var(--muted))' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="oklch(var(--chart-2))" 
                    radius={[0, 8, 8, 0]}
                    onClick={(data) => handlePaymentStatusClick(data.name)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskDetailDialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog({ ...detailDialog, open })}
        tasks={detailDialog.tasks}
        title={detailDialog.title}
        description={detailDialog.description}
        isAdmin={isAdmin}
        isLoading={detailDialog.isLoading}
      />
    </div>
  );
}
