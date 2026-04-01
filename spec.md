# JMD FinCap - Role-Based Loan Workflow System

## Current State
- Basic loan application form at `/apply` (public, no login)
- Backend stores applications with fixed fields (firstName, lastName, KYC, docs, etc.)
- Admin dashboard at `/admin` with 5 role logins (Admin, BM, CRM, Accounts, Operations)
- No workflow enforcement -- all roles see everything with no stage gating
- No audit trail, no remarks system, no status progression
- Applications have no status field -- only timestamp

## Requested Changes (Diff)

### Add
- **Workflow status enum**: New → Under CRM Review → BM Review → Admin Approval → Approved → Rejected → Disbursed
- **Backend: WorkflowApplication type** extending LoanApplication with: id (Text), status, assignedTo, createdAt, updatedAt
- **Backend: AuditEntry type**: applicationId, action, performedBy (role), remark, timestamp
- **Backend: submitWorkflowApplication** -- public endpoint, creates application with status=New, returns application ID
- **Backend: forwardToBM(appId, token, remark)** -- CRM only, status: Under CRM Review → BM Review
- **Backend: bmDecision(appId, token, approved, remark)** -- BM only, approved → Admin Approval, rejected → Rejected
- **Backend: adminDecision(appId, token, approved, remark)** -- Admin only, approved → Approved, rejected → Rejected
- **Backend: markDisbursed(appId, token, remark)** -- Operations only, Approved → Disbursed
- **Backend: getApplicationsByStatus(status, token)** -- role-filtered query
- **Backend: getAuditTrail(appId, token)** -- returns all audit entries for an application
- **Backend: getAllWorkflowApplications(token)** -- admin sees all, others see their scope
- **Role-specific dashboards**: CRM sees New+UnderCRMReview, BM sees BMReview, Admin sees AdminApproval+all, Operations sees Approved
- **Audit trail UI** per application -- who did what, when, with remarks
- **Remark/comment system** -- add remarks at each stage transition
- **Application detail modal** -- read-only view of all submitted data + audit timeline
- **Role-based action buttons**: Forward (CRM), Approve/Reject (BM & Admin), Mark Disbursed (Operations)

### Modify
- AdminDashboard: Replace current all-in-one view with role-specific workflow views
- AdminLogin: Keep existing 5-role login but map to workflow roles
- LoanApplicationPage: After submit, show application ID / reference number
- Backend token validation: Accept role-specific tokens (jmd_admin_, jmd_bm_, jmd_crm_, jmd_accounts_, jmd_operations_)

### Remove
- Old `submitLoanApplication` (keep for backward compat but new form uses `submitWorkflowApplication`)
- Mixed-permission dashboard views -- each role sees only their workflow stage

## Implementation Plan
1. Update backend main.mo: add WorkflowApplication, AuditEntry, workflow action endpoints
2. Regenerate backend.d.ts bindings
3. Build new role-specific dashboards: CRMDashboard, BMDashboard, AdminWorkflowDashboard, OperationsDashboard
4. Update AdminLogin to route users to their role-specific dashboard
5. Update LoanApplicationPage to use new submitWorkflowApplication and show reference number
6. Add application detail modal with audit timeline
7. Wire all role-based action buttons to backend endpoints
