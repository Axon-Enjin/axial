"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppToast, type ToastState } from "@/components/ui/AppToast";
import { demoActionMessage, type DemoActionKind } from "@/lib/demo-actions";
import {
  checkFreighterConnected,
  freighterAvailable,
  getFreighterNetworkDetails,
  getFreighterPublicKey,
  type FreighterNetworkDetails,
} from "@/lib/soroban/freighter";

export type AppUser = {
  id: string;
  email: string | null;
  orgId: string | null;
  orgName: string | null;
  role: string | null;
};

type AppContextValue = {
  /** Authenticated user (null if unauthenticated / auth not configured). */
  currentUser: AppUser | null;
  /** True when Freighter is connected (same as freighterPublicKey set). */
  walletConnected: boolean;
  /** Connect Freighter from the top bar; no-op if already connected. */
  connectWalletFromShell: () => Promise<void>;
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
  // ── Freighter self-custody wallet ──────────────────────────────────────────
  /** Connected Freighter public key, or null if not connected. */
  freighterPublicKey: string | null;
  /** Network details from the connected Freighter wallet. */
  freighterNetwork: FreighterNetworkDetails | null;
  /** Whether the Freighter extension is installed in this browser. */
  freighterInstalled: boolean;
  /** Whether a connection attempt is in progress. */
  freighterConnecting: boolean;
  /**
   * Connect Freighter. Prompts the user to grant access.
   * On success, `freighterPublicKey` is set.
   * Throws on user rejection or extension not installed.
   */
  connectFreighter: () => Promise<string>;
  /** Disconnect Freighter (clears local state — does not revoke extension access). */
  disconnectFreighter: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AppUser | null;
}) {
  const [currentUser] = useState<AppUser | null>(initialUser);
  // currentUser is initialised from server-side session (see initialUser prop)
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastSwapAdvancePhp, setLastSwapAdvancePhp] = useState<number | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Freighter state
  const [freighterPublicKey, setFreighterPublicKey] = useState<string | null>(null);
  const [freighterNetwork, setFreighterNetwork] = useState<FreighterNetworkDetails | null>(null);
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [freighterConnecting, setFreighterConnecting] = useState(false);

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

  // Detect Freighter on mount and auto-restore an existing session
  useEffect(() => {
    const installed = freighterAvailable();
    setFreighterInstalled(installed);
    if (!installed) return;
    void checkFreighterConnected().then(async (connected) => {
      if (!connected) return;
      try {
        const publicKey = await getFreighterPublicKey();
        const networkDetails = await getFreighterNetworkDetails().catch(
          (): FreighterNetworkDetails => ({
            network: "TESTNET",
            networkUrl: "https://horizon-testnet.stellar.org",
            networkPassphrase: "Test SDF Network ; September 2015",
          }),
        );
        setFreighterPublicKey(publicKey);
        setFreighterNetwork(networkDetails);
      } catch {
        // Silent — user can connect manually via WalletCard
      }
    });
  }, []); // intentionally run once on mount

  // ── Freighter ──────────────────────────────────────────────────────────────
  const connectFreighter = useCallback(async () => {
    setFreighterInstalled(freighterAvailable());
    if (!freighterAvailable()) {
      throw new Error("Freighter extension not installed. Visit freighter.app to install it.");
    }
    setFreighterConnecting(true);
    try {
      const publicKey = await getFreighterPublicKey();
      let networkDetails: FreighterNetworkDetails;
      try {
        networkDetails = await getFreighterNetworkDetails();
      } catch {
        // Older Freighter versions may not expose getNetworkDetails — use defaults
        networkDetails = {
          network: "TESTNET",
          networkUrl: "https://horizon-testnet.stellar.org",
          networkPassphrase: "Test SDF Network ; September 2015",
        };
      }
      setFreighterPublicKey(publicKey);
      setFreighterNetwork(networkDetails);
      setFreighterInstalled(true);
      return publicKey;
    } finally {
      setFreighterConnecting(false);
    }
  }, []);

  const walletConnected = Boolean(freighterPublicKey);

  const connectWalletFromShell = useCallback(async () => {
    if (freighterPublicKey) return;
    await connectFreighter();
  }, [freighterPublicKey, connectFreighter]);

  const disconnectFreighter = useCallback(() => {
    setFreighterPublicKey(null);
    setFreighterNetwork(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      walletConnected,
      connectWalletFromShell,
      toast,
      lastSwapAdvancePhp,
      setLastSwapAdvancePhp,
      dispatch,
      setProgressToast,
      dismissToast,
      freighterPublicKey,
      freighterNetwork,
      freighterInstalled,
      freighterConnecting,
      connectFreighter,
      disconnectFreighter,
    }),
    [
      currentUser,
      walletConnected,
      connectWalletFromShell,
      toast,
      lastSwapAdvancePhp,
      dispatch,
      setProgressToast,
      dismissToast,
      freighterPublicKey,
      freighterNetwork,
      freighterInstalled,
      freighterConnecting,
      connectFreighter,
      disconnectFreighter,
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
