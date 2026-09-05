import { quotes as fallbackQuotes } from '@/config/Quote';
import { NextResponse } from 'next/server';

/**
 * ZenQuotes returns 50 random quotes per call and rate-limits to 5 calls per
 * 30 s per IP, so we fetch one batch, cache it for an hour, and let the
 * client cycle through it without further API calls.
 * Attribution is required: https://zenquotes.io/
 */
export const revalidate = 3600;

const ZENQUOTES_URL = 'https://zenquotes.io/api/quotes';

type ZenQuote = { q: string; a: string };

export type QuoteCard = {
  quote: string;
  author: string;
  /** Seeded so the same quote always gets the same photo */
  image: string;
};

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

function toCard(quote: string, author: string): QuoteCard {
  return {
    quote,
    author,
    image: `https://picsum.photos/seed/${slug(`${author}-${quote}`)}/1200/600`,
  };
}

export async function GET() {
  try {
    const response = await fetch(ZENQUOTES_URL, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`ZenQuotes error: ${response.status}`);

    const data: ZenQuote[] = await response.json();
    const cards = data
      .filter((q) => q.q && q.a && !/zenquotes\.io/i.test(q.a))
      .map((q) => toCard(q.q.trim(), q.a.trim()));
    if (cards.length === 0) throw new Error('ZenQuotes returned no quotes');

    return NextResponse.json(
      { source: 'zenquotes', quotes: cards },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    console.error('Failed to fetch quotes, using fallback list:', error);
    return NextResponse.json({
      source: 'fallback',
      quotes: fallbackQuotes.map((q) =>
        toCard(q.quote.replace(/\s+/g, ' ').trim(), q.author),
      ),
    });
  }
}
