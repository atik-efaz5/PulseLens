import { checkFingerPlacement, getDefaultFingerLandmarks } from '../../src/placement';
import { findRadialPulsePoint } from '../../src/wristDetection';
import { createMockLandmarks } from '../../src/mockProvider';
import { CV_CONSTANTS } from '../../src/types';

describe('placement', () => {
  it('accepts fingers within tolerance', () => {
    const landmarks = createMockLandmarks();
    const pulse = findRadialPulsePoint(landmarks)!;
    const fingers = getDefaultFingerLandmarks(landmarks);
    // Nudge fingers to pulse point
    fingers[0] = { ...pulse, visibility: 0.9 };
    fingers[1] = { ...pulse, visibility: 0.9 };
    const result = checkFingerPlacement(fingers, pulse);
    expect(result.correct).toBe(true);
    expect(result.distance).toBeLessThanOrEqual(CV_CONSTANTS.PLACEMENT_TOLERANCE);
  });

  it('rejects fingers far from pulse point', () => {
    const landmarks = createMockLandmarks();
    const pulse = findRadialPulsePoint(landmarks)!;
    const fingers = [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }];
    const result = checkFingerPlacement(fingers, pulse);
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain('Adjust');
  });
});
