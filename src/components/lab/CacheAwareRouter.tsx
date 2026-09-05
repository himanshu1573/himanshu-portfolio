'use client';

import {
  type RoutePolicy,
  type RouterConfig,
  type RouterState,
  createRouter,
  stepRouter,
  summarizeRouter,
} from '@/lib/infra/router';
import { cn } from '@/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { PlayBar, RangeControl, userColor } from './controls';

const POLICIES: RoutePolicy[] = ['round-robin', 'least-loaded', 'prefix-aware'];

const POLICY_COPY: Record<RoutePolicy, { title: string; blurb: string }> = {
  'round-robin': {
    title: 'Round-robin',
    blurb: 'Next pod, every time. Ignores load and cache.',
  },
  'least-loaded': {
    title: 'Least loaded',
    blurb: 'Send to the pod with the smallest prefill queue.',
  },
  'prefix-aware': {
    title: 'Prefix-aware (llm-d EPP)',
    blurb:
      'Send to the pod that already holds the conversation prefix, unless it is overloaded; then least loaded.',
  },
};

const DEFAULT_CONFIG: RouterConfig = {
  seed: 9,
  pods: 4,
  cacheCapacity: 6,
  conversations: 24,
  prefixTokens: 2048,
  newTokensRange: [64, 256],
  arrivalRate: 0.5,
  podThroughput: 1200,
  loadThreshold: 6000,
};

