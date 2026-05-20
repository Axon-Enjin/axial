export type DemoActionKind =
  | "unlock"
  | "transfer"
  | "browse-files"
  | "swap-executed";

const MESSAGES: Record<DemoActionKind, string | ((payload?: string) => string)> = {
  unlock: "Capital unlock flow opened — choose a receivable to tokenize.",
  transfer: "Transfer composer opened.",
  "browse-files": "File picker opened. Drop PDF or XML invoices to tokenize.",
  "swap-executed": (payload) => {
    if (!payload) {
      return "Atomic swap executed. USDC settling on Stellar.";
    }
    if (payload.startsWith("tx:")) {
      const [, invoiceId, hash] = payload.split("|");
      return `Swap on ${invoiceId ?? "invoice"} confirmed. TX ${hash?.slice(0, 8)}…`;
    }
    return `Atomic swap executed on ${payload}. USDC settling on Stellar.`;
  },
};

export function demoActionMessage(kind: DemoActionKind, payload?: string): string {
  const msg = MESSAGES[kind];
  return typeof msg === "function" ? msg(payload) : msg;
}

export const PAGE_META: Record<
  string,
  { title: string; subtitle: string | null }
> = {
  "/": {
    title: "Overview",
    subtitle: null,
  },
  "/liquidity": {
    title: "Liquidity Engine",
    subtitle: "Tokenize B2B receivables and execute atomic swaps on Stellar.",
  },
  "/compliance": {
    title: "Compliance Ledger",
    subtitle: null,
  },
  "/settings": {
    title: "Architectural Settings",
    subtitle: null,
  },
};
