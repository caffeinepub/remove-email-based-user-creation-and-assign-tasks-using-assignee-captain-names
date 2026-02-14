import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface AssigneeCaptainUpdate {
    assignee: string;
    captain: string;
}
export interface TaskCategory {
    id: string;
    name: string;
}
export interface Task {
    id: string;
    status: string;
    client: string;
    subCategory: string;
    paymentStatus: string;
    completionDate: Time;
    captainName: string;
    assignmentDate: Time;
    owner: Principal;
    bill: bigint;
    advanceReceived: bigint;
    createdAt: Time;
    assigneeName: string;
    dueDate: Time;
    comment: string;
    updatedAt: Time;
    outstandingAmount: bigint;
    taskCategory: string;
}
export interface BulkTaskUpdateInput {
    updates: Array<{
        status?: string;
        paymentStatus?: string;
        taskId: string;
    }>;
}
export interface TaskStatus {
    id: string;
    name: string;
}
export interface AssigneeCaptainInput {
    assignee: string;
    captain: string;
}
export interface PaymentStatus {
    id: string;
    name: string;
}
export interface UserProfile {
    name: string;
    createdAt: Time;
    email: string;
}
export interface SubCategory {
    id: string;
    name: string;
    category: TaskCategory;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAssigneeCaptainPair(input: AssigneeCaptainInput): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkDeleteAssigneeCaptainPairs(assignees: Array<string>): Promise<void>;
    bulkDeleteTasks(taskIds: Array<string>): Promise<void>;
    bulkUpdateAssigneeCaptainPairs(pairs: Array<AssigneeCaptainInput>): Promise<void>;
    bulkUpdateTasks(input: BulkTaskUpdateInput): Promise<void>;
    createPaymentStatus(name: string): Promise<PaymentStatus>;
    createSubCategory(name: string, category: TaskCategory): Promise<SubCategory>;
    createTask(ownerPrincipal: Principal | null, client: string, taskCategory: string, subCategory: string, status: string, paymentStatus: string, assigneeName: string, captainName: string, comment: string, dueDate: Time, assignmentDate: Time, completionDate: Time, bill: bigint, advanceReceived: bigint, outstandingAmount: bigint): Promise<Task>;
    createTaskCategory(name: string): Promise<TaskCategory>;
    createTaskStatus(name: string): Promise<TaskStatus>;
    deleteAssigneeCaptainPair(assignee: string): Promise<void>;
    getAssigneeCaptainDirectory(): Promise<Array<[string, string]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPaymentStatuses(): Promise<Array<PaymentStatus>>;
    getSubCategories(): Promise<Array<SubCategory>>;
    getTask(taskId: string): Promise<Task | null>;
    getTaskCategories(): Promise<Array<TaskCategory>>;
    getTaskStatuses(): Promise<Array<TaskStatus>>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAssigneeCaptainPair(assignee: string, update: AssigneeCaptainUpdate): Promise<void>;
    updateTask(taskId: string, client: string, taskCategory: string, subCategory: string, status: string, paymentStatus: string, assigneeName: string, captainName: string, comment: string, dueDate: Time, assignmentDate: Time, completionDate: Time, bill: bigint, advanceReceived: bigint, outstandingAmount: bigint): Promise<Task>;
}
