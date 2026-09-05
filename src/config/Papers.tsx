export type PaperStatus = 'reading' | 'read' | 'queued';

export interface Paper {
  title: string;
  /** Short author list, e.g. 'Kwon et al.' */
  authors: string;
  year: number;
  /** Conference or venue, e.g. 'SOSP 2023' or 'arXiv' */
  venue?: string;
  /** arXiv abstract page, publisher page, or PDF */
  link: string;
  status: PaperStatus;
  tags: string[];
  /** One-line takeaway once read */
  takeaway?: string;
}

export const paperStatusLabel: Record<PaperStatus, string> = {
  reading: 'Reading now',
  read: 'Read',
  queued: 'Reading list',
};

/**
 * Research papers, grouped by status on /papers.
 *
 * NOTE: seeded with the canonical LLM-serving papers behind the blog posts
 * and tinyserve. Adjust statuses and takeaways to match your actual reading.
 */
export const papers: Paper[] = [
  {
    title:
      'Efficient Memory Management for Large Language Model Serving with PagedAttention',
    authors: 'Kwon et al.',
    year: 2023,
    venue: 'SOSP 2023',
    link: 'https://arxiv.org/abs/2309.06180',
    status: 'read',
    tags: ['kv-cache', 'serving', 'vllm'],
    takeaway:
      'Treat the KV cache like virtual memory: fixed-size blocks, block tables, and copy-on-write sharing. This is the design tinyserve re-implements.',
  },
  {
    title:
      'Orca: A Distributed Serving System for Transformer-Based Generative Models',
    authors: 'Yu et al.',
    year: 2022,
    venue: 'OSDI 2022',
    link: 'https://www.usenix.org/conference/osdi22/presentation/yu',
    status: 'read',
    tags: ['continuous-batching', 'scheduling', 'serving'],
    takeaway:
      'Iteration-level scheduling: admit and retire requests every decode step instead of per batch.',
  },
  {
    title:
      'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
    authors: 'Dao et al.',
    year: 2022,
    venue: 'NeurIPS 2022',
    link: 'https://arxiv.org/abs/2205.14135',
    status: 'reading',
    tags: ['attention', 'gpu', 'kernels'],
  },
  {
    title:
      'DistServe: Disaggregating Prefill and Decoding for Goodput-optimized LLM Serving',
    authors: 'Zhong et al.',
    year: 2024,
    venue: 'OSDI 2024',
    link: 'https://arxiv.org/abs/2401.09670',
    status: 'reading',
    tags: ['disaggregation', 'serving', 'llm-d'],
  },
  {
    title:
      'Mooncake: A KVCache-centric Disaggregated Architecture for LLM Serving',
    authors: 'Qin et al.',
    year: 2024,
    venue: 'FAST 2025',
    link: 'https://arxiv.org/abs/2407.00079',
    status: 'queued',
    tags: ['kv-cache', 'disaggregation', 'serving'],
  },
  {
    title:
      'Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve',
    authors: 'Agrawal et al.',
    year: 2024,
    venue: 'OSDI 2024',
    link: 'https://arxiv.org/abs/2403.02310',
    status: 'queued',
    tags: ['chunked-prefill', 'scheduling', 'serving'],
  },
  {
    title:
      'Splitwise: Efficient Generative LLM Inference Using Phase Splitting',
    authors: 'Patel et al.',
    year: 2024,
    venue: 'ISCA 2024',
    link: 'https://arxiv.org/abs/2311.18677',
    status: 'queued',
    tags: ['disaggregation', 'gpu', 'serving'],
  },
  {
    title: 'Fast Inference from Transformers via Speculative Decoding',
    authors: 'Leviathan et al.',
    year: 2023,
    venue: 'ICML 2023',
    link: 'https://arxiv.org/abs/2211.17192',
    status: 'queued',
    tags: ['speculative-decoding', 'inference'],
  },
  {
    title: 'SGLang: Efficient Execution of Structured Language Model Programs',
    authors: 'Zheng et al.',
    year: 2024,
    venue: 'NeurIPS 2024',
    link: 'https://arxiv.org/abs/2312.07104',
    status: 'queued',
    tags: ['radix-attention', 'prefix-caching', 'serving'],
  },
  {
    title:
      'AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration',
    authors: 'Lin et al.',
    year: 2024,
    venue: 'MLSys 2024',
    link: 'https://arxiv.org/abs/2306.00978',
    status: 'queued',
    tags: ['quantization', 'inference'],
  },
  {
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    year: 2017,
    venue: 'NeurIPS 2017',
    link: 'https://arxiv.org/abs/1706.03762',
    status: 'read',
    tags: ['transformers', 'attention'],
    takeaway:
      'Where the KV cache comes from: every decode step re-attends over all previous keys and values.',
  },
];
