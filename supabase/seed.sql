-- Seed 5 demo patients (run after migration)
INSERT INTO patients (id, name, age, sex, chief_complaint, current_symptoms, vital_signs, allergies, medications, diagnosis_history)
VALUES
  ('pt-sarah-chen', 'Sarah Chen', 34, 'Female', 'Chest tightness and cough',
   ARRAY['chest tightness','dry cough','mild fatigue'],
   '{"bloodPressure":"118/76","heartRate":88,"o2Saturation":97,"temperature":101.5}',
   ARRAY['Penicillin'],
   '[{"name":"Warfarin","dosage":"5mg daily"},{"name":"Loratadine","dosage":"10mg daily"}]',
   '["Seasonal allergies","Atrial fibrillation (2023)"]'),
  ('pt-robert-martinez', 'Robert Martinez', 58, 'Male', 'Elevated blood pressure',
   ARRAY['headache','dizziness'],
   '{"bloodPressure":"152/94","heartRate":78,"o2Saturation":98,"temperature":98.4}',
   ARRAY[]::TEXT[],
   '[{"name":"Lisinopril","dosage":"10mg daily"}]',
   '["Hypertension"]'),
  ('pt-emily-watson', 'Emily Watson', 27, 'Female', 'Sore throat',
   ARRAY['sore throat','fever'],
   '{"bloodPressure":"110/70","heartRate":92,"o2Saturation":99,"temperature":100.8}',
   ARRAY['Sulfa drugs'], '[]', '["Strep throat (2022)"]'),
  ('pt-michael-okonkwo', 'Michael Okonkwo', 45, 'Male', 'Joint pain',
   ARRAY['knee pain','stiffness'],
   '{"bloodPressure":"125/82","heartRate":74,"o2Saturation":98,"temperature":98.2}',
   ARRAY[]::TEXT[], '[{"name":"Metformin","dosage":"500mg twice daily"}]', '["Type 2 Diabetes"]'),
  ('pt-linda-thompson', 'Linda Thompson', 62, 'Female', 'Acid reflux',
   ARRAY['heartburn','nausea'],
   '{"bloodPressure":"130/85","heartRate":80,"o2Saturation":97,"temperature":98.6}',
   ARRAY['Aspirin'], '[{"name":"Omeprazole","dosage":"20mg daily"}]', '["GERD"]')
ON CONFLICT (id) DO NOTHING;
