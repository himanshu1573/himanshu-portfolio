export interface Achievement {
  title: string;
  organization: string;
  date: string;
  href?: string;
  icon?: 'trophy' | 'medal' | 'star';
}

export const achievements: Achievement[] = [
  {
    title:
      'Competitive Programmer — 1000+ rating on Codeforces, 500+ problems solved',
    organization: 'Codeforces / LeetCode / CSES / SPOJ',
    date: 'Ongoing',
    href: 'https://codeforces.com/profile/hmnshu_',
    icon: 'trophy',
  },
  {
    title:
      'Open Source Contributor — Merged contributions to llm-d, vLLM (GuideLLM), and SkyPilot',
    organization: 'Open Source (2026)',
    date: '2026',
    href: 'https://github.com/himanshu1573',
    icon: 'medal',
  },
  {
    title:
      'Built tinyserve — from-scratch LLM serving engine with continuous batching and paged KV cache',
    organization: 'Personal Project',
    date: 'Ongoing',
    href: '/projects/tinyserve',
    icon: 'star',
  },
];

/** Legacy certificate gallery data (used on certificates page if needed) */
export const certificates = [
  {
    file: '/blog/frontend-part-1.png',
    title: 'SSoC Certificate',
    issuer: 'Summer of Code (SSoC)',
    date: '2025-10-10',
  },
  {
    file: '/blog/how-to-be-me.png',
    title: 'Example Certificate 1',
    issuer: 'Example Issuer',
    date: '2024-01-01',
  },
  {
    file: '/blog/frontend-part-1.png',
    title: 'Example Certificate 2',
    issuer: 'Example Issuer',
    date: '2023-08-01',
  },
  {
    file: '/blog/how-to-be-me.png',
    title: 'SSoC Participation Certificate',
    issuer: 'SSoC',
    date: '2025-10-10',
  },
];

const achievementsConfig = {
  achievements,
  certificates,
};

export default achievementsConfig;
