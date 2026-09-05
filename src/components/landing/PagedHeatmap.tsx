'use client';

import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export type HeatmapDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

interface PagedHeatmapProps {
  days: HeatmapDay[];
  /** 5 colours, level 0 → 4 */
  palette: string[];
  /** What one unit of count is called, e.g. "contribution" */
  unit: string;
  /** Replay duration in ms */
  replayMs?: number;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const LEVEL_FILL = [0, 0.3, 0.55, 0.8, 1];

function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

function shortDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/**
 * A contribution calendar drawn as a paged KV cache: every day is a
 * fixed-size block, every week is a sequence with a 7-entry block table,
 * and each unit of activity is a token stored in the block. Boots with a
 * prefill sweep; hovering a week reveals its block table.
 */
export default function PagedHeatmap({
  days,
  palette,
  unit,
  replayMs = 2600,
}: PagedHeatmapProps) {
  const [revealed, setRevealed] = useState(0);
  const [hoverWeek, setHoverWeek] = useState<number | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [started, setStarted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Lay days out GitHub-style: columns are weeks, rows Sun..Sat
  const { weeks, monthLabels, totals } = useMemo(() => {
    const lead = days.length ? weekdayOf(days[0].date) : 0;
    const cells: (HeatmapDay | null)[] = [
      ...Array.from({ length: lead }, () => null),
      ...days,
    ];
    const weeks: (HeatmapDay | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      const week = cells.slice(i, i + 7);
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    const monthLabels: (string | null)[] = weeks.map((week, w) => {
      const first = week.find((d) => d !== null);
      if (!first) return null;
      const month = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
      const prevWeek = weeks[w - 1]?.find((d) => d !== null);
      const prevMonth = prevWeek
        ? new Date(`${prevWeek.date}T00:00:00Z`).getUTCMonth()
        : -1;
      return month !== prevMonth ? MONTHS[month] : null;
    });
    const tokens = days.reduce((n, d) => n + d.count, 0);
    const nonEmpty = days.filter((d) => d.count > 0).length;
    return {
      weeks,
      monthLabels,
      totals: { tokens, blocks: days.length, nonEmpty },
    };
  }, [days]);

  // Start the prefill sweep once the graph is on screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el || started) return;
    if (!('IntersectionObserver' in window)) {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  // Prefill sweep: reveal blocks in date order
  useEffect(() => {
    if (!started) return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) {
      setRevealed(days.length);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    setRevealed(0);
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / replayMs);
      // Ease-out so the tail slows down like a draining queue
      const eased = 1 - Math.pow(1 - p, 2);
      setRevealed(Math.floor(eased * days.length));
      if (p < 1) raf = window.requestAnimationFrame(tick);
      else setRevealed(days.length);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [started, days.length, replayMs, replayKey]);

  const revealedTokens = useMemo(
    () => days.slice(0, revealed).reduce((n, d) => n + d.count, 0),
    [days, revealed],
  );

  const hovered = hoverWeek === null ? null : weeks[hoverWeek];
  const hoveredDays = hovered?.filter((d): d is HeatmapDay => d !== null) ?? [];
  const hoveredTokens = hoveredDays.reduce((n, d) => n + d.count, 0);
  const hoveredEmpty = hoveredDays.filter((d) => d.count === 0).length;

  const perBlock = totals.blocks ? totals.tokens / totals.blocks : 0;
  const booting = revealed < days.length;

  return (
    <div ref={rootRef} className="space-y-3">
      {/* Grid */}
      <div className="w-full overflow-x-auto">
        <div className="inline-flex min-w-full flex-col gap-1">
          {/* Month labels */}
          <div className="ml-8 flex gap-[3px]">
            {monthLabels.map((label, w) => (
              <div
                key={w}
                className="text-muted-foreground w-[11px] shrink-0 text-[10px] leading-none"
              >
                {label && <span className="absolute">{label}</span>}
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            {/* Weekday labels */}
            <div className="flex w-6 shrink-0 flex-col gap-[3px]">
              {WEEKDAYS.map((d, i) => (
                <div
                  key={i}
                  className="text-muted-foreground h-[11px] text-[9px] leading-[11px]"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks = sequences, days = blocks */}
            <div
              className="flex gap-[3px]"
              onMouseLeave={() => setHoverWeek(null)}
            >
              {weeks.map((week, w) => {
                const active = hoverWeek === w;
                const dimmed = hoverWeek !== null && !active;
                return (
                  <div
                    key={w}
                    className={cn(
                      'flex flex-col gap-[3px] rounded-[3px] transition-opacity duration-150',
                      dimmed && 'opacity-40',
                    )}
                    onMouseEnter={() => setHoverWeek(w)}
                  >
                    {week.map((day, r) => {
                      if (!day) {
                        return <div key={r} className="size-[11px]" />;
                      }
                      const index = days.indexOf(day);
                      const shown = index < revealed;
                      const level = shown ? day.level : 0;
                      const fill = LEVEL_FILL[level];
                      return (
                        <div
                          key={day.date}
                          title={`${shortDate(day.date)}: ${day.count} ${unit}${day.count === 1 ? '' : 's'}`}
                          className={cn(
                            'relative size-[11px] overflow-hidden rounded-[2px] transition-colors duration-200',
                            active && 'ring-foreground/40 ring-1',
                          )}
                          style={{ backgroundColor: palette[0] }}
                        >
                          {fill > 0 && (
                            <div
                              className="absolute inset-x-0 bottom-0"
                              style={{
                                height: `${fill * 100}%`,
                                backgroundColor: palette[level],
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status line */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-muted-foreground font-mono text-[11px]">
          {booting ? (
            <>
              <span className="text-foreground">prefill</span> {revealed}/
              {totals.blocks} blocks ·{' '}
              <span className="text-foreground">
                {revealedTokens.toLocaleString()}
              </span>{' '}
              tokens stored
            </>
          ) : hovered ? (
            <>
              <span className="text-foreground">
                seq week of{' '}
                {shortDate(hoveredDays[0]?.date ?? days[0]?.date ?? '')}
              </span>{' '}
              · {hoveredTokens} tokens in {hoveredDays.length} blocks
              {hoveredEmpty > 0 && ` · ${hoveredEmpty} empty`}
            </>
          ) : (
            <>
              <span className="text-foreground">
                {totals.tokens.toLocaleString()}
              </span>{' '}
              {unit}s = tokens in{' '}
              <span className="text-foreground">{totals.blocks}</span>{' '}
              day-blocks · {perBlock.toFixed(2)} tok/block · {totals.nonEmpty}{' '}
              non-empty
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setReplayKey((k) => k + 1)}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] transition-colors"
            aria-label="Replay prefill"
          >
            <RotateCcw className="size-3" />
            replay
          </button>
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className="inline-block size-2.5 rounded-sm"
                style={{ backgroundColor: palette[level] }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Block table for the hovered week */}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200',
          hovered && !booting
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
        aria-hidden={!hovered}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]">
            {hoveredDays.map((day, i) => (
              <span
                key={day.date}
                className="text-muted-foreground inline-flex items-center gap-1.5 rounded-md border border-dashed border-[var(--dashed-border)] px-2 py-1"
              >
                <span className="text-foreground">L{i}</span>→
                <span
                  className="inline-block size-2 rounded-[2px]"
                  style={{ backgroundColor: palette[day.level] }}
                />
                {shortDate(day.date)} · {day.count} tok
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
