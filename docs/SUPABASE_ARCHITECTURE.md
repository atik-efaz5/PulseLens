# Supabase Architecture

- Server-only `SUPABASE_SERVICE_ROLE_KEY`
- No RLS in v1 (prototype; not HIPAA)
- Tables: `patients`, `prescriptions`
- Demo fallback: in-memory seed when DB unavailable and `DEMO_MODE=true`
