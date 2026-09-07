export type Urgency = 'routine' | 'urgent' | 'emergency';

export interface PatientContext {
  name: string;
  age: number;
  sex: string;
  chiefComplaint: string;
  currentSymptoms: string[];
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    o2Saturation?: number;
    temperature?: number;
  };
  allergies: string[];
  currentMedications: { name: string; dosage: string; started?: string }[];
  diagnosisHistory: string[];
}

export interface ClinicalAdvice {
  diagnosis: string;
  recommendations: string[];
  urgency: Urgency;
  confidence: number;
  reasoning?: string;
  aiDisclaimer: string;
}

export interface IntentResult {
  intent: string;
  entities: Record<string, string>;
  confidence: number;
}

const VALID_INTENTS = [
  'start_training',
  'start_assessment',
  'record_symptom',
  'prescribe_medication',
  'show_medications',
  'show_allergies',
  'show_patient_history',
  'request_decision',
  'repeat_instructions',
  'end_session',
  'unknown',
] as const;

const AI_DISCLAIMER =
  'AI-generated suggestion — not verified clinical fact. Confirm with a licensed clinician.';

function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}

function getClient() {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const key = process.env.GEMINI_API_KEY;
  if (!key && !isDemoMode()) throw new Error('GEMINI_API_KEY not configured');
  return new GoogleGenerativeAI(key || 'demo');
}

export async function generateResponse(prompt: string): Promise<string> {
  if (!prompt.trim()) throw new Error('Prompt cannot be empty');
  if (isDemoMode()) {
    return `[Demo] Gemini response to: ${prompt.substring(0, 50)}...`;
  }
  const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export function validateClinicalAdvice(data: Record<string, unknown>): ClinicalAdvice | null {
  if (typeof data.diagnosis !== 'string') return null;
  if (!Array.isArray(data.recommendations)) return null;
  const urgency = data.urgency as Urgency;
  if (!['routine', 'urgent', 'emergency'].includes(urgency)) return null;
  const confidence = typeof data.confidence === 'number' ? data.confidence : 0.7;
  return {
    diagnosis: data.diagnosis,
    recommendations: data.recommendations as string[],
    urgency,
    confidence,
    reasoning: typeof data.reasoning === 'string' ? data.reasoning : undefined,
    aiDisclaimer: AI_DISCLAIMER,
  };
}

export async function generateClinicalAdvice(patient: PatientContext): Promise<ClinicalAdvice> {
  if (isDemoMode()) {
    const sys = patient.vitalSigns.heartRate > 100 || patient.currentSymptoms.includes('chest pain');
    return {
      diagnosis: sys ? 'Possible cardiac concern' : 'Upper Respiratory Infection (likely viral)',
      recommendations: sys
        ? ['Obtain ECG', 'Monitor vitals closely', 'Consider urgent evaluation']
        : ['Rest and hydration', 'Acetaminophen for discomfort', 'Follow up if symptoms persist'],
      urgency: sys ? 'urgent' : 'routine',
      confidence: 0.82,
      reasoning: 'Demo mode clinical assessment',
      aiDisclaimer: AI_DISCLAIMER,
    };
  }

  const prompt = `You are an AI clinical support assistant. Respond ONLY with valid JSON.
Patient: ${patient.name}, ${patient.age}y ${patient.sex}
Chief complaint: ${patient.chiefComplaint}
Symptoms: ${patient.currentSymptoms.join(', ')}
Vitals: BP ${patient.vitalSigns.bloodPressure}, HR ${patient.vitalSigns.heartRate}
Allergies: ${patient.allergies.join(', ') || 'None'}
Medications: ${patient.currentMedications.map((m) => `${m.name} ${m.dosage}`).join(', ') || 'None'}
History: ${patient.diagnosisHistory.join(', ') || 'None'}

JSON format: {"diagnosis":"...","recommendations":["..."],"urgency":"routine|urgent|emergency","confidence":0.0-1.0,"reasoning":"..."}`;

  const raw = await generateResponse(prompt);
  const parsed = extractJson(raw);
  if (!parsed) throw new Error('Invalid clinical advice JSON from Gemini');
  const validated = validateClinicalAdvice(parsed);
  if (!validated) throw new Error('Clinical advice failed schema validation');
  return validated;
}

export async function extractIntent(transcription: string): Promise<IntentResult> {
  const lower = transcription.toLowerCase();

  // Fast local fallbacks
  if (lower.includes('start training') || lower.includes('training pulse')) {
    return { intent: 'start_training', entities: {}, confidence: 0.95 };
  }
  if (lower.includes('start assessment') || lower.includes('assess ')) {
    const nameMatch = transcription.match(/(?:assessment|assess)\s+(.+)/i);
    return {
      intent: 'start_assessment',
      entities: { patient_name: nameMatch?.[1]?.trim() || '' },
      confidence: 0.9,
    };
  }
  if (lower.includes('record symptom')) {
    const sym = transcription.replace(/.*record symptom[:\s]*/i, '').trim();
    return { intent: 'record_symptom', entities: { symptom: sym }, confidence: 0.9 };
  }
  if (lower.includes('prescribe')) {
    const medMatch = transcription.match(/prescribe\s+(\w+)\s*(\d+\s*mg)?/i);
    return {
      intent: 'prescribe_medication',
      entities: {
        medication: medMatch?.[1] || '',
        dosage: medMatch?.[2]?.replace(/\s/g, '') || '',
      },
      confidence: 0.85,
    };
  }
  if (lower.includes('show medication')) {
    return { intent: 'show_medications', entities: {}, confidence: 0.95 };
  }
  if (lower.includes('show allerg')) {
    return { intent: 'show_allergies', entities: {}, confidence: 0.95 };
  }
  if (lower.includes('show history') || lower.includes('patient history')) {
    return { intent: 'show_patient_history', entities: {}, confidence: 0.95 };
  }
  if (lower.includes('end assessment') || lower.includes('end session')) {
    return { intent: 'end_session', entities: {}, confidence: 0.95 };
  }

  if (isDemoMode()) {
    return { intent: 'unknown', entities: {}, confidence: 0 };
  }

  const prompt = `Extract intent from: "${transcription}"
Valid intents: ${VALID_INTENTS.join(', ')}
JSON: {"intent":"...","entities":{},"confidence":0.0-1.0}`;

  const raw = await generateResponse(prompt);
  const parsed = extractJson(raw);
  if (!parsed || typeof parsed.intent !== 'string') {
    return { intent: 'unknown', entities: {}, confidence: 0 };
  }
  return {
    intent: parsed.intent as string,
    entities: (parsed.entities as Record<string, string>) || {},
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
  };
}
