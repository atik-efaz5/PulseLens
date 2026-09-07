# Requirements Reconciliation

Priority: source code > tests > documentation. PulseLens overrides broken source to deliver intended workflows.

| Requirement | Reference source | PulseLens |
|-------------|------------------|-----------|
| Training states | 8 in trainingMode.js; 7 in config/tests | 8-state machine with real CV |
| Wake word | `hey medsnap` | `hey pulselens` |
| BPM range | 60–100 in controller | 60–100; no auto-inject 18 |
| Pulse offset | 2cm CV + 3cm overlay (double-applied) | Single 2cm thumb-vector |
| Placement tolerance | 0.015 normalized | Same |
| Pressure | 50/25/25; gaps 0.25–0.30 optimal | Same classification |
| Letta | 20 turns / 4000 tokens, compress at 3600 | Same + 2h session TTL |
| Drugs | 8 meds, Warfarin+NSAID | Same; fix object-shaped meds in API |
| Dashboard | Mock 100 patients | cmdk + 5 seed + 100 synthetic + live AI |
| Backend boot | Broken | `server.ts` + full deps |
| Auth | None | None (prototype) |

See `COMPATIBILITY_MATRIX.md` for feature-level tracking.
