import { Request, Response } from 'express';
import { extractIntent } from '../services/geminiService';

export async function voiceCommand(req: Request, res: Response) {
  const { transcription } = req.body;
  if (!transcription) {
    return res.status(400).json({ success: false, error: 'transcription is required' });
  }

  const result = await extractIntent(transcription);
  res.json({
    success: true,
    intent: result.intent,
    parameters: result.entities,
    confidence: result.confidence,
  });
}
