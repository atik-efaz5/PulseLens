import {
  findWrist,
  findRadialPulsePoint,
  calculateBpm,
  validateBpm,
} from '../../src/wristDetection';
import { createMockLandmarks } from '../../src/mockProvider';
import { CV_CONSTANTS } from '../../src/types';

describe('wristDetection', () => {
  it('returns not detected for null landmarks', () => {
    expect(findWrist(null).detected).toBe(false);
  });

  it('returns not detected for low confidence', () => {
    const landmarks = createMockLandmarks({ confidence: 0.5 });
    expect(findWrist(landmarks).detected).toBe(false);
  });

  it('detects wrist with sufficient confidence', () => {
    const landmarks = createMockLandmarks({ confidence: 0.85 });
    const result = findWrist(landmarks);
    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(CV_CONSTANTS.MIN_CONFIDENCE);
  });

  it('finds radial pulse point along thumb vector', () => {
    const landmarks = createMockLandmarks();
    const pulse = findRadialPulsePoint(landmarks);
    expect(pulse).not.toBeNull();
    expect(pulse!.anatomicalName).toContain('Radial');
    expect(pulse!.x).toBeGreaterThan(landmarks[0].x);
  });

  it('returns null pulse point when thumb vector is zero', () => {
    const landmarks = createMockLandmarks({ offset: 0 });
    landmarks[4] = { ...landmarks[0] };
    expect(findRadialPulsePoint(landmarks)).toBeNull();
  });

  it('calculates BPM correctly', () => {
    expect(calculateBpm(18, 15)).toBe(72);
    expect(calculateBpm(25, 15)).toBe(100);
  });

  it('validates BPM ranges', () => {
    expect(validateBpm(72)).toBe('normal');
    expect(validateBpm(112)).toBe('elevated');
    expect(validateBpm(44)).toBe('low');
  });
});
