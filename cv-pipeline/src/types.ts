export interface Point3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface Landmark extends Point3D {}

export const LandmarkIndex = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
} as const;

export interface WristDetection {
  detected: boolean;
  confidence: number;
  position?: Point3D;
  isFacingCamera?: boolean;
}

export interface PulsePoint {
  x: number;
  y: number;
  z: number;
  anatomicalName: string;
}

export interface PlacementResult {
  correct: boolean;
  distance: number;
  distanceCm: number;
  feedback: string;
  direction?: string;
}

export type PressureLevel = 'too_light' | 'optimal' | 'too_heavy';

export interface PressureResult {
  level: PressureLevel;
  score: number;
  feedback: string;
}

export const CV_CONSTANTS = {
  PULSE_POINT_OFFSET: 0.02,
  PLACEMENT_TOLERANCE: 0.015,
  MIN_CONFIDENCE: 0.7,
  TOO_LIGHT_THRESHOLD: 0.25,
  EXCESSIVE_PRESSURE_THRESHOLD: 0.7,
  CURVATURE_NORMALIZER: 0.3,
  BPM_MIN: 60,
  BPM_MAX: 100,
} as const;
