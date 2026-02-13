import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Task, UserProfile, TaskCategory, SubCategory, TaskStatus, PaymentStatus, AssigneeCaptainInput, AssigneeCaptainUpdate } from '../backend';
import { UserRole } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

// Helper function to parse authorization errors
function parseAuthError(error: Error): string {
  const message = error.message;
  if (message.includes('Unauthorized')) {
    if (message.includes('Only admins')) {
      return 'You need admin access for this action';
    }
    if (message.includes('Only users')) {
      return 'Please complete profile setup to access this feature';
    }
    return message.replace('Unauthorized: ', '');
  }
  return message;
}

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
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
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

export function useFilterTasksByCategory() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (category: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.filterTasksByCategory(category);
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
    },
  });
}

export function useFilterTasksByStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (status: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.filterTasksByStatus(status);
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
    },
  });
}

export function useFilterTasksByPaymentStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (paymentStatus: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.filterTasksByPaymentStatus(paymentStatus);
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
    },
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
        data.captainName
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerCategory'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerPaymentStatus'] });
      toast.success('Task created successfully');
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
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
        data.captainName
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerCategory'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerPaymentStatus'] });
      toast.success('Task updated successfully');
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerCategory'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerPaymentStatus'] });
      toast.success('Task deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
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
      toast.error(parseAuthError(error));
    },
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
      toast.error(parseAuthError(error));
    },
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
      toast.error(parseAuthError(error));
    },
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
      toast.error(parseAuthError(error));
    },
  });
}

// Analytics Queries
export function useGetTaskCountsPerCategory() {
  const { actor, isFetching } = useActor();

  return useQuery<[string, bigint][]>({
    queryKey: ['taskCountsPerCategory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskCountsPerCategory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTaskCountsPerStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<[string, bigint][]>({
    queryKey: ['taskCountsPerStatus'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskCountsPerStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTaskCountsPerPaymentStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<[string, bigint][]>({
    queryKey: ['taskCountsPerPaymentStatus'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTaskCountsPerPaymentStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

// Bulk Upload
export function useBulkCreateTasks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tasksData: Array<[Principal, string, string, string, string, string, string, string]>) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkCreateTasks(tasksData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerCategory'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['taskCountsPerPaymentStatus'] });
      toast.success('Tasks uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
    },
  });
}

// User Management (Admin Only)
export function useListAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userPrincipal: Principal; name: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUser(data.userPrincipal, data.name, data.email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
    },
  });
}

export function useGetUserRole() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserRole(user);
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
    },
  });
}

export function useSetUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setUserRole(data.user, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(parseAuthError(error));
    },
  });
}

// Assignee/Captain Directory Queries
export function useGetAssigneeCaptainDirectory() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, string]>>({
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
      toast.error(parseAuthError(error));
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
      toast.error(parseAuthError(error));
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
      toast.error(parseAuthError(error));
    },
  });
}
