import { cn } from '@/lib/utils';
import React from 'react';

type Tone = 'active' | 'done' | 'queued';

interface StatusPillProps {
  label: string;
  tone: Tone;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  active:
    'border-[#1a7f37]/40 bg-[#1a7f37]/10 text-[#1a7f37] dark:border-[#3fb950]/40 dark:bg-[#3fb950]/15 dark:text-[#3fb950]',
  done: 'border-[#8250df]/40 bg-[#8250df]/10 text-[#8250df] dark:border-[#a371f7]/40 dark:bg-[#a371f7]/15 dark:text-[#a371f7]',
  queued: 'border-muted-foreground/40 bg-transparent text-muted-foreground',
};

/** Small rounded status badge shared by books and papers */
export default function StatusPill({
  label,
  tone,
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {tone === 'active' && (
        <span className="relative mr-1.5 flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {label}
    </span>
  );
}
