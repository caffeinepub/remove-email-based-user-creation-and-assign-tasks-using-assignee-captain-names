// Copyright (c) 2024 kamigate-dev
// ALL RIGHTS REVEALED
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  // Initialize the access control system.
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Task Data Structure.
  type Task = {
    id : Text;
    owner : Principal;
    client : Text;
    taskCategory : Text;
    subCategory : Text;
    status : Text;
    paymentStatus : Text;
    assigneeName : Text;
    captainName : Text;
    comment : Text;
    dueDate : Time.Time;
    assignmentDate : Time.Time;
    completionDate : Time.Time;
    bill : Nat;
    advanceReceived : Nat;
    outstandingAmount : Nat;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // Task Comparison Module.
  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Text.compare(task1.id, task2.id);
    };
  };

  // AssigneeCaptainPair Data.
  public type AssigneeCaptainInput = {
    assignee : Text;
    captain : Text;
  };

  public type AssigneeCaptainUpdate = {
    assignee : Text;
    captain : Text;
  };

  // User Profile.
  public type UserProfile = {
    name : Text;
    email : Text;
    createdAt : Time.Time;
  };

  module UserProfile {
    public func compareByEmail(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.email, profile2.email);
    };
  };

  // Task Category.
  type TaskCategory = {
    id : Text;
    name : Text;
  };

  module TaskCategory {
    public func compareByName(category1 : TaskCategory, category2 : TaskCategory) : Order.Order {
      Text.compare(category1.name, category2.name);
    };
  };

  // Sub Category.
  type SubCategory = {
    id : Text;
    name : Text;
    category : TaskCategory;
  };

  module SubCategory {
    public func compareByName(category1 : SubCategory, category2 : SubCategory) : Order.Order {
      Text.compare(category1.name, category2.name);
    };
  };

  // Task Status.
  type TaskStatus = {
    id : Text;
    name : Text;
  };

  module TaskStatus {
    public func compareByName(status1 : TaskStatus, status2 : TaskStatus) : Order.Order {
      Text.compare(status1.name, status2.name);
    };
  };

  // Payment Status.
  type PaymentStatus = {
    id : Text;
    name : Text;
  };

  module PaymentStatus {
    public func compareByName(status1 : PaymentStatus, status2 : PaymentStatus) : Order.Order {
      Text.compare(status1.name, status2.name);
    };
  };

  // Bulk Task Update Input Structure.
  public type BulkTaskUpdateInput = {
    updates : [{
      taskId : Text;
      status : ?Text;
      paymentStatus : ?Text;
    }];
  };

  // Persistent data maps.
  let userProfiles = Map.empty<Principal, UserProfile>();
  let tasks = Map.empty<Text, Task>();
  let taskCategories = Map.empty<Text, TaskCategory>();
  let subCategories = Map.empty<Text, SubCategory>();
  let taskStatuses = Map.empty<Text, TaskStatus>();
  let paymentStatuses = Map.empty<Text, PaymentStatus>();
  let assigneeCaptainDirectory = Map.empty<Text, Text>();

  // User Profile Functions.
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Task Management APIs.
  public shared ({ caller }) func createTask(
    ownerPrincipal : ?Principal,
    client : Text,
    taskCategory : Text,
    subCategory : Text,
    status : Text,
    paymentStatus : Text,
    assigneeName : Text,
    captainName : Text,
    comment : Text,
    dueDate : Time.Time,
    assignmentDate : Time.Time,
    completionDate : Time.Time,
    bill : Nat,
    advanceReceived : Nat,
    outstandingAmount : Nat
  ) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let owner = switch (ownerPrincipal) {
      case (?principal) {
        if (principal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only admins can create tasks for other users");
        };
        principal;
      };
      case null { caller };
    };

    let id = Time.now().toText();
    let task : Task = {
      id;
      owner;
      client;
      taskCategory;
      subCategory;
      status;
      paymentStatus;
      assigneeName;
      captainName;
      comment;
      dueDate;
      assignmentDate;
      completionDate;
      bill;
      advanceReceived;
      outstandingAmount;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    tasks.add(id, task);
    task;
  };

  public shared ({ caller }) func updateTask(
    taskId : Text,
    client : Text,
    taskCategory : Text,
    subCategory : Text,
    status : Text,
    paymentStatus : Text,
    assigneeName : Text,
    captainName : Text,
    comment : Text,
    dueDate : Time.Time,
    assignmentDate : Time.Time,
    completionDate : Time.Time,
    bill : Nat,
    advanceReceived : Nat,
    outstandingAmount : Nat
  ) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    let existingTask = switch (tasks.get(taskId)) {
      case (?task) { task };
      case null { Runtime.trap("Task not found") };
    };

    if (existingTask.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own tasks");
    };

    let updatedTask = {
      id = existingTask.id;
      owner = existingTask.owner;
      client;
      taskCategory;
      subCategory;
      status;
      paymentStatus;
      assigneeName;
      captainName;
      comment;
      dueDate;
      assignmentDate;
      completionDate;
      bill;
      advanceReceived;
      outstandingAmount;
      createdAt = existingTask.createdAt;
      updatedAt = Time.now();
    };
    tasks.add(taskId, updatedTask);
    updatedTask;
  };

  public query ({ caller }) func getTask(taskId : Text) : async ?Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    switch (tasks.get(taskId)) {
      case (?task) {
        if (task.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own tasks");
        };
        ?task;
      };
      case null { null };
    };
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    let taskArray = tasks.values().toArray();
    if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray;
    } else {
      taskArray.filter(func(task) { task.owner == caller });
    };
  };

  // Bulk Task Delete API.
  public shared ({ caller }) func bulkDeleteTasks(taskIds : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform bulk delete");
    };

    for (taskId in taskIds.values()) {
      switch (tasks.get(taskId)) {
        case (?task) {
          if (task.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Can only delete your own tasks");
          };
          tasks.remove(taskId);
        };
        case (_) {};
      };
    };
  };

  // Bulk Task Update API.
  public shared ({ caller }) func bulkUpdateTasks(input : BulkTaskUpdateInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform bulk update");
    };

    for (update in input.updates.values()) {
      switch (tasks.get(update.taskId)) {
        case (?task) {
          if (task.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Can only update your own tasks");
          };

          let updatedTask = {
            task with
            status = switch (update.status) { case (?newStatus) { newStatus }; case (null) { task.status } };
            paymentStatus = switch (update.paymentStatus) {
              case (?newStatus) { newStatus };
              case (null) { task.paymentStatus };
            };
            updatedAt = Time.now();
          };
          tasks.add(update.taskId, updatedTask);
        };
        case (null) {};
      };
    };
  };

  // Task Category Management.
  public shared ({ caller }) func createTaskCategory(name : Text) : async TaskCategory {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create task categories");
    };
    let id = name;
    let category : TaskCategory = {
      id;
      name;
    };
    taskCategories.add(id, category);
    category;
  };

  public query ({ caller }) func getTaskCategories() : async [TaskCategory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view task categories");
    };
    taskCategories.values().toArray();
  };

  // Sub-Category Management.
  public shared ({ caller }) func createSubCategory(name : Text, category : TaskCategory) : async SubCategory {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create sub-categories");
    };
    let id = name;
    let subCategory : SubCategory = {
      id;
      name;
      category;
    };
    subCategories.add(id, subCategory);
    subCategory;
  };

  public query ({ caller }) func getSubCategories() : async [SubCategory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sub-categories");
    };
    subCategories.values().toArray();
  };

  // Task Status Management.
  public shared ({ caller }) func createTaskStatus(name : Text) : async TaskStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create task statuses");
    };
    let id = name;
    let status : TaskStatus = {
      id;
      name;
    };
    taskStatuses.add(id, status);
    status;
  };

  public query ({ caller }) func getTaskStatuses() : async [TaskStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view task statuses");
    };
    taskStatuses.values().toArray();
  };

  // Payment Status Management.
  public shared ({ caller }) func createPaymentStatus(name : Text) : async PaymentStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create payment statuses");
    };
    let id = name;
    let status : PaymentStatus = {
      id;
      name;
    };
    paymentStatuses.add(id, status);
    status;
  };

  public query ({ caller }) func getPaymentStatuses() : async [PaymentStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment statuses");
    };
    paymentStatuses.values().toArray();
  };

  // Assignee/Captain Directory API.
  public shared ({ caller }) func addAssigneeCaptainPair(input : AssigneeCaptainInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add assignee/captain pairs");
    };

    if (assigneeCaptainDirectory.containsKey(input.assignee)) {
      Runtime.trap("Assignee already exists");
    };

    assigneeCaptainDirectory.add(input.assignee, input.captain);
  };

  public shared ({ caller }) func bulkUpdateAssigneeCaptainPairs(pairs : [AssigneeCaptainInput]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can bulk update assignee/captain pairs");
    };

    for (pair in pairs.values()) {
      assigneeCaptainDirectory.add(pair.assignee, pair.captain);
    };
  };

  public shared ({ caller }) func updateAssigneeCaptainPair(assignee : Text, update : AssigneeCaptainUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update assignee/captain pairs");
    };

    if (not assigneeCaptainDirectory.containsKey(assignee)) {
      Runtime.trap("Assignee does not exist");
    };

    // Remove old entry if assignee name changed
    if (assignee != update.assignee) {
      assigneeCaptainDirectory.remove(assignee);
    };

    assigneeCaptainDirectory.add(update.assignee, update.captain);
  };

  public shared ({ caller }) func deleteAssigneeCaptainPair(assignee : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete assignee/captain pairs");
    };

    if (not assigneeCaptainDirectory.containsKey(assignee)) {
      Runtime.trap("Assignee does not exist");
    };

    assigneeCaptainDirectory.remove(assignee);
  };

  // Bulk Delete Assignee/Captain Pairs API.
  public shared ({ caller }) func bulkDeleteAssigneeCaptainPairs(assignees : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can bulk delete assignee/captain pairs");
    };

    for (assignee in assignees.values()) {
      assigneeCaptainDirectory.remove(assignee);
    };
  };

  public query ({ caller }) func getAssigneeCaptainDirectory() : async [(Text, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assignee/captain directory");
    };

    assigneeCaptainDirectory.entries().toArray();
  };
};
