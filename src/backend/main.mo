import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize the access control system.
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Task Type.
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
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // Task Comparison Module.
  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Text.compare(task1.id, task2.id);
    };
  };

  // User Profile Type.
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

  type TaskCategory = {
    id : Text;
    name : Text;
  };

  module TaskCategory {
    public func compareByName(category1 : TaskCategory, category2 : TaskCategory) : Order.Order {
      Text.compare(category1.name, category2.name);
    };
  };

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

  type TaskStatus = {
    id : Text;
    name : Text;
  };

  module TaskStatus {
    public func compareByName(status1 : TaskStatus, status2 : TaskStatus) : Order.Order {
      Text.compare(status1.name, status2.name);
    };
  };

  type PaymentStatus = {
    id : Text;
    name : Text;
  };

  module PaymentStatus {
    public func compareByName(status1 : PaymentStatus, status2 : PaymentStatus) : Order.Order {
      Text.compare(status1.name, status2.name);
    };
  };

  type AssigneeCaptainPair = {
    assignee : Text;
    captain : Text;
  };

  public type AssigneeCaptainInput = {
    assignee : Text;
    captain : Text;
  };

  public type AssigneeCaptainUpdate = {
    assignee : Text;
    captain : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let tasks = Map.empty<Text, Task>();
  let taskCategories = Map.empty<Text, TaskCategory>();
  let subCategories = Map.empty<Text, SubCategory>();
  let taskStatuses = Map.empty<Text, TaskStatus>();
  let paymentStatuses = Map.empty<Text, PaymentStatus>();
  let assigneeCaptainDirectory = Map.empty<Text, Text>();

  // New Assignee/Captain API
  public shared ({ caller }) func addAssigneeCaptainPair(input : AssigneeCaptainInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add assignee/captain pairs");
    };
    if (assigneeCaptainDirectory.containsKey(input.assignee)) {
      Runtime.trap("Assignee already exists");
    };
    assigneeCaptainDirectory.add(input.assignee, input.captain);
  };

  public shared ({ caller }) func updateAssigneeCaptainPair(assignee : Text, update : AssigneeCaptainUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update assignee/captain pairs");
    };
    if (not assigneeCaptainDirectory.containsKey(assignee)) {
      Runtime.trap("Assignee does not exist");
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

  public query ({ caller }) func getAssigneeCaptainDirectory() : async [(Text, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assignee/captain directory");
    };

    assigneeCaptainDirectory.entries().toArray();
  };

  // Required User Profile Functions.
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

  // User Management (Admin-Only).
  public shared ({ caller }) func createUser(userPrincipal : Principal, name : Text, email : Text) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create users");
    };
    let profile : UserProfile = {
      name;
      email;
      createdAt = Time.now();
    };
    userProfiles.add(userPrincipal, profile);
    AccessControl.assignRole(accessControlState, caller, userPrincipal, #user);
    profile;
  };

  public shared ({ caller }) func deleteUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    if (not userProfiles.containsKey(user)) {
      Runtime.trap("User does not exist");
    };
    userProfiles.remove(user);
  };

  public query ({ caller }) func listAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    userProfiles.values().toArray();
  };

  public shared ({ caller }) func setUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func getUserRole(user : Principal) : async AccessControl.UserRole {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view user roles");
    };
    AccessControl.getUserRole(accessControlState, user);
  };

  // Task Category Management (Admin-Only).
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

  // Query functions for categories/statuses.
  public query ({ caller }) func getTaskCategories() : async [TaskCategory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view task categories");
    };
    taskCategories.values().toArray();
  };

  public query ({ caller }) func getSubCategories() : async [SubCategory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sub-categories");
    };
    subCategories.values().toArray();
  };

  public query ({ caller }) func getTaskStatuses() : async [TaskStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view task statuses");
    };
    taskStatuses.values().toArray();
  };

  public query ({ caller }) func getPaymentStatuses() : async [PaymentStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment statuses");
    };
    paymentStatuses.values().toArray();
  };

  // Task Management with Assignee.
  public shared ({ caller }) func createTask(
    ownerPrincipal : ?Principal,
    client : Text,
    taskCategory : Text,
    subCategory : Text,
    status : Text,
    paymentStatus : Text,
    assigneeName : Text,
    captainName : Text,
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
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    tasks.add(id, task);
    task;
  };

  // Update Task with Assignee.
  public shared ({ caller }) func updateTask(
    taskId : Text,
    client : Text,
    taskCategory : Text,
    subCategory : Text,
    status : Text,
    paymentStatus : Text,
    assigneeName : Text,
    captainName : Text,
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

    let updatedTask : Task = {
      id = existingTask.id;
      owner = existingTask.owner;
      client;
      taskCategory;
      subCategory;
      status;
      paymentStatus;
      assigneeName;
      captainName;
      createdAt = existingTask.createdAt;
      updatedAt = Time.now();
    };
    tasks.add(taskId, updatedTask);
    updatedTask;
  };

  // Delete Task.
  public shared ({ caller }) func deleteTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    let existingTask = switch (tasks.get(taskId)) {
      case (?task) { task };
      case null { Runtime.trap("Task not found") };
    };

    if (existingTask.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own tasks");
    };

    tasks.remove(taskId);
  };

  // Get single Task.
  public query ({ caller }) func getTask(taskId : Text) : async ?Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    let task = tasks.get(taskId);
    switch (task) {
      case (?t) {
        if (t.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own tasks");
        };
        ?t;
      };
      case null { null };
    };
  };

  // Get Tasks by Owner.
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

  // Filtering and Analytics Queries.
  public query ({ caller }) func filterTasksByClient(clientId : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter tasks by client");
    };
    let taskArray = tasks.values().toArray();
    let filteredTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray.filter(func(task) { task.client == clientId });
    } else {
      taskArray.filter(func(task) { task.owner == caller and task.client == clientId });
    };
    filteredTasks;
  };

  public query ({ caller }) func filterTasksByCategory(category : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter tasks by category");
    };
    let taskArray = tasks.values().toArray();
    let filteredTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray.filter(func(task) { task.taskCategory == category });
    } else {
      taskArray.filter(func(task) { task.owner == caller and task.taskCategory == category });
    };
    filteredTasks;
  };

  public query ({ caller }) func filterTasksBySubCategory(subCategory : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter tasks by sub-category");
    };
    let taskArray = tasks.values().toArray();
    let filteredTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray.filter(func(task) { task.subCategory == subCategory });
    } else {
      taskArray.filter(func(task) { task.owner == caller and task.subCategory == subCategory });
    };
    filteredTasks;
  };

  public query ({ caller }) func filterTasksByStatus(status : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter tasks by status");
    };
    let taskArray = tasks.values().toArray();
    let filteredTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray.filter(func(task) { task.status == status });
    } else {
      taskArray.filter(func(task) { task.owner == caller and task.status == status });
    };
    filteredTasks;
  };

  public query ({ caller }) func filterTasksByPaymentStatus(paymentStatus : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter tasks by payment status");
    };
    let taskArray = tasks.values().toArray();
    let filteredTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray.filter(func(task) { task.paymentStatus == paymentStatus });
    } else {
      taskArray.filter(func(task) { task.owner == caller and task.paymentStatus == paymentStatus });
    };
    filteredTasks;
  };

  // Analytics Queries.
  public query ({ caller }) func getTaskCountsPerCategory() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get task counts per category");
    };
    let taskArray = tasks.values().toArray();
    let relevantTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray;
    } else {
      taskArray.filter(func(task) { task.owner == caller });
    };

    let counts = Map.empty<Text, Nat>();
    for (task in relevantTasks.vals()) {
      let currentCount = switch (counts.get(task.taskCategory)) {
        case (?count) { count };
        case null { 0 };
      };
      counts.add(task.taskCategory, currentCount + 1);
    };
    counts.entries().toArray();
  };

  public query ({ caller }) func getTaskCountsPerStatus() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get task counts per status");
    };
    let taskArray = tasks.values().toArray();
    let relevantTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray;
    } else {
      taskArray.filter(func(task) { task.owner == caller });
    };

    let counts = Map.empty<Text, Nat>();
    for (task in relevantTasks.vals()) {
      let currentCount = switch (counts.get(task.status)) {
        case (?count) { count };
        case null { 0 };
      };
      counts.add(task.status, currentCount + 1);
    };
    counts.entries().toArray();
  };

  public query ({ caller }) func getTaskCountsPerPaymentStatus() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get task counts per payment status");
    };
    let taskArray = tasks.values().toArray();
    let relevantTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray;
    } else {
      taskArray.filter(func(task) { task.owner == caller });
    };

    let counts = Map.empty<Text, Nat>();
    for (task in relevantTasks.vals()) {
      let currentCount = switch (counts.get(task.paymentStatus)) {
        case (?count) { count };
        case null { 0 };
      };
      counts.add(task.paymentStatus, currentCount + 1);
    };
    counts.entries().toArray();
  };

  // Bulk Task Creation with Assignee.
  public shared ({ caller }) func bulkCreateTasks(tasksData : [(Principal, Text, Text, Text, Text, Text, Text, Text)]) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can bulk create tasks");
    };

    let createdTasks = tasksData.map(
      func(taskData) {
        let (owner, client, taskCategory, subCategory, status, paymentStatus, assigneeName, captainName) = taskData;

        // Validate that the owner exists in userProfiles
        if (not userProfiles.containsKey(owner)) {
          Runtime.trap("Invalid owner: User does not exist");
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
          createdAt = Time.now();
          updatedAt = Time.now();
        };
        tasks.add(id, task);
        task;
      },
    );
    createdTasks;
  };

  // Filter Tasks by AssigneeName (Text-based).
  public query ({ caller }) func filterTasksByAssigneeName(assigneeName : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter tasks by assignee");
    };

    let taskArray = tasks.values().toArray();

    let filteredTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray.filter(func(task) { task.assigneeName == assigneeName });
    } else {
      taskArray.filter(func(task) { task.owner == caller and task.assigneeName == assigneeName });
    };
    filteredTasks;
  };

  // Filter Tasks by CaptainName.
  public query ({ caller }) func filterTasksByCaptainName(captainName : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter tasks by captain");
    };

    let taskArray = tasks.values().toArray();

    let filteredTasks = if (AccessControl.isAdmin(accessControlState, caller)) {
      taskArray.filter(func(task) { task.captainName == captainName });
    } else {
      taskArray.filter(func(task) { task.owner == caller and task.captainName == captainName });
    };
    filteredTasks;
  };
};
