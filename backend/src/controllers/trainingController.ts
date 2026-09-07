import { Request, Response } from 'express';
import { initSession } from '../services/lettaService';
import { generateTTS } from '../services/fishAudioService';
import { generateResponse } from '../services/geminiService';

export async function startTraining(req: Request, res: Response) {
  const { procedure, user_id } = req.body;
  if (!procedure) {
    return res.status(400).json({ success: false, error: 'procedure is required' });
  }
  if (!user_id) {
    return res.status(400).json({ success: false, error: 'user_id is required' });
  }
  if (procedure !== 'pulse_taking') {
    return res.status(400).json({
      success: false,
      error: 'Invalid procedure. Only pulse_taking is supported.',
    });
  }

  const session_id = initSession();
  const message = 'Starting pulse taking training. Locate the radial artery on the wrist.';
  const audio_url = await generateTTS(message).catch(() => '');

  res.json({ success: true, session_id, message, audio_url });
}

export async function trainingFeedback(req: Request, res: Response) {
  const { session_id, pulse_count, duration_seconds } = req.body;

  if (!session_id) {
    return res.status(400).json({ success: false, error: 'session_id is required' });
  }
  if (typeof pulse_count !== 'number') {
    return res.status(400).json({ success: false, error: 'pulse_count must be a number' });
  }
  if (typeof duration_seconds !== 'number' || duration_seconds <= 0) {
    return res.status(400).json({ success: false, error: 'duration_seconds must be positive' });
  }

  const bpm = Math.round((pulse_count / duration_seconds) * 60);
  let assessment: 'normal' | 'elevated' | 'low' = 'normal';
  if (bpm > 100) assessment = 'elevated';
  else if (bpm < 60) assessment = 'low';

  let message = `Your pulse rate is ${bpm} beats per minute. `;
  let technique_feedback = '';
  if (assessment === 'normal') {
    message += 'That is within the normal range. Good technique!';
    technique_feedback = 'Excellent finger placement and pressure control.';
  } else if (assessment === 'elevated') {
    message += 'That is above the normal range of 60 to 100.';
    technique_feedback = 'Consider recounting. Ensure you are at the radial artery.';
  } else {
    message += 'That is below the normal range of 60 to 100.';
    technique_feedback = 'Verify finger placement on the radial artery.';
  }

  let audio_url = '';
  try {
    audio_url = await generateTTS(message);
  } catch {
    // optional TTS
  }

  if (process.env.DEMO_MODE !== 'true') {
    try {
      await generateResponse(`Provide brief nursing feedback for BPM ${bpm}, assessment ${assessment}`);
    } catch {
      // non-blocking
    }
  }

  res.json({
    success: true,
    bpm,
    assessment,
    message,
    technique_feedback,
    audio_url,
  });
}
