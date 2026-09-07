export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ContextSession {
  id: string;
  messages: Message[];
  totalTokens: number;
  createdAt: number;
  lastActivity: number;
}

const MAX_TURNS = 20;
const MAX_TOKENS = 4000;
const TOKENS_PER_CHAR = 0.25;
const COMPRESS_THRESHOLD = MAX_TOKENS * 0.9;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

const sessions = new Map<string, ContextSession>();

function estimateTokens(messages: Message[]): number {
  const chars = messages.reduce((s, m) => s + m.content.length, 0);
  return Math.ceil(chars * TOKENS_PER_CHAR);
}

function summarizeMessages(messages: Message[]): string {
  const parts: string[] = [];
  for (const m of messages) {
    const lower = m.content.toLowerCase();
    if (/symptom[:\s]+/.test(lower)) parts.push(m.content.slice(0, 80));
    if (/diagnosis[:\s]+/.test(lower)) parts.push(m.content.slice(0, 80));
    if (/prescrib/.test(lower)) parts.push(m.content.slice(0, 80));
  }
  return parts.length
    ? `[Summary of previous conversation] ${parts.join('; ')}`
    : '[Summary of previous conversation] Clinical assessment in progress.';
}

function compressContext(session: ContextSession): void {
  if (session.messages.length < 10) return;

  const keepCount = Math.floor(session.messages.length / 2);
  const oldMessages = session.messages.slice(0, session.messages.length - keepCount);
  const recentMessages = session.messages.slice(-keepCount);

  session.messages = [
    { role: 'system', content: summarizeMessages(oldMessages), timestamp: Date.now() },
    ...recentMessages,
  ];
  session.totalTokens = estimateTokens(session.messages);
}

export function initSession(): string {
  const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  sessions.set(id, {
    id,
    messages: [],
    totalTokens: 0,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  });
  return id;
}

export function getSession(sessionId: string): ContextSession | undefined {
  return sessions.get(sessionId);
}

export function addMessage(sessionId: string, message: Message): void {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found');

  session.messages.push(message);
  session.totalTokens = estimateTokens(session.messages);
  session.lastActivity = Date.now();

  const maxMessages = MAX_TURNS * 2;
  if (session.messages.length > maxMessages) {
    session.messages = session.messages.slice(-maxMessages);
    session.totalTokens = estimateTokens(session.messages);
  }

  if (session.totalTokens > COMPRESS_THRESHOLD) {
    compressContext(session);
  }
}

export function buildContextPrompt(messages: Message[]): string {
  return messages.map((m) => `${m.role}: ${m.content}`).join('\n');
}

export function cleanupExpiredSessions(): number {
  const now = Date.now();
  let removed = 0;
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      sessions.delete(id);
      removed++;
    }
  }
  return removed;
}

export function clearAllSessions(): void {
  sessions.clear();
}

export { MAX_TURNS, MAX_TOKENS, TOKENS_PER_CHAR };
