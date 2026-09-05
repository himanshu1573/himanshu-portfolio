import {
  type Book,
  type BookStatus,
  bookStatusLabel,
  books,
} from '@/config/Books';
import React from 'react';

import DashedHorizontalRule from '../common/DashedHorizontalRule';
import BookCover from './BookCover';
import StatusPill from './StatusPill';

const STATUS_ORDER: BookStatus[] = ['reading', 'queued', 'finished'];

const STATUS_TONE: Record<BookStatus, 'active' | 'done' | 'queued'> = {
  reading: 'active',
  finished: 'done',
  queued: 'queued',
};

function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
}

function BookCard({ book }: { book: Book }) {
  const meta = [
    book.startedOn && `Started ${book.startedOn}`,
    book.finishedOn && `Finished ${book.finishedOn}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const body = (
    <>
      <BookCover book={book} className="w-20 sm:w-24" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground text-sm leading-snug font-semibold">
            {book.title}
          </h3>
          <StatusPill
            label={bookStatusLabel[book.status]}
            tone={STATUS_TONE[book.status]}
          />
        </div>
        <p className="text-muted-foreground text-xs">{book.author}</p>
        {book.note && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {book.note}
          </p>
        )}
        {meta && <p className="text-muted-foreground/80 text-[10px]">{meta}</p>}
      </div>
    </>
  );

  const classes = 'group flex h-full items-start gap-4 px-5 py-5';

  if (book.link) {
    return (
      <a
        href={book.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`${classes} transition-opacity hover:opacity-80`}
      >
        {body}
      </a>
    );
  }
  return <article className={classes}>{body}</article>;
}

/** Books grouped by status; 2-column grid with dashed dividers */
export default function BooksGrid() {
  const groups = STATUS_ORDER.map((status) => ({
    status,
    items: books.filter((book) => book.status === status),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return (
      <p className="text-muted-foreground px-6 py-10 text-center text-sm">
        Nothing on the shelf yet — add books in src/config/Books.tsx.
      </p>
    );
  }

  return (
    <div className="w-full">
      {groups.map((group, groupIndex) => {
        const rows = chunkPairs(group.items);
        return (
          <React.Fragment key={group.status}>
            {groupIndex > 0 && <DashedHorizontalRule />}
            <div className="flex items-baseline gap-2 px-6 py-3">
              <h2 className="text-foreground text-sm font-semibold">
                {bookStatusLabel[group.status]}
              </h2>
              <span className="text-muted-foreground text-xs">
                {group.items.length}
              </span>
            </div>
            <DashedHorizontalRule />
            {rows.map((row, rowIndex) => (
              <React.Fragment key={row.map((b) => b.title).join('-')}>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {row.map((book, colIndex) => (
                    <div
                      key={book.title}
                      className={
                        colIndex === 0 && row.length > 1
                          ? 'sm:border-r sm:border-dashed sm:border-[var(--dashed-border)]'
                          : undefined
                      }
                    >
                      <BookCard book={book} />
                    </div>
                  ))}
                </div>
                {rowIndex < rows.length - 1 && <DashedHorizontalRule />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}
