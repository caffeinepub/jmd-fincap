# JMD FinCap

## Current State
The JMD FinCap loan management web application has a complete frontend with multiple pages. Several pages contain Hindi text (Hinglish/Roman Hindi) in form labels, placeholders, buttons, headings, dropdown options, and helper text.

Affected files:
- `src/frontend/src/pages/LoanApplicationPage.tsx` - Multi-step loan form with Hindi placeholders
- `src/frontend/src/pages/CustomerLogin.tsx` - Customer login/signup with Hindi text
- `src/frontend/src/pages/AdminLogin.tsx` - Admin login with possible Hindi text
- `src/frontend/src/pages/HomePage.tsx` - Home page with Hindi text
- `src/frontend/src/pages/ContactPage.tsx` - Contact form with Hindi text
- `src/frontend/src/pages/AboutPage.tsx` - About page
- `src/frontend/src/pages/ServicesPage.tsx` - Services page
- `src/frontend/src/pages/CustomerDashboard.tsx` - Customer dashboard
- `src/frontend/src/pages/AdminDashboard.tsx` - Admin/CRM dashboard
- `src/frontend/src/components/Navbar.tsx` - Navigation
- `src/frontend/src/components/Footer.tsx` - Footer

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Replace ALL Hindi/Hinglish text with professional English across ALL pages
- Examples: "Apna poora naam likhein" → "Enter Full Name", "Pita / Pati ka naam" → "Father / Husband Name", "Gender chunein" → "Select Gender", "Loan type chunein" → "Select Loan Type", "Kitna loan chahiye?" → "Enter Loan Amount", "Monthly aay (Rupees mein)" → "Monthly Income (INR)", "Kitne saal ka anubhav" → "Work Experience (in Years)", "Rishta chunein" → "Select Relationship"
- Use Title Case for labels, professional finance terminology
- No password hints on any login forms

### Remove
- All Hindi/Hinglish text strings

## Implementation Plan
1. Scan and replace all Hindi text in LoanApplicationPage.tsx (most critical - all form labels, placeholders, step titles)
2. Fix CustomerLogin.tsx and AdminLogin.tsx
3. Fix HomePage.tsx, ContactPage.tsx, AboutPage.tsx, ServicesPage.tsx
4. Fix CustomerDashboard.tsx and AdminDashboard.tsx
5. Fix Navbar.tsx and Footer.tsx
6. Validate build
