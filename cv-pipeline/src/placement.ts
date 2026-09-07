import { CV_CONSTANTS, Landmark, LandmarkIndex, PlacementResult, Point3D, PulsePoint } from './types';
import { distance2D } from './wristDetection';

export function checkFingerPlacement(
  fingerLandmarks: Landmark[],
  pulsePoint: PulsePoint | Point3D
): PlacementResult {
  if (!fingerLandmarks.length) {
    return {
      correct: false,
      distance: 1,
      distanceCm: 100,
      feedback: 'Place your index and middle fingers on the pulse point.',
    };
  }

  const avg: Point3D = {
    x: fingerLandmarks.reduce((s, l) => s + l.x, 0) / fingerLandmarks.length,
    y: fingerLandmarks.reduce((s, l) => s + l.y, 0) / fingerLandmarks.length,
    z: fingerLandmarks.reduce((s, l) => s + l.z, 0) / fingerLandmarks.length,
  };

  const distance = distance2D(avg, pulsePoint);
  const distanceCm = distance * 100;
  const correct = distance <= CV_CONSTANTS.PLACEMENT_TOLERANCE;

  if (correct) {
    return {
      correct: true,
      distance,
      distanceCm,
      feedback: 'Good position. Apply gentle, steady pressure.',
    };
  }

  let direction = 'toward the pulse point';
  const dx = pulsePoint.x - avg.x;
  const dy = pulsePoint.y - avg.y;
  if (Math.abs(dx) > 0.01) direction = dx > 0 ? 'toward the thumb' : 'away from the thumb';
  else if (Math.abs(dy) > 0.01) direction = dy > 0 ? 'up' : 'down';

  return {
    correct: false,
    distance,
    distanceCm,
    feedback: `Adjust your hand. Move ${Math.round(distanceCm)} centimeters ${direction}.`,
    direction,
  };
}

export function getDefaultFingerLandmarks(landmarks: Landmark[]): Landmark[] {
  return [landmarks[LandmarkIndex.INDEX_TIP], landmarks[LandmarkIndex.MIDDLE_TIP]];
}
