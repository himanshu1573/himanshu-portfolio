/**
 * Tiny, deterministic LLM serving simulator.
 *
 * One `step` = one decode iteration of the engine (one forward pass that
 * produces one token for every running sequence). The model is deliberately
 * simple: no compute cost model, no prefill chunking. It exists to make the
 * *scheduling* and *memory* differences between static batching and
 * continuous batching with a paged KV cache visible.
 *
 * Both schedulers are fed the exact same closed-loop workload (same seed, same
 * users, same request lengths) so the comparison is fair.
 */

export type SchedulerMode = 'static' | 'continuous';

export interface SimConfig {
  seed: number;
  /** Concurrent clients; each sends its next request after the previous one finishes */
  users: number;
  /** Max sequences decoding in one step (batch slots) */
  maxBatch: number;
  /** KV cache capacity in blocks */
  totalBlocks: number;
  /** Tokens per KV block */
  blockSize: number;
  promptRange: [number, number];
  outputRange: [number, number];
  /** Steps a user waits before sending its next request */
  thinkRange: [number, number];
}

export type SeqStatus = 'waiting' | 'running' | 'done' | 'preempted';

export interface Sequence {
  id: number;
  user: number;
  promptTokens: number;
  outputTokens: number;
  generated: number;
  status: SeqStatus;
  /** KV blocks owned (physical block ids) */
  blocks: number[];
  arrivedAt: number;
  firstTokenAt: number | null;
  finishedAt: number | null;
  /** Static mode: blocks reserved up front for the worst case */
  reservedBlocks: number;
  preemptions: number;
}

export interface SimMetrics {
  tokensGenerated: number;
  completed: number;
  ttftSum: number;
  ttftCount: number;
  /** Σ busy slots per step, for utilisation */
  busySlotSum: number;
  /** Σ tokens actually stored in the cache, per step */
  storedTokenSum: number;
  /** Σ blocks reserved (owned) per step */
  ownedBlockSum: number;
  preemptions: number;
}

export interface SimState {
  config: SimConfig;
  mode: SchedulerMode;
  step: number;
  seqs: Sequence[];
  /** Slot index → sequence id (null = idle slot) */
  slots: (number | null)[];
  freeBlocks: number[];
  /** Physical block id → sequence id */
  blockOwner: (number | null)[];
  metrics: SimMetrics;
  nextSeqId: number;
  /** Per-user: how many requests issued so far, and when the next one may arrive */
  userNextRequest: number[];
  userNextArrival: number[];
}

/* ------------------------------------------------------------------ */
/* Deterministic randomness                                            */
/* ------------------------------------------------------------------ */

/** Small integer hash → [0, 1). Same inputs always give the same output. */
export function hashUnit(...parts: number[]): number {
  let h = 2166136261;
  for (const p of parts) {
    h ^= p + 0x9e3779b9;
    h = Math.imul(h, 16777619);
    h ^= h >>> 13;
  }
  return ((h >>> 0) % 100000) / 100000;
}

function rangeFrom(unit: number, [lo, hi]: [number, number]): number {
  return lo + Math.floor(unit * (hi - lo + 1));
}

