import {
  initSession,
  addMessage,
  getSession,
  clearAllSessions,
  MAX_TURNS,
} from '../../src/services/lettaService';

describe('lettaService', () => {
  beforeEach(() => clearAllSessions());

  it('creates unique sessions', () => {
    const a = initSession();
    const b = initSession();
    expect(a).not.toBe(b);
    expect(getSession(a)).toBeDefined();
  });

  it('caps messages at MAX_TURNS * 2', () => {
    const id = initSession();
    for (let i = 0; i < 50; i++) {
      addMessage(id, { role: 'user', content: `msg ${i}`, timestamp: Date.now() });
    }
    const session = getSession(id)!;
    expect(session.messages.length).toBeLessThanOrEqual(MAX_TURNS * 2);
  });

  it('compresses when token limit approached', () => {
    const id = initSession();
    for (let i = 0; i < 15; i++) {
      addMessage(id, {
        role: 'user',
        content: 'symptom: chest pain '.repeat(50),
        timestamp: Date.now(),
      });
    }
    const session = getSession(id)!;
    expect(session.messages.some((m) => m.role === 'system')).toBe(true);
  });
});
