import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Patient, Prescription } from '../models/patient';
import { SEED_PATIENTS } from '../data/seedPatients';

let client: SupabaseClient | null = null;
let useDemoData = false;

export function initSupabase(): void {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key && process.env.DEMO_MODE !== 'true') {
    client = createClient(url, key);
  } else {
    useDemoData = true;
  }
}

export function isUsingDemoData(): boolean {
  return useDemoData || !client;
}

export async function findPatientByName(name: string): Promise<Patient | null> {
  if (isUsingDemoData()) {
    const lower = name.toLowerCase();
    return (
      SEED_PATIENTS.find((p) => p.name.toLowerCase().includes(lower)) || null
    );
  }
  const { data, error } = await client!
    .from('patients')
    .select('*')
    .ilike('name', `%${name}%`)
    .limit(1)
    .single();
  if (error || !data) return null;
  return mapPatient(data);
}

export async function findPatientById(id: string): Promise<Patient | null> {
  if (isUsingDemoData()) {
    return SEED_PATIENTS.find((p) => p.id === id) || null;
  }
  const { data, error } = await client!.from('patients').select('*').eq('id', id).single();
  if (error || !data) return null;
  return mapPatient(data);
}

export async function listPatients(): Promise<Patient[]> {
  if (isUsingDemoData()) return SEED_PATIENTS;
  const { data, error } = await client!.from('patients').select('*').order('name');
  if (error || !data) return SEED_PATIENTS;
  return data.map(mapPatient);
}

export async function createPrescription(
  patientId: string,
  medication: string,
  dosage: string,
  blocked: boolean,
  warnings: string[]
): Promise<Prescription> {
  const rx: Prescription = {
    id: `rx_${Date.now()}`,
    patient_id: patientId,
    medication,
    dosage,
    status: blocked ? 'blocked' : 'pending_physician_approval',
    blocked,
    warnings,
    created_at: new Date().toISOString(),
  };

  if (!isUsingDemoData()) {
    const { data, error } = await client!
      .from('prescriptions')
      .insert({
        patient_id: patientId,
        medication,
        dosage,
        status: rx.status,
        blocked,
        warnings,
      })
      .select()
      .single();
    if (!error && data) {
      rx.id = data.id;
    }
  }
  return rx;
}

function mapPatient(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string,
    name: row.name as string,
    age: row.age as number,
    sex: row.sex as string,
    chief_complaint: (row.chief_complaint as string) || '',
    current_symptoms: (row.current_symptoms as string[]) || [],
    vital_signs: (row.vital_signs as Patient['vital_signs']) || {
      bloodPressure: '120/80',
      heartRate: 72,
    },
    allergies: (row.allergies as string[]) || [],
    medications: (row.medications as Patient['medications']) || [],
    diagnosis_history: (row.diagnosis_history as Patient['diagnosis_history']) || [],
    created_at: row.created_at as string,
  };
}
