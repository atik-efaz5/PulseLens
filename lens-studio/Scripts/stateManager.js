/**
 * PulseLens application state bag
 */
function StateManager() {
  this.state = {
    mode: 'IDLE',
    sessionId: null,
    patient: null,
    lastActivity: Date.now(),
    trainingState: 'IDLE',
    clinicalState: 'IDLE',
  };
}

StateManager.prototype.set = function (key, value) {
  this.state[key] = value;
  this.state.lastActivity = Date.now();
};

StateManager.prototype.get = function (key) {
  return this.state[key];
};

StateManager.prototype.reset = function () {
  this.state = {
    mode: 'IDLE',
    sessionId: null,
    patient: null,
    lastActivity: Date.now(),
    trainingState: 'IDLE',
    clinicalState: 'IDLE',
  };
};

if (typeof global !== 'undefined') {
  global.stateManager = new StateManager();
}

module.exports = StateManager;
