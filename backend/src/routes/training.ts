import { Router } from 'express';
import { startTraining, trainingFeedback } from '../controllers/trainingController';

const router = Router();

router.post('/start', startTraining);
router.post('/feedback', trainingFeedback);

export default router;
