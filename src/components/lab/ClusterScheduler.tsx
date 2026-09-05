'use client';

import {
  type ClusterConfig,
  type ClusterState,
  type Policy,
  type Pool,
  createCluster,
  stepCluster,
  summarizeCluster,
} from '@/lib/infra/cluster';
import { cn } from '@/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Metric,
  PlayBar,
  RangeControl,
  ToggleControl,
  userColor,
} from './controls';

const POOLS: Pool[] = [
  {
    id: 'aws',
    cloud: 'AWS',
    region: 'us-east-1',
    accelerator: 'H100-SXM',
    gpus: 8,
    price: 3.9,
  },
  {
    id: 'nebius',
    cloud: 'Nebius',
    region: 'eu-north1',
    accelerator: 'H100',
    gpus: 8,
    price: 2.2,
    spot: true,
  },
  {
    id: 'gcp',
    cloud: 'GCP',
    region: 'us-central1',
    accelerator: 'A100',
    gpus: 8,
    price: 2.5,
  },
  {
    id: 'k8s',
    cloud: 'Kubernetes',
    region: 'on-prem',
    accelerator: 'L4',
    gpus: 8,
    price: 0.4,
  },
];

const ACCEL_HUE: Record<string, number> = {
  'H100-SXM': 0,
  H100: 1,
  A100: 2,
  L4: 3,
  any: 4,
};

const DEFAULT_CONFIG: ClusterConfig = {
  seed: 5,
  pools: POOLS,
  arrivalRate: 0.12,
  durationRange: [20, 90],
  gpuRange: [1, 4],
  requests: [
    { accelerator: 'H100-SXM', weight: 3 },
    { accelerator: 'A100', weight: 3 },
    { accelerator: 'any', weight: 2 },
    { accelerator: 'L4', weight: 2 },
  ],
  strictVariantMatching: true,
  spotReclaimRate: 0.004,
  pinnedPool: 'aws',
};

const POLICY_COPY: Record<Policy, { title: string; blurb: string }> = {
  cheapest: {
    title: 'Cheapest first, with failover',
    blurb:
      'Every job is placed on the cheapest pool that has a matching accelerator and free capacity, across all clouds. Spot capacity can be reclaimed; the job re-queues.',
  },
  'single-cloud': {
    title: 'Pinned to one cloud (AWS H100)',
    blurb:
      'Everything goes to a single reserved pool. Jobs that need another accelerator, or arrive while it is full, wait.',
  },
};

