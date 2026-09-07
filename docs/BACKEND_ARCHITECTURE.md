# Backend Architecture

Entry: `backend/src/server.ts`

Layers: routes → controllers → services → db/providers

Services: `lettaService`, `geminiService`, `fishAudioService`, `drugInteractionService`, `clinicalDecisionEngine`, `responseCache`

Middleware: CORS allowlist, JSON, request-id, structured logger, demo mode

Default port: 3001
