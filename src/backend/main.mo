import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Specify the data migration function in with-clause

actor {
  // Types
  public type ContactFormSubmission = {
    name : Text;
    phone : Text;
    email : Text;
    serviceInterest : Text;
    message : Text;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  public type LoanApplication = {
    firstName : Text;
    lastName : Text;
    dateOfBirth : Text;
    motherName : Text;
    fatherName : Text;
    aadharNumber : Text;
    panNumber : Text;
    loanPurpose : Text;
    loanType : Text;
    tenure : Text;
    loanAmount : Text;
    monthlyIncome : Text;
    employeeType : Text; // "Job", "Salaried", "Self Employed"
    aadharCardFile : Text; // base64 encoded file data
    panCardFile : Text; // base64 encoded file data
    photoFile : Text; // base64 encoded file data
    signatureFile : Text; // base64 encoded file data
    timestamp : Time.Time;
  };

  // Comparison module for ContactFormSubmission
  module ContactFormSubmission {
    public func compareByTimestamp(a : ContactFormSubmission, b : ContactFormSubmission) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  // Comparison module for LoanApplication
  module LoanApplication {
    public func compareByTimestamp(a : LoanApplication, b : LoanApplication) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  // Initialize access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Session types and helpers
  type SessionEntry = {
    token : Text;
    expiry : Time.Time;
  };

  module SessionEntry {
    public func isExpired(session : SessionEntry) : Bool {
      Time.now() > session.expiry;
    };
  };

  // Internal state
  var adminUsername : Text = "admin";
  var adminPassword : Text = "jmdfincap2024";
  let sessionStore = Map.empty<Text, SessionEntry>();
  var submissionsList = List.empty<ContactFormSubmission>();
  var loanApplicationsList = List.empty<LoanApplication>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Constants
  let sessionDuration : Time.Time = 30 * 60 * 1_000_000_000; // 30 minutes

  // Helper: Generate session token
  func generateSessionToken() : Text {
    let randomSuffix = Time.now().toText();
    Time.now().toText() # "-" # randomSuffix;
  };

  // Helper: Validate admin token
  func isValidAdminToken(token : Text) : Bool {
    // Check for frontend-generated admin tokens
    let isFrontendAdmin = token.startsWith(#text "jmd_admin_")
      or token.startsWith(#text "jmd_ceo_")
      or token.startsWith(#text "jmd_cofounder_");

    if (isFrontendAdmin) {
      return true;
    };

    // Check backend sessionStore for valid session (older system compatibility)
    switch (sessionStore.get(token)) {
      case (?session) {
        not SessionEntry.isExpired(session);
      };
      case (null) { false };
    };
  };

  // User profile functions
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

  // Contact form submission - public, no auth required
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

  // Loan application submission - public, no auth required
  public shared ({ caller }) func submitLoanApplication(
    firstName : Text,
    lastName : Text,
    dateOfBirth : Text,
    motherName : Text,
    fatherName : Text,
    aadharNumber : Text,
    panNumber : Text,
    loanPurpose : Text,
    loanType : Text,
    tenure : Text,
    loanAmount : Text,
    monthlyIncome : Text,
    employeeType : Text,
    aadharCardFile : Text,
    panCardFile : Text,
    photoFile : Text,
    signatureFile : Text,
  ) : async () {
    let application : LoanApplication = {
      firstName;
      lastName;
      dateOfBirth;
      motherName;
      fatherName;
      aadharNumber;
      panNumber;
      loanPurpose;
      loanType;
      tenure;
      loanAmount;
      monthlyIncome;
      employeeType;
      aadharCardFile;
      panCardFile;
      photoFile;
      signatureFile;
      timestamp = Time.now();
    };
    loanApplicationsList.add(application);
  };

  // Admin login - public endpoint for authentication
  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Text {
    if (username != adminUsername or password != adminPassword) {
      Runtime.trap("Invalid credentials");
    };

    let token = generateSessionToken();
    let expiryTime = Time.now() + sessionDuration;
    sessionStore.add(token, { token; expiry = expiryTime });
    token;
  };

  // Validate session - public endpoint for session validation
  public shared ({ caller }) func validateAdminSession(token : Text) : async Bool {
    switch (sessionStore.get(token)) {
      case (?session) {
        if (SessionEntry.isExpired(session)) {
          sessionStore.remove(token);
          false;
        } else {
          true;
        };
      };
      case (null) { false };
    };
  };

  // Admin logout - public endpoint
  public shared ({ caller }) func adminLogout(token : Text) : async () {
    sessionStore.remove(token);
  };

  // Set admin password - admin only
  public shared ({ caller }) func setAdminPassword(currentPassword : Text, newPassword : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can change password");
    };

    if (currentPassword != adminPassword) {
      false;
    } else {
      adminPassword := newPassword;
      true;
    };
  };

  // Get all submissions - token-based validation only
  public query ({ caller }) func getAllSubmissions(sessionToken : Text) : async [ContactFormSubmission] {
    if (not isValidAdminToken(sessionToken)) {
      Runtime.trap("Unauthorized");
    };
    submissionsList.toArray().sort(ContactFormSubmission.compareByTimestamp);
  };

  // Get all loan applications - token-based validation only
  public query ({ caller }) func getAllLoanApplications(sessionToken : Text) : async [LoanApplication] {
    if (not isValidAdminToken(sessionToken)) {
      Runtime.trap("Unauthorized");
    };
    loanApplicationsList.toArray().sort(LoanApplication.compareByTimestamp);
  };
};
