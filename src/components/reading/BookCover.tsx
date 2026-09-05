import { type Book } from '@/config/Books';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

/** Open Library serves covers by ISBN with no API key */
export function getBookCoverUrl(book: Book): string | null {
  if (book.cover) return book.cover;
  if (book.isbn) {
    return `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;
  }
  return null;
}

interface BookCoverProps {
  book: Book;
  className?: string;
}

/** 2:3 cover image, or a generated spine when no cover is available */
export default function BookCover({ book, className }: BookCoverProps) {
  const src = getBookCoverUrl(book);

  return (
    <div
      className={cn(
        'bg-muted relative aspect-[2/3] shrink-0 overflow-hidden rounded-md border border-[var(--dashed-border)]',
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={`${book.title} cover`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 30vw, 8rem"
        />
      ) : (
        <div className="from-foreground/80 to-foreground/60 flex h-full w-full flex-col justify-end bg-gradient-to-br p-2">
          <p className="text-background line-clamp-4 text-[11px] leading-tight font-semibold">
            {book.title}
          </p>
          <p className="text-background/70 mt-1 line-clamp-1 text-[10px]">
            {book.author}
          </p>
        </div>
      )}
    </div>
  );
}
