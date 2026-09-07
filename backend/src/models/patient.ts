export interface Medication {
  name: string;
  dosage: string;
  started?: string;
}

export interface DiagnosisRecord {
  date: string;
  diagnosis: string;
  provider?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  chief_complaint: string;
  current_symptoms: string[];
  vital_signs: {
    bloodPressure: string;
    heartRate: number;
    o2Saturation?: number;
    temperature?: number;
  };
  allergies: string[];
  medications: Medication[];
  diagnosis_history: DiagnosisRecord[] | string[];
  created_at?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  medication: string;
  dosage: string;
  status: string;
  blocked: boolean;
  warnings: string[];
  created_at?: string;
}

export function toPatientContext(patient: Patient) {
  return {
    name: patient.name,
    age: patient.age,
    sex: patient.sex,
    chiefComplaint: patient.chief_complaint,
    currentSymptoms: patient.current_symptoms,
    vitalSigns: {
      bloodPressure: patient.vital_signs.bloodPressure,
      heartRate: patient.vital_signs.heartRate,
      o2Saturation: patient.vital_signs.o2Saturation,
      temperature: patient.vital_signs.temperature,
    },
    allergies: patient.allergies,
    currentMedications: patient.medications,
    diagnosisHistory: Array.isArray(patient.diagnosis_history)
      ? patient.diagnosis_history.map((d) =>
          typeof d === 'string' ? d : d.diagnosis
        )
      : [],
  };
}
