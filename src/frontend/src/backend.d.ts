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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllLoanApplications(sessionToken: string): Promise<Array<LoanApplication>>;
    getAllSubmissions(sessionToken: string): Promise<Array<ContactFormSubmission>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdminPassword(currentPassword: string, newPassword: string): Promise<boolean>;
    submitContactForm(name: string, phone: string, email: string, serviceInterest: string, message: string): Promise<void>;
    submitLoanApplication(firstName: string, lastName: string, dateOfBirth: string, motherName: string, fatherName: string, aadharNumber: string, panNumber: string, loanPurpose: string, loanType: string, tenure: string, loanAmount: string, monthlyIncome: string, employeeType: string, aadharCardFile: string, panCardFile: string, photoFile: string, signatureFile: string): Promise<void>;
    validateAdminSession(token: string): Promise<boolean>;
}
