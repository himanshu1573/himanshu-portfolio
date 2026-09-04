import Bun from '@/components/technologies/Bun';
import JavaScript from '@/components/technologies/JavaScript';
import MongoDB from '@/components/technologies/MongoDB';
import NextJs from '@/components/technologies/NextJs';
import NodeJs from '@/components/technologies/NodeJs';
import Prisma from '@/components/technologies/Prisma';
import ReactIcon from '@/components/technologies/ReactIcon';
import TypeScript from '@/components/technologies/TypeScript';

export const mySkills = [
  <ReactIcon key="react" />,
  <Bun key="bun" />,
  <JavaScript key="javascript" />,
  <TypeScript key="typescript" />,
  <MongoDB key="mongodb" />,
  <NextJs key="nextjs" />,
  <NodeJs key="nodejs" />,
  // <PostgreSQL key="postgresql" />,
  <Prisma key="prisma" />,
];

export const about = {
  name: 'Himanshu Prajapati',
  description: `I'm an early-career AI infrastructure engineer focused on the LLM inference stack: open-source contributor to llm-d, vLLM, and SkyPilot. Building eightserve, a from-scratch serving engine with continuous batching and a paged KV cache.`,
};
