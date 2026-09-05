'use client';

import {
  type SchedulerMode,
  type SimConfig,
  type SimState,
  blockFill,
  createSim,
  stepSim,
  summarize,
} from '@/lib/inference/sim';
import { cn } from '@/lib/utils';
import { Pause, Play, RotateCcw, Shuffle } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

/** Stable, distinguishable colour per user in both themes */
export function userColor(user: number, alpha = 1): string {
  const hue = (user * 137.508) % 360;
  return `hsl(${hue.toFixed(0)} 70% 52% / ${alpha})`;
}

const DEFAULT_CONFIG: SimConfig = {
  seed: 7,
  users: 8,
  maxBatch: 4,
  totalBlocks: 64,
  blockSize: 16,
  promptRange: [16, 96],
  outputRange: [16, 128],
  thinkRange: [1, 6],
};

interface ControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: ControlProps) {
  return (
    <label className="flex min-w-[9rem] flex-1 flex-col gap-1">
      <span className="text-muted-foreground flex items-center justify-between text-[11px] tracking-wide uppercase">
        {label}
        <span className="text-foreground font-mono text-xs normal-case">
          {format ? format(value) : value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-foreground h-1.5 w-full cursor-pointer"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* KV block grid                                                       */
/* ------------------------------------------------------------------ */

export function KVBlockGrid({
  state,
  compact = false,
}: {
  state: SimState;
  compact?: boolean;
}) {
  const { totalBlocks, blockSize } = state.config;
  const cols = totalBlocks <= 32 ? 16 : totalBlocks <= 64 ? 16 : 32;

  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      aria-label="KV cache blocks"
    >
      {Array.from({ length: totalBlocks }, (_, block) => {
        const owner = state.blockOwner[block];
        const fill = owner === null ? 0 : blockFill(state, block);
        const ratio = fill / blockSize;
        const seq = owner === null ? null : state.seqs[owner];
        return (
          <div
            key={block}
            title={
              seq
                ? `Block ${block}: user ${seq.user + 1}, ${fill}/${blockSize} tokens`
                : `Block ${block}: free`
            }
            className={cn(
              'relative overflow-hidden rounded-[3px] border transition-colors duration-150',
              compact ? 'aspect-square' : 'aspect-[4/3]',
              seq ? '' : 'bg-muted/40 border-[var(--dashed-border)]',
            )}
            style={
              seq
                ? {
                    borderColor: userColor(seq.user, 0.7),
                    backgroundColor: userColor(seq.user, 0.12),
                  }
                : undefined
            }
          >
            {seq && (
              <div
                className="absolute inset-x-0 bottom-0"
                style={{
                  height: `${Math.max(ratio * 100, ratio > 0 ? 12 : 0)}%`,
                  backgroundColor: userColor(seq.user, 0.85),
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One scheduler panel                                                 */
/* ------------------------------------------------------------------ */

const MODE_COPY: Record<SchedulerMode, { title: string; blurb: string }> = {
  static: {
    title: 'Static batching',
    blurb:
      'A batch is formed, runs until its slowest request finishes, then the next batch starts. Each slot pre-reserves KV memory for the worst-case length.',
  },
  continuous: {
    title: 'Continuous batching + paged KV',
    blurb:
      'Every step, finished requests leave and queued ones join. KV memory is handed out one 16-token block at a time, only when needed.',
  },
};

function Metric({
  label,
  value,
  hint,
  good,
}: {
  label: string;
  value: string;
  hint?: string;
  good?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-dashed border-[var(--dashed-border)] px-3 py-2">
      <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
        {label}
      </span>
      <span
        className={cn(
          'font-mono text-lg leading-tight font-semibold',
          good ? 'text-[#1a7f37] dark:text-[#3fb950]' : 'text-foreground',
        )}
      >
        {value}
      </span>
      {hint && (
        <span className="text-muted-foreground text-[10px]">{hint}</span>
      )}
    </div>
  );
}

function SchedulerPanel({
  state,
  best,
}: {
  state: SimState;
  best: Partial<Record<'tps' | 'ttft' | 'util' | 'kv', boolean>>;
}) {
  const copy = MODE_COPY[state.mode];
  const summary = summarize(state);
  const queued = state.seqs.filter(
    (s) => s.status === 'waiting' || s.status === 'preempted',
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-foreground text-sm font-semibold">{copy.title}</h3>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {copy.blurb}
        </p>
      </div>

      {/* Batch slots */}
      <div>
        <div className="text-muted-foreground mb-1.5 flex items-center justify-between text-[10px] tracking-wide uppercase">
          <span>Batch slots</span>
          <span className="normal-case">{queued} queued</span>
        </div>
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${state.config.maxBatch}, minmax(0, 1fr))`,
          }}
        >
          {state.slots.map((id, slot) => {
            const seq = id === null ? null : state.seqs[id];
            const progress = seq ? seq.generated / seq.outputTokens : 0;
            return (
              <div
                key={slot}
                className={cn(
                  'relative h-9 overflow-hidden rounded-md border',
                  seq
                    ? ''
                    : 'bg-muted/30 border-dashed border-[var(--dashed-border)]',
                )}
                style={
                  seq
                    ? {
                        borderColor: userColor(seq.user, 0.7),
                        backgroundColor: userColor(seq.user, 0.1),
                      }
                    : undefined
                }
                title={
                  seq
                    ? `Slot ${slot + 1}: user ${seq.user + 1}, ${seq.generated}/${seq.outputTokens} tokens`
                    : `Slot ${slot + 1}: idle`
                }
              >
                {seq && (
                  <>
                    <div
                      className="absolute inset-y-0 left-0 transition-[width] duration-150"
                      style={{
                        width: `${progress * 100}%`,
                        backgroundColor: userColor(seq.user, 0.45),
                      }}
                    />
                    <span className="text-foreground relative flex h-full items-center justify-center font-mono text-[10px]">
                      U{seq.user + 1} · {seq.generated}/{seq.outputTokens}
                    </span>
                  </>
                )}
                {!seq && (
                  <span className="text-muted-foreground flex h-full items-center justify-center text-[10px]">
                    idle
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* KV cache */}
      <div>
        <div className="text-muted-foreground mb-1.5 flex items-center justify-between text-[10px] tracking-wide uppercase">
          <span>KV cache · {state.config.totalBlocks} blocks</span>
          <span className="normal-case">
            {summary.blocksInUse} owned · {state.freeBlocks.length} free
          </span>
        </div>
        <KVBlockGrid state={state} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric
          label="Throughput"
          value={summary.tokensPerStep.toFixed(2)}
          hint="tokens / step"
          good={best.tps}
        />
        <Metric
          label="Avg TTFT"
          value={summary.avgTtft.toFixed(1)}
          hint="steps waited"
          good={best.ttft}
        />
        <Metric
          label="Slot util."
          value={`${(summary.slotUtilisation * 100).toFixed(0)}%`}
          hint="busy slots / step"
          good={best.util}
        />
        <Metric
          label="KV efficiency"
          value={`${(summary.kvEfficiency * 100).toFixed(0)}%`}
          hint="stored / reserved"
          good={best.kv}
        />
      </div>
      <p className="text-muted-foreground text-[11px]">
        {summary.completed} requests completed
        {summary.preemptions > 0 && ` · ${summary.preemptions} preemptions`}
        {' · step '}
        {state.step}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Simulator                                                           */
/* ------------------------------------------------------------------ */

const SPEEDS = [2, 5, 10, 20, 40];

export default function ServingSimulator() {
  const [config, setConfig] = useState<SimConfig>(DEFAULT_CONFIG);
  const [speed, setSpeed] = useState(10);
  const [running, setRunning] = useState(true);
  const [, setTick] = useState(0);

  const staticRef = useRef<SimState>(createSim(config, 'static'));
  const contRef = useRef<SimState>(createSim(config, 'continuous'));

  const reset = useCallback((next: SimConfig) => {
    staticRef.current = createSim(next, 'static');
    contRef.current = createSim(next, 'continuous');
    setTick((t) => t + 1);
  }, []);

  const update = (patch: Partial<SimConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    reset(next);
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      stepSim(staticRef.current);
      stepSim(contRef.current);
      setTick((t) => t + 1);
    }, 1000 / speed);
    return () => window.clearInterval(id);
  }, [running, speed]);

  const s = summarize(staticRef.current);
  const c = summarize(contRef.current);
  const bestStatic = {
    tps: s.tokensPerStep > c.tokensPerStep,
    ttft: s.avgTtft > 0 && s.avgTtft < c.avgTtft,
    util: s.slotUtilisation > c.slotUtilisation,
    kv: s.kvEfficiency > c.kvEfficiency,
  };
  const bestCont = {
    tps: c.tokensPerStep > s.tokensPerStep,
    ttft: c.avgTtft > 0 && c.avgTtft < s.avgTtft,
    util: c.slotUtilisation > s.slotUtilisation,
    kv: c.kvEfficiency > s.kvEfficiency,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 rounded-lg border border-dashed border-[var(--dashed-border)] p-4">
        <div className="flex flex-wrap gap-4">
          <RangeControl
            label="Users"
            value={config.users}
            min={1}
            max={16}
            onChange={(v) => update({ users: v })}
          />
          <RangeControl
            label="Batch slots"
            value={config.maxBatch}
            min={1}
            max={8}
            onChange={(v) => update({ maxBatch: v })}
          />
          <RangeControl
            label="KV blocks"
            value={config.totalBlocks}
            min={16}
            max={128}
            step={16}
            onChange={(v) => update({ totalBlocks: v })}
          />
          <RangeControl
            label="Block size"
            value={config.blockSize}
            min={4}
            max={32}
            step={4}
            onChange={(v) => update({ blockSize: v })}
            format={(v) => `${v} tok`}
          />
          <RangeControl
            label="Max output"
            value={config.outputRange[1]}
            min={32}
            max={256}
            step={16}
            onChange={(v) => update({ outputRange: [16, v] })}
            format={(v) => `≤${v} tok`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="bg-foreground text-background inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-opacity hover:opacity-90"
          >
            {running ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
            {running ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => reset(config)}
            className="text-foreground hover:bg-muted inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--dashed-border)] px-3 text-xs font-medium transition-colors"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => update({ seed: Math.floor(Math.random() * 10000) })}
            className="text-foreground hover:bg-muted inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--dashed-border)] px-3 text-xs font-medium transition-colors"
          >
            <Shuffle className="size-3.5" />
            New workload
          </button>
          <div className="ml-auto flex items-center gap-1">
            <span className="text-muted-foreground mr-1 text-[11px] uppercase">
              Speed
            </span>
            {SPEEDS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSpeed(v)}
                className={cn(
                  'h-7 rounded-md border px-2 font-mono text-[11px] transition-colors',
                  speed === v
                    ? 'border-foreground bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground border-[var(--dashed-border)]',
                )}
              >
                {v}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
        <SchedulerPanel state={staticRef.current} best={bestStatic} />
        <SchedulerPanel state={contRef.current} best={bestCont} />
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        Same seed, same {config.users} users, same request lengths on both
        sides. Each colour is one user; a block&apos;s fill shows how many of
        its {config.blockSize} token slots hold real K/V vectors. Green numbers
        mark the better scheduler for that metric. This is a toy: one step is
        one forward pass, prefill is free, and there is no compute model. It is
        the same scheduler and block allocator design as{' '}
        <a
          href="https://github.com/himanshu1573/tinyserve"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4"
        >
          tinyserve
        </a>
        , minus the model.
      </p>
    </div>
  );
}
