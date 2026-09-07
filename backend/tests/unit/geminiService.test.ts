import { extractIntent, generateClinicalAdvice, validateClinicalAdvice } from '../../src/services/geminiService';

describe('geminiService', () => {
  it('extracts start_assessment intent locally', async () => {
    const result = await extractIntent('start assessment Sarah Chen');
    expect(result.intent).toBe('start_assessment');
    expect(result.entities.patient_name).toContain('Sarah Chen');
  });

  it('extracts prescribe intent with medication', async () => {
    const result = await extractIntent('prescribe Ibuprofen 400mg');
    expect(result.intent).toBe('prescribe_medication');
    expect(result.entities.medication).toBe('Ibuprofen');
  });

  it('returns demo clinical advice', async () => {
    const advice = await generateClinicalAdvice({
      name: 'Sarah Chen',
      age: 34,
      sex: 'Female',
      chiefComplaint: 'cough',
      currentSymptoms: ['cough'],
      vitalSigns: { bloodPressure: '120/80', heartRate: 72 },
      allergies: [],
      currentMedications: [],
      diagnosisHistory: [],
    });
    expect(advice.diagnosis).toBeDefined();
    expect(advice.aiDisclaimer).toContain('AI-generated');
  });

  it('validates clinical advice schema', () => {
    const valid = validateClinicalAdvice({
      diagnosis: 'URI',
      recommendations: ['rest'],
      urgency: 'routine',
      confidence: 0.8,
    });
    expect(valid).not.toBeNull();
    expect(validateClinicalAdvice({ diagnosis: 1 })).toBeNull();
  });
});
