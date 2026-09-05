export type BlogSource = 'local' | 'medium';

export interface BlogFrontmatter {
  title: string;
  description: string;
  image: string;
  tags: string[];
  date: string;
  isPublished: boolean;
  /** Origin of the post — local MDX or synced from Medium */
  source?: BlogSource;
  /** Set for Medium posts: the card links here instead of /blog/[slug] */
  externalUrl?: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
  /** mdx for local files, markdown for remote bodies */
  format?: 'mdx' | 'markdown';
}

export interface BlogPostPreview {
  slug: string;
  frontmatter: BlogFrontmatter;
}
