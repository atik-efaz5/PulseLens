/**
 * PulseLens CV pipeline (SnapML / SIK adapter)
 */
var CONFIG = require('./config');

function CVPipeline() {
  this.lastLandmarks = null;
}

CVPipeline.prototype.processLandmarks = function (landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { handsDetected: false, confidence: 0 };
  }
  this.lastLandmarks = landmarks;
  var wrist = landmarks[0];
  var confidence = wrist.visibility !== undefined ? wrist.visibility : 1.0;
  if (confidence < CONFIG.MIN_CONFIDENCE) {
    return { handsDetected: false, confidence: confidence };
  }
  return { handsDetected: true, confidence: confidence, landmarks: landmarks };
};

CVPipeline.prototype.findPulsePoint = function (landmarks) {
  var wrist = landmarks[0];
  var thumb = landmarks[4];
  var dx = thumb.x - wrist.x;
  var dy = thumb.y - wrist.y;
  var mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return null;
  var off = CONFIG.PULSE_POINT_OFFSET;
  return {
    x: wrist.x + (dx / mag) * off,
    y: wrist.y + (dy / mag) * off,
    z: wrist.z,
  };
};

CVPipeline.prototype.checkPlacement = function (landmarks) {
  var pulse = this.findPulsePoint(landmarks);
  if (!pulse) return { correct: false, feedback: 'Hand not detected.' };
  var idx = landmarks[8];
  var mid = landmarks[12];
  var avgX = (idx.x + mid.x) / 2;
  var avgY = (idx.y + mid.y) / 2;
  var dist = Math.sqrt((avgX - pulse.x) ** 2 + (avgY - pulse.y) ** 2);
  if (dist <= CONFIG.PLACEMENT_TOLERANCE) {
    return { correct: true, distance: dist, feedback: 'Good position. Apply gentle pressure.' };
  }
  return { correct: false, distance: dist, feedback: 'Adjust finger placement toward the pulse point.' };
};

CVPipeline.prototype.detectPressure = function (landmarks) {
  var idxMcp = landmarks[5], idxTip = landmarks[8];
  var midMcp = landmarks[9], midTip = landmarks[12];
  var d1 = Math.sqrt((idxTip.x - idxMcp.x) ** 2 + (idxTip.y - idxMcp.y) ** 2);
  var d2 = Math.sqrt((midTip.x - midMcp.x) ** 2 + (midTip.y - midMcp.y) ** 2);
  var curvature = Math.max(0, Math.min(1, 1 - ((d1 + d2) / 2) / 0.3));
  var vis = ((idxTip.visibility || 1) + (midTip.visibility || 1)) / 2;
  var zs = [idxTip.z, landmarks[7].z, midTip.z, landmarks[11].z];
  var meanZ = zs.reduce(function (a, b) { return a + b; }, 0) / zs.length;
  var varZ = zs.reduce(function (s, z) { return s + (z - meanZ) * (z - meanZ); }, 0) / zs.length;
  var depth = Math.max(0, 1 - varZ * 100);
  var score = curvature * 0.5 + (1 - vis) * 0.25 + depth * 0.25;
  if (score < 0.25) return { level: 'too_light', score: score, feedback: 'Apply slightly more pressure.' };
  if (score > 0.7) return { level: 'too_heavy', score: score, feedback: 'Lighten your touch.' };
  return { level: 'optimal', score: score, feedback: 'Good pressure.' };
};

if (typeof global !== 'undefined') {
  global.cvPipeline = new CVPipeline();
}

module.exports = CVPipeline;
