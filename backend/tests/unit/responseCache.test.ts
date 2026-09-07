import { ResponseCache } from '../../src/utils/responseCache';

describe('ResponseCache', () => {
  it('caches and retrieves values', () => {
    const cache = new ResponseCache(10000);
    cache.set('Hello', 'url1');
    expect(cache.get('hello')).toBe('url1');
    expect(cache.get('missing')).toBeNull();
  });

  it('expires entries after TTL', () => {
    const cache = new ResponseCache(1);
    cache.set('test', 'url');
    expect(cache.get('test')).toBe('url');
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(cache.get('test')).toBeNull();
        resolve();
      }, 10);
    });
  });
});
