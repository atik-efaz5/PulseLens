# PulseLens — Hands-Free AR Clinical Assistant

Clean-room reimplementation of the MedSnap architecture for Snap Spectacles, with a working Express backend, CV pipeline, Lens Studio client, and clinical dashboard.

**Live demo:** [https://pulselens-clinical.vercel.app](https://pulselens-clinical.vercel.app)

**Repository:** [https://github.com/atik-efaz5/PulseLens](https://github.com/atik-efaz5/PulseLens)

**Not for clinical use.** Prototype / hackathon-quality demonstration.

**Author:** Atik Shahariyar Hasan Efaz ([@atik-efaz5](https://github.com/atik-efaz5))

## Architecture

```
Snap Spectacles (AR + Voice + CV)
        ↓
Express Backend (Gemini, Letta wrapper, Fish TTS, Supabase)
        ↓
PulseLens Dashboard (Next.js clinical UI)
```

## Quick Start

```bash
chmod +x start-local.sh
./start-local.sh
```

- **Backend:** http://localhost:3001
- **Dashboard:** http://localhost:3000 (or next free port if 3000 is taken)
- **Lens Studio:** See [lens-studio/DEPLOYMENT.md](lens-studio/DEPLOYMENT.md)

### Manual startup

```bash
# Backend (demo mode — no API keys required)
cd backend && cp ../.env.example .env && DEMO_MODE=true npm run dev

# Dashboard
cd pulselens-dashboard && echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local && npm run dev
```

## Project Structure

```
PulseLens/
├── backend/              Express API (port 3001)
├── cv-pipeline/          MediaPipe CV algorithms + tests
├── lens-studio/          Snap Spectacles AR client scripts
├── pulselens-dashboard/  Next.js 14 clinical dashboard
├── supabase/             DB migrations + seed
├── config/               Demo fixtures
├── docs/                 Forensic analysis + architecture docs
└── start-local.sh        Local dev launcher
```

## Key Features

- **Training Mode:** 8-state pulse-taking workflow with real CV checks, 10s skip, 15s count, BPM validation
- **Clinical Mode:** Wake word `hey pulselens`, patient load (3 retries + list fallback), symptoms, prescriptions with drug interaction checks
- **Letta context:** 20-turn / 4000-token window with compression
- **Gemini:** Schema-validated clinical advice + intent extraction
- **Fish Audio TTS:** 24h cache, startup phrase pre-generation
- **Dashboard:** cmdk search, patient detail, live AI diagnosis card, glassmorphism UI

## Environment Variables

Copy `.env.example` to `backend/.env`:

| Variable | Required | Notes |
|----------|----------|-------|
| `DEMO_MODE` | No | `true` = canned AI/TTS, no external keys |
| `GEMINI_API_KEY` | Prod | Google Gemini 1.5 Flash |
| `FISH_AUDIO_API_KEY` | Prod | Fish Audio TTS |
| `SUPABASE_URL` | Prod | PostgreSQL via Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Prod | Server-side only |

## Tests

```bash
cd cv-pipeline && npm test      # 13 tests
cd backend && npm test           # 24 tests
cd lens-studio && npm test       # Lens state machine tests
```

## Documentation

See `docs/` for full forensic analysis, architecture, API inventory, compatibility matrix, and deployment guides.

## Differences from Reference MedSnap

- Wake word: `hey pulselens` (was `hey medsnap`)
- Backend boots correctly (`server.ts`, full dependencies)
- Prescription interaction check uses object-shaped medications (Warfarin+Ibuprofen works)
- Training mode uses real CV, not timers; no auto-injected BPM
- Dashboard: clinical-only (no OSIRIS marketing), cmdk search, live AI
- No committed `.env` or secrets

## Deployment

| Service | URL |
|---------|-----|
| Dashboard (Vercel) | https://pulselens-clinical.vercel.app |
| API (Vercel) | https://pulselens-api.vercel.app |

> Note: `pulselens.vercel.app` is already registered to another Vercel project. This deployment uses `pulselens-clinical.vercel.app`.

Dashboard proxies `/api/*` to the API via `API_URL` (set in Vercel project env).

## License

Prototype demonstration. Not for production medical use.
