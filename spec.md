# JMD FinCap

## Current State
- Website has a role-based admin login at `/admin/login` with Admin, CEO, Co-Founder roles
- Forgot Password flow uses OTP that is shown on-screen (demo mode, no real email)
- Admin panel is accessible only via direct URL `/admin/login` (not in navbar)
- Customer website is separate from admin access

## Requested Changes (Diff)

### Add
- **Security PIN authentication** in the Forgot Password flow: before OTP is sent/used, user must enter a 4-digit security PIN (set per role). First-time users see a "Set PIN" prompt. This PIN acts as a 2nd factor before allowing password reset.
- **Dedicated "Staff Login" page** that is visually separate from the customer website — a clean standalone page at `/staff-login` that redirects to `/admin/login`. The customer website navbar and footer will have NO admin/staff link. The staff login entry point is only known to staff.

### Modify
- Forgot Password flow in AdminLogin.tsx: add a new `pin-verify` view step before `otp-sent`. User must enter their 4-digit PIN to proceed. If PIN not set, show a "Set PIN" prompt first.
- PIN is stored per-role in localStorage (`jmd_pin_<roleId>`).
- The flow becomes: login → forgot-role → pin-verify (enter or set PIN) → otp-sent → reset-password → success

### Remove
- Nothing removed from existing functionality

## Implementation Plan
1. In `AdminLogin.tsx`: add PIN state management (view states: `pin-verify`, `set-pin`), PIN storage helpers, and PIN verification UI with 4-digit numeric input
2. Add PIN setup flow for first-time users (no PIN set yet) — styled input with numeric keypad feel
3. The forgot password flow: after role select, check if PIN is set. If not set → show Set PIN screen. If set → show Enter PIN screen. After PIN verified → proceed to OTP flow.
4. Admin login page stays at `/admin/login`. No changes to customer website navbar — admin link already removed.
