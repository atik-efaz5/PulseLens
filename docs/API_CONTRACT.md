# API Contract

Lens Studio / Dashboard → Express → Service → Supabase/Gemini/Fish → JSON response + optional `audio_url`.

Client timeout: 3000 ms. TTS URLs played via Audio component on device.

Session flow: `POST /api/clinical/session` → use `session_id` for symptom/decision calls.

Patient load: `POST /api/clinical/patient/load` → `patient` + `ar_display` + `audio_url`.

Prescription blocked: `{ blocked: true, warnings, alternatives, ar_display: { icon: 'red_x', badge: 'BLOCKED' } }`.
