# JMD FinCap

## Current State
- Full-stack website with Motoko backend and React frontend
- Backend stores ContactFormSubmission records (name, phone, email, serviceInterest, message, timestamp)
- Backend exposes: `submitContactForm` (public), `getAllSubmissions` (query, currently unprotected)
- Frontend has: Navbar, Hero, About, Services, Team, Contact (with form), Footer, WhatsApp button, AI Chat widget

## Requested Changes (Diff)

### Add
- Admin Dashboard page (route: `/admin`) showing all contact form submissions in a pro-level data table
- Admin Login page (route: `/admin/login`) with Internet Identity authentication via the authorization component
- Admin-only access gate: only the canister owner / authorized principal can call `getAllSubmissions`
- Dashboard features: submissions table with Name, Phone, Email, Service, Message, Date/Time columns; search/filter by name or service; stats cards (total submissions, today's, most-requested service); export to CSV button; status badges; responsive layout

### Modify
- Backend: protect `getAllSubmissions` so only authorized admin principals can access it using the authorization component
- Frontend App.tsx: add React Router with routes for main site (`/`) and admin pages (`/admin`, `/admin/login`)

### Remove
- Nothing removed from existing site

## Implementation Plan
1. Select `authorization` Caffeine component
2. Regenerate Motoko backend with admin role-based access for `getAllSubmissions` and an `addAdmin` function for the owner
3. Update frontend:
   - Add React Router (already available via vite)
   - Create `/admin/login` page with Internet Identity login button
   - Create `/admin` dashboard page with:
     - Stats cards (Total, Today, Top Service)
     - Searchable/filterable submissions data table
     - CSV export
     - Responsive navy/gold design matching brand
   - Guard `/admin` behind auth check — redirect to `/admin/login` if not authenticated
   - Add "Admin" link in Navbar (small, subtle)
