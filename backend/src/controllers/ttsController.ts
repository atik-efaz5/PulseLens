import { Request, Response } from 'express';
import { generateTTS } from '../services/fishAudioService';

export async function generateTtsHandler(req: Request, res: Response) {
  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ success: false, error: 'text is required' });
  }

  try {
    const audio_url = await generateTTS(text);
    res.json({ success: true, audio_url });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
}
