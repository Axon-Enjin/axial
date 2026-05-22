import { Icon } from "./Icon";

export type StatusKind =
  | "active"
  | "synced"
  | "minted"
  | "scanning"
  | "settled"
  | "warning"
  | "error";

const kindClass: Record<StatusKind, string> = {
  active:
    "border-outline-variant/50 bg-surface-container/60 text-on-surface",
  synced:
    "border-[#2DD4BF]/30 bg-[#2DD4BF]/10 text-[#2DD4BF]",
  minted:
    "border-secondary/20 bg-secondary-container/30 text-secondary",
  scanning:
    "border-outline-variant/20 bg-surface-variant/50 text-on-surface-variant",
  settled:
    "border-outline-variant/10 bg-surface-variant/30 text-on-surface-variant",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  error: "border-red-300/30 bg-red-300/10 text-red-200",
};

const dotClass: Record<StatusKind, string> = {
  active: "bg-[#2DD4BF] shadow-[0_0_10px_rgba(45,212,191,0.6)]",
  synced: "bg-[#2DD4BF]",
  minted: "bg-secondary",
  scanning: "bg-outline",
  settled: "bg-outline",
  warning: "bg-amber-400",
  error: "bg-red-300",
};

type StatusBadgeProps = {
  kind?: StatusKind;
  icon?: string;
  animated?: boolean;
  children: React.ReactNode;
};

export function StatusBadge({
  kind = "active",
  icon,
  animated,
  children,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full border px-2 py-0.5 sm:px-3 sm:py-1 font-label-sm text-[10px] sm:text-label-sm ${kindClass[kind]}`}
    >
      {kind !== "settled" && !icon ? (
        <span className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${dotClass[kind]}`} />
      ) : null}
      {icon ? (
        <Icon
          name={icon}
          size={12}
          className={`sm:hidden ${animated ? "animate-spin" : ""}`}
        />
      ) : null}
      {icon ? (
        <Icon
          name={icon}
          size={14}
          className={`hidden sm:block ${animated ? "animate-spin" : ""}`}
        />
      ) : null}
      {children}
    </span>
  );
}
