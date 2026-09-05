import { BlogContent } from '@/components/blog/BlogContent';
import Container from '@/components/common/Container';
import { siteConfig } from '@/config/Meta';
import { getBlogPostBySlug, getLocalBlogPosts } from '@/lib/blog';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/** Only local MDX posts have on-site pages; Medium posts link out */
export const dynamicParams = false;

export async function generateStaticParams() {
  return getLocalBlogPosts()
    .filter((post) => post.frontmatter.isPublished)
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const { title, description, image } = post.frontmatter;

  return {
    title: `${title} – ${siteConfig.name}`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || !post.frontmatter.isPublished) {
    notFound();
  }

  return (
    <Container className="py-16">
      <BlogContent
        frontmatter={post.frontmatter}
        content={post.content}
        format={post.format ?? 'mdx'}
      />
    </Container>
  );
}
