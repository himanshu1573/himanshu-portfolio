export type BookStatus = 'reading' | 'finished' | 'queued';

export interface Book {
  title: string;
  author: string;
  status: BookStatus;
  /**
   * ISBN-13 (digits only). The cover is fetched from Open Library:
   * https://covers.openlibrary.org/b/isbn/<isbn>-M.jpg
   */
  isbn?: string;
  /** Local or remote cover image; overrides the ISBN lookup */
  cover?: string;
  /** Where the book lives online (publisher, free PDF, Goodreads…) */
  link?: string;
  /** One or two sentences: why this book, or what it is teaching you */
  note?: string;
  /** Free-form, e.g. '2026-08' */
  startedOn?: string;
  finishedOn?: string;
}

export const bookStatusLabel: Record<BookStatus, string> = {
  reading: 'Currently reading',
  finished: 'Finished',
  queued: 'Up next',
};

/**
 * Bookshelf. Newest activity first within each status.
 *
 * NOTE: these entries are starter picks that match the LLM-inference /
 * systems track. Replace them with what you are actually reading.
 */
export const books: Book[] = [
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    status: 'reading',
    isbn: '9781449373320',
    link: 'https://dataintensive.net/',
    note: 'The mental model for replication, partitioning, and consistency that every inference cluster ends up re-deriving.',
    startedOn: '2026-08',
  },
  {
    title: 'Programming Massively Parallel Processors',
    author: 'Wen-mei W. Hwu, David B. Kirk, Izzat El Hajj',
    status: 'reading',
    isbn: '9780323912310',
    link: 'https://www.elsevier.com/books/programming-massively-parallel-processors/hwu/978-0-323-91231-0',
    note: 'CUDA from first principles: memory hierarchy, occupancy, and why attention kernels look the way they do.',
    startedOn: '2026-09',
  },
  {
    title: 'Build a Large Language Model (From Scratch)',
    author: 'Sebastian Raschka',
    status: 'queued',
    isbn: '9781633437166',
    link: 'https://www.manning.com/books/build-a-large-language-model-from-scratch',
    note: 'To pair with tinyserve: the model side of the same problem.',
  },
  {
    title: 'Kubernetes in Action',
    author: 'Marko Lukša',
    status: 'queued',
    isbn: '9781617293726',
    link: 'https://www.manning.com/books/kubernetes-in-action',
    note: 'Filling in the scheduler and controller internals behind the llm-d and SkyPilot work.',
  },
  {
    title: 'The Linux Programming Interface',
    author: 'Michael Kerrisk',
    status: 'queued',
    isbn: '9781593272203',
    link: 'https://man7.org/tlpi/',
    note: 'Reference for the syscalls under asyncio, sockets, and memory mapping.',
  },
  {
    title: 'Operating Systems: Three Easy Pieces',
    author: 'Remzi and Andrea Arpaci-Dusseau',
    status: 'finished',
    isbn: '9781985086593',
    link: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    note: 'Virtualization, concurrency, persistence. Paging here is the same paging as in PagedAttention.',
    finishedOn: '2026-06',
  },
];
