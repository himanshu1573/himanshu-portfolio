'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';

// ── Types ────────────────────────────────────────────────────────────────────

type PRState = 'open' | 'closed';

interface PullRequest {
  id: number;
  title: string;
  html_url: string;
  state: PRState;
  merged_at: string | null;
  created_at: string;
  number: number;
  repository: string; // e.g. "owner/repo"
}

// ── Icons ─────────────────────────────────────────────────────────────────────

/** Merged PR – purple merge icon (GitHub style) */
function MergedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      className="shrink-0"
      aria-label="Merged"
    >
      <path
        fill="#8957e5"
        d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z"
      />
    </svg>
  );
}

/** Open PR – green icon */
function OpenPRIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      className="shrink-0"
      aria-label="Open"
    >
      <path
        fill="#3fb950"
        d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"
      />
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPRStatus(pr: PullRequest): 'merged' | 'open' {
  if (pr.merged_at) return 'merged';
  return 'open';
}

function StatusBadge({ status }: { status: 'merged' | 'open' }) {
  if (status === 'merged') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400 ring-1 ring-purple-500/20">
        <MergedIcon />
        Merged
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400 ring-1 ring-green-500/20">
      <OpenPRIcon />
      Open
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PRSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border-border flex items-center gap-3 rounded-xl border p-4"
        >
          <div className="bg-muted h-4 w-4 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-3.5 w-3/4 rounded" />
            <div className="bg-muted h-3 w-1/3 rounded" />
          </div>
          <div className="bg-muted h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GITHUB_USERNAME = 'Saurabhsing21';
const DEFAULT_VISIBLE = 10;

const SKIP_TITLES = new Set([
  'testing frontend',
  'testing backend',
  'fixed',
  'dashboard',
  'addded backend',
  'created pull request for saurabhsingh branch',
]);

// ── Main Component ────────────────────────────────────────────────────────────

export default function OpenSourceContributions() {
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchPRs() {
      try {
        setIsLoading(true);

        // Only fetch merged or open PRs in external repos
        const query = `author:${GITHUB_USERNAME}+type:pr+is:merged+-user:${GITHUB_USERNAME}`;
        const openQuery = `author:${GITHUB_USERNAME}+type:pr+is:open+-user:${GITHUB_USERNAME}`;

        const [mergedRes, openRes] = await Promise.all([
          fetch(
            `https://api.github.com/search/issues?q=${query}&per_page=30&sort=updated`,
            { headers: { Accept: 'application/vnd.github+json' } },
          ),
          fetch(
            `https://api.github.com/search/issues?q=${openQuery}&per_page=10&sort=updated`,
            { headers: { Accept: 'application/vnd.github+json' } },
          ),
        ]);

        if (!mergedRes.ok || !openRes.ok) throw new Error('GitHub API error');

        const [mergedData, openData] = await Promise.all([
          mergedRes.json(),
          openRes.json(),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapItem = (item: any): PullRequest => ({
          id: item.id,
          title: item.title,
          html_url: item.html_url,
          state: item.state as PRState,
          merged_at: item.pull_request?.merged_at ?? null,
          created_at: item.created_at,
          number: item.number,
          repository: item.repository_url.replace(
            'https://api.github.com/repos/',
            '',
          ),
        });

        const allItems: PullRequest[] = [
          ...(openData.items ?? []).map(mapItem),
          ...(mergedData.items ?? []).map(mapItem),
        ].filter((pr) => !SKIP_TITLES.has(pr.title.toLowerCase().trim()));

        setPrs(allItems);
      } catch (err) {
        console.error('Failed to fetch OSS PRs:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPRs();
  }, []);

  const visiblePRs = prs.slice(0, DEFAULT_VISIBLE);

  return (
    <Container className="mt-20">
      <SectionHeading subHeading="Open Source" heading="Contributions" />

      <div className="mt-8">
        {isLoading ? (
          <PRSkeleton />
        ) : hasError ? (
          <div className="text-muted-foreground border-border rounded-xl border-2 border-dashed p-8 text-center">
            <p className="font-medium">Unable to load contributions</p>
            <p className="mt-1 text-sm">
              Check out my{' '}
              <Link
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                GitHub profile
              </Link>{' '}
              directly.
            </p>
          </div>
        ) : prs.length === 0 ? (
          <div className="text-muted-foreground border-border rounded-xl border-2 border-dashed p-8 text-center">
            <p className="text-sm">No public contributions found.</p>
          </div>
        ) : (
          <div className="border-border bg-background/50 rounded-2xl border p-4 backdrop-blur-sm dark:border-white/10">
            <ul className="space-y-2">
              {visiblePRs.map((pr) => {
                const status = getPRStatus(pr);

                return (
                  <li key={pr.id}>
                    <Link
                      href={pr.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group border-border hover:bg-muted/50 flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-150"
                    >
                      {/* Status icon */}
                      <div className="shrink-0">
                        {status === 'merged' ? <MergedIcon /> : <OpenPRIcon />}
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground group-hover:text-primary truncate text-sm font-medium transition-colors">
                          {pr.title}
                        </p>
                        <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                          <span className="font-mono">{pr.repository}</span>
                          <span>·</span>
                          <span>#{pr.number}</span>
                        </p>
                      </div>

                      {/* Badge */}
                      <div className="shrink-0">
                        <StatusBadge status={status} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Footer — single GitHub link */}
            <div className="mt-3 border-t border-dashed border-black/10 pt-3 text-center dark:border-white/10">
              <Link
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                See all contributions on GitHub →
              </Link>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
