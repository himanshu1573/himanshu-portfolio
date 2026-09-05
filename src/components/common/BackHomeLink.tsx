import ArrowLeft from '@/components/svgs/ArrowLeft';
import { cn } from '@/lib/utils';
import { Link } from 'next-view-transitions';
import React from 'react';

interface BackHomeLinkProps {
  href?: string;
  label?: string;
  className?: string;
}

/** Small "← Home" link for pages that do not use PageBackTitle */
export default function BackHomeLink({
  href = '/',
  label = 'Home',
  className,
}: BackHomeLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
        className,
      )}
    >
      <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </Link>
  );
}
