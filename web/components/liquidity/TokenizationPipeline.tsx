"use client";

import { FlowPipeline } from "@/components/pipeline/FlowPipeline";
import { advancePipelineSteps } from "@/lib/pipeline/configs";
import type { PipelineStage } from "@/lib/liquidity/pipeline-stage";

/** Advance flow pipeline — Liquidity view. */
export function TokenizationPipeline({ stage }: { stage: PipelineStage }) {
  return <FlowPipeline steps={advancePipelineSteps(stage)} />;
}
