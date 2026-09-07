# PulseLens Lens Studio Deployment

## Prerequisites

- Lens Studio 5.x with Spectacles support
- Snap Spectacles (or simulator)
- PulseLens backend running at `http://localhost:3001` (or update `Scripts/config.js`)

## Project Setup

1. Open Lens Studio → **File → Open Project**
2. Open `lens-studio/PulseLens.lsproj` (create new Spectacles project if `.lsproj` not present, then import scripts)
3. Import all scripts from `lens-studio/Scripts/`:
   - `config.js`, `stateManager.js`, `apiClient.js`
   - `arOverlayManager.js`, `cvPipeline.js`
   - `trainingMode.js`, `clinicalMode.js`, `voiceController.js`
   - `modeManager.js`, `patientCardRenderer.js`, `prescriptionUI.js`

## Scene Hierarchy (attach scripts)

| Object | Script | Notes |
|--------|--------|-------|
| Main Controller | `mainIntegration.js` (create) | Wires all modules on `OnStartEvent` |
| Camera | Camera Module | Device camera |
| Hand Tracking | Spectacles Interaction Kit | SIK HandInputData |
| ASR | ASR Module | Voice input |
| ML Component | `cvPipeline.js` | Bind `hand_landmarker.task` |
| PatientCard | `patientCardRenderer.js` | Text components for name, meds, allergies |
| PrescriptionUI | `prescriptionUI.js` | Warning/success text |

## Wire on Start

```javascript
// mainIntegration.js pattern
var api = global.apiClient;
var overlays = global.arOverlayManager;
var cv = global.cvPipeline;
var patientCard = new PatientCardRenderer();
var rxUI = new PrescriptionUI();
var clinical = new ClinicalMode({ api, patientCard, prescriptionUI: rxUI, overlays, onTTS: playTTS });
var training = new TrainingMode({ api, cv, overlays, onTTS: playTTS, handProvider: global.SIK.HandInputData });
var voice = new VoiceController({ api, training, clinical, onBeep: playBeep });
```

## Configuration

Edit `Scripts/config.js`:
- `API_BASE_URL`: backend URL (use machine IP for Spectacles, not localhost)
- `DEMO_MODE`: `true` for offline demo without backend
- `WAKE_WORD`: `hey pulselens`

## Push to Device

1. Connect Spectacles via Lens Studio
2. **Push to Device** (or Preview)
3. Say: **"Hey PulseLens, start training pulse taking"**
4. Say: **"Hey PulseLens, start assessment Sarah Chen"**

## MOCK_HARDWARE

Set `MOCK_HARDWARE=true` in backend for simulated API responses when testing without Spectacles.

## Troubleshooting

- **No voice**: Verify ASR Module is enabled and microphone permission granted
- **No hand tracking**: Ensure SIK package is in project; good lighting required
- **API errors**: Check `API_BASE_URL` uses device-reachable IP, not `localhost`
