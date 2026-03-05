export type UserRole = "admin" | "bm" | "crm" | "accounts" | "operations";

export interface RolePermissions {
  canApproveLoan: boolean;
  canRejectLoan: boolean;
  canViewReports: boolean;
  canViewSettings: boolean;
  canManageStaff: boolean;
  canAddCustomer: boolean;
  canUploadDocuments: boolean;
  canUpdateEMI: boolean;
  canUpdateLoanStatus: boolean;
  canViewLoanData: boolean;
  canViewCustomerData: boolean;
  canVerifyDocuments: boolean;
  canProcessLoanFiles: boolean;
  canManageDisbursement: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canApproveLoan: true,
    canRejectLoan: true,
    canViewReports: true,
    canViewSettings: true,
    canManageStaff: true,
    canAddCustomer: true,
    canUploadDocuments: true,
    canUpdateEMI: true,
    canUpdateLoanStatus: true,
    canViewLoanData: true,
    canViewCustomerData: true,
    canVerifyDocuments: true,
    canProcessLoanFiles: true,
    canManageDisbursement: true,
  },
  bm: {
    canApproveLoan: true,
    canRejectLoan: true,
    canViewReports: true,
    canViewSettings: false,
    canManageStaff: false,
    canAddCustomer: false,
    canUploadDocuments: false,
    canUpdateEMI: false,
    canUpdateLoanStatus: true,
    canViewLoanData: true,
    canViewCustomerData: true,
    canVerifyDocuments: false,
    canProcessLoanFiles: false,
    canManageDisbursement: false,
  },
  crm: {
    canApproveLoan: false,
    canRejectLoan: false,
    canViewReports: false,
    canViewSettings: false,
    canManageStaff: false,
    canAddCustomer: true,
    canUploadDocuments: true,
    canUpdateEMI: false,
    canUpdateLoanStatus: true,
    canViewLoanData: true,
    canViewCustomerData: true,
    canVerifyDocuments: false,
    canProcessLoanFiles: false,
    canManageDisbursement: false,
  },
  accounts: {
    canApproveLoan: false,
    canRejectLoan: false,
    canViewReports: true,
    canViewSettings: false,
    canManageStaff: false,
    canAddCustomer: false,
    canUploadDocuments: false,
    canUpdateEMI: true,
    canUpdateLoanStatus: false,
    canViewLoanData: true,
    canViewCustomerData: false,
    canVerifyDocuments: false,
    canProcessLoanFiles: false,
    canManageDisbursement: true,
  },
  operations: {
    canApproveLoan: false,
    canRejectLoan: false,
    canViewReports: false,
    canViewSettings: false,
    canManageStaff: false,
    canAddCustomer: false,
    canUploadDocuments: true,
    canUpdateEMI: false,
    canUpdateLoanStatus: true,
    canViewLoanData: true,
    canViewCustomerData: false,
    canVerifyDocuments: true,
    canProcessLoanFiles: true,
    canManageDisbursement: false,
  },
};

export function getPermissions(role: string): RolePermissions {
  return ROLE_PERMISSIONS[role as UserRole] ?? ROLE_PERMISSIONS.admin;
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin — Full Control",
  bm: "Branch Manager",
  crm: "CRM Executive",
  accounts: "Accounts",
  operations: "Operations",
};

export const ROLE_DESCRIPTIONS: Record<string, string[]> = {
  admin: [
    "Full system control",
    "Manage all users & branches",
    "Reports, settings & documents",
  ],
  bm: [
    "Approve / Reject loan applications",
    "Monitor CRM team & branch ops",
    "View branch reports",
  ],
  crm: [
    "Add new customer leads",
    "Upload documents & create loans",
    "Manage follow-ups",
  ],
  accounts: [
    "Track EMI & disbursements",
    "Maintain financial records",
    "Generate payment reports",
  ],
  operations: [
    "Verify customer documents",
    "Process loan files",
    "Update processing status",
  ],
};
