# Dashboard Architecture

Next.js 14 App Router, React 18, Tailwind, Radix, cmdk, Framer Motion.

Routes:
- `/` — command palette patient search
- `/patient/[id]` — detail + AI diagnosis card

Data: 5 seed patients (API/Supabase) + 100 synthetic for search UX.

Glassmorphism: `backdrop-blur`, translucent cards, yellow clinical theme.

No OSIRIS marketing, no hardcoded login.
