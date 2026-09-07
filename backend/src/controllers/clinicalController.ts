import { Request, Response } from 'express';
import { initSession } from '../services/lettaService';
import { findPatientByName, findPatientById, listPatients } from '../db/supabase';
import { addMessage } from '../services/lettaService';
import { analyzePatient, formatForTTS } from '../services/clinicalDecisionEngine';
import { generateTTS } from '../services/fishAudioService';
import { checkInteraction, checkAllergy } from '../services/drugInteractionService';
import { createPrescription } from '../db/supabase';
import { toPatientContext } from '../models/patient';
import { findPatientById as getPatient } from '../db/supabase';

export async function createSession(_req: Request, res: Response) {
  const sessionId = initSession();
  res.json({ success: true, session_id: sessionId });
}

export async function loadPatient(req: Request, res: Response) {
  const { patient_name } = req.body;
  if (!patient_name) {
    return res.status(400).json({ success: false, error: 'patient_name is required' });
  }

  const patient = await findPatientByName(patient_name);
  if (!patient) {
    return res.status(404).json({
      success: false,
      error: 'Patient not found. Please repeat patient name.',
    });
  }

  const message = `Loading patient ${patient.name}. Age ${patient.age}. Chief complaint: ${patient.chief_complaint}.`;
  let audio_url = '';
  try {
    audio_url = await generateTTS(message);
  } catch {
    audio_url = '';
  }

  res.json({
    success: true,
    patient,
    ar_display: {
      position: 'top_center',
      duration_seconds: 10,
      priority_fields: ['allergies', 'medications', 'chief_complaint'],
    },
    audio_url,
  });
}

export async function listAllPatients(_req: Request, res: Response) {
  const patients = await listPatients();
  res.json({
    success: true,
    patients: patients.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      chief_complaint: p.chief_complaint,
    })),
  });
}

export async function getPatientById(req: Request, res: Response) {
  const patient = await findPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }
  res.json({ success: true, patient });
}

export async function recordSymptom(req: Request, res: Response) {
  const { session_id, symptom } = req.body;
  if (!session_id || !symptom) {
    return res.status(400).json({ success: false, error: 'session_id and symptom required' });
  }

  try {
    addMessage(session_id, {
      role: 'user',
      content: `Symptom recorded: ${symptom}`,
      timestamp: Date.now(),
    });
    const audio_url = await generateTTS('Symptom recorded.');
    res.json({ success: true, message: 'Symptom recorded.', audio_url });
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message });
  }
}

export async function decisionSupport(req: Request, res: Response) {
  const { session_id, patient_id, symptoms, vital_signs } = req.body;
  if (!session_id || !patient_id) {
    return res.status(400).json({ success: false, error: 'session_id and patient_id required' });
  }
  if (symptoms && !Array.isArray(symptoms)) {
    return res.status(400).json({ success: false, error: 'symptoms must be an array' });
  }

  const patient = await getPatient(patient_id);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  try {
    const result = await analyzePatient({
      patient: toPatientContext(patient) as Parameters<typeof analyzePatient>[0]['patient'],
      symptoms: symptoms || patient.current_symptoms,
      vitalSigns: vital_signs,
    });

    addMessage(session_id, {
      role: 'assistant',
      content: `Diagnosis: ${result.primary_diagnosis}`,
      timestamp: Date.now(),
    });

    const audio_url = await generateTTS(formatForTTS(result));
    res.json({ success: true, ...result, audio_url });
  } catch (e) {
    res.status(503).json({ success: false, error: (e as Error).message });
  }
}

export async function createPrescriptionHandler(req: Request, res: Response) {
  const { patient_id, medication, dosage } = req.body;
  if (!patient_id || !medication || !dosage) {
    return res.status(400).json({
      success: false,
      error: 'patient_id, medication, and dosage required',
    });
  }

  const patient = await getPatient(patient_id);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  const allergyWarning = checkAllergy(medication, patient.allergies);
  if (allergyWarning) {
    const audio_url = await generateTTS(allergyWarning.message).catch(() => '');
    return res.status(409).json({
      success: false,
      blocked: true,
      message: allergyWarning.message,
      warnings: [allergyWarning.message],
      alternatives: allergyWarning.alternative ? [allergyWarning.alternative] : [],
      ar_display: { icon: 'red_x', badge: 'BLOCKED' },
      audio_url,
    });
  }

  const interaction = checkInteraction(medication, patient.medications);
  if (interaction) {
    const audio_url = await generateTTS(`Warning: ${interaction.message}`).catch(() => '');
    const rx = await createPrescription(patient_id, medication, dosage, true, [interaction.message]);
    return res.status(409).json({
      success: false,
      blocked: true,
      prescription_id: rx.id,
      message: interaction.message,
      warnings: [interaction.message],
      alternatives: interaction.alternative ? [interaction.alternative] : [],
      ar_display: { icon: 'red_x', badge: 'BLOCKED' },
      audio_url,
    });
  }

  const rx = await createPrescription(patient_id, medication, dosage, false, []);
  const audio_url = await generateTTS('Prescription logged.').catch(() => '');
  res.json({
    success: true,
    blocked: false,
    prescription_id: rx.id,
    message: `Prescription for ${medication} ${dosage} logged.`,
    warnings: [],
    alternatives: [],
    ar_display: { icon: 'green_checkmark', badge: 'PENDING' },
    audio_url,
  });
}
