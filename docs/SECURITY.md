# Security

- Never commit `.env` or API keys
- No credentials in Lens bundle or client-side env (except `NEXT_PUBLIC_API_URL`)
- Service-role Supabase server-only
- Structured logs: no keys, tokens, or PHI in logs
- Prototype disclaimer: not for clinical use, not HIPAA
