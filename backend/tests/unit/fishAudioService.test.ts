import { generateTTS, COMMON_PHRASES } from '../../src/services/fishAudioService';
import { responseCache } from '../../src/utils/responseCache';

describe('fishAudioService', () => {
  beforeEach(() => responseCache.clear());

  it('returns demo URL in demo mode', async () => {
    const url = await generateTTS('Patient loaded');
    expect(url).toContain('demo-audio');
  });

  it('caches repeated phrases', async () => {
    await generateTTS('Test phrase');
    await generateTTS('Test phrase');
    expect(responseCache.getHitRate()).toBeGreaterThan(0);
  });

  it('has common phrases defined', () => {
    expect(COMMON_PHRASES.length).toBeGreaterThanOrEqual(10);
  });
});
