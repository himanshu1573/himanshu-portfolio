'use client';

import { KVBlockGrid } from '@/components/lab/ServingSimulator';
import {
  type SimConfig,
  type SimState,
  createSim,
  stepSim,
  summarize,
} from '@/lib/inference/sim';
import { Link } from 'next-view-transitions';
import React, { useEffect, useRef, useState } from 'react';

import SectionTitle from '../common/SectionTitle';
import ViewAllButton from '../common/ViewAllButton';

const TEASER_CONFIG: SimConfig = {
  seed: 11,
  users: 6,
  maxBatch: 4,
  totalBlocks: 64,
  blockSize: 16,
  promptRange: [16, 64],
  outputRange: [16, 96],
  thinkRange: [1, 5],
};

/** Home-page teaser: a live paged-KV grid from the continuous scheduler */
export default function Lab() {
  const simRef = useRef<SimState>(createSim(TEASER_CONFIG, 'continuous'));
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      stepSim(simRef.current);
      setTick((t) => t + 1);
    }, 140);
    return () => window.clearInterval(id);
  }, []);

  const summary = summarize(simRef.current);

  return (
    <section className="pb-10">
      <SectionTitle>Inference Lab</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="flex flex-col gap-3 px-6 pt-6 md:col-span-2 md:border-r md:border-dashed md:border-[var(--dashed-border)]">
          <p className="text-foreground text-sm leading-relaxed">
            Interactive models of what I work on. Inference: a live
            continuous-batching scheduler with a paged KV cache, and a
            fit-and-speed calculator. Infrastructure: multi-cloud GPU scheduling
            with failover, and KV-cache-aware request routing.
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            The grid on the right is the KV cache of a toy engine right now:
            each colour is a user, each cell a 16-token block, the fill how much
            of it holds real K/V vectors.
          </p>
          <div className="text-muted-foreground mt-1 flex gap-4 font-mono text-xs">
            <span>
              <span className="text-foreground">
                {summary.tokensPerStep.toFixed(2)}
              </span>{' '}
              tok/step
            </span>
            <span>
              <span className="text-foreground">
                {(summary.slotUtilisation * 100).toFixed(0)}%
              </span>{' '}
              slots busy
            </span>
            <span>
              <span className="text-foreground">{summary.blocksInUse}</span>/
              {TEASER_CONFIG.totalBlocks} blocks
            </span>
          </div>
        </div>
        <Link
          href="/lab"
          className="group px-6 pt-6 transition-opacity hover:opacity-90 md:col-span-3"
          aria-label="Open the inference lab"
        >
          <KVBlockGrid state={simRef.current} compact />
        </Link>
      </div>

      <div className="mt-6 flex justify-center px-6">
        <ViewAllButton href="/lab">Open the lab</ViewAllButton>
      </div>
    </section>
  );
}
