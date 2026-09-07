import { Router } from 'express';
import {
  createSession,
  loadPatient,
  listAllPatients,
  getPatientById,
  recordSymptom,
  decisionSupport,
  createPrescriptionHandler,
} from '../controllers/clinicalController';

const router = Router();

router.post('/session', createSession);
router.get('/patients', listAllPatients);
router.get('/patient/:id', getPatientById);
router.post('/patient/load', loadPatient);
router.post('/symptom/record', recordSymptom);
router.post('/decision-support', decisionSupport);
router.post('/prescription/create', createPrescriptionHandler);

export default router;