function PodView({ state, pod }: { state: RouterState; pod: number }) {
  const p = state.pods[pod];
  const load = p.queue.reduce((n, id) => n + state.requests[id].remaining, 0);
  const capacity = state.config.podThroughput * 6;
  const ratio = Math.min(1, load / capacity);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-muted-foreground flex items-center justify-between font-mono text-[10px]">
        <span>pod-{pod}</span>
        <span>
          {p.queue.length} req · {load.toLocaleString()} tok
        </span>
      </div>
      <div className="bg-muted/40 h-2 w-full overflow-hidden rounded-full border border-[var(--dashed-border)]">
        <div
          className={cn(
            'h-full transition-[width] duration-150',
            ratio > 0.85 ? 'bg-[#cf222e]' : 'bg-foreground/70',
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <div className="flex min-h-[1.1rem] flex-wrap gap-1">
        {p.cache.length === 0 ? (
          <span className="text-muted-foreground text-[10px]">cache empty</span>
        ) : (
          p.cache.map((conv) => (
            <span
              key={conv}
              title={`conversation ${conv} prefix cached`}
              className="inline-block h-3.5 rounded-[3px] px-1 font-mono text-[9px] leading-[14px]"
              style={{
                backgroundColor: userColor(conv, 0.25),
                border: `1px solid ${userColor(conv, 0.7)}`,
              }}
            >
              c{conv}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function PolicyPanel({
  state,
  best,
}: {
  state: RouterState;
  best: { hit: boolean; latency: boolean };
}) {
  const copy = POLICY_COPY[state.policy];
  const s = summarizeRouter(state);
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-foreground text-sm font-semibold">{copy.title}</h3>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {copy.blurb}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {state.pods.map((_, i) => (
          <PodView key={i} state={state} pod={i} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-dashed border-[var(--dashed-border)] px-2 py-1.5">
          <p className="text-muted-foreground text-[9px] tracking-wide uppercase">
            hit rate
          </p>
          <p
            className={cn(
              'font-mono text-base font-semibold',
              best.hit
                ? 'text-[#1a7f37] dark:text-[#3fb950]'
                : 'text-foreground',
            )}
          >
            {(s.hitRate * 100).toFixed(0)}%
          </p>
        </div>
        <div className="rounded-md border border-dashed border-[var(--dashed-border)] px-2 py-1.5">
          <p className="text-muted-foreground text-[9px] tracking-wide uppercase">
            latency
          </p>
          <p
            className={cn(
              'font-mono text-base font-semibold',
              best.latency
                ? 'text-[#1a7f37] dark:text-[#3fb950]'
                : 'text-foreground',
            )}
          >
            {s.avgLatency.toFixed(2)}
            <span className="text-muted-foreground text-[10px]"> steps</span>
          </p>
        </div>
        <div className="rounded-md border border-dashed border-[var(--dashed-border)] px-2 py-1.5">
          <p className="text-muted-foreground text-[9px] tracking-wide uppercase">
            imbalance
          </p>
          <p className="text-foreground font-mono text-base font-semibold">
            {s.imbalance.toFixed(2)}×
          </p>
        </div>
      </div>
      <p className="text-muted-foreground font-mono text-[10px]">
        prefill saved {(s.prefillSaved / 1000).toFixed(0)}k tok · computed{' '}
        {(s.prefillComputed / 1000).toFixed(0)}k tok
      </p>
    </div>
  );
}

export default function CacheAwareRouter() {
  const [config, setConfig] = useState<RouterConfig>(DEFAULT_CONFIG);
  const [speed, setSpeed] = useState(10);
  const [running, setRunning] = useState(true);
  const [, setTick] = useState(0);

  const refs = useRef<Record<RoutePolicy, RouterState>>({
    'round-robin': createRouter(config, 'round-robin'),
    'least-loaded': createRouter(config, 'least-loaded'),
    'prefix-aware': createRouter(config, 'prefix-aware'),
  });

  const reset = useCallback((next: RouterConfig) => {
    for (const policy of POLICIES)
      refs.current[policy] = createRouter(next, policy);
    setTick((t) => t + 1);
  }, []);

  const update = (patch: Partial<RouterConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    reset(next);
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      for (const policy of POLICIES) stepRouter(refs.current[policy]);
      setTick((t) => t + 1);
    }, 1000 / speed);
    return () => window.clearInterval(id);
  }, [running, speed]);

  const summaries = POLICIES.map((p) => summarizeRouter(refs.current[p]));
  const bestHit = Math.max(...summaries.map((s) => s.hitRate));
  const bestLatency = Math.min(
    ...summaries.filter((s) => s.completed > 0).map((s) => s.avgLatency),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-lg border border-dashed border-[var(--dashed-border)] p-4">
        <div className="flex flex-wrap gap-4">
          <RangeControl
            label="Decode pods"
            value={config.pods}
            min={2}
            max={8}
            onChange={(v) => update({ pods: v })}
          />
          <RangeControl
            label="Prefix cache / pod"
            value={config.cacheCapacity}
            min={2}
            max={16}
            onChange={(v) => update({ cacheCapacity: v })}
            format={(v) => `${v} prefixes`}
          />
          <RangeControl
            label="Conversations"
            value={config.conversations}
            min={8}
            max={64}
            step={4}
            onChange={(v) => update({ conversations: v })}
          />
          <RangeControl
            label="Shared prefix"
            value={config.prefixTokens}
            min={256}
            max={8192}
            step={256}
            onChange={(v) => update({ prefixTokens: v, loadThreshold: v * 3 })}
            format={(v) => `${v} tok`}
          />
          <RangeControl
            label="Traffic"
            value={config.arrivalRate}
            min={0.1}
            max={0.9}
            step={0.1}
            onChange={(v) => update({ arrivalRate: v })}
            format={(v) => `${(v * 4).toFixed(1)} req/step`}
          />
        </div>
        <PlayBar
          running={running}
          onToggle={() => setRunning((r) => !r)}
          onReset={() => reset(config)}
          onShuffle={() => update({ seed: Math.floor(Math.random() * 10000) })}
          speed={speed}
          onSpeed={setSpeed}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
        {POLICIES.map((policy, i) => (
          <PolicyPanel
            key={policy}
            state={refs.current[policy]}
            best={{
              hit: summaries[i].hitRate === bestHit && bestHit > 0,
              latency:
                summaries[i].avgLatency === bestLatency &&
                summaries[i].completed > 0,
            }}
          />
        ))}
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        Same seeded traffic for all three. A request whose conversation prefix
        is already on its pod pays only for its new tokens; a miss recomputes
        the whole {config.prefixTokens.toLocaleString()}-token prefix and evicts
        the least recently used one. Chips are the prefixes each pod holds; the
        bar is its outstanding prefill work. Prefix-aware routing trades some
        load balance for far less prefill, which is what the llm-d endpoint
        picker does with its KV-cache index. Step{' '}
        {refs.current['prefix-aware'].step}.
      </p>
    </div>
  );
}
