import { MockHandProvider, createMockLandmarks } from '../../src/mockProvider';
import { findWrist, findRadialPulsePoint } from '../../src/wristDetection';
import { checkFingerPlacement, getDefaultFingerLandmarks } from '../../src/placement';
import { detectPressure } from '../../src/pressureDetection';

describe('cv-pipeline integration', () => {
  it('runs full CV chain on mock provider', () => {
    const provider = new MockHandProvider();
    expect(provider.isTracked()).toBe(true);

    const landmarks = provider.getLandmarks()!;
    const wrist = findWrist(landmarks);
    expect(wrist.detected).toBe(true);

    const pulse = findRadialPulsePoint(landmarks);
    expect(pulse).not.toBeNull();

    const placement = checkFingerPlacement(getDefaultFingerLandmarks(landmarks), pulse!);
    expect(placement).toBeDefined();

    const pressure = detectPressure(landmarks);
    expect(pressure.level).toBeDefined();
  });

  it('handles missing hand', () => {
    const provider = new MockHandProvider(null);
    expect(provider.isTracked()).toBe(false);
    expect(findWrist(null).detected).toBe(false);
  });
});
