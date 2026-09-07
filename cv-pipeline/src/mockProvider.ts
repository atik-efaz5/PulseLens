import { Landmark, LandmarkIndex } from './types';

/** Mock hand provider for MOCK_HARDWARE / unit tests */
export function createMockLandmarks(options: {
  wristX?: number;
  wristY?: number;
  offset?: number;
  confidence?: number;
} = {}): Landmark[] {
  const { wristX = 0.5, wristY = 0.5, offset = 0.08, confidence = 0.9 } = options;
  const landmarks: Landmark[] = Array.from({ length: 21 }, () => ({
    x: 0,
    y: 0,
    z: 0,
    visibility: confidence,
  }));

  landmarks[LandmarkIndex.WRIST] = { x: wristX, y: wristY, z: 0.1, visibility: confidence };
  landmarks[LandmarkIndex.THUMB_TIP] = {
    x: wristX + offset,
    y: wristY,
    z: 0.1,
    visibility: confidence,
  };
  landmarks[LandmarkIndex.INDEX_MCP] = { x: wristX, y: wristY - 0.05, z: 0.1, visibility: confidence };
  landmarks[LandmarkIndex.INDEX_TIP] = { x: wristX + 0.01, y: wristY - 0.08, z: 0.1, visibility: confidence };
  landmarks[LandmarkIndex.MIDDLE_MCP] = { x: wristX - 0.01, y: wristY - 0.05, z: 0.1, visibility: confidence };
  landmarks[LandmarkIndex.MIDDLE_TIP] = { x: wristX, y: wristY - 0.09, z: 0.1, visibility: confidence };
  landmarks[LandmarkIndex.INDEX_DIP] = { x: wristX + 0.005, y: wristY - 0.065, z: 0.1, visibility: confidence };
  landmarks[LandmarkIndex.MIDDLE_DIP] = { x: wristX - 0.005, y: wristY - 0.065, z: 0.1, visibility: confidence };

  return landmarks;
}

export interface HandTrackingProvider {
  getLandmarks(): Landmark[] | null;
  isTracked(): boolean;
}

export class MockHandProvider implements HandTrackingProvider {
  private landmarks: Landmark[] | null;

  constructor(landmarks: Landmark[] | null = createMockLandmarks()) {
    this.landmarks = landmarks;
  }

  getLandmarks(): Landmark[] | null {
    return this.landmarks;
  }

  isTracked(): boolean {
    return this.landmarks !== null && this.landmarks.length >= 21;
  }

  setLandmarks(landmarks: Landmark[] | null): void {
    this.landmarks = landmarks;
  }
}
