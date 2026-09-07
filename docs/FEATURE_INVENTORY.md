# Feature Inventory

| Feature | Reference | PulseLens |
|---------|-----------|-----------|
| Snap Spectacles / Lens Studio | Partial (stubs in scene) | Scripts + DEPLOYMENT.md |
| AR overlays | Designed in Scripts/ | Implemented |
| Training 8-state | Partial (timers) | Full + real CV |
| Clinical 6-state | Partial (method bugs) | Full + list endpoint |
| Voice / wake / beep | Partial | `hey pulselens` |
| CV wrist / placement / pressure | TS tested; JS divergent | Unified cv-pipeline |
| Letta context | In-memory | Same semantics |
| Gemini advice + intent | Weak JSON parse | Schema-validated |
| Fish TTS + cache | Pre-gen unwired | Startup pre-gen |
| Supabase patients/Rx | Schema yes | Migration + seed |
| Dashboard cmdk | Unused | Primary search |
| Demo mode | 3 disconnected systems | Single `DEMO_MODE` |
| Mock hardware | Partial | `MOCK_HARDWARE` flag |
