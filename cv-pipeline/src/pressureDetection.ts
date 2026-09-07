import { CV_CONSTANTS, Landmark, LandmarkIndex, PressureLevel, PressureResult } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function fingerCurvature(landmarks: Landmark[]): number {
  const pairs = [
    [LandmarkIndex.INDEX_MCP, LandmarkIndex.INDEX_TIP],
    [LandmarkIndex.MIDDLE_MCP, LandmarkIndex.MIDDLE_TIP],
  ];
  let total = 0;
  for (const [mcp, tip] of pairs) {
    const a = landmarks[mcp];
    const b = landmarks[tip];
    const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    total += dist;
  }
  const avg = total / pairs.length;
  return clamp(1 - avg / CV_CONSTANTS.CURVATURE_NORMALIZER, 0, 1);
}

function visibilityScore(landmarks: Landmark[]): number {
  const tips = [landmarks[LandmarkIndex.INDEX_TIP], landmarks[LandmarkIndex.MIDDLE_TIP]];
  const vis = tips.map((t) => t.visibility ?? 1.0);
  return vis.reduce((a, b) => a + b, 0) / vis.length;
}

function depthCompression(landmarks: Landmark[]): number {
  const indices = [
    LandmarkIndex.INDEX_TIP,
    LandmarkIndex.INDEX_DIP,
    LandmarkIndex.MIDDLE_TIP,
    LandmarkIndex.MIDDLE_DIP,
  ];
  const zs = indices.map((i) => landmarks[i].z);
  const mean = zs.reduce((a, b) => a + b, 0) / zs.length;
  const variance = zs.reduce((s, z) => s + (z - mean) ** 2, 0) / zs.length;
  return Math.max(0, 1 - variance * 100);
}

export function detectPressure(landmarks: Landmark[]): PressureResult {
  const curvature = fingerCurvature(landmarks);
  const visibility = visibilityScore(landmarks);
  const depth = depthCompression(landmarks);

  const score = curvature * 0.5 + (1 - visibility) * 0.25 + depth * 0.25;

  let level: PressureLevel = 'optimal';
  let feedback = 'Good pressure. Apply gentle, steady pressure.';

  if (score < CV_CONSTANTS.TOO_LIGHT_THRESHOLD) {
    level = 'too_light';
    feedback = 'Apply slightly more pressure to feel the pulse clearly.';
  } else if (score > CV_CONSTANTS.EXCESSIVE_PRESSURE_THRESHOLD) {
    level = 'too_heavy';
    feedback = "You're pressing too hard. Lighten your touch.";
  }

  return { level, score, feedback };
}
