/*
 * CUSTOMIZATION EXAMPLE
 *
 * Want to customize this portfolio for yourself? Here's how easy it is:
 *
 * 1. Update your personal info:
 *    name: "Your Name"
 *    title: "Your Professional Title"
 *    avatar: "/path/to/your/image.jpg"
 *
 * 2. Add your skills:
 *    skills: [
 *      { name: "Python", href: "https://python.org", component: "Python" }, // Note: You'd need to create Python component
 *      { name: "React", href: "https://react.dev", component: "ReactIcon" },
 *      { name: "Node.js", href: "https://nodejs.org", component: "NodeJs" },
 *    ]
 *
 * 3. Write your description using the template:
 *    template: "I'm a **passionate developer** who loves building apps with {skills:0} and {skills:1}. I specialize in **web development** and enjoy working with {skills:2}."
 *
 * 4. Update your social links:
 *    Just change the href values to your own social media profiles
 *
 * That's it! Your portfolio will automatically update with your information.
 */
import Github from '@/components/svgs/Github';
import LeetCode from '@/components/svgs/LeetCode';
import LinkedIn from '@/components/svgs/LinkedIn';
import X from '@/components/svgs/X';
import AgenticAI from '@/components/technologies/AgenticAI';
import Bun from '@/components/technologies/Bun';
import Docker from '@/components/technologies/Docker';
import JavaScript from '@/components/technologies/JavaScript';
import LangChain from '@/components/technologies/LangChain';
import MongoDB from '@/components/technologies/MongoDB';
import NextJs from '@/components/technologies/NextJs';
import NodeJs from '@/components/technologies/NodeJs';
import PostgreSQL from '@/components/technologies/PostgreSQL';
import Prisma from '@/components/technologies/Prisma';
import Python from '@/components/technologies/Python';
import ReactIcon from '@/components/technologies/ReactIcon';
// Technology Components
import TypeScript from '@/components/technologies/TypeScript';

// Component mapping for skills
export const skillComponents = {
  TypeScript: TypeScript,
  ReactIcon: ReactIcon,
  NextJs: NextJs,
  Bun: Bun,
  PostgreSQL: PostgreSQL,
  NodeJs: NodeJs,
  MongoDB: MongoDB,
  Prisma: Prisma,
  JavaScript: JavaScript,
  Python: Python,
  Docker: Docker,
  LangChain: LangChain,
  AgenticAI: AgenticAI,
};

export const heroConfig = {
  // Personal Information
  name: 'Himanshu Prajapati',
  title: 'AI Infrastructure Engineer',
  /** Rotating roles under the name */
  titles: [
    'AI Infrastructure Engineer',
    'Backend Engineer',
    'Open Source Contributor',
    'Competitive Programmer',
  ],
  avatar: '/assets/logo.png',

  // Skills Configuration
  skills: [
    {
      name: 'Python',
      href: 'https://www.python.org/',
      component: 'Python',
    },
    {
      name: 'TypeScript',
      href: 'https://www.typescriptlang.org/',
      component: 'TypeScript',
    },
    {
      name: 'FastAPI',
      href: 'https://fastapi.tiangolo.com/',
      component: 'AgenticAI',
    },
    {
      name: 'Docker',
      href: 'https://www.docker.com/',
      component: 'Docker',
    },
    {
      name: 'LangChain',
      href: 'https://www.langchain.com/',
      component: 'LangChain',
    },
    {
      name: 'Agentic AI',
      href: 'https://www.anthropic.com/',
      component: 'AgenticAI',
    },
    {
      name: 'Kubernetes',
      href: 'https://kubernetes.io/',
      component: 'Docker',
    },
  ],

  // Description Configuration
  description: {
    template:
      'I build <b>AI infrastructure</b> using {skills:0}, {skills:1}, {skills:2}, and {skills:3}. Focused on <b>LLM inference</b>, <b>GPU provisioning</b>, and <b>Agentic AI</b> with {skills:5}, crafting intelligent solutions. Passionate about open source and solving real-world problems with {skills:4}.',
  },

  // Buttons Configuration
  buttons: [
    {
      variant: 'default',
      text: 'Check my resume',
      href: '/resume/Himanshu_Prajapati_AI_engineer_resume.pdf',
      icon: 'CV',
    },
    {
      variant: 'outline',
      text: 'View GitHub',
      href: 'https://github.com/himanshu1573',
      icon: 'Calendar',
    },
  ],
};

// Social Links Configuration
export const socialLinks = [
  {
    name: 'Github',
    href: 'https://github.com/himanshu1573',
    icon: <Github />,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/himanshu-prajapati1573/',
    icon: <LinkedIn />,
  },
  {
    name: 'X',
    href: 'https://x.com/himanshu1573',
    icon: <X />,
  },
  {
    name: 'LeetCode',
    href: 'https://leetcode.com/u/himanshu1573/',
    icon: <LeetCode />,
  },
];
