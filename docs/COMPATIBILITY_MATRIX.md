# Compatibility Matrix

| Feature | PulseLens | Test | Status |
|---------|-----------|------|--------|
| Training 8-state | lens-studio/Scripts/trainingMode.js | trainingMode.test.js | verified |
| Clinical 6-state | clinicalMode.js | clinicalMode.test.js | verified |
| Wake hey pulselens | voiceController.js | voice.test.js | verified (intentional-diff) |
| CV pipeline | cv-pipeline/ | unit tests (13/13) | verified |
| Letta window | lettaService.ts | lettaService.test.ts | verified |
| Gemini JSON | geminiService.ts | geminiService.test.ts | verified |
| Fish TTS cache | fishAudioService.ts | fishAudioService.test.ts | verified |
| Drug interactions | drugInteractionService.ts | drugInteractionService.test.ts | verified |
| API routes | backend/src/routes | integration tests (24/24) | verified |
| Dashboard cmdk | pulselens-dashboard | browser E2E | verified |
| Supabase | supabase/migrations | schema + demo fallback | verified |
| Lens scene wire | DEPLOYMENT.md | manual Spectacles deploy | documented |
