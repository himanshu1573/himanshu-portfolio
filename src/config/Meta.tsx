import { Metadata } from 'next';

import { about } from './About';
import { heroConfig } from './Hero';

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

// Base site configuration
export const siteConfig = {
  name: heroConfig.name,
  title: 'Himanshu Prajapati - Portfolio',
  description: 'AI Infrastructure Engineer Portfolio - Himanshu Prajapati',
  url: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  ogImage: '/meta/opengraph-image.png',
  author: {
    name: about.name,
    twitter: '@himanshu1573',
    github: 'himanshu1573',
    linkedin: 'himanshu-prajapati1573',
    email: 'himanshu.codespace157@gmail.com',
  },
  keywords: [
    'portfolio',
    'ai infrastructure engineer',
    'llm inference',
    'vllm',
    'llm-d',
    'kubernetes',
    'gpu',
    'open source',
    heroConfig.name.toLowerCase(),
  ],
};

export const pageMetadata: Record<string, PageMeta> = {
  // Home page
  '/': {
    title: `${heroConfig.name} - ${heroConfig.title}`,
    description: `${about.description} Explore my projects, experience, and technical expertise.`,
    keywords: [
      'portfolio',
      'ai infrastructure',
      'llm inference',
      'llm serving',
      'projects',
    ],
    ogImage: '/meta/hero.png',
    twitterCard: 'summary_large_image',
  },

  // Contact page
  '/contact': {
    title: 'Contact - Get in Touch',
    description:
      "Get in touch with me for collaborations, projects, or opportunities. I'd love to hear from you!",
    keywords: [
      'contact',
      'hire',
      'collaboration',
      'ai infrastructure',
      'engineer',
    ],
    ogImage: '/assets/logo.png',
    twitterCard: 'summary',
  },

  // Work Experience page
  '/work-experience': {
    title: 'Work Experience - Professional Journey',
    description:
      'Internships and roles across AI infrastructure, data engineering, and full-stack development.',
    keywords: [
      'work experience',
      'career',
      'professional',
      'ai engineer',
      'employment history',
    ],
    ogImage: '/meta/work.png',
    twitterCard: 'summary_large_image',
  },

  // Projects page
  '/projects': {
    title: 'Projects - LLM Serving, Agents & Retrieval',
    description:
      'Systems I have built around LLM inference and serving, agentic workflows, and retrieval: tinyserve, a Kubeflow docs assistant, and a drug-discovery multi-agent pipeline.',
    keywords: [
      'projects',
      'llm serving',
      'continuous batching',
      'paged kv cache',
      'rag',
      'langgraph',
    ],
    ogImage: '/meta/projects.png',
    twitterCard: 'summary_large_image',
  },

  // Resume page
  '/resume': {
    title: 'Resume - Professional CV',
    description: `View and download ${heroConfig.name}'s professional resume and CV. Technical skills, experience, and qualifications.`,
    keywords: [
      'resume',
      'cv',
      'professional',
      'skills',
      'qualifications',
      'download',
    ],
    ogImage: '/meta/resume.png',
    twitterCard: 'summary',
  },

  // Gears page
  '/gears': {
    title: 'Gears Used - Hardware & Tools',
    description:
      'The devices, software, and browser extensions I use daily as an AI infrastructure engineer.',
    keywords: ['gears', 'setup', 'hardware', 'tools', 'macbook', 'workflow'],
    ogImage: '/meta/gears.png',
    twitterCard: 'summary_large_image',
  },

  // Editor setup page
  '/setup': {
    title: 'VS Code / Cursor Setup',
    description:
      'My VS Code and Cursor editor setup — fonts, extensions, and settings.json for productive AI development.',
    keywords: [
      'vscode',
      'cursor',
      'editor setup',
      'extensions',
      'settings',
      'developer tools',
    ],
    ogImage: '/meta/setup.png',
    twitterCard: 'summary_large_image',
  },

  // Inference lab
  '/lab': {
    title: 'Inference Lab - Continuous Batching & KV Cache, Live',
    description:
      'Interactive LLM serving models: a live continuous-batching vs static-batching simulator with a paged KV cache, and a calculator for whether a model fits on a GPU and how fast it decodes.',
    keywords: [
      'continuous batching',
      'pagedattention',
      'kv cache calculator',
      'llm inference',
      'vllm',
      'gpu memory',
    ],
    ogImage: '/meta/projects.png',
    twitterCard: 'summary_large_image',
  },

  // Books page
  '/books': {
    title: 'Bookshelf - What I Am Reading',
    description:
      'Books I am reading, queued, and finished: systems, GPUs, and the machinery behind LLM serving.',
    keywords: ['books', 'reading', 'systems', 'gpu', 'llm serving'],
    ogImage: '/meta/blogs.png',
    twitterCard: 'summary_large_image',
  },

  // Papers page
  '/papers': {
    title: 'Research Papers - LLM Inference Reading List',
    description:
      'A running collection of research papers on LLM inference and serving, with one-line takeaways.',
    keywords: [
      'research papers',
      'llm inference',
      'pagedattention',
      'continuous batching',
      'reading list',
    ],
    ogImage: '/meta/blogs.png',
    twitterCard: 'summary_large_image',
  },

  // Movies page
  '/movies': {
    title: 'Movies & Shows I Love',
    description:
      'Films and series that shape how I think — Dark, Interstellar, Inception, Mission Impossible, and more.',
    keywords: [
      'movies',
      'shows',
      'dark',
      'interstellar',
      'inception',
      'mission impossible',
    ],
    ogImage: '/meta/blogs.png',
    twitterCard: 'summary_large_image',
  },
};

// Helper function to get metadata for a specific page
export function getPageMetadata(pathname: string): PageMeta {
  return pageMetadata[pathname] || pageMetadata['/'];
}

// Helper function to generate complete metadata object for Next.js
export function generateMetadata(pathname: string): Metadata {
  const pageMeta = getPageMetadata(pathname);

  return {
    metadataBase: new URL(siteConfig.url),
    title: pageMeta.title,
    description: pageMeta.description,
    keywords: pageMeta.keywords?.join(', '),
    authors: [{ name: siteConfig.author.name }],
    creator: siteConfig.author.name,
    openGraph: {
      type: 'website',
      url: `${siteConfig.url}${pathname}`,
      title: pageMeta.title,
      description: pageMeta.description,
      siteName: siteConfig.title,
      images: [
        {
          url: pageMeta.ogImage || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: pageMeta.title,
        },
      ],
    },
    twitter: {
      card: pageMeta.twitterCard || 'summary_large_image',
      title: pageMeta.title,
      description: pageMeta.description,
      creator: siteConfig.author.twitter,
      images: [pageMeta.ogImage || siteConfig.ogImage],
    },
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
    },
    alternates: {
      canonical: `${siteConfig.url}${pathname}`,
    },
  };
}
