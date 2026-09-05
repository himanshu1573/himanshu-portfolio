/**
 * Multi-cloud GPU scheduling simulator (SkyPilot-shaped).
 *
 * Jobs ask for N accelerators of a type. Pools (a cloud region, or an
 * on-prem Kubernetes node group) advertise an accelerator label, capacity and
 * an hourly price. A policy picks where each job runs; if nothing fits the
 * job waits in the queue. One `step` is one scheduling tick (think: a
 * minute). Deterministic for a given seed so policies can be compared on the
 * identical job stream.
 */
import { hashUnit } from '@/lib/inference/sim';

export type Policy = 'cheapest' | 'single-cloud';

export interface Pool {
  id: string;
  cloud: string;
  region: string;
  /** Accelerator label the pool advertises, e.g. "H100" or "H100-SXM" */
  accelerator: string;
  gpus: number;
  /** USD per GPU-hour */
  price: number;
  /** Spot capacity can be reclaimed */
  spot?: boolean;
}

export interface ClusterConfig {
  seed: number;
  pools: Pool[];
  /** New jobs per step, as a probability per step (0..1) × maxArrivals */
  arrivalRate: number;
  /** Job length range in steps */
  durationRange: [number, number];
  /** GPUs per job range */
  gpuRange: [number, number];
  /** Accelerator requests the workload draws from, with weights */
  requests: { accelerator: string; weight: number }[];
  /** Match "H100-SXM" requests only to pools with that exact label */
  strictVariantMatching: boolean;
  /** Probability per step that a spot pool reclaims capacity */
  spotReclaimRate: number;
  /** Which pool a single-cloud policy is pinned to */
  pinnedPool: string;
}

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface Job {
  id: number;
  accelerator: string;
  gpus: number;
  duration: number;
  arrivedAt: number;
  startedAt: number | null;
  finishedAt: number | null;
  pool: string | null;
  status: JobStatus;
  /** Landed on a bare-name pool although a variant was requested */
  misplaced: boolean;
  restarts: number;
}

export interface ClusterState {
  config: ClusterConfig;
  policy: Policy;
  step: number;
  jobs: Job[];
  /** pool id → gpus in use */
  used: Record<string, number>;
  nextJobId: number;
  metrics: {
    completed: number;
    waitSum: number;
    costUsd: number;
    misplaced: number;
    preempted: number;
    gpuStepsUsed: number;
    gpuStepsAvailable: number;
    wastedGpuSteps: number;
  };
}

/** Base accelerator name: "H100-SXM" → "H100" */
export function baseAccelerator(label: string): string {
  return label.split('-')[0];
}

/** Can a pool with `poolLabel` serve a request for `requested`? */
export function acceleratorMatches(
  requested: string,
  poolLabel: string,
  strict: boolean,
): boolean {
  if (requested === 'any') return true;
  if (requested === poolLabel) return true;
  const requestIsVariant = requested.includes('-');
  const poolIsVariant = poolLabel.includes('-');
  if (baseAccelerator(requested) !== baseAccelerator(poolLabel)) return false;
  // Request "H100" is happy with "H100-SXM" (a more specific node)
  if (!requestIsVariant && poolIsVariant) return true;
  // Request "H100-SXM" on a bare "H100" pool: only if not strict (the bug)
  if (requestIsVariant && !poolIsVariant) return !strict;
  return false;
}

export function createCluster(
  config: ClusterConfig,
  policy: Policy,
): ClusterState {
  const used: Record<string, number> = {};
  for (const pool of config.pools) used[pool.id] = 0;
  return {
    config,
    policy,
    step: 0,
    jobs: [],
    used,
    nextJobId: 0,
    metrics: {
      completed: 0,
      waitSum: 0,
      costUsd: 0,
      misplaced: 0,
      preempted: 0,
      gpuStepsUsed: 0,
      gpuStepsAvailable: 0,
      wastedGpuSteps: 0,
    },
  };
}

function pickAccelerator(config: ClusterConfig, u: number): string {
  const total = config.requests.reduce((n, r) => n + r.weight, 0);
  let acc = u * total;
  for (const r of config.requests) {
    acc -= r.weight;
    if (acc <= 0) return r.accelerator;
  }
  return config.requests[config.requests.length - 1].accelerator;
}

