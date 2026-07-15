"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { JourneyStage, JourneyStageStatus } from "@/lib/pipeline/journey";

function statusLabel(status: JourneyStageStatus): string {
  switch (status) {
    case "done":
      return "Done";
    case "active":
      return "Now";
    case "blocked":
      return "Paused";
    default:
      return "Next";
  }
}

function connectorTone(from: JourneyStageStatus, to: JourneyStageStatus): string {
  if (from === "done" && (to === "done" || to === "active")) {
    return "from-[#2DD4BF]/70 to-[#2DD4BF]/45";
  }
  if (from === "done" || from === "active") {
    return "from-[#2DD4BF]/35 to-outline-variant/25";
  }
  return "from-outline-variant/25 to-outline-variant/15";
}

function nodeRing(status: JourneyStageStatus): string {
  switch (status) {
    case "active":
      return "border-[#2DD4BF]/60 bg-[#2DD4BF]/15 text-[#2DD4BF] shadow-[0_0_24px_rgba(45,212,191,0.22)]";
    case "done":
      return "border-[#2DD4BF]/35 bg-surface-container-high text-[#2DD4BF]/90";
    case "blocked":
      return "border-amber-500/40 bg-amber-500/10 text-amber-300";
    default:
      return "border-outline-variant/25 bg-surface-container/50 text-outline";
  }
}

type Props = {
  stages: JourneyStage[];
  compact?: boolean;
  className?: string;
};

