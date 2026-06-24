import { getPublishedBlogPosts } from '@/lib/blog';
import { Link } from 'next-view-transitions';
import Image from 'next/image';
import React from 'react';

import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import ArrowRight from '../svgs/ArrowRight';
import Calender from '../svgs/Calender';

export default function Blog() {
  const posts = getPublishedBlogPosts().slice(0, 3);

  return (
    <Container className="mt-20">
      <div className="flex items-end justify-between">
        <SectionHeading subHeading="Featured" heading="Blogs" />
        <Link
          href="/blog"
          className="text-secondary hover:text-foreground mb-1 flex items-center gap-1 text-sm transition-colors"
        >
          All posts <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Blog grid — 1 large featured + 2 stacked on desktop */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        {/* Featured (large) — first post */}
        {posts[0] && <FeaturedCard post={posts[0]} />}

        {/* Side cards — remaining posts */}
        <div className="flex flex-col gap-4 md:col-span-2">
          {posts.slice(1).map((post) => (
            <SideCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </Container>
  );
}

// ── Featured large card ───────────────────────────────────────────────────────

function FeaturedCard({
  post,
}: {
  post: ReturnType<typeof getPublishedBlogPosts>[0];
}) {
  const { slug, frontmatter } = post;
  const { title, description, image, tags, date } = frontmatter;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={`/blog/${slug}`}
      className="group border-border hover:border-primary/30 bg-background/50 relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 md:col-span-3"
    >
      {/* Cover image */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Tags on image */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-lg leading-snug font-semibold transition-colors">
          {title}
        </h3>
        <p className="text-secondary line-clamp-2 text-sm">{description}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <time className="text-secondary flex items-center gap-1.5 text-xs">
            <Calender className="size-3.5" />
            {formattedDate}
          </time>
          <span className="text-primary flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">
            Read more <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Compact side card ─────────────────────────────────────────────────────────

function SideCard({
  post,
}: {
  post: ReturnType<typeof getPublishedBlogPosts>[0];
}) {
  const { slug, frontmatter } = post;
  const { title, description, image, tags, date } = frontmatter;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={`/blog/${slug}`}
      className="group border-border hover:border-primary/30 bg-background/50 flex gap-4 overflow-hidden rounded-2xl border p-3 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-col justify-between py-0.5">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-sm leading-snug font-semibold transition-colors">
            {title}
          </h3>
          <p className="text-secondary line-clamp-1 text-xs">{description}</p>
        </div>

        <time className="text-secondary flex items-center gap-1 text-xs">
          <Calender className="size-3" />
          {formattedDate}
        </time>
      </div>
    </Link>
  );
}
