"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { demoActionMessage, type DemoActionKind } from "@/lib/demo-actions";

type AppContextValue = {
  walletConnected: boolean;
  toggleWallet: () => void;
  toast: string | null;
  dispatch: (kind: DemoActionKind, payload?: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const dispatch = useCallback((kind: DemoActionKind, payload?: string) => {
    const message = demoActionMessage(kind, payload);
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const toggleWallet = useCallback(() => {
    setWalletConnected((w) => !w);
  }, []);

  const value = useMemo(
    () => ({ walletConnected, toggleWallet, toast, dispatch }),
    [walletConnected, toggleWallet, toast, dispatch],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          className="fixed bottom-7 right-7 z-[200] flex max-w-sm items-start gap-2.5 rounded-xl border border-[#2DD4BF]/30 bg-surface-container-high/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_15px_rgba(45,212,191,0.18)] backdrop-blur-xl"
          role="status"
        >
          <span
            className="material-symbols-outlined fill text-[18px] text-[#2DD4BF]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="font-label-md text-label-md text-on-surface">{toast}</p>
        </div>
      ) : null}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
