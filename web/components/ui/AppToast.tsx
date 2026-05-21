"use client";

export type ToastState = {
  message: string;
  variant: "progress" | "success" | "error";
  progress?: number;
  stepLabel?: string;
};

export function AppToast({ toast }: { toast: ToastState }) {
  const icon =
    toast.variant === "progress"
      ? "sync"
      : toast.variant === "error"
        ? "error"
        : "check_circle";

  return (
    <div
      className="fixed bottom-7 right-7 z-[200] w-full max-w-sm rounded-xl border border-[#2DD4BF]/30 bg-surface-container-high/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_15px_rgba(45,212,191,0.18)] backdrop-blur-xl"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-2.5">
        <span
          className={[
            "material-symbols-outlined shrink-0 text-[20px] text-[#2DD4BF]",
            toast.variant === "progress" ? "animate-spin" : "",
          ].join(" ")}
          style={
            toast.variant === "success"
              ? { fontVariationSettings: "'FILL' 1" }
              : undefined
          }
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          {toast.stepLabel ? (
            <p className="font-label-sm text-label-sm text-[#2DD4BF]">{toast.stepLabel}</p>
          ) : null}
          <p className="font-label-md text-label-md text-on-surface">{toast.message}</p>
          {toast.variant === "progress" && toast.progress != null ? (
            <div className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-[#2DD4BF] transition-all duration-500"
                style={{ width: `${Math.min(100, toast.progress * 100)}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
