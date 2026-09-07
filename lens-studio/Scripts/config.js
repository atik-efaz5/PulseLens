/**
 * PulseLens Lens Studio configuration
 */
var CONFIG = {
  WAKE_WORD: 'hey pulselens',
  COMMAND_TIMEOUT_MS: 5000,
  SESSION_TIMEOUT_MS: 120000,
  CLINICAL_INACTIVITY_MS: 120000,
  TRAINING_COMPLETE_EXIT_MS: 10000,
  WRIST_RETRY_MS: 10000,
  PULSE_COUNT_MS: 15000,
  PATIENT_LOAD_RETRIES: 3,
  PATIENT_CARD_DURATION_S: 10,
  API_BASE_URL: 'http://localhost:3001',
  DEMO_MODE: true,
  COLORS: {
    pulsePoint: { r: 0, g: 1, b: 1, a: 0.5 },
    arrow: { r: 1, g: 1, b: 0, a: 1 },
    warning: { r: 1, g: 0, b: 0, a: 1 },
    success: { r: 0, g: 1, b: 0, a: 1 },
    text: { r: 1, g: 1, b: 1, a: 1 },
    allergy: { r: 1, g: 0, b: 0, a: 1 },
    cardBg: { r: 0.1, g: 0.1, b: 0.1, a: 0.5 },
  },
  BPM_MIN: 60,
  BPM_MAX: 100,
  PLACEMENT_TOLERANCE: 0.015,
  PULSE_POINT_OFFSET: 0.02,
  MIN_CONFIDENCE: 0.7,
};

if (typeof global !== 'undefined') {
  global.PulseLensConfig = CONFIG;
}

module.exports = CONFIG;
