/**
 * PulseLens AR overlay manager
 */
var CONFIG = require('./config');

function AROverlayManager() {
  this.overlays = {};
  this.fadeDuration = 0.5;
}

AROverlayManager.prototype._color = function (c) {
  return new vec4(c.r, c.g, c.b, c.a);
};

AROverlayManager.prototype.showPulsePoint = function (position) {
  this._showText('pulsePoint', '●', position, 60, this._color(CONFIG.COLORS.pulsePoint));
};

AROverlayManager.prototype.showArrow = function (direction, position) {
  var arrows = { up: '↑', down: '↓', left: '←', right: '→' };
  this._showText('arrow', arrows[direction] || '→', position, 48, this._color(CONFIG.COLORS.arrow));
};

AROverlayManager.prototype.showWarning = function (text, position) {
  this._showText('warning', '⚠ ' + text, position || { x: 0, y: 0.2, z: 0.5 }, 28, this._color(CONFIG.COLORS.warning));
};

AROverlayManager.prototype.showSuccess = function (text, position) {
  this._showText('success', '✓ ' + text, position || { x: 0, y: 0.2, z: 0.5 }, 28, this._color(CONFIG.COLORS.success));
};

AROverlayManager.prototype.showInstruction = function (text) {
  this._showText('instruction', text, { x: 0, y: 0.15, z: 0.5 }, 24, this._color(CONFIG.COLORS.text));
};

AROverlayManager.prototype._showText = function (id, text, position, size, color) {
  print('[AR] ' + id + ': ' + text + ' @ ' + JSON.stringify(position));
  this.overlays[id] = { text: text, position: position, size: size, color: color, visible: true };
  if (typeof global !== 'undefined' && global.onOverlayUpdate) {
    global.onOverlayUpdate(id, this.overlays[id]);
  }
};

AROverlayManager.prototype.hide = function (id) {
  if (this.overlays[id]) this.overlays[id].visible = false;
};

AROverlayManager.prototype.hideAll = function () {
  for (var k in this.overlays) this.overlays[k].visible = false;
};

if (typeof global !== 'undefined') {
  global.arOverlayManager = new AROverlayManager();
}

module.exports = AROverlayManager;
