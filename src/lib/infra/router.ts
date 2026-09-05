/**
 * KV-cache-aware request routing simulator (llm-d-shaped).
 *
 * A fleet of decode pods sits behind a router. Each pod keeps an LRU cache of
 * conversation prefixes. A request from a conversation whose prefix is
 * already on the chosen pod skips most of its prefill; otherwise the pod has
 * to recompute the prefix and then caches it, evicting the least recently
 * used one if full. Three routing policies are run on the same workload.
 */
import { hashUnit } from '@/lib/inference/sim';

export type RoutePolicy = 'round-robin' | 'least-loaded' | 'prefix-aware';

export interface RouterConfig {
  seed: number;
  pods: number;
  /** Prefixes a pod can keep cached */
  cacheCapacity: number;
  conversations: number;
  /** Shared prefix tokens per conversation */
  prefixTokens: number;
  /** New tokens per request range */
  newTokensRange: [number, number];
  /** Requests arriving per step, probability per slot × 4 slots */
  arrivalRate: number;
  /** Tokens a pod can prefill per step */
  podThroughput: number;
  /** Prefix-aware: fall back to least-loaded if the cached pod's queue exceeds this */
  loadThreshold: number;
}

export interface RouteRequest {
  id: number;
  conversation: number;
  newTokens: number;
  arrivedAt: number;
  pod: number | null;
  /** Prefill tokens this request still owes on its pod */
  remaining: number;
  hit: boolean | null;
  startedAt: number | null;
  finishedAt: number | null;
}

export interface PodState {
  /** Conversation ids in LRU order, most recent last */
  cache: number[];
  queue: number[]; // request ids
}

export interface RouterState {
  config: RouterConfig;
  policy: RoutePolicy;
  step: number;
  requests: RouteRequest[];
  pods: PodState[];
  rrCursor: number;
  nextId: number;
  metrics: {
    hits: number;
    misses: number;
    prefillComputed: number;
    prefillSaved: number;
    completed: number;
    latencySum: number;
    loadImbalanceSum: number;
  };
}

export function createRouter(
  config: RouterConfig,
  policy: RoutePolicy,
): RouterState {
  return {
    config,
    policy,
    step: 0,
    requests: [],
    pods: Array.from({ length: config.pods }, () => ({ cache: [], queue: [] })),
    rrCursor: 0,
    nextId: 0,
    metrics: {
      hits: 0,
      misses: 0,
      prefillComputed: 0,
      prefillSaved: 0,
      completed: 0,
      latencySum: 0,
      loadImbalanceSum: 0,
    },
  };
}

function podLoad(state: RouterState, pod: number): number {
  return state.pods[pod].queue.reduce(
    (n, id) => n + state.requests[id].remaining,
    0,
  );
}

function leastLoaded(state: RouterState): number {
  let best = 0;
  let bestLoad = Number.POSITIVE_INFINITY;
  state.pods.forEach((_, i) => {
    const load = podLoad(state, i);
    if (load < bestLoad) {
      bestLoad = load;
      best = i;
    }
  });
  return best;
}

function choosePod(state: RouterState, req: RouteRequest): number {
  switch (state.policy) {
    case 'round-robin': {
      const pod = state.rrCursor % state.config.pods;
      state.rrCursor++;
      return pod;
    }
    case 'least-loaded':
      return leastLoaded(state);
    case 'prefix-aware': {
      const cached = state.pods.findIndex((p) =>
        p.cache.includes(req.conversation),
      );
      if (cached >= 0 && podLoad(state, cached) <= state.config.loadThreshold) {
        return cached;
      }
      return leastLoaded(state);
    }
  }
}

function touchCache(
  state: RouterState,
  pod: number,
  conversation: number,
): boolean {
  const cache = state.pods[pod].cache;
  const idx = cache.indexOf(conversation);
  if (idx >= 0) {
    cache.splice(idx, 1);
    cache.push(conversation);
    return true;
  }
  cache.push(conversation);
  if (cache.length > state.config.cacheCapacity) cache.shift(); // evict LRU
  return false;
}

function arrivals(state: RouterState): void {
  const { config } = state;
  for (let k = 0; k < 4; k++) {
    if (hashUnit(config.seed, state.step, k, 21) >= config.arrivalRate)
      continue;
    const id = state.nextId++;
    // Conversations are zipf-ish: a few are hot
    const u = hashUnit(config.seed, id, 22);
    const conversation = Math.min(
      config.conversations - 1,
      Math.floor(Math.pow(u, 1.6) * config.conversations),
    );
    const [lo, hi] = config.newTokensRange;
    const newTokens =
      lo + Math.floor(hashUnit(config.seed, id, 23) * (hi - lo + 1));
    const req: RouteRequest = {
      id,
      conversation,
      newTokens,
      arrivedAt: state.step,
      pod: null,
      remaining: 0,
      hit: null,
      startedAt: null,
      finishedAt: null,
    };
    state.requests.push(req);

    const pod = choosePod(state, req);
    const hit = touchCache(state, pod, conversation);
    req.pod = pod;
    req.hit = hit;
    req.remaining = hit ? newTokens : config.prefixTokens + newTokens;
    if (hit) {
      state.metrics.hits++;
      state.metrics.prefillSaved += config.prefixTokens;
    } else {
      state.metrics.misses++;
    }
    state.pods[pod].queue.push(id);
  }
}

function serve(state: RouterState): void {
  const { config } = state;
  const loads: number[] = [];
  state.pods.forEach((pod, i) => {
    let budget = config.podThroughput;
    loads.push(podLoad(state, i));
    while (budget > 0 && pod.queue.length > 0) {
      const req = state.requests[pod.queue[0]];
      if (req.startedAt === null) req.startedAt = state.step;
      const work = Math.min(budget, req.remaining);
      req.remaining -= work;
      budget -= work;
      state.metrics.prefillComputed += work;
      if (req.remaining === 0) {
        req.finishedAt = state.step;
        state.metrics.completed++;
        state.metrics.latencySum += state.step - req.arrivedAt;
        pod.queue.shift();
      }
    }
  });
  const avg = loads.reduce((n, l) => n + l, 0) / Math.max(1, loads.length);
  const max = Math.max(0, ...loads);
  state.metrics.loadImbalanceSum += avg > 0 ? max / avg : 1;
}

export function stepRouter(state: RouterState): RouterState {
  arrivals(state);
  serve(state);
  state.step++;
  return state;
}

export interface RouterSummary {
  hitRate: number;
  prefillSaved: number;
  prefillComputed: number;
  avgLatency: number;
  imbalance: number;
  completed: number;
  queued: number;
}

export function summarizeRouter(state: RouterState): RouterSummary {
  const m = state.metrics;
  const routed = m.hits + m.misses;
  return {
    hitRate: routed ? m.hits / routed : 0,
    prefillSaved: m.prefillSaved,
    prefillComputed: m.prefillComputed,
    avgLatency: m.completed ? m.latencySum / m.completed : 0,
    imbalance: state.step ? m.loadImbalanceSum / state.step : 1,
    completed: m.completed,
    queued: state.pods.reduce((n, p) => n + p.queue.length, 0),
  };
}
