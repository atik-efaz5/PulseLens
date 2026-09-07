# Performance

Targets (not claims until measured):

| Metric | Target |
|--------|--------|
| AR FPS | ≥30 |
| CV latency | <500ms |
| API | <3s |
| TTS cached | measure p50/p95 |
| Cache hit rate | >50% goal |

## Measured (2026-09-04, DEMO_MODE=true, local)

Run: `cd backend && npm run perf` (backend must be listening on port 3001).

| Endpoint | Latency |
|----------|---------|
| GET /health | 111ms |
| POST /api/training/start | 48ms |
| POST /api/clinical/patient/load | 8ms |
| POST /api/tts/generate (cache miss) | 5ms |
| POST /api/tts/generate (cache hit) | 4ms |

All API endpoints measured **under 3s target**. TTS cache hit is near-instant in demo mode (in-memory stub).

CV pipeline unit tests complete in ~3.2s for 13 tests (mock provider; on-device latency not measured here).
