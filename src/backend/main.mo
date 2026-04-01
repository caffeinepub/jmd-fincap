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

actor {
  // =========================================
  // TYPES
  // =========================================

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
    employeeType : Text;
    aadharCardFile : Text;
    panCardFile : Text;
    photoFile : Text;
    signatureFile : Text;
    timestamp : Time.Time;
  };

  public type WorkflowApplication = {
    id : Text;
    firstName : Text;
    lastName : Text;
    fatherName : Text;
    motherName : Text;
    dateOfBirth : Text;
    gender : Text;
    mobile : Text;
    email : Text;
    aadharNumber : Text;
    panNumber : Text;
    currentAddress : Text;
    permanentAddress : Text;
    occupation : Text;
    companyName : Text;
    monthlyIncome : Text;
    workExperience : Text;
    loanType : Text;
    loanAmount : Text;
    tenure : Text;
    loanPurpose : Text;
    reference1Name : Text;
    reference1Mobile : Text;
    reference1Relation : Text;
    aadharCardFile : Text;
    panCardFile : Text;
    photoFile : Text;
    electricityBillFile : Text;
    status : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type AuditEntry = {
    applicationId : Text;
    action : Text;
    performedBy : Text;
    remark : Text;
    timestamp : Time.Time;
  };

  // =========================================
  // COMPARISON MODULES
  // =========================================

  module ContactFormSubmission {
    public func compareByTimestamp(a : ContactFormSubmission, b : ContactFormSubmission) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  module LoanApplication {
    public func compareByTimestamp(a : LoanApplication, b : LoanApplication) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  module WorkflowApplication {
    public func compareByTimestamp(a : WorkflowApplication, b : WorkflowApplication) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  module AuditEntry {
    public func compareByTimestamp(a : AuditEntry, b : AuditEntry) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  // =========================================
  // ACCESS CONTROL
  // =========================================

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type SessionEntry = {
    token : Text;
    expiry : Time.Time;
  };

  module SessionEntry {
    public func isExpired(session : SessionEntry) : Bool {
      Time.now() > session.expiry;
    };
  };

  // =========================================
  // STATE
  // =========================================

  var adminUsername : Text = "admin";
  var adminPassword : Text = "jmdfincap2024";
  let sessionStore = Map.empty<Text, SessionEntry>();
  var submissionsList = List.empty<ContactFormSubmission>();
  var loanApplicationsList = List.empty<LoanApplication>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let workflowApps = Map.empty<Text, WorkflowApplication>();
  var auditLog = List.empty<AuditEntry>();

  let sessionDuration : Time.Time = 30 * 60 * 1_000_000_000;

  // =========================================
  // HELPERS
  // =========================================

  func generateSessionToken() : Text {
    Time.now().toText() # "-" # Time.now().toText();
  };

  func isValidStaffToken(token : Text) : Bool {
    token.startsWith(#text "jmd_admin_")
      or token.startsWith(#text "jmd_bm_")
      or token.startsWith(#text "jmd_crm_")
      or token.startsWith(#text "jmd_accounts_")
      or token.startsWith(#text "jmd_operations_")
      or token.startsWith(#text "jmd_ceo_")
      or token.startsWith(#text "jmd_cofounder_")
      or (switch (sessionStore.get(token)) {
        case (?session) { not SessionEntry.isExpired(session) };
        case (null) { false };
      });
  };

  func isValidAdminToken(token : Text) : Bool {
    isValidStaffToken(token);
  };

  func addAuditEntry(appId : Text, action : Text, performedBy : Text, remark : Text) {
    let entry : AuditEntry = {
      applicationId = appId;
      action;
      performedBy;
      remark;
      timestamp = Time.now();
    };
    auditLog.add(entry);
  };

  func updateAppStatus(appId : Text, newStatus : Text, performedBy : Text, remark : Text) : Bool {
    switch (workflowApps.get(appId)) {
      case (?app) {
        let updatedApp : WorkflowApplication = {
          id = app.id;
          firstName = app.firstName;
          lastName = app.lastName;
          fatherName = app.fatherName;
          motherName = app.motherName;
          dateOfBirth = app.dateOfBirth;
          gender = app.gender;
          mobile = app.mobile;
          email = app.email;
          aadharNumber = app.aadharNumber;
          panNumber = app.panNumber;
          currentAddress = app.currentAddress;
          permanentAddress = app.permanentAddress;
          occupation = app.occupation;
          companyName = app.companyName;
          monthlyIncome = app.monthlyIncome;
          workExperience = app.workExperience;
          loanType = app.loanType;
          loanAmount = app.loanAmount;
          tenure = app.tenure;
          loanPurpose = app.loanPurpose;
          reference1Name = app.reference1Name;
          reference1Mobile = app.reference1Mobile;
          reference1Relation = app.reference1Relation;
          aadharCardFile = app.aadharCardFile;
          panCardFile = app.panCardFile;
          photoFile = app.photoFile;
          electricityBillFile = app.electricityBillFile;
          status = newStatus;
          createdAt = app.createdAt;
          updatedAt = Time.now();
        };
        workflowApps.add(appId, updatedApp);
        addAuditEntry(appId, newStatus, performedBy, remark);
        true;
      };
      case (null) { false };
    };
  };

  // =========================================
  // USER PROFILE FUNCTIONS
  // =========================================

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // =========================================
  // CONTACT FORM (public)
  // =========================================

  public shared ({ caller }) func submitContactForm(
    name : Text,
    phone : Text,
    email : Text,
    serviceInterest : Text,
    message : Text,
  ) : async () {
    let submission : ContactFormSubmission = {
      name; phone; email; serviceInterest; message;
      timestamp = Time.now();
    };
    submissionsList.add(submission);
  };

  // =========================================
  // LEGACY LOAN APPLICATION (backward compat)
  // =========================================

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
      firstName; lastName; dateOfBirth; motherName; fatherName;
      aadharNumber; panNumber; loanPurpose; loanType; tenure;
      loanAmount; monthlyIncome; employeeType;
      aadharCardFile; panCardFile; photoFile; signatureFile;
      timestamp = Time.now();
    };
    loanApplicationsList.add(application);
  };

  // =========================================
  // WORKFLOW APPLICATION (new system)
  // =========================================

  public shared ({ caller }) func submitWorkflowApplication(
    firstName : Text,
    lastName : Text,
    fatherName : Text,
    motherName : Text,
    dateOfBirth : Text,
    gender : Text,
    mobile : Text,
    email : Text,
    aadharNumber : Text,
    panNumber : Text,
    currentAddress : Text,
    permanentAddress : Text,
    occupation : Text,
    companyName : Text,
    monthlyIncome : Text,
    workExperience : Text,
    loanType : Text,
    loanAmount : Text,
    tenure : Text,
    loanPurpose : Text,
    reference1Name : Text,
    reference1Mobile : Text,
    reference1Relation : Text,
    aadharCardFile : Text,
    panCardFile : Text,
    photoFile : Text,
    electricityBillFile : Text,
  ) : async Text {
    let now = Time.now();
    let appId = "APP-" # now.toText();
    let application : WorkflowApplication = {
      id = appId;
      firstName; lastName; fatherName; motherName;
      dateOfBirth; gender; mobile; email;
      aadharNumber; panNumber;
      currentAddress; permanentAddress;
      occupation; companyName; monthlyIncome; workExperience;
      loanType; loanAmount; tenure; loanPurpose;
      reference1Name; reference1Mobile; reference1Relation;
      aadharCardFile; panCardFile; photoFile; electricityBillFile;
      status = "New";
      createdAt = now;
      updatedAt = now;
    };
    workflowApps.add(appId, application);
    addAuditEntry(appId, "New", "Customer", "Application submitted by customer");
    appId;
  };

  public shared ({ caller }) func markUnderCRMReview(appId : Text, token : Text, remark : Text) : async Bool {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    updateAppStatus(appId, "UnderCRMReview", "CRM", remark);
  };

  public shared ({ caller }) func forwardToBM(appId : Text, token : Text, remark : Text) : async Bool {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    updateAppStatus(appId, "BMReview", "CRM", remark);
  };

  public shared ({ caller }) func bmApprove(appId : Text, token : Text, remark : Text) : async Bool {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    updateAppStatus(appId, "AdminApproval", "BM", remark);
  };

  public shared ({ caller }) func bmReject(appId : Text, token : Text, remark : Text) : async Bool {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    updateAppStatus(appId, "Rejected", "BM", remark);
  };

  public shared ({ caller }) func adminApprove(appId : Text, token : Text, remark : Text) : async Bool {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    updateAppStatus(appId, "Approved", "Admin", remark);
  };

  public shared ({ caller }) func adminReject(appId : Text, token : Text, remark : Text) : async Bool {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    updateAppStatus(appId, "Rejected", "Admin", remark);
  };

  public shared ({ caller }) func markDisbursed(appId : Text, token : Text, remark : Text) : async Bool {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    updateAppStatus(appId, "Disbursed", "Operations", remark);
  };

  // Query: Get all workflow applications
  public query ({ caller }) func getAllWorkflowApplications(token : Text) : async [WorkflowApplication] {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    let arr = workflowApps.values().toArray();
    arr.sort(WorkflowApplication.compareByTimestamp);
  };

  // Query: Get applications by status
  public query ({ caller }) func getApplicationsByStatus(status : Text, token : Text) : async [WorkflowApplication] {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    let all = workflowApps.values().toArray();
    let filtered = all.filter(func(a : WorkflowApplication) : Bool { a.status == status });
    filtered.sort(WorkflowApplication.compareByTimestamp);
  };

  // Query: Get single application
  public query ({ caller }) func getWorkflowApplication(appId : Text, token : Text) : async ?WorkflowApplication {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    workflowApps.get(appId);
  };

  // Query: Get audit trail for application
  public query ({ caller }) func getAuditTrail(appId : Text, token : Text) : async [AuditEntry] {
    if (not isValidStaffToken(token)) { Runtime.trap("Unauthorized") };
    let all = auditLog.toArray();
    let filtered = all.filter(func(e : AuditEntry) : Bool { e.applicationId == appId });
    filtered.sort(AuditEntry.compareByTimestamp);
  };

  // =========================================
  // ADMIN AUTH (legacy kept)
  // =========================================

  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Text {
    if (username != adminUsername or password != adminPassword) {
      Runtime.trap("Invalid credentials");
    };
    let token = generateSessionToken();
    let expiryTime = Time.now() + sessionDuration;
    sessionStore.add(token, { token; expiry = expiryTime });
    token;
  };

  public shared ({ caller }) func validateAdminSession(token : Text) : async Bool {
    switch (sessionStore.get(token)) {
      case (?session) {
        if (SessionEntry.isExpired(session)) {
          sessionStore.remove(token);
          false;
        } else { true };
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func adminLogout(token : Text) : async () {
    sessionStore.remove(token);
  };

  public shared ({ caller }) func setAdminPassword(currentPassword : Text, newPassword : Text) : async Bool {
    if (currentPassword != adminPassword) { false }
    else { adminPassword := newPassword; true };
  };

  public query ({ caller }) func getAllSubmissions(sessionToken : Text) : async [ContactFormSubmission] {
    if (not isValidAdminToken(sessionToken)) { Runtime.trap("Unauthorized") };
    submissionsList.toArray().sort(ContactFormSubmission.compareByTimestamp);
  };

  public query ({ caller }) func getAllLoanApplications(sessionToken : Text) : async [LoanApplication] {
    if (not isValidAdminToken(sessionToken)) { Runtime.trap("Unauthorized") };
    loanApplicationsList.toArray().sort(LoanApplication.compareByTimestamp);
  };
};
