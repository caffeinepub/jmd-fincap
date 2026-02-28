import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ContactFormSubmission = {
    name : Text;
    phone : Text;
    email : Text;
    serviceInterest : Text;
    message : Text;
    timestamp : Time.Time;
  };

  module ContactFormSubmission {
    public func compareByTimestamp(a : ContactFormSubmission, b : ContactFormSubmission) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  var submissionsList = List.empty<ContactFormSubmission>();

  // User profile management functions
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

  // Contact form submission - anyone can submit (including guests)
  public shared ({ caller }) func submitContactForm(
    name : Text,
    phone : Text,
    email : Text,
    serviceInterest : Text,
    message : Text,
  ) : async () {
    let submission : ContactFormSubmission = {
      name;
      phone;
      email;
      serviceInterest;
      message;
      timestamp = Time.now();
    };
    submissionsList.add(submission);
  };

  // Get all submissions - ADMIN ONLY
  public query ({ caller }) func getAllSubmissions() : async [ContactFormSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all submissions");
    };
    submissionsList.toArray().sort(ContactFormSubmission.compareByTimestamp);
  };
};
