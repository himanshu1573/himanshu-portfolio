/**
 * Model and hardware catalog + back-of-envelope inference math.
 *
 * The decode phase of an LLM is memory-bandwidth bound: every generated token
 * re-reads the full weights plus the KV cache of every sequence in the batch.
 * That single fact gives surprisingly good first-order estimates.
 */

export interface ModelSpec {
  id: string;
  name: string;
  params: number; // total parameters
  layers: number;
  kvHeads: number; // GQA: KV heads, not attention heads
  headDim: number;
  maxContext: number;
}

export interface DeviceSpec {
  id: string;
  name: string;
  memoryGB: number;
  /** Peak memory bandwidth, GB/s */
  bandwidthGBs: number;
  kind: 'gpu' | 'apple';
}

export const MODELS: ModelSpec[] = [
  {
    id: 'qwen2.5-1.5b',
    name: 'Qwen2.5-1.5B',
    params: 1.54e9,
    layers: 28,
    kvHeads: 2,
    headDim: 128,
    maxContext: 32768,
  },
  {
    id: 'qwen2.5-7b',
    name: 'Qwen2.5-7B',
    params: 7.6e9,
    layers: 28,
    kvHeads: 4,
    headDim: 128,
    maxContext: 131072,
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    params: 7.24e9,
    layers: 32,
    kvHeads: 8,
    headDim: 128,
    maxContext: 32768,
  },
  {
    id: 'llama3.1-8b',
    name: 'Llama 3.1 8B',
    params: 8.03e9,
    layers: 32,
    kvHeads: 8,
    headDim: 128,
    maxContext: 131072,
  },
  {
    id: 'llama3.1-70b',
    name: 'Llama 3.1 70B',
    params: 70.6e9,
    layers: 80,
    kvHeads: 8,
    headDim: 128,
    maxContext: 131072,
  },
  {
    id: 'qwen2.5-72b',
    name: 'Qwen2.5-72B',
    params: 72.7e9,
    layers: 80,
    kvHeads: 8,
    headDim: 128,
    maxContext: 131072,
  },
];

export const DEVICES: DeviceSpec[] = [
  {
    id: 'm1-8',
    name: 'Apple M1 (8 GB)',
    memoryGB: 8,
    bandwidthGBs: 68,
    kind: 'apple',
  },
  {
    id: 'm4-pro-48',
    name: 'Apple M4 Pro (48 GB)',
    memoryGB: 48,
    bandwidthGBs: 273,
    kind: 'apple',
  },
  {
    id: 'rtx4090',
    name: 'RTX 4090 (24 GB)',
    memoryGB: 24,
    bandwidthGBs: 1008,
    kind: 'gpu',
  },
  {
    id: 'a100-80',
    name: 'A100 (80 GB)',
    memoryGB: 80,
    bandwidthGBs: 2039,
    kind: 'gpu',
  },
  {
    id: 'h100-sxm',
    name: 'H100 SXM (80 GB)',
    memoryGB: 80,
    bandwidthGBs: 3350,
    kind: 'gpu',
  },
  {
    id: 'h200',
    name: 'H200 (141 GB)',
    memoryGB: 141,
    bandwidthGBs: 4800,
    kind: 'gpu',
  },
  {
    id: 'b200',
    name: 'B200 (192 GB)',
    memoryGB: 192,
    bandwidthGBs: 8000,
    kind: 'gpu',
  },
];

export type WeightPrecision = 'fp16' | 'int8' | 'int4';
export type KvPrecision = 'fp16' | 'fp8';

export const WEIGHT_BYTES: Record<WeightPrecision, number> = {
  fp16: 2,
  int8: 1,
  int4: 0.5,
};

export const KV_BYTES: Record<KvPrecision, number> = {
  fp16: 2,
  fp8: 1,
};

export interface CalcInput {
  model: ModelSpec;
  device: DeviceSpec;
  weightPrecision: WeightPrecision;
  kvPrecision: KvPrecision;
  /** Tokens per sequence (prompt + generation) */
  contextTokens: number;
  /** Sequences decoding concurrently */
  concurrency: number;
  /** Fraction of device memory the engine may use (vLLM gpu_memory_utilization) */
  memoryUtilisation: number;
}

export interface CalcResult {
  weightsGB: number;
  /** Bytes of KV cache per token across all layers */
  kvBytesPerToken: number;
  kvPerSequenceGB: number;
  kvTotalGB: number;
  budgetGB: number;
  kvBudgetGB: number;
  fits: boolean;
  /** Max sequences of this context that fit in the KV budget */
  maxConcurrent: number;
  /** Decode speed for a single user, tokens/s (bandwidth bound) */
  singleUserTps: number;
  /** Aggregate decode speed at the requested concurrency, tokens/s */
  batchedTps: number;
  /** Per-user speed inside that batch */
  perUserTpsInBatch: number;
  /** Bytes read from memory per decode step at this concurrency */
  bytesPerStep: number;
}

const GB = 1e9;

/** KV bytes for one token, all layers: 2 (K and V) × layers × kvHeads × headDim × bytes */
export function kvBytesPerToken(
  model: ModelSpec,
  kvPrecision: KvPrecision,
): number {
  return (
    2 * model.layers * model.kvHeads * model.headDim * KV_BYTES[kvPrecision]
  );
}

export function calculate(input: CalcInput): CalcResult {
  const {
    model,
    device,
    weightPrecision,
    kvPrecision,
    contextTokens,
    concurrency,
    memoryUtilisation,
  } = input;

  const weightsBytes = model.params * WEIGHT_BYTES[weightPrecision];
  const perToken = kvBytesPerToken(model, kvPrecision);
  const kvPerSeq = perToken * contextTokens;
  const kvTotal = kvPerSeq * concurrency;

  const budget = device.memoryGB * GB * memoryUtilisation;
  const kvBudget = Math.max(0, budget - weightsBytes);
  const maxConcurrent = kvPerSeq > 0 ? Math.floor(kvBudget / kvPerSeq) : 0;
  const fits = weightsBytes + kvTotal <= budget;

  const bandwidth = device.bandwidthGBs * GB;
  // Each decode step reads all weights once plus every sequence's KV cache.
  // Use half the context as the average KV length over a generation.
  const avgKvPerSeq = kvPerSeq / 2;
  const singleStepBytes = weightsBytes + avgKvPerSeq;
  const batchStepBytes = weightsBytes + avgKvPerSeq * concurrency;

  const singleUserTps = bandwidth / singleStepBytes;
  const stepsPerSecond = bandwidth / batchStepBytes;
  const batchedTps = stepsPerSecond * concurrency;

  return {
    weightsGB: weightsBytes / GB,
    kvBytesPerToken: perToken,
    kvPerSequenceGB: kvPerSeq / GB,
    kvTotalGB: kvTotal / GB,
    budgetGB: budget / GB,
    kvBudgetGB: kvBudget / GB,
    fits,
    maxConcurrent,
    singleUserTps,
    batchedTps,
    perUserTpsInBatch: stepsPerSecond,
    bytesPerStep: batchStepBytes,
  };
}

export function formatGB(gb: number): string {
  if (gb >= 100) return `${gb.toFixed(0)} GB`;
  if (gb >= 10) return `${gb.toFixed(1)} GB`;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${(gb * 1000).toFixed(0)} MB`;
}

export function formatKB(bytes: number): string {
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  return `${(bytes / 1e3).toFixed(1)} KB`;
}
