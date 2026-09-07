/**
 * PulseLens Patient Card Renderer
 */
var CONFIG = require('./config');

function PatientCardRenderer() {
  this.patient = null;
  this.filter = 'all';
  this.hideTimer = null;
}

PatientCardRenderer.prototype.show = function (patient) {
  this.patient = patient;
  this.filter = 'all';
  this._render();
  var self = this;
  if (this.hideTimer) clearTimeout(this.hideTimer);
  this.hideTimer = setTimeout(function () { self.hide(); }, CONFIG.PATIENT_CARD_DURATION_S * 1000);
};

PatientCardRenderer.prototype.filterView = function (view) {
  this.filter = view;
  this._render();
};

PatientCardRenderer.prototype.filter = function (view) {
  this.filterView(view);
};

PatientCardRenderer.prototype.hide = function () {
  this.patient = null;
  print('[PatientCard] hidden');
};

PatientCardRenderer.prototype._render = function () {
  if (!this.patient) return;
  var p = this.patient;
  var lines = [p.name + ', ' + p.age + 'y ' + p.sex];
  if (this.filter === 'all' || this.filter === 'chief') {
    lines.push('Chief: ' + (p.chief_complaint || ''));
  }
  if (this.filter === 'all' || this.filter === 'medications') {
    var meds = (p.medications || []).map(function (m) {
      return typeof m === 'string' ? m : m.name + ' ' + (m.dosage || '');
    });
    lines.push('Meds: ' + meds.join(', '));
  }
  if (this.filter === 'all' || this.filter === 'allergies') {
    lines.push('Allergies: ' + (p.allergies || []).join(', ') || 'None');
  }
  if (this.filter === 'all' || this.filter === 'history') {
    var hist = p.diagnosis_history || [];
    lines.push('History: ' + hist.join(', '));
  }
  print('[PatientCard] ' + lines.join(' | '));
};

module.exports = PatientCardRenderer;
