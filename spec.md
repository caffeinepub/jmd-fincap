# JMD FinCap — Professional Design Upgrade

## Current State

The website is a multi-page financial services app with:
- Public homepage (Navbar, Hero, About, Services, Team, Contact, Footer, WhatsApp button, AI Chat widget)
- Loan Application page (`/apply`) — 8-step form with document uploads
- Admin Login page (`/admin/login`) — 3-role selector, OTP forgot-password flow
- Admin Dashboard (`/admin`) — Tabs: Overview, Loan Applications, Enquiries, Settings
- Sanction Letter page (`/sanction-letter`)

Design system: Navy blue (#0D1B3E) + Gold (#C9A84C), Playfair Display (headings) + Plus Jakarta Sans (body), OKLCH tokens in `index.css`, Tailwind custom colors in `tailwind.config.js`.

Issues identified via UI audit:
1. **Hero section** — plain dark blue background with no visual depth; stats row looks flat; CTAs lack premium feel
2. **Service cards** — generic colored icon boxes; uniform radius and shadow; hover underline animation is subtle to the point of being invisible
3. **Navbar** — logo is too small on desktop; no active section indicator; "Admin" link is almost invisible (intentional but ugly)
4. **About section** — left panel (navy card) is blocky; bullet list is minimal
5. **Team cards** — initials-only avatars; no social/contact detail; expertise tags look like generic badges
6. **Contact section** — form card on dark navy background lacks depth contrast; input fields are indistinguishable
7. **Footer** — dense 3-column layout has poor spacing rhythm; WhatsApp CTA is buried
8. **Loan Application form** — step indicator progress bar is small and not prominent enough; upload areas are plain dashed boxes
9. **Admin Login** — already quite polished (keep as-is, minor tweaks only)
10. **Admin Dashboard** — sidebar is basic; stat cards are functional but flat; table lacks alternating row contrast

## Requested Changes (Diff)

### Add
- Premium hero background: use `hero-bg-premium.dim_1920x1000.jpg` as overlay behind the existing radial gradients for depth
- Animated gradient shimmer on primary CTA buttons (subtle gold shimmer keyframe)
- Testimonials / trust-signals band between Services and Team: 3 logos or partner badges (RBI, IRDAI, AMFI) — text-based, no images needed
- "Why Choose Us" section: 4 highlight boxes (Speed, Trust, Expert, Local) with icons, inserted between About and Services
- Active nav link scroll indicator (gold underline dot tracking current section)
- Sticky navbar transition: transparent-to-white with blur as user scrolls past hero

### Modify
- **index.css**: Add `@font-face` declarations for Playfair Display and Plus Jakarta Sans using `/assets/fonts/` paths; add premium animations (shimmer, float, pulse-ring); tighten scrollbar styling
- **tailwind.config.js**: Add `gold-navy` gradient token, `shadow-premium` box-shadow, additional spacing/radius tokens
- **HeroSection**: Add a real background image layer, make stats animated counter-style, upgrade CTA buttons with shimmer effect, add a floating "trusted by" badge row
- **Navbar**: Larger logo (h-14 desktop), smooth scroll-spy active state with gold dot, backdrop-blur transition
- **ServicesSection**: Replace colored icon squares with glassmorphism-style cards on darker background; add subtle card tilt/lift on hover
- **AboutSection**: Replace plain bullet list with icon+text feature rows; add a second stat row with animated counters
- **TeamSection**: Larger avatar circles with gold ring border; add a subtle gradient card background
- **ContactSection**: Light card with subtle border and elevated shadow on white background; form inputs with smooth focus transitions
- **Footer**: Increase padding and whitespace; make WhatsApp CTA more prominent (larger, pulsing ring)
- **LoanApplicationPage**: Bigger, more prominent step progress indicator; styled upload areas with dashed gold border and preview thumbnails
- **AdminDashboard**: Premium stat cards with gradient top-border; table with alternating row highlights; improved sidebar with active state indicator

### Remove
- `Built with love using caffeine.ai` text in footer (keep the link but remove the label)
- Google Fonts reference comment (fonts are already local)

## Implementation Plan

1. Update `index.css`:
   - Add `@font-face` for Playfair Display and Plus Jakarta Sans from `/assets/fonts/`
   - Add keyframes: `shimmer`, `float`, `pulse-ring`, `counter-up`
   - Refine scrollbar, section-fade, gold-underline

2. Update `tailwind.config.js`:
   - Add `shadow-premium`, `shadow-gold-lg` tokens
   - Add gradient utilities

3. Upgrade `App.tsx`:
   - Navbar: scroll-spy with gold dot, backdrop-blur on scroll, larger logo
   - HeroSection: real background image with gradient overlay, animated stats, shimmer CTAs, trust badges
   - Add `WhyChooseUsSection` component (4 cards)
   - Add `TrustBand` component (RBI/IRDAI/AMFI text badges)
   - ServicesSection: glassmorphism cards
   - AboutSection: icon feature rows, animated counters
   - TeamSection: gold-ring avatar, gradient card
   - ContactSection: elevated card, premium form
   - Footer: spacing upgrade, prominent WhatsApp CTA

4. Upgrade `LoanApplicationPage.tsx`:
   - Prominent step indicator (numbered circles with connecting line)
   - Styled upload zones (gold dashed border, icon, hover state)

5. Upgrade `AdminDashboard.tsx`:
   - Stat cards with gradient accent top borders
   - Table with alternating row shading
   - Sidebar active indicator (gold left border)

6. Build and validate (typecheck + lint)
