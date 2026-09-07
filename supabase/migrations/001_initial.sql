-- PulseLens initial schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL,
  chief_complaint TEXT,
  current_symptoms TEXT[] DEFAULT '{}',
  vital_signs JSONB DEFAULT '{}',
  allergies TEXT[] NOT NULL DEFAULT '{}',
  medications JSONB NOT NULL DEFAULT '[]',
  diagnosis_history JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (LOWER(name));

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL,
  status TEXT DEFAULT 'pending_physician_approval',
  blocked BOOLEAN DEFAULT FALSE,
  warnings JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
