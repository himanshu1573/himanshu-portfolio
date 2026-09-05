'use client';

import { userColor } from '@/components/lab/ServingSimulator';
import {
  type SimConfig,
  type SimState,
  blockFill,
  createSim,
  stepSim,
  summarize,
} from '@/lib/inference/sim';
import { Link } from 'next-view-transitions';
import React, { useEffect, useRef, useState } from 'react';

const CONFIG: SimConfig = {
  seed: 3,
  users: 6,
  maxBatch: 4,
  totalBlocks: 48,
  blockSize: 16,
  promptRange: [16, 64],
  outputRange: [24, 96],
  thinkRange: [1, 4],
};

const MAX_LINES = 6;

function pad(n: number, width = 4): string {
  return String(n).padStart(width, '0');
}

/** Diff two engine states into scheduler-style log lines */
function logLines(before: SimState, after: SimState): string[] {
  const lines: string[] = [];
  const step = pad(after.step);

  for (const seq of after.seqs) {
    const prev = before.seqs[seq.id];
    const wasRunning = prev?.status === 'running';
    if (seq.status === 'running' && !wasRunning) {
      lines.push(
        `${step}  admit   seq#${pad(seq.id, 2)} u${seq.user + 1}  prompt=${seq.promptTokens}  +${seq.blocks.length} blk`,
      );
    }
    if (seq.status === 'done' && prev && prev.status !== 'done') {
      lines.push(
        `${step}  done    seq#${pad(seq.id, 2)} u${seq.user + 1}  ${seq.outputTokens} tok  ttft=${(seq.firstTokenAt ?? 0) - seq.arrivedAt}`,
      );
    }
    if (seq.status === 'preempted' && prev?.status === 'running') {
      lines.push(
        `${step}  preempt seq#${pad(seq.id, 2)} u${seq.user + 1}  cache full`,
      );
    }
  }

  if (lines.length === 0 && after.step % 4 === 0) {
    const busy = after.slots.filter((s) => s !== null).length;
    lines.push(
      `${step}  decode  batch=${busy}/${after.config.maxBatch}  free=${after.freeBlocks.length}/${after.config.totalBlocks}`,
    );
  }
  return lines;
}

/** Cheap structural snapshot so we can diff after a step */
function snapshot(state: SimState): SimState {
  return {
    ...state,
    seqs: state.seqs.map((s) => ({ ...s })),
  };
}

/**
 * Hero banner: a live continuous-batching engine ticking in the dark strip
 * at the top of the page. Left: scheduler log. Right: its paged KV cache.
 */
export default function HeroBanner() {
  const simRef = useRef<SimState>(createSim(CONFIG, 'continuous'));
  const [lines, setLines] = useState<string[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      const before = snapshot(simRef.current);
      stepSim(simRef.current);
      const fresh = logLines(before, simRef.current);
      if (fresh.length > 0) {
        setLines((prev) => [...prev, ...fresh].slice(-MAX_LINES));
      }
      setTick((t) => t + 1);
    }, 160);
    return () => window.clearInterval(id);
  }, []);

  const state = simRef.current;
  const summary = summarize(state);

  return (
    <Link
      href="/lab"
      className="group relative block min-h-[200px] overflow-hidden bg-[#0d0d09] text-white"
      aria-label="Open the inference lab"
    >
      <div className="grid grid-cols-1 gap-5 px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
        {/* Scheduler log */}
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] text-white/45">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            tinyserve · continuous batching · paged KV · live
          </div>
          <pre className="m-0 h-[7.5rem] overflow-hidden font-mono text-[11px] leading-5 whitespace-pre text-white/75">
            {lines.length === 0
              ? `${pad(0)}  boot    engine ready`
              : lines.join('\n')}
          </pre>
          <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-white/45">
            <span>
              <span className="text-white/90">
                {summary.tokensPerStep.toFixed(2)}
              </span>{' '}
              tok/step
            </span>
            <span>
              <span className="text-white/90">
                {(summary.slotUtilisation * 100).toFixed(0)}%
              </span>{' '}
              busy
            </span>
            <span>
              <span className="text-white/90">
                {(summary.kvEfficiency * 100).toFixed(0)}%
              </span>{' '}
              kv used
            </span>
            <span className="text-white/30 transition-colors group-hover:text-white/70">
              open the lab →
            </span>
          </div>
        </div>

        {/* KV cache */}
        <div
          className="grid w-full gap-[3px] sm:w-[13rem]"
          style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}
          aria-hidden="true"
        >
          {Array.from({ length: CONFIG.totalBlocks }, (_, block) => {
            const owner = state.blockOwner[block];
            const seq = owner === null ? null : state.seqs[owner];
            const ratio = seq ? blockFill(state, block) / CONFIG.blockSize : 0;
            return (
              <div
                key={block}
                className="relative aspect-square overflow-hidden rounded-[3px] border border-white/10 bg-white/[0.04]"
                style={
                  seq ? { borderColor: userColor(seq.user, 0.6) } : undefined
                }
              >
                {seq && (
                  <div
                    className="absolute inset-x-0 bottom-0"
                    style={{
                      height: `${Math.max(ratio * 100, 15)}%`,
                      backgroundColor: userColor(seq.user, 0.85),
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
