# Deployment

## Local

`./start-local.sh` — backend :3001, dashboard :3000

## Demo

`DEMO_MODE=true MOCK_HARDWARE=true`

## Production

- API: Railway or similar (`npm run build && npm start`)
- Dashboard: Vercel (`NEXT_PUBLIC_API_URL`)
- Supabase: cloud project + migration
- Lens: Lens Studio → Push to Spectacles

See `lens-studio/DEPLOYMENT.md` for AR client steps.
