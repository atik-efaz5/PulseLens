# Letta Context (Logical Window)

Not the Letta SDK in v1.

- `MAX_TURNS = 20` (40 messages)
- `MAX_TOKENS = 4000`, `TOKENS_PER_CHAR = 0.25`
- Compress when tokens > 3600 and messages ≥ 10: keep last 50%, summarize older
- Session TTL: 2 hours idle
- `callWithContext(sessionId, prompt)` → Gemini with history
