export interface MedicationInfo {
  name: string;
  class: string;
  common_dosage: string;
}

export interface MedicationRef {
  name: string;
  dosage?: string;
}

export interface InteractionWarning {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  alternative?: { medication: string; dosage: string; reason: string };
}

export const MEDICATIONS: MedicationInfo[] = [
  { name: 'Amoxicillin', class: 'Penicillin', common_dosage: '500mg three times daily' },
  { name: 'Azithromycin', class: 'Macrolide', common_dosage: '250mg once daily' },
  { name: 'Acetaminophen', class: 'Analgesic', common_dosage: '500mg every 6 hours as needed' },
  { name: 'Ibuprofen', class: 'NSAID', common_dosage: '400mg every 6 hours as needed' },
  { name: 'Lisinopril', class: 'ACE Inhibitor', common_dosage: '10mg once daily' },
  { name: 'Metformin', class: 'Biguanide', common_dosage: '500mg twice daily' },
  { name: 'Omeprazole', class: 'Proton Pump Inhibitor', common_dosage: '20mg once daily' },
  { name: 'Warfarin', class: 'Anticoagulant', common_dosage: '5mg once daily' },
];

export function findMedication(name: string): MedicationInfo | undefined {
  const lower = name.toLowerCase();
  return MEDICATIONS.find((m) => m.name.toLowerCase() === lower);
}

export function normalizeMedicationRef(med: string | MedicationRef): MedicationRef {
  if (typeof med === 'string') return { name: med };
  return med;
}

export function checkInteraction(
  newMedication: string,
  currentMedications: (string | MedicationRef)[]
): InteractionWarning | null {
  const newMed = findMedication(newMedication);
  if (!newMed) return null;

  for (const current of currentMedications) {
    const ref = normalizeMedicationRef(current);
    const currentMed = findMedication(ref.name);
    if (!currentMed) continue;

    if (currentMed.name === 'Warfarin' && newMed.class === 'NSAID') {
      return {
        severity: 'HIGH',
        message: `${newMed.name} interacts with Warfarin (bleeding risk).`,
        alternative: {
          medication: 'Acetaminophen',
          dosage: '500mg every 6 hours as needed',
          reason: 'Safer pain relief option with no anticoagulant interaction',
        },
      };
    }
  }
  return null;
}

export function checkAllergy(
  medication: string,
  allergies: string[]
): InteractionWarning | null {
  const med = findMedication(medication);
  if (!med) return null;

  for (const allergy of allergies) {
    const lower = allergy.toLowerCase();
    if (med.name.toLowerCase() === lower || med.class.toLowerCase() === lower) {
      const alt =
        lower.includes('penicillin')
          ? {
              medication: 'Azithromycin',
              dosage: '250mg once daily for 5 days',
              reason: 'Macrolide antibiotic safe for patients with Penicillin allergy',
            }
          : undefined;
      return {
        severity: 'HIGH',
        message: `Patient is allergic to ${allergy}. Cannot prescribe ${med.name}.`,
        alternative: alt,
      };
    }
  }
  return null;
}
