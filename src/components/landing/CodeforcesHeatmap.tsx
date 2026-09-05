'use client';

import { codeforcesConfig } from '@/config/Codeforces';
import { githubConfig } from '@/config/Github';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import CodeforcesIcon from '../svgs/Codeforces';
import { Button } from '../ui/button';

const ActivityCalendar = dynamic(
  () => import('react-activity-calendar').then((mod) => mod.default),
  { ssr: false },
);

type ActivityItem = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type CodeforcesPayload = {
  handle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  solved: number;
  contests: number;
  total: number;
  contributions: ActivityItem[];
};

/** Codeforces rank → colour, matching the site's handle colours */
function rankColor(rank: string | null): string {
  switch (rank) {
    case 'newbie':
      return '#808080';
    case 'pupil':
      return '#008000';
    case 'specialist':
      return '#03a89e';
    case 'expert':
      return '#0000ff';
    case 'candidate master':
      return '#aa00aa';
    case 'master':
    case 'international master':
      return '#ff8c00';
    default:
      return '#ff0000';
  }
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-foreground text-sm font-semibold">{value}</span>
      <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}

export default function CodeforcesHeatmap() {
  const [data, setData] = useState<CodeforcesPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setHasError(false);

        const response = await fetch('/api/codeforces', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load Codeforces data: ${response.status}`);
        }

        const payload: CodeforcesPayload = await response.json();
        if (!payload.contributions?.length) {
          throw new Error('Empty Codeforces payload');
        }
        setData(payload);
      } catch (err) {
        console.error('Failed to fetch Codeforces activity:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (hasError || !data) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed border-gray-200 p-6 text-center dark:border-gray-800">
        <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
          <CodeforcesIcon className="h-6 w-6" />
        </div>
        <p className="mb-1 text-sm font-medium">
          {codeforcesConfig.errorState.title}
        </p>
        <p className="mb-3 text-xs">
          {codeforcesConfig.errorState.description}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link
            href={codeforcesConfig.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <CodeforcesIcon className="h-3 w-3" />
            {codeforcesConfig.errorState.buttonText}
          </Link>
        </Button>
      </div>
    );
  }

  const palette =
    theme === 'dark'
      ? codeforcesConfig.theme.dark
      : codeforcesConfig.theme.light;

  return (
    <div className="space-y-3">
      {/* Header: handle + stats */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Link
          href={codeforcesConfig.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <CodeforcesIcon className="size-4" />
          <span
            className="text-sm font-semibold"
            style={{ color: rankColor(data.rank) }}
          >
            {data.handle}
          </span>
          {data.rank && (
            <span className="text-muted-foreground text-xs capitalize">
              · {data.rank}
            </span>
          )}
        </Link>
        <div className="flex gap-6">
          <Stat label="Rating" value={data.rating ?? '—'} />
          <Stat label="Max" value={data.maxRating ?? '—'} />
          <Stat label="Solved" value={data.solved} />
          <Stat label="Contests" value={data.contests} />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <ActivityCalendar
          data={data.contributions}
          blockSize={10}
          blockMargin={3}
          fontSize={githubConfig.fontSize}
          colorScheme={theme === 'dark' ? 'dark' : 'light'}
          maxLevel={4}
          hideTotalCount={true}
          hideColorLegend={true}
          hideMonthLabels={false}
          theme={codeforcesConfig.theme}
          labels={{
            months: githubConfig.months,
            weekdays: githubConfig.weekdays,
            totalCount: '{{count}} accepted submissions in the last year',
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          <span className="text-foreground font-semibold">
            {data.total.toLocaleString()}
          </span>{' '}
          accepted submissions in the last 11 months
        </p>
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
  );
}
