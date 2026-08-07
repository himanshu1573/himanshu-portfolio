import { cn } from '@/lib/utils';
import React from 'react';

import DashedHorizontalRule from './DashedHorizontalRule';

interface SectionTitleProps {
  children: string;
  className?: string;
}

/**
 * Bold period-ending section heading sandwiched between two
 * full-viewport dashed horizontal rules (rudrakumar.in pattern).
 */
export default function SectionTitle({
  children,
  className,
}: SectionTitleProps) {
  const title = children.endsWith('.') ? children : `${children}.`;

  return (
    <div className={cn('w-full', className)}>
      <DashedHorizontalRule />
      <h2 className="section-heading px-6 py-4">{title}</h2>
      <DashedHorizontalRule />
    </div>
  );
}
