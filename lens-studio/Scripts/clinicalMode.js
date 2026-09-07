/**
 * PulseLens Clinical Mode — 6-state machine
 */
var CONFIG = require('./config');
var STATES = {
  IDLE: 'IDLE',
  LOADING_PATIENT: 'LOADING_PATIENT',
  PATIENT_LOADED: 'PATIENT_LOADED',
  RECORDING_SYMPTOM: 'RECORDING_SYMPTOM',
  PRESCRIBING: 'PRESCRIBING',
  REQUESTING_DECISION: 'REQUESTING_DECISION',
};

function ClinicalMode(deps) {
  this.state = STATES.IDLE;
  this.deps = deps || {};
  this.patient = null;
  this.sessionId = null;
  this.loadRetries = 0;
  this.inactivityTimer = null;
}

ClinicalMode.prototype.startAssessment = function (patientName) {
  this.state = STATES.LOADING_PATIENT;
  this._loadPatient(patientName);
};

ClinicalMode.prototype._loadPatient = function (name) {
  var self = this;
  var api = this.deps.api;
  if (!api) return;

  api.createSession().then(function (sessionRes) {
    self.sessionId = sessionRes.session_id;
    return api.loadPatient(name);
  }).then(function (res) {
    if (res.success) {
      self.patient = res.patient;
      self.state = STATES.PATIENT_LOADED;
      self.loadRetries = 0;
      self._resetInactivity();
      if (self.deps.patientCard) self.deps.patientCard.show(res.patient);
      if (self.deps.onTTS && res.audio_url) self.deps.onTTS('Patient loaded: ' + res.patient.name);
    } else {
      throw new Error('not found');
    }
  }).catch(function () {
    self.loadRetries++;
    if (self.loadRetries < CONFIG.PATIENT_LOAD_RETRIES) {
      self._loadPatient(name);
    } else {
      self._offerPatientList();
    }
  });
};

ClinicalMode.prototype._offerPatientList = function () {
  var self = this;
  this.deps.api.listPatients().then(function (res) {
    var names = (res.patients || []).map(function (p) { return p.name; }).join(', ');
    if (self.deps.onTTS) self.deps.onTTS('Patient not found. Available patients: ' + names);
    self.state = STATES.IDLE;
  });
};

ClinicalMode.prototype.recordSymptom = function (symptom) {
  if (this.state !== STATES.PATIENT_LOADED) return;
  this.state = STATES.RECORDING_SYMPTOM;
  var self = this;
  this.deps.api.recordSymptom(this.sessionId, this.patient.id, symptom).then(function () {
    self.state = STATES.PATIENT_LOADED;
    self._resetInactivity();
    if (self.deps.onTTS) self.deps.onTTS('Symptom recorded: ' + symptom);
    if (self.deps.overlays) self.deps.overlays.showSuccess('Symptom recorded');
  });
};

ClinicalMode.prototype.initiatePrescription = function (medication, dosage) {
  if (this.state !== STATES.PATIENT_LOADED) return;
  this.state = STATES.PRESCRIBING;
  var self = this;
  this.deps.api.createPrescription(this.patient.id, medication, dosage).then(function (res) {
    self.state = STATES.PATIENT_LOADED;
    self._resetInactivity();
    if (self.deps.prescriptionUI) self.deps.prescriptionUI.showResult(res);
    if (res.blocked) {
      if (self.deps.onTTS) self.deps.onTTS('Warning: ' + (res.message || 'Prescription blocked'));
    } else {
      if (self.deps.onTTS) self.deps.onTTS('Prescription logged.');
    }
  });
};

ClinicalMode.prototype.showMedications = function () {
  if (!this.patient || !this.deps.patientCard) return;
  this.deps.patientCard.filter('medications');
  this._resetInactivity();
};

ClinicalMode.prototype.showAllergies = function () {
  if (!this.patient || !this.deps.patientCard) return;
  this.deps.patientCard.filter('allergies');
  this._resetInactivity();
};

ClinicalMode.prototype.showPatientHistory = function () {
  if (!this.patient || !this.deps.patientCard) return;
  this.deps.patientCard.filter('history');
  this._resetInactivity();
};

ClinicalMode.prototype.requestDecision = function () {
  if (!this.patient) return;
  this.state = STATES.REQUESTING_DECISION;
  this._resetInactivity();
  if (this.deps.onTTS) this.deps.onTTS('Requesting clinical decision support.');
};

ClinicalMode.prototype.endSession = function () {
  this._clearInactivity();
  this.patient = null;
  this.sessionId = null;
  this.state = STATES.IDLE;
  if (this.deps.patientCard) this.deps.patientCard.hide();
  if (this.deps.onTTS) this.deps.onTTS('Assessment complete.');
};

ClinicalMode.prototype.handleVoiceCommand = function (command) {
  var lower = command.toLowerCase();
  this._resetInactivity();

  if (lower.includes('record symptom')) {
    var sym = command.replace(/.*record symptom[:\s]*/i, '').trim();
    this.recordSymptom(sym);
    return;
  }
  if (lower.includes('prescribe')) {
    var match = command.match(/prescribe\s+(\w+)\s*(\d+\s*mg)?/i);
    this.initiatePrescription(match ? match[1] : '', match && match[2] ? match[2].replace(/\s/g, '') : '');
    return;
  }
  if (lower.includes('show medication')) { this.showMedications(); return; }
  if (lower.includes('show allerg')) { this.showAllergies(); return; }
  if (lower.includes('show history')) { this.showPatientHistory(); return; }
  if (lower.includes('decision') || lower.includes('diagnosis')) { this.requestDecision(); return; }
  if (lower.includes('end assessment') || lower.includes('end session')) { this.endSession(); return; }
};

ClinicalMode.prototype._resetInactivity = function () {
  this._clearInactivity();
  var self = this;
  this.inactivityTimer = setTimeout(function () {
    self.endSession();
    if (self.deps.onTTS) self.deps.onTTS('Session ended due to inactivity.');
  }, CONFIG.CLINICAL_INACTIVITY_MS);
};

ClinicalMode.prototype._clearInactivity = function () {
  if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
  this.inactivityTimer = null;
};

ClinicalMode.STATES = STATES;
module.exports = ClinicalMode;
