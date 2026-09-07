import {
  checkInteraction,
  checkAllergy,
  findMedication,
  MEDICATIONS,
} from '../../src/services/drugInteractionService';

describe('drugInteractionService', () => {
  it('has exactly 8 medications', () => {
    expect(MEDICATIONS).toHaveLength(8);
  });

  it('detects Warfarin + Ibuprofen interaction with object meds', () => {
    const warning = checkInteraction('Ibuprofen', [{ name: 'Warfarin', dosage: '5mg' }]);
    expect(warning).not.toBeNull();
    expect(warning!.severity).toBe('HIGH');
    expect(warning!.alternative?.medication).toBe('Acetaminophen');
  });

  it('detects Warfarin + Ibuprofen with string meds', () => {
    const warning = checkInteraction('Ibuprofen', ['Warfarin']);
    expect(warning).not.toBeNull();
  });

  it('blocks penicillin allergy for Amoxicillin', () => {
    const warning = checkAllergy('Amoxicillin', ['Penicillin']);
    expect(warning).not.toBeNull();
    expect(warning!.alternative?.medication).toBe('Azithromycin');
  });

  it('finds medication by name', () => {
    expect(findMedication('Warfarin')?.class).toBe('Anticoagulant');
  });
});
