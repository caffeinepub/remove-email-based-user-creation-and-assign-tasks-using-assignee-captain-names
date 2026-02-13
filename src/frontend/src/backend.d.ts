import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SubCategory {
    id: string;
    name: string;
    category: TaskCategory;
}
export type Time = bigint;
export interface AssigneeCaptainUpdate {
    assignee: string;
    captain: string;
}
export interface TaskStatus {
    id: string;
    name: string;
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
    captainName: string;
    owner: Principal;
    createdAt: Time;
    assigneeName: string;
    updatedAt: Time;
    taskCategory: string;
}
export interface PaymentStatus {
    id: string;
    name: string;
}
export interface AssigneeCaptainInput {
    assignee: string;
    captain: string;
}
export interface UserProfile {
    name: string;
    createdAt: Time;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAssigneeCaptainPair(input: AssigneeCaptainInput): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkCreateTasks(tasksData: Array<[Principal, string, string, string, string, string, string, string]>): Promise<Array<Task>>;
    createPaymentStatus(name: string): Promise<PaymentStatus>;
    createSubCategory(name: string, category: TaskCategory): Promise<SubCategory>;
    createTask(ownerPrincipal: Principal | null, client: string, taskCategory: string, subCategory: string, status: string, paymentStatus: string, assigneeName: string, captainName: string): Promise<Task>;
    createTaskCategory(name: string): Promise<TaskCategory>;
    createTaskStatus(name: string): Promise<TaskStatus>;
    createUser(userPrincipal: Principal, name: string, email: string): Promise<UserProfile>;
    deleteAssigneeCaptainPair(assignee: string): Promise<void>;
    deleteTask(taskId: string): Promise<void>;
    deleteUser(user: Principal): Promise<void>;
    filterTasksByAssigneeName(assigneeName: string): Promise<Array<Task>>;
    filterTasksByCaptainName(captainName: string): Promise<Array<Task>>;
    filterTasksByCategory(category: string): Promise<Array<Task>>;
    filterTasksByClient(clientId: string): Promise<Array<Task>>;
    filterTasksByPaymentStatus(paymentStatus: string): Promise<Array<Task>>;
    filterTasksByStatus(status: string): Promise<Array<Task>>;
    filterTasksBySubCategory(subCategory: string): Promise<Array<Task>>;
    getAssigneeCaptainDirectory(): Promise<Array<[string, string]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPaymentStatuses(): Promise<Array<PaymentStatus>>;
    getSubCategories(): Promise<Array<SubCategory>>;
    getTask(taskId: string): Promise<Task | null>;
    getTaskCategories(): Promise<Array<TaskCategory>>;
    getTaskCountsPerCategory(): Promise<Array<[string, bigint]>>;
    getTaskCountsPerPaymentStatus(): Promise<Array<[string, bigint]>>;
    getTaskCountsPerStatus(): Promise<Array<[string, bigint]>>;
    getTaskStatuses(): Promise<Array<TaskStatus>>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(user: Principal): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    listAllUsers(): Promise<Array<UserProfile>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUserRole(user: Principal, role: UserRole): Promise<void>;
    updateAssigneeCaptainPair(assignee: string, update: AssigneeCaptainUpdate): Promise<void>;
    updateTask(taskId: string, client: string, taskCategory: string, subCategory: string, status: string, paymentStatus: string, assigneeName: string, captainName: string): Promise<Task>;
}
