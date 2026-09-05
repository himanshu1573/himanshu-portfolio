/**
 * Medium blog sync configuration
 *
 * The blog list merges local MDX posts (src/data/blog) with articles from the
 * Medium RSS feed. Medium posts open on medium.com. New articles appear after
 * the next revalidation without a redeploy.
 */
export const mediumConfig = {
  username: 'himanshu157',
  profileUrl: 'https://medium.com/@himanshu157',
  feedUrl: 'https://medium.com/feed/@himanshu157',
  /** Revalidate listing every hour so new posts show up without a redeploy */
  revalidateSeconds: 3600,
  fallbackImage: '/meta/blogs.png',
};

export interface SeedPost {
  title: string;
  description: string;
  url: string;
  date: string;
  tags: string[];
  image?: string;
}

/**
 * Snapshot of published articles. Used when the RSS feed cannot be fetched
 * (offline builds, Medium rate limits) so the blog never renders empty.
 * The live feed wins on overlap.
 */
export const seedPosts: SeedPost[] = [
  {
    title:
      'KV Cache: A Necessary Evil · Part 2: From One GPU to a Whole Cluster',
    description:
      'What happens when the cache outgrows the machine it lives on, and why companies now build entire clusters around it.',
    url: 'https://medium.com/@himanshu157/kv-cache-a-necessary-evil-part-2-from-one-gpu-to-a-whole-cluster-687f88c2bcf0',
    date: '2026-08-27',
    tags: ['kv-cache', 'llm-serving', 'vllm', 'pagedattention'],
    image:
      'https://cdn-images-1.medium.com/max/1024/1*xb8LfZbBqALVLeDKul4N9A.png',
  },
  {
    title: 'KV Cache: A Necessary Evil',
    description:
      'How one memory shortcut made LLMs fast, and why it now decides whether serving them makes money.',
    url: 'https://medium.com/@himanshu157/kv-cache-a-necessary-evil-fd4ac177985e',
    date: '2026-08-25',
    tags: ['kv-cache', 'large-language-models', 'gpu'],
    image:
      'https://cdn-images-1.medium.com/max/1024/1*uS7qgvx2VSSUBFhy-L9aTA.png',
  },
  {
    title: 'My laptop reads a gigabyte to write one word',
    description:
      'Running a small model on an 8 GB MacBook, noticing 26 words per second, and following the question of why decoding is memory-bound.',
    url: 'https://medium.com/@himanshu157/my-laptop-reads-a-gigabyte-to-write-one-word-4c1235b301ef',
    date: '2026-08-11',
    tags: ['llm-inference', 'quantization', 'llm-serving'],
    image:
      'https://cdn-images-1.medium.com/max/1024/1*FuiePecTd5Upy8Nj1EGedg.png',
  },
  {
    title:
      '18 Hours on Free Colab: The Question That Taught Me How AI Training Actually Scales',
    description:
      'A friend’s 18-hour training run on a free Colab GPU, and what it taught me about data parallelism and distributed training.',
    url: 'https://medium.com/@himanshu157/18-hours-on-free-colab-the-question-that-taught-me-how-ai-training-actually-scales-8b311606b5e0',
    date: '2026-08-03',
    tags: ['deep-learning', 'data-parallelism', 'distributed-systems'],
    image:
      'https://cdn-images-1.medium.com/max/1024/1*TYCTXrfU_jhzDczY8Kv4Lg.png',
  },
  {
    title: 'Training Is a Marathon, Serving Is a Sprint: How AI Actually Runs',
    description:
      'A fine-tuned chatbot that worked on one laptop and died when forty people scanned the QR code, and why training and serving are different problems.',
    url: 'https://medium.com/@himanshu157/training-is-a-marathon-serving-is-a-sprint-how-ai-actually-runs-05c719cf87e3',
    date: '2026-07-30',
    tags: ['llm', 'ai-infrastructure', 'machine-learning'],
    image:
      'https://cdn-images-1.medium.com/max/1024/1*qqzLPmId4Y9DwsMi_d4aig.png',
  },
  {
    title:
      'Why Most RAG Systems Fail on Code and How AST-Based Chunking Fixes It',
    description:
      'Most RAG systems feel impressive until you try them on real codebases. The issue is not the model, it is how we feed code into the retriever.',
    url: 'https://medium.com/@himanshu157/why-most-rag-systems-fail-on-code-and-how-ast-based-chunking-fixes-it-e003cea33e02',
    date: '2026-04-20',
    tags: ['rag', 'ast', 'chunking'],
    image:
      'https://cdn-images-1.medium.com/max/1024/1*6OB7LNXfkRfODS28siCofw.png',
  },
  {
    title:
      'Exploring CMake, Git PRs, and Buffer Overflow Vulnerabilities: A Learning Journey',
    description:
      'Notes from working with CMake, the pull-request workflow, and buffer overflow bugs in C.',
    url: 'https://medium.com/@himanshu157/exploring-cmake-git-prs-and-buffer-overflow-vulnerabilities-a-learning-journey-6bc2813b03c3',
    date: '2024-11-06',
    tags: ['cmake', 'c', 'open-source'],
  },
  {
    title:
      'Dive into the Depths of Storage: Unlocking Open Source Innovation with Ceph GSoC',
    description:
      'An introduction to contributing to Ceph through Google Summer of Code.',
    url: 'https://medium.com/@himanshu157/dive-into-the-depths-of-storage-unlocking-open-source-innovation-with-ceph-gsoc-678d45506842',
    date: '2024-01-15',
    tags: ['ceph', 'gsoc', 'open-source'],
    image:
      'https://cdn-images-1.medium.com/max/1024/1*fYZQpA5z8pArHyQAxVUDSA.png',
  },
];
