'use client';

import { cn } from '@/lib/utils';
import { Pause, Play, RotateCcw, Shuffle } from 'lucide-react';
import React from 'react';

/** Stable, distinguishable colour per entity (user, job, conversation) */
export function userColor(index: number, alpha = 1): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue.toFixed(0)} 70% 52% / ${alpha})`;
}

interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

export function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: RangeControlProps) {
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

interface ToggleControlProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export function ToggleControl({
  label,
  checked,
  onChange,
  hint,
}: ToggleControlProps) {
  return (
    <label className="flex min-w-[9rem] flex-1 cursor-pointer flex-col gap-1">
      <span className="text-muted-foreground text-[11px] tracking-wide uppercase">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative h-5 w-9 rounded-full border transition-colors',
            checked
              ? 'border-foreground bg-foreground'
              : 'bg-muted border-[var(--dashed-border)]',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 size-3.5 rounded-full transition-transform',
              checked
                ? 'bg-background translate-x-4'
                : 'bg-foreground/50 translate-x-0.5',
            )}
          />
        </button>
        <span className="text-foreground font-mono text-xs">
          {checked ? 'on' : 'off'}
        </span>
        {hint && (
          <span className="text-muted-foreground text-[10px]">{hint}</span>
        )}
      </span>
    </label>
  );
}

interface MetricProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'good' | 'bad';
}

export function Metric({ label, value, hint, tone }: MetricProps) {
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
          !tone && 'text-foreground',
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

export const SPEEDS = [2, 5, 10, 20, 40];

interface PlayBarProps {
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  onShuffle?: () => void;
  speed: number;
  onSpeed: (speed: number) => void;
}

export function PlayBar({
  running,
  onToggle,
  onReset,
  onShuffle,
  speed,
  onSpeed,
}: PlayBarProps) {
  const btn =
    'text-foreground hover:bg-muted inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--dashed-border)] px-3 text-xs font-medium transition-colors';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className="bg-foreground text-background inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-opacity hover:opacity-90"
      >
        {running ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
        {running ? 'Pause' : 'Play'}
      </button>
      <button type="button" onClick={onReset} className={btn}>
        <RotateCcw className="size-3.5" />
        Reset
      </button>
      {onShuffle && (
        <button type="button" onClick={onShuffle} className={btn}>
          <Shuffle className="size-3.5" />
          New workload
        </button>
      )}
      <div className="ml-auto flex items-center gap-1">
        <span className="text-muted-foreground mr-1 text-[11px] uppercase">
          Speed
        </span>
        {SPEEDS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onSpeed(v)}
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
  );
}
