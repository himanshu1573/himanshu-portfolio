'use client';

import {
  DEVICES,
  type KvPrecision,
  MODELS,
  type WeightPrecision,
  calculate,
  formatGB,
  formatKB,
} from '@/lib/inference/models';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';

const CONTEXTS = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground text-[11px] tracking-wide uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

const selectClass =
  'bg-background text-foreground h-9 rounded-md border border-[var(--dashed-border)] px-2 text-sm outline-none focus:border-foreground/50';

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'good' | 'bad';
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-dashed border-[var(--dashed-border)] px-3 py-2">
      <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
        {label}
      </span>
      <span
        className={cn(
          'font-mono text-lg leading-tight font-semibold',
          tone === 'good' && 'text-[#1a7f37] dark:text-[#3fb950]',
          tone === 'bad' && 'text-[#cf222e] dark:text-[#f85149]',
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

export default function KVCalculator() {
  const [modelId, setModelId] = useState('llama3.1-8b');
  const [deviceId, setDeviceId] = useState('h100-sxm');
  const [weightPrecision, setWeightPrecision] =
    useState<WeightPrecision>('fp16');
  const [kvPrecision, setKvPrecision] = useState<KvPrecision>('fp16');
  const [contextTokens, setContextTokens] = useState(8192);
  const [concurrency, setConcurrency] = useState(16);
  const [memoryUtilisation, setMemoryUtilisation] = useState(0.9);

  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];

  const result = useMemo(
    () =>
      calculate({
        model,
        device,
        weightPrecision,
        kvPrecision,
        contextTokens,
        concurrency,
        memoryUtilisation,
      }),
    [
      model,
      device,
      weightPrecision,
      kvPrecision,
      contextTokens,
      concurrency,
      memoryUtilisation,
    ],
  );

  const total = device.memoryGB;
  const weightsPct = Math.min(100, (result.weightsGB / total) * 100);
  const kvPct = Math.min(100 - weightsPct, (result.kvTotalGB / total) * 100);
  const budgetPct = memoryUtilisation * 100;
  const overflow = result.weightsGB + result.kvTotalGB > result.budgetGB;

  return (
    <div className="flex flex-col gap-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-dashed border-[var(--dashed-border)] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Model">
          <select
            className={selectClass}
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Device">
          <select
            className={selectClass}
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          >
            {DEVICES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Weights">
          <select
            className={selectClass}
            value={weightPrecision}
            onChange={(e) =>
              setWeightPrecision(e.target.value as WeightPrecision)
            }
          >
            <option value="fp16">FP16 / BF16 (2 B)</option>
            <option value="int8">INT8 (1 B)</option>
            <option value="int4">INT4 / 4-bit (0.5 B)</option>
          </select>
        </Field>
        <Field label="KV cache dtype">
          <select
            className={selectClass}
            value={kvPrecision}
            onChange={(e) => setKvPrecision(e.target.value as KvPrecision)}
          >
            <option value="fp16">FP16 (2 B)</option>
            <option value="fp8">FP8 (1 B)</option>
          </select>
        </Field>
        <Field label="Context per sequence">
          <select
            className={selectClass}
            value={contextTokens}
            onChange={(e) => setContextTokens(Number(e.target.value))}
          >
            {CONTEXTS.filter((c) => c <= model.maxContext).map((c) => (
              <option key={c} value={c}>
                {c.toLocaleString()} tokens
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Concurrent sequences · ${concurrency}`}>
          <input
            type="range"
            min={1}
            max={256}
            value={concurrency}
            onChange={(e) => setConcurrency(Number(e.target.value))}
            className="accent-foreground mt-3 h-1.5 w-full cursor-pointer"
          />
        </Field>
        <Field
          label={`Memory budget · ${(memoryUtilisation * 100).toFixed(0)}%`}
        >
          <input
            type="range"
            min={0.5}
            max={0.95}
            step={0.05}
            value={memoryUtilisation}
            onChange={(e) => setMemoryUtilisation(Number(e.target.value))}
            className="accent-foreground mt-3 h-1.5 w-full cursor-pointer"
          />
        </Field>
        <div className="text-muted-foreground flex flex-col justify-end text-[11px] leading-relaxed">
          {model.layers} layers · {model.kvHeads} KV heads × {model.headDim} dim
          <br />
          {device.bandwidthGBs.toLocaleString()} GB/s · {device.memoryGB} GB
        </div>
      </div>

      {/* Memory bar */}
      <div>
        <div className="text-muted-foreground mb-1.5 flex items-center justify-between text-[10px] tracking-wide uppercase">
          <span>{device.name} memory</span>
          <span
            className={cn(
              'normal-case',
              overflow && 'text-[#cf222e] dark:text-[#f85149]',
            )}
          >
            {overflow
              ? `Over budget by ${formatGB(result.weightsGB + result.kvTotalGB - result.budgetGB)}`
              : `${formatGB(result.budgetGB - result.weightsGB - result.kvTotalGB)} headroom`}
          </span>
        </div>
        <div className="bg-muted relative h-6 w-full overflow-hidden rounded-md border border-[var(--dashed-border)]">
          <div
            className="bg-foreground/80 absolute inset-y-0 left-0"
            style={{ width: `${weightsPct}%` }}
            title={`Weights ${formatGB(result.weightsGB)}`}
          />
          <div
            className="absolute inset-y-0 bg-[#2563eb]/70"
            style={{ left: `${weightsPct}%`, width: `${kvPct}%` }}
            title={`KV cache ${formatGB(result.kvTotalGB)}`}
          />
          <div
            className="absolute inset-y-0 w-px bg-[#cf222e]"
            style={{ left: `${budgetPct}%` }}
            title={`Budget ${formatGB(result.budgetGB)}`}
          />
        </div>
        <div className="text-muted-foreground mt-1.5 flex flex-wrap gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="bg-foreground/80 inline-block size-2.5 rounded-sm" />
            Weights {formatGB(result.weightsGB)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-[#2563eb]/70" />
            KV cache {formatGB(result.kvTotalGB)} ({concurrency} ×{' '}
            {formatGB(result.kvPerSequenceGB)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-px bg-[#cf222e]" />
            Budget {formatGB(result.budgetGB)}
          </span>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat
          label="Fits?"
          value={result.fits ? 'Yes' : 'No'}
          tone={result.fits ? 'good' : 'bad'}
          hint={`weights + KV ≤ ${(memoryUtilisation * 100).toFixed(0)}% of memory`}
        />
        <Stat
          label="KV per token"
          value={formatKB(result.kvBytesPerToken)}
          hint="2 × layers × KV heads × dim × bytes"
        />
        <Stat
          label="Max concurrent"
          value={result.maxConcurrent.toLocaleString()}
          hint={`sequences at ${contextTokens.toLocaleString()} tokens`}
        />
        <Stat
          label="Single user"
          value={`${result.singleUserTps.toFixed(0)} tok/s`}
          hint="bandwidth ÷ bytes read per token"
        />
        <Stat
          label={`Batched ×${concurrency}`}
          value={`${result.batchedTps.toLocaleString(undefined, { maximumFractionDigits: 0 })} tok/s`}
          hint="aggregate decode throughput"
          tone={result.fits ? 'good' : undefined}
        />
        <Stat
          label="Per user in batch"
          value={`${result.perUserTpsInBatch.toFixed(0)} tok/s`}
          hint={`${(result.batchedTps / result.singleUserTps).toFixed(1)}× more tokens for the same weight reads`}
        />
      </div>

      <details className="text-muted-foreground group text-xs leading-relaxed">
        <summary className="text-foreground cursor-pointer text-xs font-medium select-none">
          How these numbers are computed
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          <p>
            <span className="text-foreground">Weights</span> = parameters ×
            bytes per weight.{' '}
            <span className="text-foreground">KV per token</span> = 2 (K and V)
            × layers × KV heads × head dim × bytes; GQA models have far fewer KV
            heads than attention heads, which is why Llama 3.1 8B needs only 128
            KB per token.
          </p>
          <p>
            Decode is memory-bandwidth bound: producing one token for a batch
            reads all weights once plus every sequence&apos;s KV cache (taken as
            half the context on average). So{' '}
            <span className="text-foreground">steps per second</span> ≈
            bandwidth ÷ (weights + N × KV), and aggregate tokens/s = steps × N.
            Batching is almost free until the KV reads rival the weight reads.
          </p>
          <p>
            Ignores compute limits, prefill, attention-kernel efficiency, and
            tensor parallelism. Real engines land at 50 to 80% of these numbers.
            The M1 row is the setup from{' '}
            <a
              href="https://medium.com/@himanshu157/my-laptop-reads-a-gigabyte-to-write-one-word-4c1235b301ef"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              my laptop reads a gigabyte to write one word
            </a>
            .
          </p>
        </div>
      </details>
    </div>
  );
}
