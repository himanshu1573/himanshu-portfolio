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
import Docker from '@/components/technologies/Docker';
import Golang from '@/components/technologies/Golang';
import Kubernetes from '@/components/technologies/Kubernetes';
import LangChain from '@/components/technologies/LangChain';
import PyTorch from '@/components/technologies/PyTorch';
import Python from '@/components/technologies/Python';
import TypeScript from '@/components/technologies/TypeScript';
import VLLM from '@/components/technologies/VLLM';

// Component mapping for skills
export const skillComponents = {
  Python: Python,
  Kubernetes: Kubernetes,
  VLLM: VLLM,
  Golang: Golang,
  Docker: Docker,
  LangChain: LangChain,
  PyTorch: PyTorch,
  TypeScript: TypeScript,
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
      name: 'Kubernetes',
      href: 'https://kubernetes.io/',
      component: 'Kubernetes',
    },
    {
      name: 'vLLM',
      href: 'https://github.com/vllm-project/vllm',
      component: 'VLLM',
    },
    {
      name: 'Go',
      href: 'https://go.dev/',
      component: 'Golang',
    },
    {
      name: 'Docker',
      href: 'https://www.docker.com/',
      component: 'Docker',
    },
    {
      name: 'LangGraph',
      href: 'https://www.langchain.com/langgraph',
      component: 'LangChain',
    },
    {
      name: 'PyTorch',
      href: 'https://pytorch.org/',
      component: 'PyTorch',
    },
  ],

  // Description Configuration
  description: {
    template:
      'I work on <b>AI infrastructure</b> for the <b>LLM inference stack</b> using {skills:0}, {skills:3}, {skills:1}, and {skills:2}. I contribute to <b>llm-d</b>, <b>vLLM (GuideLLM)</b>, and <b>SkyPilot</b>, and I am building <b>tinyserve</b>, a from-scratch serving engine with <b>continuous batching</b> and a <b>paged KV cache</b>. On the side: agentic systems with {skills:5}, {skills:6}, and competitive programming.',
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
