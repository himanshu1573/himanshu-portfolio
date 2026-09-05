import PageBackTitle from '@/components/common/PageBackTitle';
import PapersList from '@/components/reading/PapersList';
import { generateMetadata as getMetadata } from '@/config/Meta';
import { Metadata } from 'next';

export const metadata: Metadata = {
  ...getMetadata('/papers'),
};

export default function PapersPage() {
  return (
    <main>
      <div className="content-column content-column-dashed relative mx-auto">
        <PageBackTitle href="/#about-me">Research Papers</PageBackTitle>
        <p className="text-muted-foreground px-6 py-4 text-sm">
          A running collection of papers on LLM inference and serving, with a
          one-line takeaway once I have read them.
        </p>
        <PapersList />
      </div>
    </main>
  );
}
