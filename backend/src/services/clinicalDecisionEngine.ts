import { generateClinicalAdvice, PatientContext, ClinicalAdvice } from './geminiService';

export interface DecisionSupportInput {
  patient: PatientContext;
  symptoms: string[];
  vitalSigns?: PatientContext['vitalSigns'];
}

export interface DecisionSupportResult extends ClinicalAdvice {
  primary_diagnosis: string;
  warnings: string[];
  follow_up: string;
}

export async function analyzePatient(input: DecisionSupportInput): Promise<DecisionSupportResult> {
  const ctx: PatientContext = {
    ...input.patient,
    currentSymptoms: input.symptoms.length ? input.symptoms : input.patient.currentSymptoms,
    vitalSigns: input.vitalSigns || input.patient.vitalSigns,
  };

  const advice = await generateClinicalAdvice(ctx);
  const warnings: string[] = [];

  if (ctx.allergies.length) {
    warnings.push(`Patient allergies: ${ctx.allergies.join(', ')}`);
  }
  if (ctx.currentMedications.some((m) => m.name.toLowerCase() === 'warfarin')) {
    warnings.push('Patient on anticoagulant — avoid NSAIDs');
  }

  return {
    ...advice,
    primary_diagnosis: advice.diagnosis,
    warnings,
    follow_up:
      advice.urgency === 'emergency'
        ? 'Seek emergency care immediately'
        : advice.urgency === 'urgent'
          ? 'Schedule urgent follow-up within 24 hours'
          : 'Routine follow-up as needed',
  };
}

export function formatForTTS(result: DecisionSupportResult): string {
  return `Assessment: ${result.primary_diagnosis}. Urgency: ${result.urgency}. ${result.recommendations[0] || ''}`;
}
