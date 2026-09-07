# External Dependencies

| Service | Purpose | Env var | Fallback |
|---------|---------|---------|----------|
| Snap Spectacles | AR hardware | — | MOCK_HARDWARE |
| Lens Studio | AR client | — | — |
| MediaPipe / SnapML | Hand CV | — | Mock provider |
| Gemini 1.5 Flash | AI | GEMINI_API_KEY | DEMO_MODE |
| Fish Audio | TTS | FISH_AUDIO_API_KEY | DEMO_MODE |
| Supabase | DB | SUPABASE_* | Demo seed |
| Letta SDK | — | LETTA_API_KEY | In-memory wrapper |
