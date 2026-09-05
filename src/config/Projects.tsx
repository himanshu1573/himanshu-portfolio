import Docker from '@/components/technologies/Docker';
import FastAPI from '@/components/technologies/FastAPI';
import Kubernetes from '@/components/technologies/Kubernetes';
import LangChain from '@/components/technologies/LangChain';
import NextJs from '@/components/technologies/NextJs';
import Python from '@/components/technologies/Python';
import VLLM from '@/components/technologies/VLLM';
import { Project } from '@/types/project';

/**
 * Project cards + detail pages. `image` can be a local file under
 * /public/project or a GitHub social-preview URL
 * (https://opengraph.githubassets.com/<any>/<owner>/<repo>), which always
 * reflects the repo's current README/stars without keeping a screenshot.
 */
export const projects: Project[] = [
  {
    title: 'tinyserve',
    description:
      'A readable LLM serving engine built from scratch on an 8 GB M1: continuous batching, a hand-written paged KV cache, and an OpenAI-compatible API.',
    image: 'https://opengraph.githubassets.com/1/himanshu1573/tinyserve',
    link: 'https://github.com/himanshu1573/tinyserve',
    technologies: [
      { name: 'Python', icon: <Python key="python" /> },
      { name: 'MLX', icon: <Python key="mlx" /> },
      { name: 'FastAPI', icon: <FastAPI key="fastapi" /> },
      { name: 'asyncio', icon: <Python key="asyncio" /> },
      { name: 'Paged KV Cache', icon: <VLLM key="paged-kv" /> },
    ],
    github: 'https://github.com/himanshu1573/tinyserve',
    live: 'https://github.com/himanshu1573/tinyserve',
    post: 'https://medium.com/@himanshu157/kv-cache-a-necessary-evil-fd4ac177985e',
    details: true,
    projectDetailsPageSlug: '/projects/tinyserve',
    isWorking: false,
    detailContent: {
      overview:
        'A 1.5B model reads roughly a gigabyte of weights to produce one token, so decoding is memory-bandwidth bound. tinyserve exists to answer one question honestly: if that read is the same whether you serve one user or eight, can a laptop serve eight people almost as fast as one? It is a small, readable version of what vLLM, TGI, and llm-d do, built to learn continuous batching and PagedAttention by implementing them and measuring the result.',
      highlightsLabel: 'What is inside:',
      highlights: [
        'OpenAI-compatible /v1/completions and /v1/chat/completions server around Qwen2.5-1.5B-Instruct (4-bit) on MLX',
        'Scheduler doing continuous batching: admit, prefill, batch-decode, preempt, and evict every step',
        'Hand-written block-based KV allocator: 16-token blocks, free list, per-sequence block tables, refcounts, and prefix sharing across users',
        'Paged backend behind the same interface as a padded-batch baseline so the two can be A/B measured',
        'One engine thread owns all MLX calls and streams tokens to per-request asyncio queues over SSE',
        'Frozen benchmark harness recording TTFT, per-user and aggregate tok/s, and peak unified memory for 1 to 8 concurrent users',
      ],
      outcome:
        'Roughly 3.3K lines of Python and no CUDA. The point is not speed but a serving engine small enough to read end to end, with numbers measured on real hardware.',
    },
  },
  {
    title: 'Kubeflow Docs Assistant',
    description:
      'Agentic RAG documentation assistant for Kubeflow: Kubeflow Pipelines ingestion, Milvus retrieval, and Llama 3.1-8B served through KServe + vLLM.',
    image: 'https://opengraph.githubassets.com/1/himanshu1573/docs-agent',
    link: 'https://github.com/himanshu1573/docs-agent',
    technologies: [
      { name: 'Kubeflow Pipelines', icon: <Kubernetes key="kfp" /> },
      { name: 'KServe', icon: <Kubernetes key="kserve" /> },
      { name: 'vLLM', icon: <VLLM key="vllm" /> },
      { name: 'Milvus', icon: <Python key="milvus" /> },
      { name: 'FastAPI', icon: <FastAPI key="fastapi" /> },
      { name: 'Python', icon: <Python key="python" /> },
    ],
    github: 'https://github.com/himanshu1573/docs-agent',
    live: 'https://github.com/himanshu1573/docs-agent',
    post: 'https://medium.com/@himanshu157/why-most-rag-systems-fail-on-code-and-how-ast-based-chunking-fixes-it-e003cea33e02',
    details: true,
    projectDetailsPageSlug: '/projects/kubeflow-docs-assistant',
    isWorking: true,
    detailContent: {
      overview:
        'Kubeflow documentation is spread across many components and repositories, and keyword search returns results without context. This assistant is a four-layer RAG system (router, Kubeflow Pipelines ingestion, Milvus vector store, KServe serving) that answers questions with citations back to the docs. It follows the Kubeflow community proposal for a documentation AI assistant (KEP-867).',
      highlightsLabel: 'Architecture and results:',
      highlights: [
        'Automated ETL with Kubeflow Pipelines that crawls, chunks, and embeds 2,184+ documentation chunks into Milvus',
        'AST-based code parser so code samples are chunked by structure instead of by character count',
        'Llama 3.1-8B deployed through KServe + vLLM on Kubernetes GPU nodes',
        'Tool calling so the model looks up documentation only when it needs to',
        'Streaming answers over WebSocket and FastAPI server-sent events',
        '91% Precision@3 on a 150-question evaluation set',
      ],
      outcome:
        'A Kubernetes-native, reproducible RAG stack where every layer (ingestion, retrieval, serving) is a first-class Kubeflow or KServe workload.',
    },
  },
  {
    title: 'Drug Discovery Agent',
    description:
      'Multi-agent LangGraph system for drug-target prioritisation across DepMap, Open Targets, Pharos, and Europe PMC, with MCP connectors and a 5-layer memory.',
    image: '/project/drug-discovery.png',
    link: 'https://drug-discovery-agent.vercel.app',
    technologies: [
      { name: 'LangGraph', icon: <LangChain key="langgraph" /> },
      { name: 'MCP', icon: <LangChain key="mcp" /> },
      { name: 'FastAPI', icon: <FastAPI key="fastapi" /> },
      { name: 'Python', icon: <Python key="python" /> },
      { name: 'Next.js', icon: <NextJs key="nextjs" /> },
      { name: 'Docker', icon: <Docker key="docker" /> },
    ],
    github: 'https://github.com/himanshu1573/Drug-disovery-multiple-agent',
    live: 'https://drug-discovery-agent.vercel.app',
    details: true,
    projectDetailsPageSlug: '/projects/drug-discovery-agent',
    isWorking: true,
    detailContent: {
      overview:
        'Prioritising a drug target by hand means querying five biomedical databases, reconciling inconsistent gene identifiers, weighting heterogeneous evidence, and writing it all up. This system runs that pipeline end to end: a LangGraph orchestrator coordinates Planning, Synthesis, and Validation agents over MCP connectors to the data sources, and every score point is traceable to a database record.',
      highlightsLabel: 'How it works:',
      highlights: [
        'LangGraph pipeline: planning, parallel collection, normalisation, deterministic scoring, evidence graph, synthesis',
        'MCP data layer querying DepMap, Pharos, Open Targets, and Europe PMC in parallel',
        'Deterministic multi-source druggability scoring with conflict detection and severity tiers',
        'Five-layer memory (episodic, working, semantic, procedural, content) so runs are reproducible and auditable',
        'Optional human-in-the-loop plan and review gates before a dossier is accepted',
        'FastAPI + Next.js research workbench with live SSE progress and follow-up Q&A; 157 tests',
      ],
      outcome:
        'Turns days of manual database work into a structured, traceable dossier in a few minutes per gene.',
    },
  },
];
