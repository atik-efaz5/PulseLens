# Training Mode

## States

`IDLE → STARTING → DETECTING_WRIST → POSITIONING_FINGERS → CHECKING_PRESSURE → COUNTING_PULSE → WAITING_FOR_RESPONSE → COMPLETE → IDLE`

## Timings

| Constant | ms |
|----------|-----|
| Welcome delay | 2000 |
| Wrist retry / skip offer | 10000 |
| Pulse count | 15000 |
| Complete auto-exit | 10000 |
| BPM valid range | 60–100 |

## BPM

`round((pulse_count / duration_seconds) * 60)`

## API

- `POST /api/training/start`
- `POST /api/training/feedback`
