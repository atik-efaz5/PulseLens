# Configuration

See root `.env.example`. Copy to `backend/.env`.

| Variable | Required | Notes |
|----------|----------|-------|
| PORT | No | Default 3001 |
| DEMO_MODE | No | `true` for canned AI/TTS |
| MOCK_HARDWARE | No | Lens dev without device |
| SUPABASE_* | Prod | Service role server-only |
| GEMINI_API_KEY | Prod | |
| FISH_AUDIO_API_KEY | Prod | |
| DASHBOARD_ORIGIN | No | CORS allowlist |

Lens `config.js`: `API_BASE_URL` points to backend (no secrets).
