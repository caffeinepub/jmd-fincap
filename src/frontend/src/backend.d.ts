import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ContactFormSubmission {
    name: string;
    email: string;
    serviceInterest: string;
    message: string;
    timestamp: Time;
    phone: string;
}
export interface LoanApplication {
    photoFile: string;
    aadharCardFile: string;
    employeeType: string;
    loanAmount: string;
    dateOfBirth: string;
    motherName: string;
    loanType: string;
    signatureFile: string;
    aadharNumber: string;
    fatherName: string;
    timestamp: Time;
    panNumber: string;
    tenure: string;
    lastName: string;
    panCardFile: string;
    loanPurpose: string;
    monthlyIncome: string;
    firstName: string;
}
export interface WorkflowApplication {
    id: string;
    firstName: string;
    lastName: string;
    fatherName: string;
    motherName: string;
    dateOfBirth: string;
    gender: string;
    mobile: string;
    email: string;
    aadharNumber: string;
    panNumber: string;
    currentAddress: string;
    permanentAddress: string;
    occupation: string;
    companyName: string;
    monthlyIncome: string;
    workExperience: string;
    loanType: string;
    loanAmount: string;
    tenure: string;
    loanPurpose: string;
    reference1Name: string;
    reference1Mobile: string;
    reference1Relation: string;
    aadharCardFile: string;
    panCardFile: string;
    photoFile: string;
    electricityBillFile: string;
    status: string;
    createdAt: Time;
    updatedAt: Time;
}
export interface AuditEntry {
    applicationId: string;
    action: string;
    performedBy: string;
    remark: string;
    timestamp: Time;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminLogin(username: string, password: string): Promise<string>;
    adminLogout(token: string): Promise<void>;
    adminApprove(appId: string, token: string, remark: string): Promise<boolean>;
    adminReject(appId: string, token: string, remark: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bmApprove(appId: string, token: string, remark: string): Promise<boolean>;
    bmReject(appId: string, token: string, remark: string): Promise<boolean>;
    forwardToBM(appId: string, token: string, remark: string): Promise<boolean>;
    getAllLoanApplications(sessionToken: string): Promise<Array<LoanApplication>>;
    getAllSubmissions(sessionToken: string): Promise<Array<ContactFormSubmission>>;
    getAllWorkflowApplications(token: string): Promise<Array<WorkflowApplication>>;
    getApplicationsByStatus(status: string, token: string): Promise<Array<WorkflowApplication>>;
    getAuditTrail(appId: string, token: string): Promise<Array<AuditEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkflowApplication(appId: string, token: string): Promise<WorkflowApplication | null>;
    isCallerAdmin(): Promise<boolean>;
    markDisbursed(appId: string, token: string, remark: string): Promise<boolean>;
    markUnderCRMReview(appId: string, token: string, remark: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdminPassword(currentPassword: string, newPassword: string): Promise<boolean>;
    submitContactForm(name: string, phone: string, email: string, serviceInterest: string, message: string): Promise<void>;
    submitLoanApplication(firstName: string, lastName: string, dateOfBirth: string, motherName: string, fatherName: string, aadharNumber: string, panNumber: string, loanPurpose: string, loanType: string, tenure: string, loanAmount: string, monthlyIncome: string, employeeType: string, aadharCardFile: string, panCardFile: string, photoFile: string, signatureFile: string): Promise<void>;
    submitWorkflowApplication(firstName: string, lastName: string, fatherName: string, motherName: string, dateOfBirth: string, gender: string, mobile: string, email: string, aadharNumber: string, panNumber: string, currentAddress: string, permanentAddress: string, occupation: string, companyName: string, monthlyIncome: string, workExperience: string, loanType: string, loanAmount: string, tenure: string, loanPurpose: string, reference1Name: string, reference1Mobile: string, reference1Relation: string, aadharCardFile: string, panCardFile: string, photoFile: string, electricityBillFile: string): Promise<string>;
    validateAdminSession(token: string): Promise<boolean>;
}
