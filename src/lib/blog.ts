import { type SeedPost, mediumConfig, seedPosts } from '@/config/Medium';
import { BlogFrontmatter, BlogPost, BlogPostPreview } from '@/types/blog';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const blogDirectory = path.join(process.cwd(), 'src/data/blog');

/**
 * Get all blog post files from the blog directory
 */
export function getBlogPostSlugs(): string[] {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const files = fs.readdirSync(blogDirectory);
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

/**
 * Get local MDX blog post by slug
 */
function getLocalBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const frontmatter = data as BlogFrontmatter;
    if (!frontmatter.title || !frontmatter.description) {
      throw new Error(`Invalid frontmatter in ${slug}.mdx`);
    }

    return {
      slug,
      frontmatter: {
        ...frontmatter,
        source: 'local',
      },
      content,
      format: 'mdx',
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Medium RSS                                                          */
/* ------------------------------------------------------------------ */

/** Strip Medium's `?source=rss...` tracking query from article links */
function cleanMediumUrl(url: string): string {
  return url.split('?')[0];
}

/** `https://medium.com/@user/my-title-abc123` → `my-title-abc123` */
function slugFromUrl(url: string): string {
  const segments = cleanMediumUrl(url).split('/').filter(Boolean);
  return segments[segments.length - 1] ?? url;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function cdata(block: string, tag: string): string | null {
  const match = block.match(
    new RegExp(
      `<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`,
    ),
  );
  return match ? match[1].trim() : null;
}

function firstImage(html: string): string | null {
  const matches = html.matchAll(/<img[^>]+src="([^"]+)"/g);
  for (const match of matches) {
    const src = match[1];
    // Skip Medium's view-tracking pixel
    if (src.includes('medium.com/_/stat')) continue;
    return src;
  }
  return null;
}

function firstParagraph(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const text = stripTags(match ? match[1] : html);
  return text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text;
}

function toDateString(pubDate: string): string {
  const date = new Date(pubDate);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);
}

function toPreview(post: SeedPost): BlogPostPreview {
  const url = cleanMediumUrl(post.url);
  return {
    slug: slugFromUrl(url),
    frontmatter: {
      title: post.title,
      description: post.description || post.title,
      image: post.image || mediumConfig.fallbackImage,
      tags: post.tags,
      date: post.date,
      isPublished: true,
      source: 'medium',
      externalUrl: url,
    },
  };
}

/** Parse the RSS 2.0 feed Medium serves for a profile */
export function parseMediumFeed(xml: string): SeedPost[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  return items.flatMap((item) => {
    const title = cdata(item, 'title');
    const link = cdata(item, 'link');
    const pubDate = cdata(item, 'pubDate');
    if (!title || !link || !pubDate) return [];

    const content = cdata(item, 'content:encoded') ?? '';
    const tags = Array.from(
      item.matchAll(/<category>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/category>/g),
    ).map((match) => match[1].trim());

    return [
      {
        title: decodeEntities(title),
        description: firstParagraph(content),
        url: cleanMediumUrl(link),
        date: toDateString(pubDate),
        tags,
        image: firstImage(content) ?? undefined,
      },
    ];
  });
}

/**
 * Fetch published articles from Medium (auto-updates when you publish).
 * Falls back to the seeded snapshot on any failure.
 */
export async function getMediumBlogPreviews(): Promise<BlogPostPreview[]> {
  const seeded = seedPosts.map(toPreview);

  try {
    const response = await fetch(mediumConfig.feedUrl, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
        'User-Agent': 'Mozilla/5.0 (portfolio blog sync)',
      },
      next: { revalidate: mediumConfig.revalidateSeconds },
    });

    if (!response.ok) {
      throw new Error(`Medium feed error: ${response.status}`);
    }

    const live = parseMediumFeed(await response.text()).map(toPreview);
    if (live.length === 0) {
      throw new Error('Medium feed returned no items');
    }

    // Live feed wins on overlap; seeds keep older posts that fall off the feed
    const bySlug = new Map<string, BlogPostPreview>();
    for (const post of seeded) bySlug.set(post.slug, post);
    for (const post of live) bySlug.set(post.slug, post);
    return Array.from(bySlug.values());
  } catch (error) {
    console.error('Failed to fetch Medium feed, using seeded posts:', error);
    return seeded;
  }
}

/* ------------------------------------------------------------------ */
/* Combined                                                            */
/* ------------------------------------------------------------------ */

/**
 * Get blog post by slug with full content. Only local MDX posts have an
 * on-site page; Medium posts link out to medium.com.
 */
export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  return getLocalBlogPostBySlug(slug);
}

/**
 * Local MDX posts only (sync — for build-time helpers)
 */
export function getLocalBlogPosts(): BlogPostPreview[] {
  const slugs = getBlogPostSlugs();

  return slugs
    .map((slug) => {
      const post = getLocalBlogPostBySlug(slug);
      if (!post) return null;

      return {
        slug: post.slug,
        frontmatter: post.frontmatter,
      };
    })
    .filter((post): post is BlogPostPreview => post !== null);
}

/**
 * Merge local MDX + Medium posts. Local wins on slug collisions.
 * Sorted newest first. New Medium publishes appear after revalidation.
 */
export async function getAllBlogPosts(): Promise<BlogPostPreview[]> {
  const [localPosts, mediumPosts] = await Promise.all([
    Promise.resolve(getLocalBlogPosts()),
    getMediumBlogPreviews(),
  ]);

  const bySlug = new Map<string, BlogPostPreview>();

  for (const post of mediumPosts) {
    bySlug.set(post.slug, post);
  }
  // Local overrides Medium if the same slug exists
  for (const post of localPosts) {
    bySlug.set(post.slug, post);
  }

  return Array.from(bySlug.values()).sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );
}

/**
 * Get all published blog posts (local + Medium)
 */
export async function getPublishedBlogPosts(): Promise<BlogPostPreview[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.filter((post) => post.frontmatter.isPublished);
}

/**
 * Get blog posts by tag
 */
export async function getBlogPostsByTag(
  tag: string,
): Promise<BlogPostPreview[]> {
  const publishedPosts = await getPublishedBlogPosts();
  return publishedPosts.filter((post) =>
    post.frontmatter.tags.some(
      (postTag) => postTag.toLowerCase() === tag.toLowerCase(),
    ),
  );
}

/**
 * Get all unique tags from published posts
 */
export async function getAllTags(): Promise<string[]> {
  const publishedPosts = await getPublishedBlogPosts();
  const tagsSet = new Set<string>();

  publishedPosts.forEach((post) => {
    post.frontmatter.tags.forEach((tag) => {
      tagsSet.add(tag.toLowerCase());
    });
  });

  return Array.from(tagsSet).sort();
}

/**
 * Get related posts based on tags (excluding the current post)
 */
export async function getRelatedPosts(
  currentSlug: string,
  maxPosts = 3,
): Promise<BlogPostPreview[]> {
  const currentPost = await getBlogPostBySlug(currentSlug);
  if (!currentPost || !currentPost.frontmatter.isPublished) {
    return [];
  }

  const allPosts = await getPublishedBlogPosts();
  const currentTags = currentPost.frontmatter.tags.map((tag) =>
    tag.toLowerCase(),
  );

  const postsWithScore = allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const sharedTags = post.frontmatter.tags.filter((tag) =>
        currentTags.includes(tag.toLowerCase()),
      );
      return {
        post,
        score: sharedTags.length,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return postsWithScore.slice(0, maxPosts).map((item) => item.post);
}
