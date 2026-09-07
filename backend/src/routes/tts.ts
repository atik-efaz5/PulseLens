import { Router } from 'express';
import { generateTtsHandler } from '../controllers/ttsController';

const router = Router();
router.post('/generate', generateTtsHandler);
export default router;
