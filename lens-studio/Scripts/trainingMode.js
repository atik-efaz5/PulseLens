/**
 * PulseLens Training Mode — 8-state machine
 */
var CONFIG = require('./config');
var STATES = {
  IDLE: 'IDLE',
  STARTING: 'STARTING',
  DETECTING_WRIST: 'DETECTING_WRIST',
  POSITIONING_FINGERS: 'POSITIONING_FINGERS',
  CHECKING_PRESSURE: 'CHECKING_PRESSURE',
  COUNTING_PULSE: 'COUNTING_PULSE',
  WAITING_FOR_RESPONSE: 'WAITING_FOR_RESPONSE',
  COMPLETE: 'COMPLETE',
};

function TrainingMode(deps) {
  this.state = STATES.IDLE;
  this.deps = deps || {};
  this.retryStartTime = null;
  this.shouldOfferSkip = false;
  this.sessionId = null;
  this.pulseCountStart = null;
  this.timers = {};
}

TrainingMode.prototype.start = function () {
  this.state = STATES.STARTING;
  var self = this;
  this._playAudio('Starting pulse taking training.');
  if (this.deps.api) {
    this.deps.api.startTraining().then(function (r) {
      self.sessionId = r.session_id;
    });
  }
  this._setTimer('starting', CONFIG.TRAINING_COMPLETE_EXIT_MS / 5, function () {
    self.state = STATES.DETECTING_WRIST;
    self.retryStartTime = Date.now();
    self._showInstruction('Show your wrist to the camera.');
  });
};

TrainingMode.prototype.update = function () {
  if (this.state === STATES.DETECTING_WRIST) {
    var wrist = this._detectWrist();
    if (wrist.detected) {
      this.state = STATES.POSITIONING_FINGERS;
      this._showPulse(wrist.position);
      this._showInstruction('Position index and middle fingers on the pulse point.');
      return;
    }
    if (this.retryStartTime && Date.now() - this.retryStartTime >= CONFIG.WRIST_RETRY_MS) {
      this.shouldOfferSkip = true;
      this._showWarning('Having trouble detecting your hand. Say skip to continue.');
    }
  }

  if (this.state === STATES.POSITIONING_FINGERS) {
    var placement = this._checkPlacement();
    if (placement && placement.correct) {
      this.state = STATES.CHECKING_PRESSURE;
      this._showSuccess('Good finger placement.');
      this._showInstruction('Apply gentle, steady pressure.');
    }
  }

  if (this.state === STATES.CHECKING_PRESSURE) {
    var pressure = this._checkPressure();
    if (pressure && pressure.level === 'optimal') {
      this.state = STATES.COUNTING_PULSE;
      this.pulseCountStart = Date.now();
      this._showInstruction('Count the beats. Starting 15 second timer.');
      var self = this;
      this._setTimer('count', CONFIG.PULSE_COUNT_MS, function () {
        self.state = STATES.WAITING_FOR_RESPONSE;
        self._showInstruction('Time. What was your count?');
      });
    } else if (pressure) {
      this._showWarning(pressure.feedback);
    }
  }
};

TrainingMode.prototype.processBPMResponse = function (count) {
  if (this.state !== STATES.WAITING_FOR_RESPONSE && this.state !== STATES.COUNTING_PULSE) return;
  var duration = CONFIG.PULSE_COUNT_MS / 1000;
  var bpm = Math.round((count / duration) * 60);
  var assessment = 'normal';
  if (bpm > CONFIG.BPM_MAX) assessment = 'elevated';
  else if (bpm < CONFIG.BPM_MIN) assessment = 'low';

  this.state = STATES.COMPLETE;
  var msg = 'Your pulse is ' + bpm + ' BPM. ';
  if (assessment === 'normal') {
    this._showSuccess('Normal range. Great technique!');
    msg += 'That is within the normal range.';
  } else {
    this._showWarning('Outside normal range of 60 to 100.');
    msg += 'Outside the normal range.';
  }
  this._playAudio(msg);

  var self = this;
  if (this.deps.api && this.sessionId) {
    this.deps.api.trainingFeedback(this.sessionId, count, duration);
  }
  this._setTimer('exit', CONFIG.TRAINING_COMPLETE_EXIT_MS, function () {
    self.exit();
  });
};

TrainingMode.prototype.skipDetection = function () {
  if (this.shouldOfferSkip || this.state === STATES.DETECTING_WRIST) {
    this.state = STATES.POSITIONING_FINGERS;
    this._showInstruction('Skipped detection. Position your fingers on the wrist.');
  }
};

TrainingMode.prototype.exit = function () {
  this._clearTimers();
  this.state = STATES.IDLE;
  this.shouldOfferSkip = false;
  if (this.deps.overlays) this.deps.overlays.hideAll();
};

TrainingMode.prototype._detectWrist = function () {
  if (this.deps.handProvider) {
    var hand = this.deps.handProvider.getHand('right') || this.deps.handProvider.getHand('left');
    if (hand && hand.isTracked && hand.isTracked()) {
      var facing = hand.isFacingCamera ? hand.isFacingCamera() : true;
      if (facing) {
        return { detected: true, confidence: 1, position: hand.getWristPosition() };
      }
    }
  }
  if (this.deps.cv && this.deps.cv.lastLandmarks) {
    var result = this.deps.cv.processLandmarks(this.deps.cv.lastLandmarks);
    if (result.handsDetected) {
      return { detected: true, confidence: result.confidence, position: this.deps.cv.lastLandmarks[0] };
    }
  }
  return { detected: false, confidence: 0 };
};

TrainingMode.prototype._checkPlacement = function () {
  if (!this.deps.cv || !this.deps.cv.lastLandmarks) return null;
  return this.deps.cv.checkPlacement(this.deps.cv.lastLandmarks);
};

TrainingMode.prototype._checkPressure = function () {
  if (!this.deps.cv || !this.deps.cv.lastLandmarks) return null;
  return this.deps.cv.detectPressure(this.deps.cv.lastLandmarks);
};

TrainingMode.prototype._showPulse = function (pos) {
  if (this.deps.overlays && this.deps.cv && this.deps.cv.lastLandmarks) {
    var pulse = this.deps.cv.findPulsePoint(this.deps.cv.lastLandmarks);
    if (pulse) this.deps.overlays.showPulsePoint(pulse);
  } else if (this.deps.overlays && pos) {
    this.deps.overlays.showPulsePoint(pos);
  }
};

TrainingMode.prototype._showInstruction = function (t) {
  if (this.deps.overlays) this.deps.overlays.showInstruction(t);
};
TrainingMode.prototype._showWarning = function (t) {
  if (this.deps.overlays) this.deps.overlays.showWarning(t);
};
TrainingMode.prototype._showSuccess = function (t) {
  if (this.deps.overlays) this.deps.overlays.showSuccess(t);
};
TrainingMode.prototype._playAudio = function (t) {
  if (this.deps.onTTS) this.deps.onTTS(t);
};

TrainingMode.prototype._setTimer = function (name, ms, fn) {
  if (this.timers[name]) clearTimeout(this.timers[name]);
  this.timers[name] = setTimeout(fn, ms);
};

TrainingMode.prototype._clearTimers = function () {
  for (var k in this.timers) clearTimeout(this.timers[k]);
  this.timers = {};
};

TrainingMode.STATES = STATES;
module.exports = TrainingMode;
