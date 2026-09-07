# Database Schema

## patients

`id UUID PK`, `name`, `age`, `sex`, `chief_complaint`, `current_symptoms TEXT[]`, `vital_signs JSONB`, `allergies TEXT[]`, `medications JSONB`, `diagnosis_history JSONB`, `created_at`

## prescriptions

`id UUID PK`, `patient_id FK`, `medication`, `dosage`, `status`, `blocked`, `warnings JSONB`, `created_at`

See `supabase/migrations/001_initial.sql` and `supabase/seed.sql`.