/** End-to-end closed-loop map: nodes on a track — capital → compliance → settle. */
export function ConnectionJourneyMap({ stages, compact = false, className }: Props) {
  if (stages.length === 0) return null;

  const active = stages.find((s) => s.status === "active");
  const doneCount = stages.filter((s) => s.status === "done").length;
  const allDone = doneCount === stages.length;
  const progress = doneCount / stages.length;

  if (compact) {
    return (
      <div className={className}>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center gap-1">
              <Link
                href={stage.href}
                title={`${stage.title} · ${statusLabel(stage.status)}`}
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 hover:scale-105 active:scale-[0.98]",
                  nodeRing(stage.status),
                ].join(" ")}
              >
                <Icon
                  name={stage.status === "done" ? "check" : stage.icon}
                  size={14}
                  fill={stage.status === "active"}
                />
              </Link>
              {i < stages.length - 1 ? (
                <div
                  className={[
                    "h-0.5 w-3 shrink-0 rounded-full bg-gradient-to-r sm:w-4",
                    connectorTone(stage.status, stages[i + 1].status),
                  ].join(" ")}
                />
              ) : null}
            </div>
          ))}
        </div>
        {active ? (
          <p className="mt-2 font-label-sm text-[10px] text-on-surface-variant">
            <span className="text-[#2DD4BF]">{active.title}</span>
            {" · "}
            {active.blurb}
          </p>
        ) : (
          <p className="mt-2 font-label-sm text-[10px] text-on-surface-variant/60">
            Closed loop complete for this invoice.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="font-label-sm text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
            Closed-loop journey
          </p>
          <p className="mt-1.5 font-headline-md text-[18px] tracking-tight text-on-surface sm:text-[20px]">
            Capital meets compliance on one track
          </p>
          <p className="mt-1 font-body-md text-[13px] text-on-surface-variant/75">
            MSME · payer · funder · BIR · settlement — click a stage to open that surface.
          </p>
        </div>
        <div className="flex min-w-[200px] flex-col gap-1.5 lg:items-end">
          <div className="flex w-full items-center justify-between gap-3 lg:w-[220px]">
            <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant/60">
              Loop progress
            </span>
            <span className="font-mono text-[11px] text-[#2DD4BF]">
              {doneCount}/{stages.length}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-high lg:w-[220px]">
            <div
              className="h-full rounded-full bg-[#2DD4BF] transition-[width] duration-700 ease-out"
              style={{ width: `${Math.max(progress * 100, allDone ? 100 : 6)}%` }}
            />
          </div>
          <p className="font-label-sm text-[11px] text-on-surface-variant">
            {allDone
              ? "Loop closed across the book"
              : active
                ? `Now · ${active.actor} · ${active.title}`
                : "Waiting for the next handoff"}
          </p>
        </div>
      </div>

      {/* Phase labels — desktop */}
      <div className="mb-3 hidden grid-cols-7 gap-0 md:grid">
        <div className="col-span-3 border-b border-outline-variant/15 pb-2">
          <span className="font-label-sm text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/55">
            A · Trust & liquidity
          </span>
        </div>
        <div className="col-span-2 border-b border-outline-variant/15 pb-2 pl-2">
          <span className="font-label-sm text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/55">
            B · Use & file
          </span>
        </div>
        <div className="col-span-2 border-b border-outline-variant/15 pb-2 pl-2">
          <span className="font-label-sm text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/55">
            C · Collect & close
          </span>
        </div>
      </div>

      {/* Mobile vertical pipeline */}
      <ol className="relative flex flex-col gap-0 md:hidden">
        <div
          className="absolute top-5 bottom-5 left-[19px] w-px bg-outline-variant/20"
          aria-hidden
        />
        {stages.map((stage, i) => (
          <li
            key={stage.id}
            className="relative z-10 flex gap-3.5 py-2"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div
              className={[
                "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-transform",
                nodeRing(stage.status),
                stage.status === "active" ? "scale-105" : "",
              ].join(" ")}
            >
              <Icon
                name={stage.status === "done" ? "check" : stage.icon}
                size={18}
                fill={stage.status === "active"}
              />
            </div>
            <Link
              href={stage.href}
              className="group min-w-0 flex-1 rounded-lg border border-transparent px-1 py-0.5 transition-colors hover:border-outline-variant/20 hover:bg-surface-container/40"
            >
              <div className="flex items-center gap-2">
                <p
                  className={[
                    "font-body-md text-[14px] font-medium",
                    stage.status === "active" ? "text-[#2DD4BF]" : "text-on-surface",
                  ].join(" ")}
                >
                  {stage.title}
                </p>
                <span className="font-label-sm text-[9px] uppercase tracking-wider text-on-surface-variant/50">
                  {stage.actor}
                </span>
              </div>
              <p className="mt-0.5 font-label-sm text-[11px] leading-snug text-on-surface-variant/70">
                {stage.blurb}
              </p>
            </Link>
          </li>
        ))}
      </ol>

      {/* Desktop: beads on a wire */}
      <div className="relative hidden md:block">
        <ol className="relative grid grid-cols-7 gap-1 lg:gap-2">
          {stages.map((stage, i) => {
            const isActive = stage.status === "active";
            return (
              <li key={stage.id} className="relative flex min-w-0 flex-col items-center text-center">
                {i < stages.length - 1 ? (
                  <div
                    className={[
                      "pointer-events-none absolute top-[21px] left-[calc(50%+24px)] z-0 flex h-0.5 w-[calc(100%-48px)] items-center",
                    ].join(" ")}
                    aria-hidden
                  >
                    <div
                      className={[
                        "h-full w-full rounded-full bg-gradient-to-r",
                        connectorTone(stage.status, stages[i + 1].status),
                      ].join(" ")}
                    />
                  </div>
                ) : null}

                <Link
                  href={stage.href}
                  className="group relative z-10 flex w-full flex-col items-center outline-none"
                >
                  <span
                    className={[
                      "relative flex h-11 w-11 items-center justify-center rounded-full border transition-transform duration-200",
                      "group-hover:scale-105 group-active:scale-[0.97]",
                      "group-focus-visible:ring-2 group-focus-visible:ring-[#2DD4BF]/35",
                      nodeRing(stage.status),
                    ].join(" ")}
                  >
                    {isActive ? (
                      <span
                        className="absolute inset-[-3px] animate-ping rounded-full bg-[#2DD4BF]/15"
                        aria-hidden
                      />
                    ) : null}
                    <Icon
                      name={stage.status === "done" ? "check" : stage.icon}
                      size={20}
                      fill={isActive}
                      className="relative"
                    />
                  </span>

                  <span
                    className={[
                      "mt-3 font-label-sm text-[9px] uppercase tracking-[0.14em]",
                      isActive ? "text-[#2DD4BF]" : "text-on-surface-variant/55",
                    ].join(" ")}
                  >
                    {stage.actor}
                  </span>
                  <span
                    className={[
                      "mt-1 font-body-md text-[13px] font-medium leading-tight",
                      isActive ? "text-[#2DD4BF]" : "text-on-surface",
                    ].join(" ")}
                  >
                    {stage.title}
                  </span>
                  <span className="mt-1 max-w-[10rem] font-label-sm text-[10px] leading-snug text-on-surface-variant/65">
                    {stage.blurb}
                  </span>
                  <span
                    className={[
                      "mt-2 font-label-sm text-[9px] uppercase tracking-wider",
                      isActive
                        ? "text-[#2DD4BF]"
                        : stage.status === "blocked"
                          ? "text-amber-400/80"
                          : "text-on-surface-variant/40",
                    ].join(" ")}
                  >
                    {allDone && stage.status === "done"
                      ? "Closed"
                      : statusLabel(stage.status)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
