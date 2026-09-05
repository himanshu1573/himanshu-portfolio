import PageBackTitle from '@/components/common/PageBackTitle';
import BooksGrid from '@/components/reading/BooksGrid';
import { generateMetadata as getMetadata } from '@/config/Meta';
import { Metadata } from 'next';

export const metadata: Metadata = {
  ...getMetadata('/books'),
};

export default function BooksPage() {
  return (
    <main>
      <div className="content-column content-column-dashed relative mx-auto">
        <PageBackTitle href="/#about-me">Bookshelf</PageBackTitle>
        <p className="text-muted-foreground px-6 py-4 text-sm">
          What I am reading, what is queued, and what I have finished. Mostly
          systems, GPUs, and the machinery behind LLM serving.
        </p>
        <BooksGrid />
      </div>
    </main>
  );
}
