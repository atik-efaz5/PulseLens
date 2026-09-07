/**
 * PulseLens Voice Controller
 */
var CONFIG = require('./config');

function VoiceController(deps) {
  this.deps = deps || {};
  this.isInSession = false;
  this.wakeActive = false;
  this.commandTimer = null;
}

VoiceController.prototype.processTranscription = function (text) {
  var lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();

  if (lower.includes(CONFIG.WAKE_WORD) || this.isInSession) {
    if (lower.includes(CONFIG.WAKE_WORD)) {
      this._onWakeWord();
      lower = lower.replace(CONFIG.WAKE_WORD, '').trim();
    }
    this._handleCommand(lower || text);
    return;
  }
};

VoiceController.prototype._onWakeWord = function () {
  this.wakeActive = true;
  if (this.deps.onBeep) this.deps.onBeep();
  if (this.deps.onListening) this.deps.onListening(true);
  var self = this;
  if (this.commandTimer) clearTimeout(this.commandTimer);
  this.commandTimer = setTimeout(function () {
    self.wakeActive = false;
    if (self.deps.onListening) self.deps.onListening(false);
  }, CONFIG.COMMAND_TIMEOUT_MS);
};

VoiceController.prototype._handleCommand = function (command) {
  var lower = command.toLowerCase();

  if (lower.includes('start training') || lower.includes('training pulse')) {
    if (this.deps.training) this.deps.training.start();
    if (this.deps.modeManager) this.deps.modeManager.setMode('TRAINING');
    return;
  }

  if (lower.includes('start assessment') || lower.includes('assess ')) {
    var name = command.replace(/.*(?:assessment|assess)\s+/i, '').trim();
    this.isInSession = true;
    if (this.deps.clinical) this.deps.clinical.startAssessment(name);
    if (this.deps.modeManager) this.deps.modeManager.setMode('CLINICAL');
    return;
  }

  if (lower.includes('skip') && this.deps.training) {
    this.deps.training.skipDetection();
    return;
  }

  if (this.deps.training && this.deps.training.state === 'WAITING_FOR_RESPONSE') {
    var num = lower.match(/\d+/);
    if (num) {
      this.deps.training.processBPMResponse(parseInt(num[0], 10));
      return;
    }
  }

  if (this.isInSession && this.deps.clinical) {
    this.deps.clinical.handleVoiceCommand(command);
    return;
  }

  if (this.deps.api) {
    this.deps.api.voiceCommand(command).then(function (res) {
      if (res.intent === 'start_training' && this.deps.training) {
        this.deps.training.start();
      }
    }.bind(this));
  }
};

VoiceController.prototype.endSession = function () {
  this.isInSession = false;
  this.wakeActive = false;
  if (this.deps.onListening) this.deps.onListening(false);
};

module.exports = VoiceController;
