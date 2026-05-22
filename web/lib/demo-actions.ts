export type DemoActionKind =
  | "unlock"
  | "transfer"
  | "browse-files"
  | "invoice-parsed"
  | "payer-confirmed"
  | "swap-executed"
  | "payroll-routed";

const MESSAGES: Record<DemoActionKind, string | ((payload?: string) => string)> = {
  unlock: "Capital unlock flow opened — choose a receivable to tokenize.",
  transfer: "Transfer composer opened.",
  "browse-files": "File picker opened. Drop PDF or XML invoices to tokenize.",
  "invoice-parsed": (payload) =>
    payload
      ? `Invoice read: ${payload}`
      : "Invoice extracted — review the new row in Active Factoring.",
  "payer-confirmed": (payload) =>
    payload
      ? `${payload} — lockbox issued; receivable is fundable.`
      : "Payer confirmed invoice and acknowledged NoA. You may tokenize.",
  "swap-executed": (payload) => {
    if (!payload) {
      return "Atomic swap executed. USDC settling on Stellar.";
    }
    if (
      payload.includes("not initialized") ||
      payload.includes("failed") ||
      payload.includes("Tokenize") ||
      payload.includes("trustline") ||
      payload.includes("Trustline") ||
      payload.includes("HostError") ||
      payload.includes("USDC balance") ||
      payload.includes("Error(Contract")
    ) {
      return payload;
    }
    if (payload.startsWith("tx:")) {
      const parts = payload.slice(3).split("|");
      const invoiceId = parts[0] ?? "invoice";
      const short = (h: string) => (h.length > 8 ? `${h.slice(0, 8)}…` : h);
      if (parts.length >= 3 && parts[1] && parts[2]) {
        return `${invoiceId} tokenized and advanced. Mint ${short(parts[1])} · Swap ${short(parts[2])}`;
      }
      if (parts.length >= 2 && parts[1]) {
        return `${invoiceId} advanced on Stellar. TX ${short(parts[1])}`;
      }
      return `${invoiceId} settled on Stellar.`;
    }
    return `Atomic swap executed on ${payload}. USDC settling on Stellar.`;
  },
  "payroll-routed": (payload) => {
    if (!payload) {
      return "Payroll routed. Statutory slices dispatched on Stellar.";
    }
    if (payload.startsWith("tx:")) {
      const parts = payload.slice(3).split("|");
      const payrollId = parts[0] ?? "payroll";
      const hash = parts[1];
      return hash
        ? `${payrollId} routed on Stellar. TX ${hash.length > 8 ? `${hash.slice(0, 8)}…` : hash}`
        : `${payrollId} routed on Stellar.`;
    }
    return `Payroll routed for ${payload}.`;
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
  "/app": {
    title: "Overview",
    subtitle: null,
  },
  "/app/liquidity": {
    title: "Liquidity Engine",
    subtitle: "Tokenize B2B receivables and execute atomic swaps on Stellar.",
  },
  "/app/compliance": {
    title: "Compliance Ledger",
    subtitle: null,
  },
  "/app/settings": {
    title: "Architectural Settings",
    subtitle: null,
  },
};
