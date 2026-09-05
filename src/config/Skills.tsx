import AWS from '@/components/technologies/AWS';
import Bash from '@/components/technologies/Bash';
import Cpp from '@/components/technologies/Cpp';
import Docker from '@/components/technologies/Docker';
import FastAPI from '@/components/technologies/FastAPI';
import GCloud from '@/components/technologies/GCloud';
import Git from '@/components/technologies/Git';
import Github from '@/components/technologies/Github';
import Golang from '@/components/technologies/Golang';
import HuggingFace from '@/components/technologies/HuggingFace';
import Kubernetes from '@/components/technologies/Kubernetes';
import LangChain from '@/components/technologies/LangChain';
import Linux from '@/components/technologies/Linux';
import LlmD from '@/components/technologies/LlmD';
import NodeJs from '@/components/technologies/NodeJs';
import PostgreSQL from '@/components/technologies/PostgreSQL';
import PyTorch from '@/components/technologies/PyTorch';
import Python from '@/components/technologies/Python';
import SQL from '@/components/technologies/SQL';
import SkyPilot from '@/components/technologies/SkyPilot';
import TypeScript from '@/components/technologies/TypeScript';
import VLLM from '@/components/technologies/VLLM';
import type { ReactNode } from 'react';

export interface SkillItem {
  name: string;
  href: string;
  icon: ReactNode;
}

/**
 * Ordered roughly as: languages → inference & serving → infra & cloud →
 * agents & ML → backend. Mirrors the resume's skills section.
 */
export const skills: SkillItem[] = [
  // Languages
  { name: 'Python', href: 'https://www.python.org/', icon: <Python /> },
  { name: 'Go', href: 'https://go.dev/', icon: <Golang /> },
  { name: 'C++', href: 'https://isocpp.org/', icon: <Cpp /> },
  {
    name: 'TypeScript',
    href: 'https://www.typescriptlang.org/',
    icon: <TypeScript />,
  },
  { name: 'SQL', href: 'https://www.postgresql.org/docs/', icon: <SQL /> },
  { name: 'Bash', href: 'https://www.gnu.org/software/bash/', icon: <Bash /> },

  // LLM inference & serving
  {
    name: 'vLLM',
    href: 'https://github.com/vllm-project/vllm',
    icon: <VLLM />,
  },
  { name: 'llm-d', href: 'https://llm-d.ai/', icon: <LlmD /> },
  { name: 'PyTorch', href: 'https://pytorch.org/', icon: <PyTorch /> },
  {
    name: 'Hugging Face',
    href: 'https://huggingface.co/',
    icon: <HuggingFace />,
  },

  // Infrastructure & cloud
  { name: 'Kubernetes', href: 'https://kubernetes.io/', icon: <Kubernetes /> },
  { name: 'Docker', href: 'https://www.docker.com/', icon: <Docker /> },
  { name: 'SkyPilot', href: 'https://skypilot.co/', icon: <SkyPilot /> },
  { name: 'AWS', href: 'https://aws.amazon.com/', icon: <AWS /> },
  { name: 'GCP', href: 'https://cloud.google.com/', icon: <GCloud /> },
  { name: 'Linux', href: 'https://www.kernel.org/', icon: <Linux /> },
  { name: 'Git', href: 'https://git-scm.com/', icon: <Git /> },
  { name: 'GitHub', href: 'https://github.com/', icon: <Github /> },

  // Agents
  {
    name: 'LangGraph',
    href: 'https://www.langchain.com/langgraph',
    icon: <LangChain />,
  },
  {
    name: 'LangChain',
    href: 'https://www.langchain.com/',
    icon: <LangChain />,
  },

  // Backend
  { name: 'FastAPI', href: 'https://fastapi.tiangolo.com/', icon: <FastAPI /> },
  { name: 'Node.js', href: 'https://nodejs.org/', icon: <NodeJs /> },
  {
    name: 'PostgreSQL',
    href: 'https://www.postgresql.org/',
    icon: <PostgreSQL />,
  },
];
