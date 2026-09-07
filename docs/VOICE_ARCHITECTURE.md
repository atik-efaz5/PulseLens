# Voice Architecture

- Wake: `hey pulselens`
- Command timeout: 5000 ms after wake
- In-session: no wake word after patient loaded
- Local string match first → `POST /api/voice/command` → Gemini intent extraction
- Beep on wake word; listening indicator while active
