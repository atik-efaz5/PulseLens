import request from 'supertest';
import app from '../../src/server';

describe('API integration', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/training/start', async () => {
    const res = await request(app)
      .post('/api/training/start')
      .send({ procedure: 'pulse_taking', user_id: 'test' });
    expect(res.status).toBe(200);
    expect(res.body.session_id).toBeDefined();
  });

  it('POST /api/training/feedback calculates BPM', async () => {
    const start = await request(app)
      .post('/api/training/start')
      .send({ procedure: 'pulse_taking', user_id: 'test' });
    const res = await request(app)
      .post('/api/training/feedback')
      .send({ session_id: start.body.session_id, pulse_count: 18, duration_seconds: 15 });
    expect(res.status).toBe(200);
    expect(res.body.bpm).toBe(72);
    expect(res.body.assessment).toBe('normal');
  });

  it('POST /api/clinical/patient/load finds Sarah Chen', async () => {
    const res = await request(app)
      .post('/api/clinical/patient/load')
      .send({ patient_name: 'Sarah Chen' });
    expect(res.status).toBe(200);
    expect(res.body.patient.name).toBe('Sarah Chen');
  });

  it('POST /api/clinical/prescription/create blocks Warfarin + Ibuprofen', async () => {
    const load = await request(app)
      .post('/api/clinical/patient/load')
      .send({ patient_name: 'Sarah Chen' });
    const res = await request(app)
      .post('/api/clinical/prescription/create')
      .send({
        patient_id: load.body.patient.id,
        medication: 'Ibuprofen',
        dosage: '400mg',
      });
    expect(res.status).toBe(409);
    expect(res.body.blocked).toBe(true);
    expect(res.body.warnings[0]).toContain('Warfarin');
  });

  it('GET /api/clinical/patients', async () => {
    const res = await request(app).get('/api/clinical/patients');
    expect(res.status).toBe(200);
    expect(res.body.patients.length).toBeGreaterThanOrEqual(5);
  });

  it('POST /api/voice/command', async () => {
    const res = await request(app)
      .post('/api/voice/command')
      .send({ transcription: 'hey pulselens start assessment Sarah Chen' });
    expect(res.status).toBe(200);
    expect(res.body.intent).toBe('start_assessment');
  });
});
