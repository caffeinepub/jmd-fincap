export type UserRole = "admin" | "ceo" | "cofounder";

export interface RolePermissions {
  canApproveLoan: boolean;
  canRejectLoan: boolean;
  canRecommendApproval: boolean;
  canViewReports: boolean;
  canViewSettings: boolean;
  canManageStaff: boolean;
  canAddCustomer: boolean;
  canUploadDocuments: boolean;
  canUpdateEMI: boolean;
  canUpdateLoanStatus: boolean;
  canViewLoanData: boolean;
  canViewCustomerData: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ceo: {
    canApproveLoan: true,
    canRejectLoan: true,
    canRecommendApproval: false,
    canViewReports: true,
    canViewSettings: true,
    canManageStaff: true,
    canAddCustomer: true,
    canUploadDocuments: true,
    canUpdateEMI: true,
    canUpdateLoanStatus: true,
    canViewLoanData: true,
    canViewCustomerData: true,
  },
  cofounder: {
    canApproveLoan: false,
    canRejectLoan: false,
    canRecommendApproval: true,
    canViewReports: true,
    canViewSettings: false,
    canManageStaff: false,
    canAddCustomer: false,
    canUploadDocuments: false,
    canUpdateEMI: false,
    canUpdateLoanStatus: false,
    canViewLoanData: true,
    canViewCustomerData: true,
  },
  admin: {
    canApproveLoan: false,
    canRejectLoan: false,
    canRecommendApproval: false,
    canViewReports: false,
    canViewSettings: false,
    canManageStaff: false,
    canAddCustomer: true,
    canUploadDocuments: true,
    canUpdateEMI: true,
    canUpdateLoanStatus: true,
    canViewLoanData: true,
    canViewCustomerData: true,
  },
};

export function getPermissions(role: string): RolePermissions {
  return ROLE_PERMISSIONS[role as UserRole] ?? ROLE_PERMISSIONS.admin;
}

export const ROLE_LABELS: Record<string, string> = {
  ceo: "CEO — Full Access",
  cofounder: "Co-Founder — Management Access",
  admin: "Admin / Staff — Limited Access",
};

export const ROLE_DESCRIPTIONS: Record<string, string[]> = {
  ceo: [
    "Approve / Reject loans",
    "View all reports & settings",
    "Manage staff accounts",
  ],
  cofounder: [
    "View loans & customer data",
    "View reports & analytics",
    "Recommend approvals",
  ],
  admin: [
    "Add customers & upload documents",
    "Update EMI & loan status",
    "No approvals or reports access",
  ],
};
