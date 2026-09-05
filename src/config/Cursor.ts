/**
 * Cursor companion: a stream of "tokens" that trails the pointer and fades,
 * coloured like the users in the KV-cache visualisations.
 */
export const cursorConfig = {
  enabled: true,
  /** Fragments emitted behind the cursor */
  tokens: [
    'the',
    'kv',
    'q',
    'k',
    'v',
    'gpu',
    '<eos>',
    'tok',
    'blk',
    'attn',
    'ffn',
    'seq',
    '▁',
  ],
  /** Max live particles */
  maxParticles: 36,
  /** Milliseconds a token stays visible */
  lifetimeMs: 900,
  /** Minimum pointer travel (px) between two emissions */
  spawnDistance: 28,
};
