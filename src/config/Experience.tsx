import AWS from '@/components/technologies/AWS';
import Docker from '@/components/technologies/Docker';
import FastAPI from '@/components/technologies/FastAPI';
import GCloud from '@/components/technologies/GCloud';
import LangChain from '@/components/technologies/LangChain';
import NextJs from '@/components/technologies/NextJs';
import NodeJs from '@/components/technologies/NodeJs';
import PostgreSQL from '@/components/technologies/PostgreSQL';
import Python from '@/components/technologies/Python';
import ReactIcon from '@/components/technologies/ReactIcon';
import TypeScript from '@/components/technologies/TypeScript';

export interface Technology {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export type EmploymentType = 'Full Time' | 'Internship' | 'Freelance' | 'Contract';

export interface Experience {
  company: string;
  position: string;
  location: string;
  image: string;
  description: string[];
  startDate: string;
  endDate: string;
  website: string;
  x?: string;
  linkedin?: string;
  github?: string;
  technologies: Technology[];
  isCurrent: boolean;
  isBlur?: boolean;
  employmentType?: EmploymentType;
}

export const experiences: Experience[] = [
  {
    isCurrent: true,
    isBlur: false,
    employmentType: 'Internship',
    company: 'Xponentium',
    position: 'AI Software Intern',
    location: 'Onsite',
    image: '/company/xponentium.png',
    description: [
      'End-to-End Data Migration: Single-handedly migrated a production ATS from Airtable to PostgreSQL/Supabase, designing a normalized 39-table schema (450+ columns, 38 FKs, ~70K rows) with 55+ versioned SQL migrations.',
      'Incremental Sync Service: Built a Node.js ETL service with real-time cursors and live schema introspection, cutting DB round-trips 88%, verified non-destructive by idempotency tests on 14K rows.',
      'Concurrency & Integrity: Wrote PL/pgSQL RPCs using transaction-scoped advisory locks to eliminate double-booking, and diagnosed an infinite sync loop that cut runs from 20+ minutes to seconds.',
      'Multilingual News Topic Clustering: Clustered 8,900+ Hinglish/Devanagari news titles using LaBSE with UMAP + HDBSCAN, benchmarking 6 architectures to cut noise from 27.7% to 0%.',
    ],
    startDate: 'January 2026',
    endDate: 'July 2026',
    technologies: [
      {
        name: 'Python',
        href: 'https://www.python.org/',
        icon: <Python />,
      },
      {
        name: 'Node.js',
        href: 'https://nodejs.org/',
        icon: <NodeJs />,
      },
      {
        name: 'PostgreSQL',
        href: 'https://www.postgresql.org/',
        icon: <PostgreSQL />,
      },
      {
        name: 'FastAPI',
        href: 'https://fastapi.tiangolo.com/',
        icon: <FastAPI />,
      },
      {
        name: 'GCloud',
        href: 'https://cloud.google.com/',
        icon: <GCloud />,
      },
    ],
    website: 'https://xponentium.com',
    linkedin: 'https://www.linkedin.com/company/xponentium/',
  },
  {
    isCurrent: false,
    isBlur: false,
    employmentType: 'Internship',
    company: 'Bithive Technologies',
    position: 'Software Development Intern',
    location: 'Remote',
    image: '/company/bithive.webp',
    description: [
      'Built the core frontend in Next.js 14/TypeScript (50+ reusable components), integrated payment gateways and REST APIs, and shipped the Resume Builder and Job Management Dashboard modules.',
    ],
    startDate: 'April 2025',
    endDate: 'November 2025',
    technologies: [
      {
        name: 'Next.js',
        href: 'https://nextjs.org/',
        icon: <NextJs />,
      },
      {
        name: 'TypeScript',
        href: 'https://www.typescriptlang.org/',
        icon: <TypeScript />,
      },
      {
        name: 'React',
        href: 'https://react.dev/',
        icon: <ReactIcon />,
      },
      {
        name: 'Node.js',
        href: 'https://nodejs.org/',
        icon: <NodeJs />,
      },
    ],
    website: 'https://www.bithive.in/',
    github: 'https://github.com/BitHiveTechnologies',
    linkedin: 'https://www.linkedin.com/company/bithive-technology/',
  },
  {
    isCurrent: false,
    isBlur: false,
    employmentType: 'Internship',
    company: 'FunctionUp (YC-23)',
    position: 'Software Engineering Intern',
    location: 'Remote',
    image: '/company/functionup.png',
    description: [
      'Built a serverless WhatsApp notification scheduler on AWS Lambda, EventBridge, and S3 (Python/Flask + Appsmith admin), cutting manual coordination time by 40% at 99.9% reliability.',
    ],
    startDate: 'January 2024',
    endDate: 'March 2024',
    technologies: [
      {
        name: 'Python',
        href: 'https://www.python.org/',
        icon: <Python />,
      },
      {
        name: 'AWS',
        href: 'https://aws.amazon.com/',
        icon: <AWS />,
      },
      {
        name: 'Docker',
        href: 'https://www.docker.com/',
        icon: <Docker />,
      },
      {
        name: 'FastAPI',
        href: 'https://fastapi.tiangolo.com/',
        icon: <FastAPI />,
      },
      {
        name: 'LangChain',
        href: 'https://www.langchain.com/',
        icon: <LangChain />,
      },
    ],
    website: 'https://functionup.org/',
    linkedin: 'https://www.linkedin.com/company/functionup/',
  },
];
