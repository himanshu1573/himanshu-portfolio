import DashedHorizontalRule from '@/components/common/DashedHorizontalRule';
import PageBackTitle from '@/components/common/PageBackTitle';
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
            Two interactive models of the problems I work on. The first is the
            scheduler from tinyserve with the model removed: watch static and
            continuous batching fight over the same KV cache. The second is the
            arithmetic behind every serving decision: does this model fit on
            this GPU, and how fast will it decode?
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
        <div className="pb-12" />
      </div>
    </main>
  );
}
