import { Router } from 'express';
import { voiceCommand } from '../controllers/voiceController';

const router = Router();
router.post('/command', voiceCommand);
export default router;
