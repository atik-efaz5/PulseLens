/**
 * PulseLens Mode Manager
 */
function ModeManager(deps) {
  this.mode = 'IDLE';
  this.deps = deps || {};
}

ModeManager.prototype.setMode = function (mode) {
  this.mode = mode;
  if (this.deps.stateManager) this.deps.stateManager.set('mode', mode);
};

ModeManager.prototype.getMode = function () {
  return this.mode;
};

module.exports = ModeManager;
