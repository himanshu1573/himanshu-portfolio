import { getPublishedBlogPosts } from '@/lib/blog';
import { Link } from 'next-view-transitions';
import React from 'react';

import HoverArrow from '../common/HoverArrow';
import SectionTitle from '../common/SectionTitle';
import ViewAllButton from '../common/ViewAllButton';
import Calender from '../svgs/Calender';

export default async function Blog() {
  const posts = (await getPublishedBlogPosts()).slice(0, 3);

  return (
    <section className="pb-10">
      <SectionTitle>Blogs</SectionTitle>

      <div className="flex flex-col gap-2 px-6 pt-6">
        {posts.map((post) => {
          const { slug, frontmatter } = post;
          const { title, tags, date, externalUrl } = frontmatter;
          const formattedDate = new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          });

          return (
            <Link
              key={slug}
              href={externalUrl ?? `/blog/${slug}`}
              {...(externalUrl
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="group card-flat-interactive flex items-center gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="text-foreground text-sm leading-snug font-semibold">
                  {title}
                </h3>
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Calender className="size-3.5" />
                  {formattedDate}
                </div>
                {tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="bg-muted/50 text-muted-foreground rounded-md border border-[var(--dashed-border)] px-2 py-0.5 text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <HoverArrow />
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center px-6">
        <ViewAllButton href="/blog">View All</ViewAllButton>
      </div>
    </section>
  );
}