function arrivals(state: ClusterState): void {
  const { config } = state;
  // Up to 3 arrivals per step, each with probability arrivalRate
  for (let k = 0; k < 3; k++) {
    if (hashUnit(config.seed, state.step, k, 11) >= config.arrivalRate)
      continue;
    const id = state.nextJobId++;
    const [dLo, dHi] = config.durationRange;
    const [gLo, gHi] = config.gpuRange;
    state.jobs.push({
      id,
      accelerator: pickAccelerator(config, hashUnit(config.seed, id, 12)),
      gpus: gLo + Math.floor(hashUnit(config.seed, id, 13) * (gHi - gLo + 1)),
      duration:
        dLo + Math.floor(hashUnit(config.seed, id, 14) * (dHi - dLo + 1)),
      arrivedAt: state.step,
      startedAt: null,
      finishedAt: null,
      pool: null,
      status: 'queued',
      misplaced: false,
      restarts: 0,
    });
  }
}

function candidates(state: ClusterState, job: Job): Pool[] {
  const { config, policy } = state;
  const fits = (p: Pool) =>
    acceleratorMatches(
      job.accelerator,
      p.accelerator,
      config.strictVariantMatching,
    ) && p.gpus - state.used[p.id] >= job.gpus;

  if (policy === 'single-cloud') {
    const pinned = config.pools.find((p) => p.id === config.pinnedPool);
    return pinned && fits(pinned) ? [pinned] : [];
  }
  // cheapest-first with failover: sorted by price, first that fits wins
  return [...config.pools].filter(fits).sort((a, b) => a.price - b.price);
}

function schedule(state: ClusterState): void {
  const queued = state.jobs.filter((j) => j.status === 'queued');
  for (const job of queued) {
    const [pool] = candidates(state, job);
    if (!pool) continue;
    state.used[pool.id] += job.gpus;
    job.pool = pool.id;
    job.status = 'running';
    job.startedAt = state.step;
    job.misplaced =
      job.accelerator.includes('-') && !pool.accelerator.includes('-');
    if (job.misplaced) state.metrics.misplaced++;
    state.metrics.waitSum += state.step - job.arrivedAt;
  }
}

function runAndFinish(state: ClusterState): void {
  const { config } = state;
  const poolById = new Map(config.pools.map((p) => [p.id, p]));

  for (const job of state.jobs) {
    if (job.status !== 'running' || !job.pool) continue;
    const pool = poolById.get(job.pool)!;

    // Spot reclaim: job is killed, its GPU-steps so far are wasted
    if (
      pool.spot &&
      hashUnit(config.seed, job.id, state.step, 15) < config.spotReclaimRate
    ) {
      state.used[pool.id] -= job.gpus;
      state.metrics.preempted++;
      state.metrics.wastedGpuSteps +=
        job.gpus * (state.step - (job.startedAt ?? state.step));
      job.status = 'queued';
      job.pool = null;
      job.startedAt = null;
      job.restarts++;
      continue;
    }

    // Charge for this step
    const cost = (job.gpus * pool.price) / 60; // a step is a minute
    state.metrics.costUsd += cost;
    state.metrics.gpuStepsUsed += job.gpus;

    // A misplaced job runs but delivers nothing useful: wrong interconnect,
    // driver mismatch, OOM. It fails after its duration and is re-queued.
    const elapsed = state.step - (job.startedAt ?? state.step) + 1;
    if (elapsed >= job.duration) {
      state.used[pool.id] -= job.gpus;
      if (job.misplaced) {
        state.metrics.wastedGpuSteps += job.gpus * job.duration;
        job.status = 'queued';
        job.pool = null;
        job.startedAt = null;
        job.restarts++;
      } else {
        job.status = 'done';
        job.finishedAt = state.step;
        state.metrics.completed++;
      }
    }
  }

  state.metrics.gpuStepsAvailable += config.pools.reduce(
    (n, p) => n + p.gpus,
    0,
  );
}

export function stepCluster(state: ClusterState): ClusterState {
  arrivals(state);
  schedule(state);
  runAndFinish(state);
  state.step++;
  return state;
}

export interface ClusterSummary {
  completed: number;
  queued: number;
  running: number;
  avgWait: number;
  utilisation: number;
  costUsd: number;
  costPerJob: number;
  misplaced: number;
  preempted: number;
  wastedGpuHours: number;
}

export function summarizeCluster(state: ClusterState): ClusterSummary {
  const m = state.metrics;
  const started = state.jobs.filter(
    (j) => j.startedAt !== null || j.status === 'done',
  ).length;
  return {
    completed: m.completed,
    queued: state.jobs.filter((j) => j.status === 'queued').length,
    running: state.jobs.filter((j) => j.status === 'running').length,
    avgWait: started ? m.waitSum / started : 0,
    utilisation: m.gpuStepsAvailable ? m.gpuStepsUsed / m.gpuStepsAvailable : 0,
    costUsd: m.costUsd,
    costPerJob: m.completed ? m.costUsd / m.completed : 0,
    misplaced: m.misplaced,
    preempted: m.preempted,
    wastedGpuHours: m.wastedGpuSteps / 60,
  };
}
