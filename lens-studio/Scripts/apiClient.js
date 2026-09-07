/**
 * PulseLens API client
 */
var CONFIG = require('./config');

function ApiClient() {
  this.baseUrl = CONFIG.API_BASE_URL;
  this.demoMode = CONFIG.DEMO_MODE;
  this.timeout = 3000;
}

ApiClient.prototype._request = function (method, path, body) {
  if (this.demoMode) {
    return Promise.resolve(this._mockResponse(path, body));
  }
  return new Promise(function (resolve, reject) {
    var internetModule = global.internetModule;
    if (!internetModule) {
      resolve(this._mockResponse(path, body));
      return;
    }
    var req = new Request(this.baseUrl + path, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    internetModule.fetch(req)
      .then(function (res) { return res.json(); })
      .then(resolve)
      .catch(function () { resolve(this._mockResponse(path, body)); }.bind(this));
  }.bind(this));
};

ApiClient.prototype._mockResponse = function (path, body) {
  if (path.indexOf('/patient/load') >= 0) {
    return {
      success: true,
      patient: {
        id: 'pt-sarah-chen',
        name: 'Sarah Chen',
        age: 34,
        sex: 'Female',
        chief_complaint: 'Chest tightness and cough',
        current_symptoms: ['chest tightness', 'dry cough'],
        vital_signs: { bloodPressure: '118/76', heartRate: 88, temperature: 101.5 },
        allergies: ['Penicillin'],
        medications: [
          { name: 'Warfarin', dosage: '5mg daily' },
          { name: 'Loratadine', dosage: '10mg daily' },
        ],
        diagnosis_history: ['Seasonal allergies'],
      },
      ar_display: { position: 'top_center', duration_seconds: 10 },
      audio_url: 'demo://loaded',
    };
  }
  if (path.indexOf('/prescription/create') >= 0) {
    if (body && body.medication && body.medication.toLowerCase() === 'ibuprofen') {
      return {
        success: false,
        blocked: true,
        message: 'Ibuprofen interacts with Warfarin (bleeding risk).',
        warnings: ['HIGH: NSAID + Warfarin'],
        alternatives: [{ medication: 'Acetaminophen', dosage: '500mg q6h' }],
        ar_display: { icon: 'red_x', badge: 'BLOCKED' },
      };
    }
    return { success: true, blocked: false, ar_display: { icon: 'green_checkmark', badge: 'PENDING' } };
  }
  if (path.indexOf('/training/start') >= 0) {
    return { success: true, session_id: 'demo-training', message: 'Starting training.', audio_url: 'demo://start' };
  }
  if (path.indexOf('/session') >= 0) {
    return { success: true, session_id: 'demo-session-' + Date.now() };
  }
  if (path.indexOf('/patients') >= 0) {
    return {
      success: true,
      patients: [
        { id: 'pt-sarah-chen', name: 'Sarah Chen' },
        { id: 'pt-robert-martinez', name: 'Robert Martinez' },
      ],
    };
  }
  return { success: true };
};

ApiClient.prototype.createSession = function () {
  return this._request('POST', '/api/clinical/session', {});
};

ApiClient.prototype.loadPatient = function (name) {
  return this._request('POST', '/api/clinical/patient/load', { patient_name: name });
};

ApiClient.prototype.listPatients = function () {
  return this._request('GET', '/api/clinical/patients', null);
};

ApiClient.prototype.recordSymptom = function (sessionId, patientId, symptom) {
  return this._request('POST', '/api/clinical/symptom/record', {
    session_id: sessionId,
    patient_id: patientId,
    symptom: symptom,
  });
};

ApiClient.prototype.createPrescription = function (patientId, medication, dosage) {
  return this._request('POST', '/api/clinical/prescription/create', {
    patient_id: patientId,
    medication: medication,
    dosage: dosage,
  });
};

ApiClient.prototype.startTraining = function () {
  return this._request('POST', '/api/training/start', {
    procedure: 'pulse_taking',
    user_id: 'lens-user',
  });
};

ApiClient.prototype.trainingFeedback = function (sessionId, pulseCount, duration) {
  return this._request('POST', '/api/training/feedback', {
    session_id: sessionId,
    pulse_count: pulseCount,
    duration_seconds: duration,
  });
};

ApiClient.prototype.voiceCommand = function (transcription) {
  return this._request('POST', '/api/voice/command', { transcription: transcription });
};

if (typeof global !== 'undefined') {
  global.apiClient = new ApiClient();
}

module.exports = ApiClient;
