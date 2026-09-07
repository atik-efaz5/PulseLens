import axios from 'axios';
import { responseCache } from '../utils/responseCache';

const FISH_AUDIO_API_URL = 'https://api.fish.audio/v1/tts';
const DEMO_AUDIO_URL = 'https://example.com/demo-audio.mp3';

export const COMMON_PHRASES = [
  'Patient loaded',
  'Recording symptom',
  'Prescription logged',
  'Patient not found. Please repeat patient name.',
  'Starting pulse taking training.',
  'Wrist detected. Position your fingers on the pulse point.',
  'Good position. Apply gentle pressure.',
  'Time. What was your count?',
  'Training complete. Great job!',
  'Assessment complete.',
  'Hey PulseLens, ready for your command.',
  'Warning: Drug interaction detected.',
  'Symptom recorded.',
  'Loading patient record.',
];

function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}

export async function generateTTS(text: string): Promise<string> {
  if (!text.trim()) throw new Error('TTS text cannot be empty');

  const cached = responseCache.get(text);
  if (cached) return cached;

  if (isDemoMode()) {
    const url = `${DEMO_AUDIO_URL}?text=${encodeURIComponent(text.substring(0, 30))}`;
    responseCache.set(text, url);
    return url;
  }

  const key = process.env.FISH_AUDIO_API_KEY;
  if (!key) throw new Error('FISH_AUDIO_API_KEY not configured');

  const response = await axios.post(
    FISH_AUDIO_API_URL,
    {
      text,
      voice_id: 'medical-professional-001',
      format: 'mp3',
      sample_rate: 24000,
      speed: 1.0,
      pitch: 0,
    },
    {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 3000,
    }
  );

  const audioUrl = response.data?.audio_url || response.data?.url;
  if (!audioUrl) throw new Error('Fish Audio returned no URL');

  responseCache.set(text, audioUrl);
  return audioUrl;
}

export async function preGenerateCommonPhrases(): Promise<void> {
  if (isDemoMode()) {
    for (const phrase of COMMON_PHRASES) {
      responseCache.set(phrase, `${DEMO_AUDIO_URL}?text=${encodeURIComponent(phrase.substring(0, 20))}`);
    }
    return;
  }
  await Promise.allSettled(COMMON_PHRASES.map((p) => generateTTS(p)));
}
