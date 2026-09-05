import Code from '@/components/svgs/Code';
import Gear from '@/components/svgs/Gear';
import { BookOpen, ScrollText } from 'lucide-react';
import React from 'react';

export interface AboutMeItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

/** Film reel icon for Movies card */
function FilmIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}

export const aboutMeItems: AboutMeItem[] = [
  {
    title: 'Bookshelf',
    description: 'Books I am reading, queued, and finished.',
    href: '/books',
    icon: <BookOpen className="size-4" />,
  },
  {
    title: 'Research Papers',
    description: 'Papers on LLM inference and serving, with takeaways.',
    href: '/papers',
    icon: <ScrollText className="size-4" />,
  },
  {
    title: 'Gears Used',
    description: 'Productivity tools and gear I use to get work done.',
    href: '/gears',
    icon: <Gear className="size-4" />,
  },
  {
    title: 'VS Code / Cursor Setup',
    description: 'Editor setup I use daily.',
    href: '/setup',
    icon: <Code className="size-4" />,
  },
  {
    title: 'Movies',
    description: 'Films and shows I enjoy when not coding.',
    href: '/movies',
    icon: <FilmIcon className="size-4" />,
  },
];
