import 'dotenv/config';

const BASE = `http://localhost:${process.env.PORT || 3001}`;

async function measure(label: string, fn: () => Promise<void>) {
  const start = Date.now();
  await fn();
  const ms = Date.now() - start;
  console.log(`${label}: ${ms}ms`);
  return ms;
}

async function main() {
  console.log('PulseLens Performance Measurements');
  console.log('==================================');
  console.log(`Target: API <3000ms, TTS cache hit as fast as possible`);
  console.log('');

  const health = await measure('GET /health', async () => {
    await fetch(`${BASE}/health`);
  });

  const training = await measure('POST /api/training/start', async () => {
    await fetch(`${BASE}/api/training/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procedure: 'pulse_taking', user_id: 'perf' }),
    });
  });

  const load = await measure('POST /api/clinical/patient/load', async () => {
    await fetch(`${BASE}/api/clinical/patient/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_name: 'Sarah Chen' }),
    });
  });

  const tts1 = await measure('POST /api/tts/generate (miss)', async () => {
    await fetch(`${BASE}/api/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Performance test phrase unique ' + Date.now() }),
    });
  });

  const tts2 = await measure('POST /api/tts/generate (hit)', async () => {
    await fetch(`${BASE}/api/tts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Patient loaded' }),
    });
  });

  console.log('');
  console.log('Summary (measured, not claimed compliant):');
  console.log(`  Health: ${health}ms`);
  console.log(`  Training start: ${training}ms`);
  console.log(`  Patient load: ${load}ms`);
  console.log(`  TTS miss: ${tts1}ms`);
  console.log(`  TTS hit: ${tts2}ms`);
}

main().catch(console.error);
