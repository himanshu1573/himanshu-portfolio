import SectionTitle from '@/components/common/SectionTitle';
import InlineExperienceCard from '@/components/landing/InlineExperienceCard';
import { experiences } from '@/config/Experience';
import { generateMetadata as getMetadata } from '@/config/Meta';
import { Metadata } from 'next';
import { Robots } from 'next/dist/lib/metadata/types/metadata-types';

export const metadata: Metadata = {
  ...getMetadata('/work-experience'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  } as Robots,
};

export default function WorkExperiencePage() {
  return (
    <main>
      <div className="content-column content-column-dashed relative mx-auto">
        <SectionTitle>Experiences</SectionTitle>
        <div className="space-y-2 px-6 pt-4 pb-12">
          <p className="text-sm text-muted-foreground">
            My work experiences across different companies and roles.
          </p>
          <div className="flex w-full flex-col pt-4">
            {experiences.map((experience) => (
              <InlineExperienceCard
                key={experience.company}
                experience={experience}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
