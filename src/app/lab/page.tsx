import DashedHorizontalRule from '@/components/common/DashedHorizontalRule';
import PageBackTitle from '@/components/common/PageBackTitle';
import CacheAwareRouter from '@/components/lab/CacheAwareRouter';
import ClusterScheduler from '@/components/lab/ClusterScheduler';
import KVCalculator from '@/components/lab/KVCalculator';
import ServingSimulator from '@/components/lab/ServingSimulator';
import { generateMetadata as getMetadata } from '@/config/Meta';
import { Metadata } from 'next';

export const metadata: Metadata = {
  ...getMetadata('/lab'),
};

export default function LabPage() {
  return (
    <main>
      <div className="content-column content-column-dashed relative mx-auto">
        <PageBackTitle href="/">Inference Lab</PageBackTitle>

        <div className="space-y-2 px-6 py-5">
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Four interactive models of the problems I work on, in two halves.
            Inference: the scheduler from tinyserve with the model removed, and
            the arithmetic behind every serving decision. Infrastructure: how
            SkyPilot places GPU jobs across clouds, and how llm-d routes
            requests to the pod that already holds their KV cache.
          </p>
        </div>

        <DashedHorizontalRule />
        <div className="px-6 py-3">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            Inference
          </p>
        </div>
        <DashedHorizontalRule />
        <section className="px-6 py-6">
          <h2 className="text-foreground text-base font-semibold">
            1 · Continuous batching vs static batching
          </h2>
          <p className="text-muted-foreground mt-1 mb-5 text-xs">
            Live simulation. Drag the sliders; both schedulers restart on the
            same workload.
          </p>
          <ServingSimulator />
        </section>

        <DashedHorizontalRule />
        <section className="px-6 py-6">
          <h2 className="text-foreground text-base font-semibold">
            2 · Will it fit, and how fast? KV cache and bandwidth calculator
          </h2>
          <p className="text-muted-foreground mt-1 mb-5 text-xs">
            First-order estimates from model shape and memory bandwidth alone.
          </p>
          <KVCalculator />
        </section>

        <DashedHorizontalRule />
        <div className="px-6 py-3">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            Infrastructure
          </p>
        </div>
        <DashedHorizontalRule />
        <section className="px-6 py-6">
          <h2 className="text-foreground text-base font-semibold">
            3 · Multi-cloud GPU scheduling with failover
          </h2>
          <p className="text-muted-foreground mt-1 mb-5 text-xs">
            SkyPilot-style placement across AWS, Nebius, GCP and an on-prem
            Kubernetes pool, versus pinning everything to one cloud. Includes
            the accelerator-variant matching rule from my SkyPilot work.
          </p>
          <ClusterScheduler />
        </section>

        <DashedHorizontalRule />
        <section className="px-6 py-6">
          <h2 className="text-foreground text-base font-semibold">
            4 · KV-cache-aware request routing
          </h2>
          <p className="text-muted-foreground mt-1 mb-5 text-xs">
            How llm-d&apos;s endpoint picker decides which decode pod gets a
            request: round-robin, least loaded, and prefix-aware on identical
            traffic.
          </p>
          <CacheAwareRouter />
        </section>

        <DashedHorizontalRule />
        <div className="pb-12" />
      </div>
    </main>
  );
}
