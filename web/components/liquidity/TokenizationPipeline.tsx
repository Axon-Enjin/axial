"use client";

import { Icon } from "@/components/ui/Icon";
import type { PipelineStage } from "@/lib/liquidity/pipeline-stage";

function PipelineStep({
  state,
  icon,
  title,
  sub,
  progress,
}: {
  state: "done" | "active" | "pending";
  icon: string;
  title: string;
  sub: string;
  progress?: number;
}) {
  const circleClass =
    state === "active"
      ? "border-[#2DD4BF]/50 bg-[#2DD4BF]/20 text-[#2DD4BF] shadow-[0_0_15px_rgba(45,212,191,0.3)]"
      : state === "done"
        ? "border-outline-variant/30 bg-surface-container-high text-on-surface-variant"
        : "border-outline-variant/15 bg-surface-variant/30 text-outline";

  return (
    <div
      className={[
        "relative z-10 flex gap-3 sm:gap-4",
        state === "pending" ? "opacity-60" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border",
          circleClass,
        ].join(" ")}
      >
        <Icon name={icon} size={20} fill={state === "active"} />
      </div>
      <div className="flex-1 pt-0.5 sm:pt-1">
        <p
          className={[
            "font-body-md text-[14px] sm:text-body-md font-medium",
            state === "active" ? "text-[#2DD4BF]" : "text-on-surface",
          ].join(" ")}
        >
          {title}
        </p>
        <p className="mt-1 font-body-md text-[13px] sm:text-body-md text-on-surface-variant">{sub}</p>
        {progress != null ? (
          <div className="mt-2 sm:mt-2.5 h-0.5 max-w-[280px] overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Ambient progress — always visible in the right column. */
export function TokenizationPipeline({ stage }: { stage: PipelineStage }) {
  const verifyDone = stage !== "idle" && stage !== "reading";
  const swapActive = stage === "minting" || stage === "swapping";
  const swapDone = stage === "complete";
  const eisDone = stage === "complete";

  let swapSub = "Click Tokenize & Swap in the table below.";
  let swapProgress: number | undefined;
  if (stage === "minting") {
    swapSub = "Minting receivable SAC on Stellar…";
    swapProgress = 0.45;
  } else if (stage === "swapping") {
    swapSub = "Executing USDC atomic advance…";
    swapProgress = 0.85;
  } else if (stage === "complete") {
    swapSub = "Mint and swap confirmed on testnet.";
  }

  return (
    <div className="relative flex flex-col gap-6">
      <div className="absolute top-6 bottom-6 left-[23px] w-px bg-outline-variant/20" />
      <PipelineStep
        state={stage === "reading" ? "active" : verifyDone ? "done" : "pending"}
        icon="document_scanner"
        title="Invoice Verification"
        sub={
          stage === "reading"
            ? "OCR reading PDF or image…"
            : verifyDone
              ? "Fields extracted — ready to tokenize."
              : "Upload an invoice to start."
        }
        progress={stage === "reading" ? 0.6 : undefined}
      />
      <PipelineStep
        state={swapDone ? "done" : swapActive ? "active" : "pending"}
        icon="token"
        title="Tokenize & Swap"
        sub={swapSub}
        progress={swapProgress}
      />
      <PipelineStep
        state={eisDone ? "done" : swapDone ? "active" : "pending"}
        icon="balance"
        title="BIR EIS Bridge"
        sub={
          eisDone
            ? "Oracle submitted — see Compliance tab."
            : "Runs automatically after swap completes."
        }
      />
    </div>
  );
}
