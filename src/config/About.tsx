import Docker from '@/components/technologies/Docker';
import Golang from '@/components/technologies/Golang';
import Kubernetes from '@/components/technologies/Kubernetes';
import LangChain from '@/components/technologies/LangChain';
import PyTorch from '@/components/technologies/PyTorch';
import Python from '@/components/technologies/Python';
import TypeScript from '@/components/technologies/TypeScript';
import VLLM from '@/components/technologies/VLLM';

export const mySkills = [
  <Python key="python" />,
  <Kubernetes key="kubernetes" />,
  <VLLM key="vllm" />,
  <Golang key="go" />,
  <Docker key="docker" />,
  <PyTorch key="pytorch" />,
  <LangChain key="langgraph" />,
  <TypeScript key="typescript" />,
];

export const about = {
  name: 'Himanshu Prajapati',
  description: `I'm an early-career AI infrastructure engineer focused on the LLM inference stack: open-source contributor to llm-d, vLLM (GuideLLM), and SkyPilot. Building tinyserve, a from-scratch serving engine with continuous batching and a paged KV cache, and I deployed Llama 3.1 via vLLM + KServe on Kubernetes.`,
};
