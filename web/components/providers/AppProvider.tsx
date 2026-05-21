"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppToast, type ToastState } from "@/components/ui/AppToast";
import { demoActionMessage, type DemoActionKind } from "@/lib/demo-actions";

type AppContextValue = {
  walletConnected: boolean;
  toggleWallet: () => void;
  toast: ToastState | null;
  /** Last on-chain swap advance (PHP units) — drives payroll default budget. */
  lastSwapAdvancePhp: number | null;
  setLastSwapAdvancePhp: (amount: number | null) => void;
  /** Short success toast (auto-dismiss). */
  dispatch: (kind: DemoActionKind, payload?: string) => void;
  /** Sticky toast with spinner + bar — updates in place until cleared. */
  setProgressToast: (
    message: string,
    opts?: { progress?: number; stepLabel?: string },
  ) => void;
  dismissToast: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastSwapAdvancePhp, setLastSwapAdvancePhp] = useState<number | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const dismissToast = useCallback(() => {
    clearDismissTimer();
    setToast(null);
  }, [clearDismissTimer]);

  const showToast = useCallback(
    (next: ToastState, autoDismissMs?: number) => {
      clearDismissTimer();
      setToast(next);
      if (autoDismissMs != null && autoDismissMs > 0) {
        dismissTimerRef.current = setTimeout(() => setToast(null), autoDismissMs);
      }
    },
    [clearDismissTimer],
  );

  const setProgressToast = useCallback(
    (message: string, opts?: { progress?: number; stepLabel?: string }) => {
      showToast({
        message,
        variant: "progress",
        progress: opts?.progress,
        stepLabel: opts?.stepLabel,
      });
    },
    [showToast],
  );

  const dispatch = useCallback(
    (kind: DemoActionKind, payload?: string) => {
      const message = demoActionMessage(kind, payload);
      const isError =
        payload != null &&
        (payload.includes("failed") ||
          payload.includes("Failed") ||
          payload.includes("before funding"));
      showToast(
        { message, variant: isError ? "error" : "success" },
        isError ? 4500 : 3200,
      );
    },
    [showToast],
  );

  const toggleWallet = useCallback(() => {
    setWalletConnected((w) => !w);
  }, []);

  const value = useMemo(
    () => ({
      walletConnected,
      toggleWallet,
      toast,
      lastSwapAdvancePhp,
      setLastSwapAdvancePhp,
      dispatch,
      setProgressToast,
      dismissToast,
    }),
    [
      walletConnected,
      toggleWallet,
      toast,
      lastSwapAdvancePhp,
      dispatch,
      setProgressToast,
      dismissToast,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast ? <AppToast toast={toast} /> : null}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
