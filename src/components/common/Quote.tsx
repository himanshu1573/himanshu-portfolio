'use client';

import type { QuoteCard } from '@/app/api/quotes/route';
import { cn } from '@/lib/utils';
import { Shuffle } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

/**
 * Photo + quote card. Quotes come from ZenQuotes (50 per batch, cached an
 * hour by /api/quotes); the photo is a Picsum image seeded by the quote so
 * each pairing is stable.
 */
export const Quote = () => {
  const [cards, setCards] = useState<QuoteCard[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [source, setSource] = useState<'zenquotes' | 'fallback'>('zenquotes');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/quotes')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(
        (data: { source: 'zenquotes' | 'fallback'; quotes: QuoteCard[] }) => {
          if (cancelled || !data.quotes?.length) return;
          setCards(data.quotes);
          setSource(data.source);
          setIndex(Math.floor(Math.random() * data.quotes.length));
        },
      )
      .catch((err) => console.error('Failed to load quotes:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  const next = useCallback(() => {
    if (cards.length < 2) return;
    setVisible(false);
    window.setTimeout(() => {
      setIndex(
        (i) =>
          (i + 1 + Math.floor(Math.random() * (cards.length - 1))) %
          cards.length,
      );
      setVisible(true);
    }, 220);
  }, [cards.length]);

  const card = cards[index];
  if (!card) {
    return <div className="h-[22rem] w-full" aria-hidden="true" />;
  }

  return (
    <figure className="relative m-0 w-full overflow-hidden">
      {/* Photo */}
      <div className="relative h-[22rem] w-full sm:h-[24rem]">
        <Image
          key={card.image}
          src={card.image}
          alt=""
          fill
          sizes="(max-width: 896px) 100vw, 56rem"
          className={cn(
            'object-cover grayscale-[35%] transition-opacity duration-500',
            visible ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />
      </div>

      {/* Quote */}
      <figcaption
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center transition-all duration-300',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
        )}
      >
        <span
          aria-hidden="true"
          className="text-5xl leading-none text-white/40 select-none"
        >
          &ldquo;
        </span>
        <p className="max-w-xl text-lg leading-relaxed text-white italic sm:text-xl">
          {card.quote}
        </p>
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-white/40" />
          <p className="text-xs font-medium tracking-widest text-white/85 uppercase">
            {card.author}
          </p>
          <span className="h-px w-8 bg-white/40" />
        </div>
      </figcaption>

      {/* Controls + attribution */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 text-[10px] text-white/50">
        <span>
          {source === 'zenquotes' ? (
            <>
              Quotes by{' '}
              <a
                href="https://zenquotes.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white/80"
              >
                ZenQuotes
              </a>
            </>
          ) : (
            'Quotes: local fallback'
          )}
          {' · Photo by '}
          <a
            href="https://picsum.photos/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/80"
          >
            Picsum
          </a>
        </span>
        <button
          type="button"
          onClick={next}
          className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-black/30 px-2 py-1 text-[10px] text-white/80 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white"
          aria-label="Show another quote"
        >
          <Shuffle className="size-3" />
          another
        </button>
      </div>
    </figure>
  );
};
