# TTS Architecture (Fish Audio)

- Endpoint: `POST https://api.fish.audio/v1/tts`
- Cache: 24h TTL, max 100 LRU, case-insensitive keys
- Pre-generate common phrases on server startup
- Demo: synthetic URL when `DEMO_MODE=true`
- Voice: en-US professional female, speed 1.0, pitch 0
