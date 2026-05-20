"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { StatTile } from "@/components/ui/StatTile";
import { StatusBadge } from "@/components/ui/StatusBadge";

type InvoiceStatus = "minted" | "scanning" | "settled";

type Invoice = {
  id: string;
  party: string;
  terms: string;
  face: number;
  immediate: number | null;
  status: InvoiceStatus;
  mintTxHash?: string | null;
  swapTxHash?: string | null;
};

function txExplorerUrl(base: string, hash: string) {
  return `${base}/${hash}`;
}

function ViewTxLinks({
  mintTxHash,
  swapTxHash,
  explorerTxBase,
}: {
  mintTxHash?: string | null;
  swapTxHash?: string | null;
  explorerTxBase: string;
}) {
  const linkClass =
    "inline-flex items-center gap-1 bg-transparent font-label-md text-label-md text-on-surface-variant hover:text-primary underline-offset-2 hover:underline";

  if (!mintTxHash && !swapTxHash) {
    return (
      <span className="font-label-sm text-label-sm text-outline" title="No on-chain txs for this row">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      {mintTxHash ? (
        <a
          href={txExplorerUrl(explorerTxBase, mintTxHash)}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          <Icon name="receipt_long" size={16} />
          Mint TX
        </a>
      ) : null}
      {swapTxHash ? (
        <a
          href={txExplorerUrl(explorerTxBase, swapTxHash)}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          <Icon name="swap_horiz" size={16} />
          Swap TX
        </a>
      ) : null}
    </span>
  );
}

const initialInvoices: Invoice[] = [
  {
    id: "INV-2023-8901",
    party: "Acme Logistics Corp",
    terms: "Net 60",
    face: 125000,
    immediate: null,
    status: "minted",
  },
  {
    id: "INV-2023-8904",
    party: "Nexus Tech Solutions",
    terms: "Net 90",
    face: 450000,
    immediate: null,
    status: "scanning",
  },
  {
    id: "INV-2023-8872",
    party: "Global Freight Systems",
    terms: "Net 30",
    face: 75500,
    immediate: null,
    status: "settled",
  },
];

function UploadZone({ onBrowse }: { onBrowse: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <Card padding="lg">
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={[
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200",
          hover ? "border-primary/50" : "border-outline-variant/30",
        ].join(" ")}
      >
        <div
          className={[
            "mb-6 flex h-20 w-20 items-center justify-center rounded-full border transition-all duration-200",
            hover
              ? "border-primary/30 bg-primary/10"
              : "border-outline-variant/40 bg-surface-variant/50",
          ].join(" ")}
        >
          <Icon
            name="upload_file"
            size={36}
            className={hover ? "text-primary" : "text-on-surface-variant"}
          />
        </div>
        <h3 className="mb-2 font-headline-md text-headline-md tracking-tight text-on-surface">
          Upload B2B Invoice
        </h3>
        <p className="mb-6 max-w-md font-body-md text-body-md text-on-surface-variant">
          Drag and drop verified PDF or XML invoices into this zone to initiate the
          tokenization sequence.
        </p>
        <Button variant="secondary" onClick={onBrowse}>
          Browse Files
        </Button>
      </div>
    </Card>
  );
}

function PipelineStep({
  state,
  icon,
  title,
  sub,
  progress,
}: {
  state: "done" | "active" | "pending";
  icon: string;
  title: string;
  sub: string;
  progress?: number;
}) {
  const circleClass =
    state === "active"
      ? "border-[#2DD4BF]/50 bg-[#2DD4BF]/20 text-[#2DD4BF] shadow-[0_0_15px_rgba(45,212,191,0.3)]"
      : state === "done"
        ? "border-outline-variant/30 bg-surface-container-high text-on-surface-variant"
        : "border-outline-variant/15 bg-surface-variant/30 text-outline";

  return (
    <div
      className={[
        "relative z-10 flex gap-4",
        state === "pending" ? "opacity-60" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border",
          circleClass,
        ].join(" ")}
      >
        <Icon name={icon} size={20} fill={state === "active"} />
      </div>
      <div className="flex-1 pt-1">
        <p
          className={[
            "font-body-md text-body-md font-medium",
            state === "active" ? "text-[#2DD4BF]" : "text-on-surface",
          ].join(" ")}
        >
          {title}
        </p>
        <p className="mt-1 font-body-md text-body-md text-on-surface-variant">{sub}</p>
        {progress != null ? (
          <div className="mt-2.5 h-0.5 max-w-[280px] overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Pipeline() {
  return (
    <div className="relative flex flex-col gap-6">
      <div className="absolute top-6 bottom-6 left-[23px] w-px bg-outline-variant/20" />
      <PipelineStep
        state="done"
        icon="document_scanner"
        title="Invoice Verification"
        sub="OCR and metadata extraction complete."
      />
      <PipelineStep
        state="active"
        icon="token"
        title="Minting in Progress"
        sub="Deploying Soroban asset representation."
        progress={0.66}
      />
      <PipelineStep
        state="pending"
        icon="balance"
        title="Liquidity Matching"
        sub="Awaiting token finality to open order book."
      />
    </div>
  );
}

async function fetchQuote(face: number): Promise<number | null> {
  try {
    const res = await fetch(`/api/swap/quote?face=${face}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { advanceAmount: number };
    return data.advanceAmount;
  } catch {
    return null;
  }
}

type ChainStatus = {
  network: string;
  onChainReady: boolean;
  receivableReady: boolean;
  swapContractId: string | null;
  receivableContractId: string | null;
  configSource: string;
  explorerTxBase: string;
  explorerContractBase: string;
};

export function LiquidityView() {
  const { dispatch } = useApp();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [swapStep, setSwapStep] = useState<"idle" | "mint" | "swap">("idle");
  const [chain, setChain] = useState<ChainStatus | null>(null);

  useEffect(() => {
    void fetch("/api/soroban/status")
      .then((r) => r.json())
      .then((data: ChainStatus) => setChain(data))
      .catch(() => setChain(null));
  }, []);

  useEffect(() => {
    void (async () => {
      const quoted = await Promise.all(
        initialInvoices.map(async (row) => {
          if (row.immediate != null) return row;
          const advance = await fetchQuote(row.face);
          return advance != null ? { ...row, immediate: advance } : row;
        }),
      );
      setInvoices(quoted);
    })();
  }, []);

  const executeSwap = useCallback(
    async (id: string, face: number) => {
      setSwappingId(id);
      setSwapStep("mint");
      const chainInvoiceId = `${id}-${Date.now()}`;

      try {
        const mintRes = await fetch("/api/receivable/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: chainInvoiceId, faceAmount: face }),
        });
        const mintData = (await mintRes.json()) as {
          mode?: string;
          txHash?: string;
          error?: string;
        };

        if (!mintRes.ok) {
          dispatch("swap-executed", mintData.error ?? `Tokenize failed (${mintRes.status})`);
          return;
        }

        setSwapStep("swap");
        const res = await fetch("/api/swap/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: chainInvoiceId, faceAmount: face }),
        });
        const data = (await res.json()) as {
          mode?: string;
          advanceAmount?: number;
          txHash?: string;
          error?: string;
        };

        if (!res.ok) {
          dispatch("swap-executed", data.error ?? `Swap failed (${res.status})`);
          return;
        }

        const swapTx = data.mode === "on-chain" && data.txHash ? data.txHash : "";
        const mintTx =
          mintData.mode === "on-chain" && mintData.txHash ? mintData.txHash : "";

        setInvoices((rows) =>
          rows.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "settled" as const,
                  immediate: data.advanceAmount ?? r.immediate,
                  mintTxHash: mintTx || null,
                  swapTxHash: swapTx || null,
                }
              : r,
          ),
        );
        const payload =
          swapTx && mintTx
            ? `tx:${id}|${mintTx}|${swapTx}`
            : swapTx
              ? `tx:${id}|${swapTx}`
              : id;
        dispatch("swap-executed", payload);
      } finally {
        setSwappingId(null);
        setSwapStep("idle");
      }
    },
    [dispatch],
  );

  return (
    <main className="mx-auto flex max-w-container-max flex-col gap-gutter px-margin-mobile py-7 md:px-margin-desktop">
      {chain ? (
        <div
          className={[
            "flex flex-wrap items-center gap-2 rounded-xl border px-4 py-2.5 font-label-sm text-label-sm",
            chain.onChainReady
              ? "border-[#2DD4BF]/30 bg-[#2DD4BF]/10 text-[#2DD4BF]"
              : "border-outline-variant/30 bg-surface-container-high/60 text-on-surface-variant",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-[16px]">hub</span>
          <span>
            {chain.onChainReady && chain.receivableReady
              ? `Stellar ${chain.network} — mint receivable + swap on-chain`
              : chain.onChainReady
                ? `Stellar ${chain.network} — swap on-chain (add STELLAR_ISSUER_SECRET for mint)`
                : `Stellar ${chain.network} — demo mode (run soroban/scripts/write-web-env.sh)`}
          </span>
          {chain.swapContractId ? (
            <a
              href={`${chain.explorerContractBase}/${chain.swapContractId}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto font-mono text-xs underline opacity-80 hover:opacity-100"
            >
              {chain.swapContractId.slice(0, 8)}…
            </a>
          ) : null}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="flex flex-col gap-6 md:col-span-8">
          <UploadZone onBrowse={() => dispatch("browse-files")} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Total Liquidity Pool" value="2.4M" unit="USDC" accent />
            <StatTile label="24h Swap Volume" value="850K" unit="USDC" />
            <StatTile label="Active Smart Contracts" value="142" />
          </div>
        </div>

        <div className="md:col-span-4">
          <Card className="h-full">
            <div className="mb-6 flex items-start justify-between">
              <h3 className="font-headline-md text-headline-md tracking-tight text-on-surface">
                Tokenization
                <br />
                Pipeline
              </h3>
              <Icon name="tune" size={20} className="text-on-surface-variant" />
            </div>
            <Pipeline />
          </Card>
        </div>
      </div>

      <Card padding="none">
        <div className="flex items-start justify-between border-b border-outline-variant/15 p-6">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Active Factoring</h3>
            <p className="mt-1.5 font-body-md text-body-md text-on-surface-variant">
              Pending and executed atomic swaps.
            </p>
          </div>
          <Button variant="ghost" icon="filter_list" className="text-primary">
            Filter
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[
                  "Invoice ID",
                  "Counterparty",
                  "Terms",
                  "Face value",
                  "Immediate USDC",
                  "Status",
                  "Action",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={[
                      "border-b border-outline-variant/15 px-6 py-3.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant",
                      i >= 3 && i <= 4 ? "text-right" : i === 5 ? "text-center" : "text-left",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((row) => (
                <tr key={row.id} className="border-b border-outline-variant/10">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-on-surface">
                    {row.id}
                  </td>
                  <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                    {row.party}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-sm bg-surface-container-high px-2.5 py-1 font-label-sm text-label-sm tracking-wide text-on-surface">
                      {row.terms}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-on-surface">
                    ${row.face.toLocaleString()}.00
                  </td>
                  <td
                    className={[
                      "px-6 py-4 text-right font-mono text-sm font-medium",
                      row.immediate ? "text-primary" : "text-on-surface-variant",
                    ].join(" ")}
                  >
                    {row.immediate ? `${row.immediate.toLocaleString()}.00` : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.status === "minted" ? (
                      <StatusBadge kind="minted">Minted</StatusBadge>
                    ) : null}
                    {row.status === "scanning" ? (
                      <StatusBadge kind="scanning" icon="sync" animated>
                        Scanning
                      </StatusBadge>
                    ) : null}
                    {row.status === "settled" ? (
                      <StatusBadge kind="settled" icon="check_circle">
                        Settled
                      </StatusBadge>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {row.status === "minted" ? (
                      <Button
                        variant="teal"
                        size="sm"
                        disabled={swappingId === row.id}
                        onClick={() => void executeSwap(row.id, row.face)}
                      >
                        {swappingId === row.id
                          ? swapStep === "mint"
                            ? "Tokenizing…"
                            : "Swapping…"
                          : "Tokenize & Swap"}
                      </Button>
                    ) : null}
                    {row.status === "scanning" ? (
                      <Button variant="surface" size="sm" disabled>
                        Pending
                      </Button>
                    ) : null}
                    {row.status === "settled" ? (
                      <ViewTxLinks
                        mintTxHash={row.mintTxHash}
                        swapTxHash={row.swapTxHash}
                        explorerTxBase={
                          chain?.explorerTxBase ??
                          "https://stellar.expert/explorer/testnet/tx"
                        }
                      />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
