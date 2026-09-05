import { codeforcesConfig } from '@/config/Codeforces';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Refresh hourly

/** Keep the graph to ~11 months so it fits without horizontal scrolling */
const MONTHS_TO_SHOW = 11;

type ActivityDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type CfUser = {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
};

type CfSubmission = {
  creationTimeSeconds: number;
  verdict?: string;
  problem: { contestId?: number; index: string; name: string };
};

type CfRatingChange = { contestId: number; newRating: number };

type CfResponse<T> = { status: 'OK' | 'FAILED'; result?: T; comment?: string };

async function cf<T>(method: string, params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(
    `${codeforcesConfig.apiUrl}/${method}?${query}`,
    {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    },
  );
  if (!response.ok) {
    throw new Error(`Codeforces ${method} error: ${response.status}`);
  }
  const data: CfResponse<T> = await response.json();
  if (data.status !== 'OK' || data.result === undefined) {
    throw new Error(
      `Codeforces ${method} failed: ${data.comment ?? 'unknown'}`,
    );
  }
  return data.result;
}

function toLevel(count: number): ActivityDay['level'] {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

/** YYYY-MM-DD in UTC so the buckets match the server timezone consistently */
function dayKey(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

function getCutoffDate() {
  const cutoff = new Date();
  cutoff.setUTCHours(0, 0, 0, 0);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - MONTHS_TO_SHOW);
  return cutoff;
}

export async function GET() {
  const { handle } = codeforcesConfig;

  try {
    const [users, submissions, ratingChanges] = await Promise.all([
      cf<CfUser[]>('user.info', { handles: handle }),
      cf<CfSubmission[]>('user.status', { handle }),
      cf<CfRatingChange[]>('user.rating', { handle }).catch(() => []),
    ]);

    const user = users[0];
    if (!user) throw new Error('User not found');

    const accepted = submissions.filter((s) => s.verdict === 'OK');

    // Unique problems solved (all time)
    const solved = new Set(
      accepted.map((s) => `${s.problem.contestId ?? 'x'}-${s.problem.index}`),
    ).size;

    // Accepted submissions per day
    const perDay = new Map<string, number>();
    for (const s of accepted) {
      const key = dayKey(s.creationTimeSeconds);
      perDay.set(key, (perDay.get(key) ?? 0) + 1);
    }

    // Fill every day in range so the calendar has a continuous axis
    const cutoff = getCutoffDate();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const contributions: ActivityDay[] = [];
    for (
      const d = new Date(cutoff);
      d <= today;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const key = d.toISOString().slice(0, 10);
      const count = perDay.get(key) ?? 0;
      contributions.push({ date: key, count, level: toLevel(count) });
    }

    const total = contributions.reduce((sum, day) => sum + day.count, 0);

    return NextResponse.json(
      {
        handle: user.handle,
        rating: user.rating ?? null,
        maxRating: user.maxRating ?? null,
        rank: user.rank ?? null,
        maxRank: user.maxRank ?? null,
        solved,
        contests: ratingChanges.length,
        total,
        contributions,
        months: MONTHS_TO_SHOW,
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    console.error('Failed to fetch Codeforces activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Codeforces activity' },
      { status: 502 },
    );
  }
}
