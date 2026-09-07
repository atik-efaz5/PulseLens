import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import clinicalRoutes from './routes/clinical';
import trainingRoutes from './routes/training';
import voiceRoutes from './routes/voice';
import ttsRoutes from './routes/tts';
import { initSupabase } from './db/supabase';
import { preGenerateCommonPhrases } from './services/fishAudioService';
import { cleanupExpiredSessions } from './services/lettaService';
import { requestId, logger, errorHandler } from './middleware';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

const allowedOrigins = [
  ...(process.env.DASHBOARD_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim()),
  'http://localhost:5173',
];

const isDev = (process.env.NODE_ENV || 'development') === 'development';
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const vercelOriginPattern = /^https:\/\/[\w.-]+\.vercel\.app$/;

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (isDev && localhostOriginPattern.test(origin)) return true;
  if (vercelOriginPattern.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) callback(null, true);
      else callback(new Error('CORS not allowed'));
    },
  })
);
app.use(express.json());
app.use(requestId);
app.use(logger);

initSupabase();

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    demoMode: process.env.DEMO_MODE === 'true',
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'PulseLens Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      training: '/api/training',
      clinical: '/api/clinical',
      voice: '/api/voice',
      tts: '/api/tts',
    },
  });
});

app.use('/api/training', trainingRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/tts', ttsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested endpoint does not exist' });
});

app.use(errorHandler);

if (require.main === module) {
  preGenerateCommonPhrases().catch(() => {});
  setInterval(() => cleanupExpiredSessions(), 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`PulseLens API listening on http://localhost:${PORT}`);
    console.log(`DEMO_MODE=${process.env.DEMO_MODE === 'true'}`);
  });
}

export default app;
