# CV Architecture

## Landmarks (MediaPipe 21-point)

Wrist=0, thumb tip=4, index tip=8, middle tip=12, index MCP=5, middle MCP=9.

## Constants

- `PULSE_POINT_OFFSET = 0.02` (normalized, along wrist→thumb)
- `PLACEMENT_TOLERANCE = 0.015`
- `minDetectionConfidence = 0.7`, `minTrackingConfidence = 0.7`
- Pressure: `curvature*0.5 + (1-visibility)*0.25 + depth*0.25`
- Classify: `<0.25` too light, `>0.70` too heavy, else optimal

## Providers

- `MediaPipeHandsProvider` — Node/tests with mocked MediaPipe
- `SnapMLProvider` — Lens Studio adapter (21 landmarks from MLComponent)
- `MockHandProvider` — `MOCK_HARDWARE` development

## Source of Truth

TypeScript in `cv-pipeline/src/`. Lens `cvPipeline.js` consumes same algorithms via shared logic patterns (independently implemented).
