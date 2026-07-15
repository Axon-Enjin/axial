"use client";

import { Icon } from "@/components/ui/Icon";

export type FlowPipelineStepState = "done" | "active" | "pending";

export type FlowPipelineStep = {
  state: FlowPipelineStepState;
  icon: string;
  title: string;
  trigger: string;
  logic: string;
  action: string;
  sub: string;
  progress?: number;
};

function PipelineStepRow({
  state,
  icon,
  title,
  trigger,
  logic,
  action,
  sub,
  progress,
}: FlowPipelineStep) {
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
        <p className="mt-1.5 font-label-sm text-[10px] sm:text-[11px] leading-relaxed text-on-surface-variant/80">
          <span className="text-[#2DD4BF]/80">Trigger</span> {trigger}
          <span className="mx-1.5 text-outline-variant/40">·</span>
          <span className="text-[#2DD4BF]/80">Logic</span> {logic}
          <span className="mx-1.5 text-outline-variant/40">·</span>
          <span className="text-[#2DD4BF]/80">Action</span> {action}
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

/** Read-only Trigger → Logic → Action pipeline (Pink Raft legibility pattern). */
export function FlowPipeline({ steps }: { steps: FlowPipelineStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="relative flex flex-col gap-6">
      <div className="absolute top-6 bottom-6 left-[23px] w-px bg-outline-variant/20" />
      {steps.map((step) => (
        <PipelineStepRow key={step.title} {...step} />
      ))}
    </div>
  );
}
