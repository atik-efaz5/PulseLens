# PulseLens Reference Analysis

Forensic analysis of [DT-0907/medisnap](https://github.com/DT-0907/medisnap) @ `82cdf84` for clean-room reimplementation.

## Project Purpose

Hands-free AR clinical assistant for Snap Spectacles: Training Mode (pulse-taking education) and Clinical Mode (voice patient assessment, prescriptions, AI support). Hackathon MVP, not production medical software.

## Repository Structure

| Path | Role |
|------|------|
| `backend/` | Express TypeScript API — Gemini, in-memory Letta wrapper, Fish TTS, Supabase |
| `cv-pipeline/` | MediaPipe Hands TypeScript (Jest-tested); not wired to Lens runtime |
| `lens-studio/Scripts/` | Full JS AR client (intended spec) |
| `lens-studio/MedSnap.lsproj/` | Lens scene mounting stub scripts, not Scripts/ |
| `medsnap-dashboard/` | OSIRIS marketing + mock MedAR UI |
| `config/` | Demo JSON fixtures |
| `docs/` | Dev implementation guides |

## Key Forensic Findings

- Backend `package.json` starts missing `server.js`; API does not boot as packaged.
- Letta is in-memory Map + Gemini, not Letta SDK; `LETTA_API_KEY` unused.
- Training Mode: 8 states in source but CV checks are timers; BPM auto-injected as 18.
- Lens `.lsproj` does not mount `Scripts/*.js`.
- Prescription HTTP path passes medication strings, breaking interaction checks.
- `backend/.env` committed in reference (PulseLens must not).
- Dashboard: 100 random patients, no backend; cmdk unused on live route.

## PulseLens Policy

Implement **intended working workflows** from source design. Fix blockers. Document differences. Wake word: `hey pulselens`. Clinical dashboard only.
