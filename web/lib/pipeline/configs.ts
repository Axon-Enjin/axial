import type { FlowPipelineStep } from "@/components/pipeline/FlowPipeline";
import type { PipelineStage } from "@/lib/liquidity/pipeline-stage";

export type SettlePipelineStage = "idle" | "funding" | "collecting" | "settling" | "complete";

export type PayrollPipelineStage = "idle" | "quoting" | "routing" | "complete";

export function advancePipelineSteps(stage: PipelineStage): FlowPipelineStep[] {
  const verifyDone = stage !== "idle" && stage !== "reading";
  const swapActive = stage === "minting" || stage === "swapping";
  const swapDone = stage === "complete";
  const eisDone = stage === "complete";

  let swapSub = "Confirm the advance, then Tokenize & Swap.";
  let swapProgress: number | undefined;
  if (stage === "minting") {
    swapSub = "Minting receivable SAC on Stellar…";
    swapProgress = 0.45;
  } else if (stage === "swapping") {
    swapSub = "Executing USDC atomic advance…";
    swapProgress = 0.85;
  } else if (stage === "complete") {
    swapSub = "Mint and swap confirmed on Mainnet.";
  }

  return [
    {
      state: stage === "reading" ? "active" : verifyDone ? "done" : "pending",
      icon: "document_scanner",
      title: "Invoice Verification",
      trigger: "Invoice uploaded",
      logic: "OCR + field extract",
      action: "Ready to tokenize",
      sub:
        stage === "reading"
          ? "OCR reading PDF or image…"
          : verifyDone
            ? "Fields extracted — ready to tokenize."
            : "Upload an invoice to start.",
      progress: stage === "reading" ? 0.6 : undefined,
    },
    {
      state: swapDone ? "done" : swapActive ? "active" : "pending",
      icon: "token",
      title: "Tokenize & Swap",
      trigger: "Payer confirmed + NoA",
      logic: "Eligibility · 85% advance",
      action: "Mint SAC → USDC swap",
      sub: swapSub,
      progress: swapProgress,
    },
    {
      state: eisDone ? "done" : swapDone ? "active" : "pending",
      icon: "balance",
      title: "BIR EIS Bridge",
      trigger: "Ledger-final event",
      logic: "Map 20 BIR fields + JWS",
      action: "Prepare for your review",
      sub:
        eisDone
          ? "Filing prepared — review in Compliance."
          : "Runs after swap; you approve before submit.",
    },
  ];
}

export function payrollPipelineSteps(stage: PayrollPipelineStage): FlowPipelineStep[] {
  const quoteActive = stage === "quoting";
  const routeActive = stage === "routing";
  const done = stage === "complete";

  return [
    {
      state: done ? "done" : quoteActive ? "active" : stage === "idle" ? "pending" : "done",
      icon: "calculate",
      title: "Statutory Quote",
      trigger: "Payroll run initiated",
      logic: "SSS · PhilHealth · Pag-IBIG brackets",
      action: "Compute split amounts",
      sub:
        quoteActive
          ? "Building payroll quote on Soroban…"
          : done || routeActive
            ? "Split amounts computed."
            : "Enter gross payroll to quote.",
      progress: quoteActive ? 0.5 : undefined,
    },
    {
      state: done ? "done" : routeActive ? "active" : "pending",
      icon: "call_split",
      title: "Route Payroll",
      trigger: "Quote confirmed",
      logic: "Agency wallet whitelist",
      action: "Single USDC transaction",
      sub:
        routeActive
          ? "Signing and submitting payroll route…"
          : done
            ? "Statutory split confirmed on Mainnet."
            : "Confirm recipients, then route.",
      progress: routeActive ? 0.75 : undefined,
    },
    {
      state: done ? "done" : "pending",
      icon: "balance",
      title: "BIR EIS Bridge",
      trigger: "Ledger-final event",
      logic: "Map payroll fields + JWS",
      action: "Prepare for your review",
      sub: done ? "EIS row queued — see submissions table." : "Runs after payroll routes.",
    },
  ];
}

export function settlePipelineSteps(stage: SettlePipelineStage): FlowPipelineStep[] {
  const fundActive = stage === "funding";
  const collectActive = stage === "collecting";
  const settleActive = stage === "settling";
  const done = stage === "complete";

  return [
    {
      state: done ? "done" : fundActive ? "active" : stage === "idle" ? "pending" : "done",
      icon: "account_balance_wallet",
      title: "Lockbox Funding",
      trigger: "NoA acknowledged",
      logic: "Payer Freighter + USDC",
      action: "Transfer to settlement contract",
      sub:
        fundActive
          ? "Building USDC transfer to lockbox…"
          : done || collectActive || settleActive
            ? "USDC received in lockbox."
            : "Connect wallet and pay invoice face value.",
      progress: fundActive ? 0.4 : undefined,
    },
    {
      state: done ? "done" : collectActive || settleActive ? "active" : "pending",
      icon: "inventory_2",
      title: "Mark Collected",
      trigger: "Payment confirmed",
      logic: "Invoice + reserve ledger",
      action: "Record collected amount",
      sub:
        collectActive
          ? "Recording collection off-chain…"
          : settleActive || done
            ? "Collection recorded."
            : "Runs after lockbox payment.",
      progress: collectActive ? 0.55 : undefined,
    },
    {
      state: done ? "done" : settleActive ? "active" : "pending",
      icon: "payments",
      title: "On-Chain Settle",
      trigger: "Lockbox balance > 0",
      logic: "Balance pre-check · advance vs face",
      action: "Repay funder · release reserve",
      sub:
        settleActive
          ? "Calling settlement::settle on Mainnet…"
          : done
            ? "Funder repaid and reserve distributed."
            : "Distributes USDC from lockbox to funder + MSME.",
      progress: settleActive ? 0.85 : undefined,
    },
  ];
}
