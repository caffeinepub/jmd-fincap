# JMD FinCap

## Current State
- 3-role login system: Admin, CEO, Co-Founder (username/password based)
- Single `/admin/login` page with role selector tabs
- Admin Dashboard with role-based permissions
- Loan applications, contact enquiries, document viewing, sanction letters
- rolePermissions.ts with 3 roles

## Requested Changes (Diff)

### Add
- 2 new roles: BM (Branch Manager) and CRM (Customer Relationship Manager), Accounts, Operations — total 5 roles
- New credentials:
  - Admin: admin@jmdfincap.com / Admin@123 (full control)
  - BM: bm@jmdfincap.com / BM@123 (approve/reject loans, branch ops)
  - CRM: crm@jmdfincap.com / CRM@123 (add customers, upload docs, create loan apps)
  - Accounts: accounts@jmdfincap.com / Accounts@123 (EMI payments, financial records)
  - Operations: operations@jmdfincap.com / Operations@123 (verify docs, process loan files)
- Login uses email as username (not short handle)
- Role-specific dashboard tabs/views for each of the 5 roles
- BM dashboard: loan approval panel, branch team activity, branch reports
- CRM dashboard: add customer lead, manage customer DB, follow-ups
- Accounts dashboard: EMI tracker, disbursement records, payment reports
- Operations dashboard: document verification queue, loan processing status

### Modify
- rolePermissions.ts: extend to 5 roles (admin, bm, crm, accounts, operations) — remove ceo/cofounder
- AdminLogin.tsx: update ROLES array to 5 entries with email-based login, new icons
- AdminDashboard.tsx: update session handling, role label display, tab visibility per role
- router.tsx: no changes needed

### Remove
- CEO and Co-Founder roles from login and permissions
- Old 3-role system credentials

## Implementation Plan
1. Update rolePermissions.ts — 5 roles, new permission flags
2. Update AdminLogin.tsx — 5-role selector with email credentials, new icons
3. Update AdminDashboard.tsx — role-aware tabs, BM/CRM/Accounts/Operations specific panels
