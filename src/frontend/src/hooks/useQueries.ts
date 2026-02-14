import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { Task, TaskCategory, SubCategory, TaskStatus, PaymentStatus, UserProfile, AssigneeCaptainInput, AssigneeCaptainUpdate, BulkTaskUpdateInput } from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Task Queries
export function useGetTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTask(taskId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Task | null>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTask(taskId);
    },
    enabled: !!actor && !isFetching && !!taskId,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      ownerPrincipal: Principal | null;
      client: string;
      taskCategory: string;
      subCategory: string;
      status: string;
      paymentStatus: string;
      assigneeName: string;
      captainName: string;
      comment: string;
      dueDate: bigint;
      assignmentDate: bigint;
      completionDate: bigint;
      bill: bigint;
      advanceReceived: bigint;
      outstandingAmount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(
        data.ownerPrincipal,
        data.client,
        data.taskCategory,
        data.subCategory,
        data.status,
        data.paymentStatus,
        data.assigneeName,
        data.captainName,
        data.comment,
        data.dueDate,
        data.assignmentDate,
        data.completionDate,
        data.bill,
        data.advanceReceived,
        data.outstandingAmount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      taskId: string;
      client: string;
      taskCategory: string;
      subCategory: string;
      status: string;
      paymentStatus: string;
      assigneeName: string;
      captainName: string;
      comment: string;
      dueDate: bigint;
      assignmentDate: bigint;
      completionDate: bigint;
      bill: bigint;
      advanceReceived: bigint;
      outstandingAmount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTask(
        data.taskId,
        data.client,
        data.taskCategory,
        data.subCategory,
        data.status,
        data.paymentStatus,
        data.assigneeName,
        data.captainName,
        data.comment,
        data.dueDate,
        data.assignmentDate,
        data.completionDate,
        data.bill,
        data.advanceReceived,
        data.outstandingAmount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkDeleteTasks([taskId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
}

export function useBulkDeleteTasks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkDeleteTasks(taskIds);
    },
    onSuccess: (_, taskIds) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`${taskIds.length} ${taskIds.length === 1 ? 'task' : 'tasks'} deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete tasks: ${error.message}`);
    },
  });
}

export function useBulkUpdateTasks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BulkTaskUpdateInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkUpdateTasks(input);
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`${input.updates.length} ${input.updates.length === 1 ? 'task' : 'tasks'} updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update tasks: ${error.message}`);
    },
  });
}

export function useBulkCreateTasks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tasks: Array<{
      ownerPrincipal: Principal | null;
      client: string;
      taskCategory: string;
      subCategory: string;
      status: string;
      paymentStatus: string;
      assigneeName: string;
      captainName: string;
      comment: string;
      dueDate: bigint;
      assignmentDate: bigint;
      completionDate: bigint;
      bill: bigint;
      advanceReceived: bigint;
      outstandingAmount: bigint;
    }>) => {
      if (!actor) throw new Error('Actor not available');
      const results = await Promise.all(
        tasks.map(task =>
          actor.createTask(
            task.ownerPrincipal,
            task.client,
            task.taskCategory,
            task.subCategory,
            task.status,
            task.paymentStatus,
            task.assigneeName,
            task.captainName,
            task.comment,
            task.dueDate,
            task.assignmentDate,
            task.completionDate,
            task.bill,
            task.advanceReceived,
            task.outstandingAmount
          )
        )
      );
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`${results.length} tasks created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create tasks: ${error.message}`);
    },
  });
}

// Category Queries
export function useGetTaskCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<TaskCategory[]>({
    queryKey: ['taskCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTaskCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTaskCategory(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskCategories'] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });
}

// SubCategory Queries
export function useGetSubCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<SubCategory[]>({
    queryKey: ['subCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSubCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; category: TaskCategory }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSubCategory(data.name, data.category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subCategories'] });
      toast.success('Sub-category created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create sub-category: ${error.message}`);
    },
  });
}

// Status Queries
export function useGetTaskStatuses() {
  const { actor, isFetching } = useActor();

  return useQuery<TaskStatus[]>({
    queryKey: ['taskStatuses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskStatuses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTaskStatus(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskStatuses'] });
      toast.success('Status created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create status: ${error.message}`);
    },
  });
}

// Payment Status Queries
export function useGetPaymentStatuses() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentStatus[]>({
    queryKey: ['paymentStatuses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPaymentStatuses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPaymentStatus(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentStatuses'] });
      toast.success('Payment status created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create payment status: ${error.message}`);
    },
  });
}