/** Request k of user u always has the same lengths for a given seed */
export function requestLengths(
  config: SimConfig,
  user: number,
  k: number,
): { promptTokens: number; outputTokens: number; think: number } {
  return {
    promptTokens: rangeFrom(
      hashUnit(config.seed, user, k, 1),
      config.promptRange,
    ),
    outputTokens: rangeFrom(
      hashUnit(config.seed, user, k, 2),
      config.outputRange,
    ),
    think: rangeFrom(hashUnit(config.seed, user, k, 3), config.thinkRange),
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function blocksNeeded(tokens: number, blockSize: number): number {
  return Math.ceil(tokens / blockSize);
}

function totalTokens(seq: Sequence): number {
  return seq.promptTokens + seq.generated;
}

function allocate(state: SimState, seq: Sequence, count: number): boolean {
  if (state.freeBlocks.length < count) return false;
  for (let i = 0; i < count; i++) {
    const block = state.freeBlocks.pop()!;
    state.blockOwner[block] = seq.id;
    seq.blocks.push(block);
  }
  return true;
}

function release(state: SimState, seq: Sequence): void {
  for (const block of seq.blocks) {
    state.blockOwner[block] = null;
    state.freeBlocks.push(block);
  }
  seq.blocks = [];
}

function seqById(state: SimState, id: number): Sequence {
  return state.seqs[id];
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */

export function createSim(config: SimConfig, mode: SchedulerMode): SimState {
  const freeBlocks: number[] = [];
  for (let b = config.totalBlocks - 1; b >= 0; b--) freeBlocks.push(b);

  const state: SimState = {
    config,
    mode,
    step: 0,
    seqs: [],
    slots: Array.from({ length: config.maxBatch }, () => null),
    freeBlocks,
    blockOwner: Array.from({ length: config.totalBlocks }, () => null),
    metrics: {
      tokensGenerated: 0,
      completed: 0,
      ttftSum: 0,
      ttftCount: 0,
      busySlotSum: 0,
      storedTokenSum: 0,
      ownedBlockSum: 0,
      preemptions: 0,
    },
    nextSeqId: 0,
    userNextRequest: Array.from({ length: config.users }, () => 0),
    userNextArrival: Array.from({ length: config.users }, (_, u) =>
      // Stagger initial arrivals a little so the queue is not a wall
      Math.floor(hashUnit(config.seed, u, -1) * 3),
    ),
  };
  return state;
}

/** Users whose think time has elapsed submit a new request */
function admitArrivals(state: SimState): void {
  const { config } = state;
  for (let u = 0; u < config.users; u++) {
    if (state.userNextArrival[u] > state.step) continue;
    // A user has at most one request in flight
    const inFlight = state.seqs.some(
      (s) => s.user === u && s.status !== 'done',
    );
    if (inFlight) continue;

    const k = state.userNextRequest[u]++;
    const { promptTokens, outputTokens } = requestLengths(config, u, k);
    state.seqs.push({
      id: state.nextSeqId++,
      user: u,
      promptTokens,
      outputTokens,
      generated: 0,
      status: 'waiting',
      blocks: [],
      arrivedAt: state.step,
      firstTokenAt: null,
      finishedAt: null,
      reservedBlocks: 0,
      preemptions: 0,
    });
    // Next arrival is scheduled when this request finishes (see finish())
    state.userNextArrival[u] = Number.POSITIVE_INFINITY;
  }
}

function finish(state: SimState, seq: Sequence): void {
  seq.status = 'done';
  seq.finishedAt = state.step;
  state.metrics.completed++;
  release(state, seq);
  const k = state.userNextRequest[seq.user] - 1;
  const { think } = requestLengths(state.config, seq.user, k);
  state.userNextArrival[seq.user] = state.step + think;
}

/**
 * Static batching: a batch is formed only when the previous batch has fully
 * drained. Every admitted sequence reserves KV blocks for its worst case
 * (prompt + max output) up front, the way a padded, pre-allocated cache does.
 */
function scheduleStatic(state: SimState): void {
  const { config } = state;
  const batchActive = state.slots.some((id) => id !== null);
  if (batchActive) return;

  const waiting = state.seqs.filter((s) => s.status === 'waiting');
  for (let slot = 0; slot < config.maxBatch && waiting.length > 0; slot++) {
    const seq = waiting[0];
    const reserve = blocksNeeded(
      seq.promptTokens + config.outputRange[1],
      config.blockSize,
    );
    if (!allocate(state, seq, reserve)) break; // cache full → wait for next batch
    waiting.shift();
    seq.reservedBlocks = reserve;
    seq.status = 'running';
    state.slots[slot] = seq.id;
  }
}

/**
 * Continuous batching: every step, fill idle slots from the queue; allocate
 * only the blocks the prompt needs now, grow by one block when a sequence
 * crosses a block boundary, preempt the youngest sequence when the cache is
 * full (its blocks are freed and it re-queues, vLLM "recompute" style).
 */
function scheduleContinuous(state: SimState): void {
  const { config } = state;
  const waiting = state.seqs
    .filter((s) => s.status === 'waiting' || s.status === 'preempted')
    .sort((a, b) => a.arrivedAt - b.arrivedAt);

  for (let slot = 0; slot < config.maxBatch && waiting.length > 0; slot++) {
    if (state.slots[slot] !== null) continue;
    const seq = waiting[0];
    const need = blocksNeeded(seq.promptTokens, config.blockSize);
    if (!allocate(state, seq, need)) break; // no room → stay queued
    waiting.shift();
    seq.status = 'running';
    seq.generated = 0;
    state.slots[slot] = seq.id;
  }
}

function preemptYoungest(state: SimState): boolean {
  let victimSlot = -1;
  let victim: Sequence | null = null;
  state.slots.forEach((id, slot) => {
    if (id === null) return;
    const seq = seqById(state, id);
    if (!victim || seq.arrivedAt > victim.arrivedAt) {
      victim = seq;
      victimSlot = slot;
    }
  });
  if (!victim) return false;
  const v: Sequence = victim;
  release(state, v);
  v.status = 'preempted';
  v.generated = 0;
  v.preemptions++;
  state.metrics.preemptions++;
  state.slots[victimSlot] = null;
  return true;
}

/** One decode iteration for every running sequence */
function decode(state: SimState): void {
  const { config } = state;

  for (let slot = 0; slot < state.slots.length; slot++) {
    const id = state.slots[slot];
    if (id === null) continue;
    const seq = seqById(state, id);

    if (state.mode === 'continuous') {
      // Need a new block if the next token crosses a block boundary
      const tokensAfter = totalTokens(seq) + 1;
      if (blocksNeeded(tokensAfter, config.blockSize) > seq.blocks.length) {
        while (!allocate(state, seq, 1)) {
          // Free memory by preempting; if we are the youngest we get preempted
          if (!preemptYoungest(state)) break;
          if (seq.status === 'preempted') break;
        }
        if (seq.status === 'preempted') continue;
      }
    }

    seq.generated++;
    state.metrics.tokensGenerated++;
    if (seq.firstTokenAt === null) {
      seq.firstTokenAt = state.step;
      state.metrics.ttftSum += state.step - seq.arrivedAt;
      state.metrics.ttftCount++;
    }
    if (seq.generated >= seq.outputTokens) {
      finish(state, seq);
      state.slots[slot] = null;
    }
  }
}

function sample(state: SimState): void {
  const { config } = state;
  state.metrics.busySlotSum += state.slots.filter((s) => s !== null).length;
  let stored = 0;
  let owned = 0;
  for (const seq of state.seqs) {
    if (seq.status !== 'running') continue;
    owned += seq.blocks.length;
    stored += Math.min(totalTokens(seq), seq.blocks.length * config.blockSize);
  }
  state.metrics.storedTokenSum += stored;
  state.metrics.ownedBlockSum += owned;
}

/** Advance the simulation by one engine step (mutates and returns state) */
export function stepSim(state: SimState): SimState {
  admitArrivals(state);
  if (state.mode === 'static') scheduleStatic(state);
  else scheduleContinuous(state);
  decode(state);
  sample(state);
  state.step++;
  return state;
}

/* ------------------------------------------------------------------ */
/* Derived numbers for the UI                                          */
/* ------------------------------------------------------------------ */

export interface SimSummary {
  tokensPerStep: number;
  avgTtft: number;
  slotUtilisation: number;
  /** Tokens stored ÷ tokens of capacity reserved (1 = no waste) */
  kvEfficiency: number;
  completed: number;
  preemptions: number;
  blocksInUse: number;
}

export function summarize(state: SimState): SimSummary {
  const m = state.metrics;
  const steps = Math.max(1, state.step);
  const owned = state.config.totalBlocks - state.freeBlocks.length;
  return {
    tokensPerStep: m.tokensGenerated / steps,
    avgTtft: m.ttftCount ? m.ttftSum / m.ttftCount : 0,
    slotUtilisation: m.busySlotSum / (steps * state.config.maxBatch),
    kvEfficiency: m.ownedBlockSum
      ? m.storedTokenSum / (m.ownedBlockSum * state.config.blockSize)
      : 1,
    completed: m.completed,
    preemptions: m.preemptions,
    blocksInUse: owned,
  };
}

/** Tokens actually stored in a block (for rendering fill levels) */
export function blockFill(state: SimState, block: number): number {
  const id = state.blockOwner[block];
  if (id === null) return 0;
  const seq = seqById(state, id);
  const index = seq.blocks.indexOf(block);
  const tokens = totalTokens(seq) - index * state.config.blockSize;
  return Math.max(0, Math.min(state.config.blockSize, tokens));
}
