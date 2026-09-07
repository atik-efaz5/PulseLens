# API Inventory

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| GET | `/` | API info |
| POST | `/api/training/start` | Start training session |
| POST | `/api/training/feedback` | Submit pulse count, get BPM |
| POST | `/api/clinical/session` | Create Letta session |
| GET | `/api/clinical/patients` | List patients (fallback) |
| GET | `/api/clinical/patient/:id` | Patient detail |
| POST | `/api/clinical/patient/load` | Load by name |
| POST | `/api/clinical/symptom/record` | Record symptom |
| POST | `/api/clinical/decision-support` | AI clinical advice |
| POST | `/api/clinical/prescription/create` | Create prescription |
| POST | `/api/voice/command` | Intent extraction |
| POST | `/api/tts/generate` | Generate TTS |
