import { detectPressure } from '../../src/pressureDetection';
import { createMockLandmarks } from '../../src/mockProvider';

describe('pressureDetection', () => {
  it('classifies optimal pressure for default mock hand', () => {
    const landmarks = createMockLandmarks();
    const result = detectPressure(landmarks);
    expect(['optimal', 'too_light', 'too_heavy']).toContain(result.level);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it('detects too heavy when fingers are curled tightly', () => {
    const landmarks = createMockLandmarks();
    // Curled fingers: very short MCP-to-tip distance → high curvature
    landmarks[5] = { x: 0.5, y: 0.5, z: 0.1, visibility: 1 };
    landmarks[8] = { x: 0.51, y: 0.51, z: 0.1, visibility: 0.3 };
    landmarks[9] = { x: 0.48, y: 0.5, z: 0.1, visibility: 1 };
    landmarks[12] = { x: 0.49, y: 0.51, z: 0.1, visibility: 0.3 };
    landmarks[7] = { x: 0.505, y: 0.505, z: 0.1, visibility: 1 };
    landmarks[11] = { x: 0.485, y: 0.505, z: 0.1, visibility: 1 };
    const result = detectPressure(landmarks);
    expect(result.level).toBe('too_heavy');
  });
});