// Assignee/Captain Directory Queries
export function useGetAssigneeCaptainDirectory() {
  const { actor, isFetching } = useActor();

  return useQuery<[string, string][]>({
    queryKey: ['assigneeCaptainDirectory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssigneeCaptainDirectory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAssigneeCaptainPair() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AssigneeCaptainInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAssigneeCaptainPair(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigneeCaptainDirectory'] });
      toast.success('Assignee/Captain pair added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add pair: ${error.message}`);
    },
  });
}

export function useUpdateAssigneeCaptainPair() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { assignee: string; update: AssigneeCaptainUpdate }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAssigneeCaptainPair(data.assignee, data.update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigneeCaptainDirectory'] });
      toast.success('Assignee/Captain pair updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update pair: ${error.message}`);
    },
  });
}

export function useDeleteAssigneeCaptainPair() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignee: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAssigneeCaptainPair(assignee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigneeCaptainDirectory'] });
      toast.success('Assignee/Captain pair deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete pair: ${error.message}`);
    },
  });
}

export function useBulkUpdateAssigneeCaptainPairs() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pairs: AssigneeCaptainInput[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkUpdateAssigneeCaptainPairs(pairs);
    },
    onSuccess: (_, pairs) => {
      queryClient.invalidateQueries({ queryKey: ['assigneeCaptainDirectory'] });
      toast.success(`${pairs.length} pairs imported successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to import pairs: ${error.message}`);
    },
  });
}

export function useBulkDeleteAssigneeCaptainPairs() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignees: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkDeleteAssigneeCaptainPairs(assignees);
    },
    onSuccess: (_, assignees) => {
      queryClient.invalidateQueries({ queryKey: ['assigneeCaptainDirectory'] });
      toast.success(`${assignees.length} ${assignees.length === 1 ? 'pair' : 'pairs'} deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete pairs: ${error.message}`);
    },
  });
}

// Dashboard Analytics Hooks
export function useGetTaskCountsPerCategory() {
  const { data: tasks = [] } = useGetTasks();

  return useQuery<[string, bigint][]>({
    queryKey: ['taskCountsPerCategory', tasks],
    queryFn: () => {
      const counts = new Map<string, number>();
      tasks.forEach(task => {
        counts.set(task.taskCategory, (counts.get(task.taskCategory) || 0) + 1);
      });
      return Array.from(counts.entries()).map(([name, count]) => [name, BigInt(count)] as [string, bigint]);
    },
    enabled: tasks.length > 0,
  });
}

export function useGetTaskCountsPerStatus() {
  const { data: tasks = [] } = useGetTasks();

  return useQuery<[string, bigint][]>({
    queryKey: ['taskCountsPerStatus', tasks],
    queryFn: () => {
      const counts = new Map<string, number>();
      tasks.forEach(task => {
        counts.set(task.status, (counts.get(task.status) || 0) + 1);
      });
      return Array.from(counts.entries()).map(([name, count]) => [name, BigInt(count)] as [string, bigint]);
    },
    enabled: tasks.length > 0,
  });
}

export function useGetTaskCountsPerPaymentStatus() {
  const { data: tasks = [] } = useGetTasks();

  return useQuery<[string, bigint][]>({
    queryKey: ['taskCountsPerPaymentStatus', tasks],
    queryFn: () => {
      const counts = new Map<string, number>();
      tasks.forEach(task => {
        counts.set(task.paymentStatus, (counts.get(task.paymentStatus) || 0) + 1);
      });
      return Array.from(counts.entries()).map(([name, count]) => [name, BigInt(count)] as [string, bigint]);
    },
    enabled: tasks.length > 0,
  });
}

export function useFilterTasksByCategory() {
  const { data: tasks = [] } = useGetTasks();

  return useMutation<Task[], Error, string>({
    mutationFn: async (categoryName: string) => {
      return tasks.filter(task => task.taskCategory === categoryName);
    },
  });
}

export function useFilterTasksByStatus() {
  const { data: tasks = [] } = useGetTasks();

  return useMutation<Task[], Error, string>({
    mutationFn: async (statusName: string) => {
      return tasks.filter(task => task.status === statusName);
    },
  });
}

export function useFilterTasksByPaymentStatus() {
  const { data: tasks = [] } = useGetTasks();

  return useMutation<Task[], Error, string>({
    mutationFn: async (paymentStatusName: string) => {
      return tasks.filter(task => task.paymentStatus === paymentStatusName);
    },
  });
}
