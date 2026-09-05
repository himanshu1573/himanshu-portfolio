import { books } from '@/config/Books';
import { papers } from '@/config/Papers';
import { Link } from 'next-view-transitions';
import React from 'react';

import DashedHorizontalRule from '../common/DashedHorizontalRule';
import HoverArrow from '../common/HoverArrow';
import SectionTitle from '../common/SectionTitle';
import ViewAllButton from '../common/ViewAllButton';
import BookCover from '../reading/BookCover';

const MAX_ITEMS = 3;

/** Home-page "Reading" section: what is in progress right now */
export default function Reading() {
  const currentBooks = books
    .filter((book) => book.status === 'reading')
    .slice(0, MAX_ITEMS);
  const currentPapers = papers
    .filter((paper) => paper.status === 'reading')
    .slice(0, MAX_ITEMS);

  return (
    <section className="pb-10">
      <SectionTitle>Reading</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Books */}
        <div className="flex flex-col gap-2 px-6 pt-6 md:border-r md:border-dashed md:border-[var(--dashed-border)]">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Books
          </p>
          {currentBooks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nothing in progress right now.
            </p>
          ) : (
            currentBooks.map((book) => (
              <Link
                key={book.title}
                href="/books"
                className="group card-flat-interactive flex items-center gap-3 px-4 py-3"
              >
                <BookCover book={book} className="w-10" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-foreground line-clamp-1 text-sm font-semibold">
                    {book.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-1 text-xs">
                    {book.author}
                  </p>
                </div>
                <HoverArrow />
              </Link>
            ))
          )}
        </div>

        {/* Papers */}
        <div className="flex flex-col gap-2 px-6 pt-6">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Papers
          </p>
          {currentPapers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nothing in progress right now.
            </p>
          ) : (
            currentPapers.map((paper) => (
              <a
                key={paper.link}
                href={paper.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group card-flat-interactive flex items-center gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-foreground line-clamp-2 text-sm leading-snug font-semibold">
                    {paper.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-1 text-xs">
                    {paper.authors} · {paper.venue ?? 'arXiv'} · {paper.year}
                  </p>
                </div>
                <HoverArrow />
              </a>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3 px-6">
        <ViewAllButton href="/books">Bookshelf</ViewAllButton>
        <ViewAllButton href="/papers">Papers</ViewAllButton>
      </div>
      <div className="pt-6">
        <DashedHorizontalRule />
      </div>
    </section>
  );
}
