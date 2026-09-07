# PulseLens Architecture

```
SNAP SPECTACLES                    PULSELENS DASHBOARD
     │                                    │
  ASR + SIK + SnapML                  Next.js 14
     │                                    │
  Mode / Training / Clinical              │
     │                                    │
     └──────────► EXPRESS API ◄────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
      Letta*       Gemini      Fish Audio
    (in-memory)   1.5-flash      TTS+cache
         │            │            │
         └────────────┼────────────┘
                      ▼
                 SUPABASE
              patients, prescriptions
```

\* Logical context window; not Letta SDK in v1.

Subsystems: `cv-pipeline/` (algorithms), `lens-studio/Scripts/` (AR client), `backend/` (API), `pulselens-dashboard/` (clinical UI).

Hardware abstraction: `MOCK_HARDWARE=true` for development without Spectacles.
