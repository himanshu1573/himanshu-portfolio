import {
  type Paper,
  type PaperStatus,
  paperStatusLabel,
  papers,
} from '@/config/Papers';
import React from 'react';

import DashedHorizontalRule from '../common/DashedHorizontalRule';
import HoverArrow from '../common/HoverArrow';
import StatusPill from './StatusPill';

const STATUS_ORDER: PaperStatus[] = ['reading', 'queued', 'read'];

const STATUS_TONE: Record<PaperStatus, 'active' | 'done' | 'queued'> = {
  reading: 'active',
  read: 'done',
  queued: 'queued',
};

export function PaperRow({ paper }: { paper: Paper }) {
  const meta = [paper.authors, paper.venue ?? 'arXiv', paper.year].join(' · ');

  return (
    <a
      href={paper.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group card-flat-interactive flex items-start gap-3 px-4 py-3"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground text-sm leading-snug font-semibold">
            {paper.title}
          </h3>
          <StatusPill
            label={paperStatusLabel[paper.status]}
            tone={STATUS_TONE[paper.status]}
          />
        </div>
        <p className="text-muted-foreground text-xs">{meta}</p>
        {paper.takeaway && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {paper.takeaway}
          </p>
        )}
        {paper.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {paper.tags.map((tag) => (
              <span
                key={tag}
                className="bg-muted/50 text-muted-foreground rounded-md border border-[var(--dashed-border)] px-2 py-0.5 text-[10px]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <HoverArrow />
    </a>
  );
}

/** Papers grouped by status */
export default function PapersList() {
  const groups = STATUS_ORDER.map((status) => ({
    status,
    items: [...papers]
      .filter((paper) => paper.status === status)
      .sort((a, b) => b.year - a.year),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return (
      <p className="text-muted-foreground px-6 py-10 text-center text-sm">
        No papers yet — add them in src/config/Papers.tsx.
      </p>
    );
  }

  return (
    <div className="w-full">
      {groups.map((group, groupIndex) => (
        <React.Fragment key={group.status}>
          {groupIndex > 0 && <DashedHorizontalRule />}
          <div className="flex items-baseline gap-2 px-6 py-3">
            <h2 className="text-foreground text-sm font-semibold">
              {paperStatusLabel[group.status]}
            </h2>
            <span className="text-muted-foreground text-xs">
              {group.items.length}
            </span>
          </div>
          <DashedHorizontalRule />
          <div className="flex flex-col gap-2 px-6 py-4">
            {group.items.map((paper) => (
              <PaperRow key={paper.link} paper={paper} />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
