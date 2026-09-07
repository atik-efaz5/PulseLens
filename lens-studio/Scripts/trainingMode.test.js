/**
 * Node-runnable tests for Lens state machines
 */
const TrainingMode = require('./trainingMode');
const ClinicalMode = require('./clinicalMode');
const VoiceController = require('./voiceController');
const CVPipeline = require('./cvPipeline');
const AROverlayManager = require('./arOverlayManager');

function createMockLandmarks() {
  const lm = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0.1, visibility: 0.9 }));
  lm[0] = { x: 0.5, y: 0.5, z: 0.1, visibility: 0.9 };
  lm[4] = { x: 0.58, y: 0.5, z: 0.1, visibility: 0.9 };
  lm[5] = { x: 0.5, y: 0.45, z: 0.1, visibility: 0.9 };
  lm[8] = { x: 0.56, y: 0.42, z: 0.1, visibility: 0.9 };
  lm[9] = { x: 0.48, y: 0.45, z: 0.1, visibility: 0.9 };
  lm[12] = { x: 0.54, y: 0.42, z: 0.1, visibility: 0.9 };
  lm[7] = { x: 0.55, y: 0.43, z: 0.1, visibility: 0.9 };
  lm[11] = { x: 0.53, y: 0.43, z: 0.1, visibility: 0.9 };
  return lm;
}

describe('TrainingMode', () => {
  it('starts in IDLE', () => {
    const tm = new TrainingMode();
    expect(tm.state).toBe('IDLE');
  });

  it('transitions to STARTING on start', () => {
    const tm = new TrainingMode({ onTTS: () => {} });
    tm.start();
    expect(tm.state).toBe('STARTING');
  });

  it('calculates BPM from spoken count', () => {
    const tm = new TrainingMode({ onTTS: () => {} });
    tm.state = 'WAITING_FOR_RESPONSE';
    tm.processBPMResponse(18);
    expect(tm.state).toBe('COMPLETE');
  });
});

describe('ClinicalMode', () => {
  it('loads patient via API', async () => {
    const mockApi = {
      createSession: () => Promise.resolve({ session_id: 's1' }),
      loadPatient: () =>
        Promise.resolve({
          success: true,
          patient: { id: 'p1', name: 'Sarah Chen', medications: [], allergies: [] },
        }),
    };
    const cm = new ClinicalMode({ api: mockApi, onTTS: () => {} });
    cm.startAssessment('Sarah Chen');
    await new Promise((r) => setTimeout(r, 50));
    expect(cm.state).toBe('PATIENT_LOADED');
    expect(cm.patient.name).toBe('Sarah Chen');
  });
});

describe('VoiceController', () => {
  it('recognizes wake word', () => {
    let beeped = false;
    const vc = new VoiceController({ onBeep: () => { beeped = true; } });
    vc.processTranscription('hey pulselens start training');
    expect(beeped).toBe(true);
  });
});

describe('CVPipeline', () => {
  it('detects placement', () => {
    const cv = new CVPipeline();
    const lm = createMockLandmarks();
    cv.lastLandmarks = lm;
    const result = cv.checkPlacement(lm);
    expect(result).toBeDefined();
  });
});
