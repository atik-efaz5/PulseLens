import { CV_CONSTANTS, Landmark, LandmarkIndex, Point3D, PulsePoint, WristDetection } from './types';

export function distance2D(a: Point3D, b: Point3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalizeVector(dx: number, dy: number): { x: number; y: number; magnitude: number } {
  const magnitude = Math.sqrt(dx * dx + dy * dy);
  if (magnitude === 0) {
    return { x: 0, y: 0, magnitude: 0 };
  }
  return { x: dx / magnitude, y: dy / magnitude, magnitude };
}

export function findWrist(landmarks: Landmark[] | null | undefined): WristDetection {
  if (!landmarks || landmarks.length < 21) {
    return { detected: false, confidence: 0 };
  }

  const wrist = landmarks[LandmarkIndex.WRIST];
  const confidence = wrist.visibility ?? 1.0;

  if (confidence < CV_CONSTANTS.MIN_CONFIDENCE) {
    return { detected: false, confidence };
  }

  return {
    detected: true,
    confidence,
    position: { x: wrist.x, y: wrist.y, z: wrist.z },
    isFacingCamera: true,
  };
}

export function findRadialPulsePoint(landmarks: Landmark[]): PulsePoint | null {
  if (landmarks.length < 21) return null;

  const wrist = landmarks[LandmarkIndex.WRIST];
  const thumbTip = landmarks[LandmarkIndex.THUMB_TIP];
  const dx = thumbTip.x - wrist.x;
  const dy = thumbTip.y - wrist.y;
  const norm = normalizeVector(dx, dy);

  if (norm.magnitude === 0) return null;

  const offset = CV_CONSTANTS.PULSE_POINT_OFFSET;
  return {
    x: wrist.x + norm.x * offset,
    y: wrist.y + norm.y * offset,
    z: wrist.z,
    anatomicalName: 'Radial Artery (Pulse Point)',
  };
}

export function calculateBpm(pulseCount: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return Math.round((pulseCount / durationSeconds) * 60);
}

export function validateBpm(bpm: number): 'normal' | 'elevated' | 'low' {
  if (bpm >= CV_CONSTANTS.BPM_MIN && bpm <= CV_CONSTANTS.BPM_MAX) return 'normal';
  if (bpm > CV_CONSTANTS.BPM_MAX) return 'elevated';
  return 'low';
}
