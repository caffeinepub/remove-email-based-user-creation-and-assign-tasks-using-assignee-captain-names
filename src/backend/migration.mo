import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  // Types matching old state.
  type OldTask = {
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

  // User Profile Type (as originally defined).
  type OldUserProfile = {
    name : Text;
    email : Text;
    createdAt : Time.Time;
  };

  type OldTaskCategory = {
    id : Text;
    name : Text;
  };

  type OldSubCategory = {
    id : Text;
    name : Text;
    category : OldTaskCategory;
  };

  type OldTaskStatus = {
    id : Text;
    name : Text;
  };

  type OldPaymentStatus = {
    id : Text;
    name : Text;
  };

  // Old actor type (prior to migration).
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    tasks : Map.Map<Text, OldTask>;
    taskCategories : Map.Map<Text, OldTaskCategory>;
    subCategories : Map.Map<Text, OldSubCategory>;
    taskStatuses : Map.Map<Text, OldTaskStatus>;
    paymentStatuses : Map.Map<Text, OldPaymentStatus>;
  };

  // Types matching new state.
  type NewTask = {
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

  // User Profile Type (matches old type).
  type NewUserProfile = {
    name : Text;
    email : Text;
    createdAt : Time.Time;
  };

  type NewTaskCategory = {
    id : Text;
    name : Text;
  };

  type NewSubCategory = {
    id : Text;
    name : Text;
    category : NewTaskCategory;
  };

  type NewTaskStatus = {
    id : Text;
    name : Text;
  };

  type NewPaymentStatus = {
    id : Text;
    name : Text;
  };

  // New actor type after migration.
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    tasks : Map.Map<Text, NewTask>;
    taskCategories : Map.Map<Text, NewTaskCategory>;
    subCategories : Map.Map<Text, NewSubCategory>;
    taskStatuses : Map.Map<Text, NewTaskStatus>;
    paymentStatuses : Map.Map<Text, NewPaymentStatus>;
    assigneeCaptainDirectory : Map.Map<Text, Text>;
  };

  public func run(old : OldActor) : NewActor {
    { old with assigneeCaptainDirectory = Map.empty<Text, Text>() };
  };
};