function PoolRow({ pool, state }: { pool: Pool; state: ClusterState }) {
  const running = state.jobs.filter(
    (j) => j.status === 'running' && j.pool === pool.id,
  );
  const slots: (typeof running)[number][] = [];
  for (const job of running) for (let g = 0; g < job.gpus; g++) slots.push(job);

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-[9.5rem] shrink-0">
        <p className="text-foreground text-xs font-medium">
          {pool.cloud}{' '}
          <span className="text-muted-foreground font-normal">
            {pool.region}
          </span>
        </p>
        <p className="text-muted-foreground font-mono text-[10px]">
          {pool.accelerator} × {pool.gpus} · ${pool.price.toFixed(2)}/h
          {pool.spot && ' · spot'}
        </p>
      </div>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: pool.gpus }, (_, i) => {
          const job = slots[i];
          return (
            <div
              key={i}
              title={
                job
                  ? `job #${job.id} · ${job.accelerator} × ${job.gpus}`
                  : 'free'
              }
              className={cn(
                'h-5 flex-1 rounded-[3px] border',
                !job &&
                  'bg-muted/40 border-dashed border-[var(--dashed-border)]',
                job?.misplaced &&
                  'border-[#cf222e] [background-image:repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(207,34,46,0.5)_3px,rgba(207,34,46,0.5)_5px)]',
              )}
              style={
                job && !job.misplaced
                  ? {
                      borderColor: userColor(
                        ACCEL_HUE[job.accelerator] ?? 4,
                        0.7,
                      ),
                      backgroundColor: userColor(
                        ACCEL_HUE[job.accelerator] ?? 4,
                        0.45,
                      ),
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
      <span className="text-muted-foreground w-10 shrink-0 text-right font-mono text-[10px]">
        {state.used[pool.id]}/{pool.gpus}
      </span>
    </div>
  );
}

function PolicyPanel({
  state,
  other,
}: {
  state: ClusterState;
  other: ClusterState;
}) {
  const copy = POLICY_COPY[state.policy];
  const s = summarizeCluster(state);
  const o = summarizeCluster(other);
  const queued = state.jobs.filter((j) => j.status === 'queued');
  const byAccel = queued.reduce<Record<string, number>>((acc, j) => {
    acc[j.accelerator] = (acc[j.accelerator] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-foreground text-sm font-semibold">{copy.title}</h3>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {copy.blurb}
        </p>
      </div>

      <div className="divide-y divide-dashed divide-[var(--dashed-border)]">
        {state.config.pools.map((pool) => (
          <PoolRow key={pool.id} pool={pool} state={state} />
        ))}
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px]">
        <span className="text-foreground">queue {queued.length}</span>
        {Object.entries(byAccel).map(([acc, n]) => (
          <span key={acc} className="flex items-center gap-1">
            <span
              className="inline-block size-2 rounded-[2px]"
              style={{ backgroundColor: userColor(ACCEL_HUE[acc] ?? 4, 0.8) }}
            />
            {acc} × {n}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric
          label="Utilisation"
          value={`${(s.utilisation * 100).toFixed(0)}%`}
          hint="GPU-minutes used"
          tone={s.utilisation > o.utilisation ? 'good' : undefined}
        />
        <Metric
          label="Avg wait"
          value={`${s.avgWait.toFixed(0)} min`}
          hint="queue → start"
          tone={s.avgWait > 0 && s.avgWait < o.avgWait ? 'good' : undefined}
        />
        <Metric
          label="Cost / job"
          value={`$${s.costPerJob.toFixed(2)}`}
          hint={`$${s.costUsd.toFixed(0)} total · ${s.completed} done`}
          tone={
            s.costPerJob > 0 && s.costPerJob < o.costPerJob ? 'good' : undefined
          }
        />
        <Metric
          label="Wasted"
          value={`${s.wastedGpuHours.toFixed(1)} GPU-h`}
          hint={`${s.misplaced} misplaced · ${s.preempted} preempted`}
          tone={s.misplaced > 0 ? 'bad' : undefined}
        />
      </div>
    </div>
  );
}

export default function ClusterScheduler() {
  const [config, setConfig] = useState<ClusterConfig>(DEFAULT_CONFIG);
  const [speed, setSpeed] = useState(10);
  const [running, setRunning] = useState(true);
  const [, setTick] = useState(0);

  const aRef = useRef<ClusterState>(createCluster(config, 'cheapest'));
  const bRef = useRef<ClusterState>(createCluster(config, 'single-cloud'));

  const reset = useCallback((next: ClusterConfig) => {
    aRef.current = createCluster(next, 'cheapest');
    bRef.current = createCluster(next, 'single-cloud');
    setTick((t) => t + 1);
  }, []);

  const update = (patch: Partial<ClusterConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    reset(next);
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      stepCluster(aRef.current);
      stepCluster(bRef.current);
      setTick((t) => t + 1);
    }, 1000 / speed);
    return () => window.clearInterval(id);
  }, [running, speed]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-lg border border-dashed border-[var(--dashed-border)] p-4">
        <div className="flex flex-wrap gap-4">
          <RangeControl
            label="Job arrivals"
            value={config.arrivalRate}
            min={0.04}
            max={0.3}
            step={0.02}
            onChange={(v) => update({ arrivalRate: v })}
            format={(v) => `${(v * 3 * 60).toFixed(0)}/h`}
          />
          <RangeControl
            label="Job length"
            value={config.durationRange[1]}
            min={30}
            max={180}
            step={10}
            onChange={(v) => update({ durationRange: [20, v] })}
            format={(v) => `≤${v} min`}
          />
          <RangeControl
            label="Spot reclaim"
            value={config.spotReclaimRate}
            min={0}
            max={0.02}
            step={0.002}
            onChange={(v) => update({ spotReclaimRate: v })}
            format={(v) => `${(v * 100).toFixed(1)}%/min`}
          />
          <ToggleControl
            label="Strict variant matching"
            checked={config.strictVariantMatching}
            onChange={(v) => update({ strictVariantMatching: v })}
            hint="H100-SXM never lands on a bare H100 node"
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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
        <PolicyPanel state={aRef.current} other={bRef.current} />
        <PolicyPanel state={bRef.current} other={aRef.current} />
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        One step is one minute. Colours are the accelerator a job asked for;
        hatched red slots are jobs that landed on the wrong variant and will
        fail at the end of their run, wasting every GPU-minute they used. Turn
        strict matching off to see why SkyPilot must not match a{' '}
        <code className="text-foreground">H100-SXM</code> request to a node that
        only advertises <code className="text-foreground">H100</code>. Step{' '}
        {aRef.current.step}.
      </p>
    </div>
  );
}
