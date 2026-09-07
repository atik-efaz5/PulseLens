export interface CachedEntry {
  value: string;
  timestamp: number;
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000;
const MAX_SIZE = 100;

export class ResponseCache {
  private cache = new Map<string, CachedEntry>();
  private hits = 0;
  private misses = 0;

  constructor(private ttlMs = DEFAULT_TTL) {}

  private key(text: string): string {
    return text.toLowerCase().trim();
  }

  get(text: string): string | null {
    const k = this.key(text);
    const entry = this.cache.get(k);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(k);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.value;
  }

  set(text: string, value: string): void {
    const k = this.key(text);
    if (this.cache.size >= MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(k, { value, timestamp: Date.now() });
  }

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

export const responseCache = new ResponseCache();
