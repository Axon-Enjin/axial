"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { InvoiceTrustRow } from "@/components/liquidity/InvoiceTrustRow";
import { PayerPanel } from "@/components/liquidity/PayerPanel";
import { TokenizationPipeline } from "@/components/liquidity/TokenizationPipeline";
import { useApp } from "@/components/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { StatTile } from "@/components/ui/StatTile";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { FactoringInvoiceClient } from "@/lib/invoices/types";
import { isFundable, trustHint } from "@/lib/msme/invoice-trust";
import {
  pipelineModalContent,
  type PipelineStage,
} from "@/lib/liquidity/pipeline-stage";

type Invoice = FactoringInvoiceClient;

const PAGE_SIZE = 5;

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
    "inline-flex items-center gap-1 bg-transparent font-label-md text-[10px] sm:text-[11px] md:text-label-md text-on-surface-variant hover:text-primary underline-offset-2 hover:underline";

  if (!mintTxHash && !swapTxHash) {
    return (
      <span className="font-label-sm text-[10px] sm:text-[11px] md:text-label-sm text-outline" title="No on-chain txs for this row">
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
          <Icon name="receipt_long" size={14} className="sm:hidden" />
          <Icon name="receipt_long" size={16} className="hidden sm:block" />
          <span className="whitespace-nowrap">Mint TX</span>
        </a>
      ) : null}
      {swapTxHash ? (
        <a
          href={txExplorerUrl(explorerTxBase, swapTxHash)}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          <Icon name="swap_horiz" size={14} className="sm:hidden" />
          <Icon name="swap_horiz" size={16} className="hidden sm:block" />
          <span className="whitespace-nowrap">Swap TX</span>
        </a>
      ) : null}
    </span>
  );
}

const ACCEPT_INVOICE = "image/png,image/jpeg,image/webp,application/pdf";

function UploadZone({
  parsing,
  parseError,
  onFiles,
  onTrySample,
}: {
  parsing: boolean;
  parseError: string | null;
  onFiles: (files: FileList | File[]) => void;
  onTrySample: () => void;
}) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | File[] | null) => {
    if (!list?.length || parsing) return;
    onFiles(list);
  };

  return (
    <Card padding="lg">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_INVOICE}
        className="sr-only"
        disabled={parsing}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={[
          "flex flex-col items-center justify-center rounded-lg sm:rounded-xl border-2 border-dashed px-4 py-8 sm:px-6 sm:py-10 md:py-12 text-center transition-colors duration-200",
          hover ? "border-primary/50" : "border-outline-variant/30",
          parsing ? "opacity-70" : "",
        ].join(" ")}
      >
        <div
          className={[
            "mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border transition-all duration-200",
            hover
              ? "border-primary/30 bg-primary/10"
              : "border-outline-variant/40 bg-surface-variant/50",
          ].join(" ")}
        >
          <Icon
            name={parsing ? "document_scanner" : "upload_file"}
            size={28}
            className={`sm:hidden ${hover || parsing ? "text-primary" : "text-on-surface-variant"}`}
          />
          <Icon
            name={parsing ? "document_scanner" : "upload_file"}
            size={36}
            className={`hidden sm:block ${hover || parsing ? "text-primary" : "text-on-surface-variant"}`}
          />
        </div>
        <h3 className="mb-2 font-headline-md text-[18px] sm:text-headline-md tracking-tight text-on-surface">
          Upload B2B Invoice
        </h3>
        <p className="mb-4 sm:mb-6 max-w-md font-body-md text-[13px] sm:text-body-md text-on-surface-variant px-2">
          Drop PNG, JPEG, or PDF — OCR extracts invoice ID, buyer, amount, and terms into
          Active Factoring.
        </p>
        {parseError ? (
          <p className="mb-4 max-w-md font-body-md text-[13px] sm:text-body-md text-red-400/90 px-2">
            {parseError}
          </p>
        ) : null}
        <Button
          variant="secondary"
          disabled={parsing}
          onClick={() => inputRef.current?.click()}
          className="w-full sm:w-auto"
        >
          {parsing ? "Reading invoice…" : "Browse Files"}
        </Button>
        <p className="mt-3 sm:mt-4 font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant px-2">
          On Vercel, use{" "}
          <button
            type="button"
            disabled={parsing}
            onClick={onTrySample}
            className="text-[#2DD4BF] hover:underline disabled:opacity-50"
          >
            sample invoice
          </button>
          {" · "}
          <a
            href="/samples/invoices/invoice-inv-2023-8901.pdf"
            download="axial-demo-invoice.pdf"
            className="text-[#2DD4BF] hover:underline"
          >
            demo PDF
          </a>
          {" · "}
          <a
            href="/samples/invoices/invoice-inv-2023-8918.png"
            download="axial-demo-invoice-8918.png"
            className="text-[#2DD4BF] hover:underline"
          >
            demo PNG
          </a>
          {" "}(INV-2023-8918 · OCR)
        </p>
      </div>
    </Card>
  );
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
  const { dispatch, setLastSwapAdvancePhp, setProgressToast, dismissToast, freighterPublicKey } =
    useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storeBackend, setStoreBackend] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [swapStep, setSwapStep] = useState<"idle" | "mint" | "swap">("idle");
  const [chain, setChain] = useState<ChainStatus | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("idle");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    book?: { totalInvoices: number; totalFacePhp: number; settledCount: number };
    treasury?: { funderUsdc: string | null };
    contractsDeployed?: number;
  } | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (pipelineStage === "idle") {
      dismissToast();
      return;
    }
    const step = pipelineModalContent(pipelineStage);
    if (!step?.loading) return;
    setProgressToast(step.sub, {
      progress: step.progress,
      stepLabel: `Step ${step.step} of 3 · ${step.title}`,
    });
  }, [pipelineStage, setProgressToast, dismissToast]);

  const loadInvoices = useCallback(async (targetPage: number, silent?: boolean) => {
    const background = silent ?? hasLoadedRef.current;
    if (background) {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }
    try {
      const res = await fetch(
        `/api/invoices?page=${targetPage}&pageSize=${PAGE_SIZE}`,
      );
      const data = (await res.json()) as {
        items?: Invoice[];
        page?: number;
        total?: number;
        totalPages?: number;
        store?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? `List failed (${res.status})`);
      }
      setInvoices(data.items ?? []);
      setPage(data.page ?? targetPage);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setStoreBackend(data.store ?? null);
      hasLoadedRef.current = true;
    } catch {
      if (!background) {
        setInvoices([]);
      }
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  const replaceInvoiceInList = useCallback((updated: Invoice) => {
    setInvoices((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
  }, []);

  useEffect(() => {
    void loadInvoices(page);
  }, [page, loadInvoices]);

  const finishParsed = useCallback(
    async (parsed: {
      invoiceId: string;
      face: number;
      confidence: string;
    }) => {
      setPipelineStage("parsed");
      if (page === 1) {
        await loadInvoices(1, true);
      } else {
        setPage(1);
      }
      dispatch(
        "invoice-parsed",
        `${parsed.invoiceId} · ₱${parsed.face.toLocaleString()} · ${parsed.confidence} confidence`,
      );
    },
    [dispatch, loadInvoices, page],
  );

  const loadSampleInvoice = useCallback(async () => {
    setParsing(true);
    setParseError(null);
    setPipelineStage("reading");
    try {
      const res = await fetch("/api/invoices/parse-sample?id=8901", {
        method: "POST",
      });
      const data = (await res.json()) as {
        parsed?: {
          invoiceId: string;
          face: number;
          confidence: string;
        };
        error?: string;
      };
      if (!res.ok || !data.parsed) {
        setParseError(data.error ?? `Sample import failed (${res.status})`);
        setPipelineStage("idle");
        dismissToast();
        return;
      }
      await finishParsed(data.parsed);
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Sample import failed",
      );
      setPipelineStage("idle");
      dismissToast();
    } finally {
      setParsing(false);
    }
  }, [dismissToast, finishParsed]);

  const parseInvoiceFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = files[0];
      if (!file) return;

      setParsing(true);
      setParseError(null);
      setPipelineStage("reading");

      try {
        const { compressImageForUpload } = await import(
          "@/lib/invoices/compress-upload"
        );
        const uploadFile = await compressImageForUpload(file);
        const body = new FormData();
        body.append("file", uploadFile);

        const res = await fetch("/api/invoices/parse", { method: "POST", body });
        let data: {
          parsed?: {
            invoiceId: string;
            party: string;
            terms: string;
            face: number;
            confidence: string;
          };
          error?: string;
        };
        try {
          data = (await res.json()) as typeof data;
        } catch {
          setParseError(`Server error (${res.status}) — check Vercel logs`);
          setPipelineStage("idle");
          dismissToast();
          return;
        }

        if (!res.ok || !data.parsed) {
          setParseError(data.error ?? `Parse failed (${res.status})`);
          setPipelineStage("idle");
          dismissToast();
          return;
        }

        await finishParsed(data.parsed);
      } catch (err) {
        setParseError(
          err instanceof Error
            ? err.message
            : "Could not read invoice — try sample invoice or a PDF.",
        );
        setPipelineStage("idle");
        dismissToast();
      } finally {
        setParsing(false);
      }
    },
    [dismissToast, finishParsed],
  );

  useEffect(() => {
    void fetch("/api/dashboard/summary")
      .then((r) => r.json())
      .then((d) => setSummary(d))
      .catch(() => setSummary(null));
    void fetch("/api/soroban/status")
      .then((r) => r.json())
      .then((data: ChainStatus) => setChain(data))
      .catch(() => setChain(null));
  }, []);

  const confirmPayerDemo = useCallback(
    async (id: string) => {
      setConfirmingId(id);
      try {
        const res = await fetch(`/api/invoices/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "confirm_payer" }),
        });
        const data = (await res.json()) as { invoice?: Invoice; error?: string };
        if (!res.ok || !data.invoice) {
          dispatch("swap-executed", data.error ?? "Confirm payer failed");
          return;
        }
        replaceInvoiceInList(data.invoice);
        dispatch("payer-confirmed", id);
      } finally {
        setConfirmingId(null);
      }
    },
    [dispatch, replaceInvoiceInList],
  );

  const markCollectedDemo = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/invoices/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_collected" }),
      });
      const data = (await res.json()) as { invoice?: Invoice };
      if (res.ok && data.invoice) {
        replaceInvoiceInList(data.invoice);
      }
    },
    [replaceInvoiceInList],
  );

  const executeSwap = useCallback(
    async (id: string, face: number) => {
      const row = invoices.find((r) => r.id === id);
      if (!row || !isFundable(row.trust)) {
        dispatch("swap-executed", "Confirm payer and NoA before funding.");
        return;
      }

      setSwappingId(id);
      setSwapStep("mint");
      setPipelineStage("minting");
      const chainInvoiceId = `${id}-${Date.now()}`;
      // If Freighter is connected, route assets to the user's self-custodied wallet
      const msmePublic = freighterPublicKey ?? undefined;

      try {
        const mintRes = await fetch("/api/receivable/mint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: chainInvoiceId, faceAmount: face, msmePublic }),
        });
        const mintData = (await mintRes.json()) as {
          mode?: string;
          txHash?: string;
          error?: string;
        };

        if (!mintRes.ok) {
          dispatch("swap-executed", mintData.error ?? `Tokenize failed (${mintRes.status})`);
          setPipelineStage("parsed");
          return;
        }

        setSwapStep("swap");
        setPipelineStage("swapping");
        const res = await fetch("/api/swap/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: chainInvoiceId, faceAmount: face, sourceInvoiceId: id, msmePublic }),
        });
        const data = (await res.json()) as {
          mode?: string;
          advanceAmount?: number;
          txHash?: string;
          error?: string;
        };

        if (!res.ok) {
          dispatch("swap-executed", data.error ?? `Swap failed (${res.status})`);
          setPipelineStage("parsed");
          return;
        }

        setPipelineStage("complete");
        const swapTx = data.mode === "on-chain" && data.txHash ? data.txHash : "";
        const mintTx =
          mintData.mode === "on-chain" && mintData.txHash ? mintData.txHash : "";
        const advancePhp = data.advanceAmount ?? row.immediate ?? 0;
        if (advancePhp > 0) {
          setLastSwapAdvancePhp(advancePhp);
        }

        const settleRes = await fetch(`/api/invoices/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "settle",
            immediate: advancePhp || row.immediate || 0,
            mintTxHash: mintTx || null,
            swapTxHash: swapTx || null,
          }),
        });
        const settleData = (await settleRes.json()) as { invoice?: Invoice };
        setExpandedId(id);
        if (page === 1 && settleData.invoice) {
          replaceInvoiceInList(settleData.invoice);
          void loadInvoices(1, true);
        } else {
          setPage(1);
        }
        const payload =
          swapTx && mintTx
            ? `tx:${id}|${mintTx}|${swapTx}`
            : swapTx
              ? `tx:${id}|${swapTx}`
              : id;
        dispatch("swap-executed", payload);
      } catch {
        setPipelineStage("parsed");
      } finally {
        setSwappingId(null);
        setSwapStep("idle");
      }
    },
    [dispatch, invoices, setLastSwapAdvancePhp, loadInvoices, page, replaceInvoiceInList],
  );

  return (
    <main className="mx-auto flex max-w-container-max flex-col gap-4 sm:gap-5 md:gap-gutter px-4 py-5 sm:px-6 sm:py-6 md:px-margin-desktop md:py-7">
      {chain ? (
        <div
          className={[
            "flex flex-wrap items-center gap-2 rounded-lg sm:rounded-xl border px-3 py-2 sm:px-4 sm:py-2.5 font-label-sm text-[11px] sm:text-label-sm",
            chain.onChainReady
              ? "border-[#2DD4BF]/30 bg-[#2DD4BF]/10 text-[#2DD4BF]"
              : "border-outline-variant/30 bg-surface-container-high/60 text-on-surface-variant",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-[14px] sm:text-[16px]">hub</span>
          <span className="flex-1 min-w-0 break-words">
            {chain.onChainReady && chain.receivableReady
              ? `Stellar ${chain.network} — mint + swap on-chain`
              : chain.onChainReady
                ? `Stellar ${chain.network} — swap on-chain`
                : `Stellar ${chain.network} — demo mode`}
          </span>
          {chain.swapContractId ? (
            <a
              href={`${chain.explorerContractBase}/${chain.swapContractId}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] sm:text-xs underline opacity-80 hover:opacity-100 shrink-0"
            >
              {chain.swapContractId.slice(0, 6)}…
            </a>
          ) : null}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-gutter md:grid-cols-12">
        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 md:col-span-8">
          <UploadZone
            parsing={parsing}
            parseError={parseError}
            onFiles={(files) => void parseInvoiceFiles(files)}
            onTrySample={() => void loadSampleInvoice()}
          />
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
            <StatTile
              label="Treasury USDC"
              value={summary?.treasury?.funderUsdc?.split(".")[0] ?? "—"}
              unit={summary?.treasury?.funderUsdc ? "USDC" : ""}
              accent
            />
            <StatTile
              label="Factoring book"
              value={
                summary?.book?.totalFacePhp
                  ? `${(summary.book.totalFacePhp / 1_000_000).toFixed(1)}M`
                  : "—"
              }
              unit="PHP face"
            />
            <StatTile
              label="Soroban contracts"
              value={String(summary?.contractsDeployed ?? 0)}
              unit={chain?.network ?? "testnet"}
            />
          </div>
        </div>

        <div className="md:col-span-4">
          <Card className="h-full">
            <div className="mb-4 sm:mb-6 flex items-center justify-between">
              <h3 className="font-headline-md text-[18px] sm:text-headline-md tracking-tight text-on-surface">
                Tokenization Pipeline
              </h3>
              <Icon name="tune" size={20} className="text-on-surface-variant" />
            </div>
            <TokenizationPipeline stage={pipelineStage} />
          </Card>
        </div>
      </div>

      <PayerPanel onPayerRegistered={() => void loadInvoices(page, true)} />

      <Card padding="none">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 border-b border-outline-variant/15 p-4 sm:p-5 md:p-6">
          <div className="flex-1 min-w-0">
            <h3 className="font-headline-md text-[18px] sm:text-headline-md text-on-surface">Active Factoring</h3>
            <p className="mt-1 font-body-md text-[13px] sm:text-body-md text-on-surface-variant">
              Confirm payer → tokenize → collect at maturity.
            </p>
            {storeBackend ? (
              <p className="mt-1 font-label-sm text-[10px] sm:text-label-sm text-outline">
                Store: {storeBackend} · {total} invoices
              </p>
            ) : null}
          </div>
          <Link
            href="/app/settings"
            className="font-label-sm text-[11px] sm:text-label-sm text-on-surface-variant hover:text-[#2DD4BF] shrink-0"
          >
            PHP ramp
          </Link>
        </div>
        <div className="relative overflow-x-auto">
          {refreshing ? (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-surface-container-high"
              aria-hidden
            >
              <div className="h-full w-1/3 animate-pulse rounded-full bg-[#2DD4BF]/80" />
            </div>
          ) : null}
          <table
            className={[
              "w-full border-collapse transition-opacity duration-200 min-w-[800px]",
              refreshing ? "opacity-80" : "opacity-100",
            ].join(" ")}
          >
            <thead>
              <tr>
                {[
                  "Invoice ID",
                  "Counterparty",
                  "Terms",
                  "Face value",
                  "Advance",
                  "Status",
                  "Action",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={[
                      "border-b border-outline-variant/15 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-3.5 font-label-sm text-[10px] sm:text-[11px] md:text-label-sm uppercase tracking-wider text-on-surface-variant whitespace-nowrap",
                      i >= 3 && i <= 4 ? "text-right" : i === 5 || i === 6 ? "text-center" : "text-left",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-outline-variant/10">
                    <td colSpan={7} className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="h-4 max-w-md animate-pulse rounded bg-surface-container-high" />
                    </td>
                  </tr>
                ))
              ) : null}
              {!initialLoading && invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 sm:px-4 sm:py-10 md:px-6 md:py-12 text-center font-body-md text-[13px] sm:text-body-md text-on-surface-variant"
                  >
                    No invoices yet — upload one or seed demo data.
                  </td>
                </tr>
              ) : null}
              {!initialLoading &&
                invoices.map((row) => {
                const showLockbox = expandedId === row.id && row.trust.lockboxAddress;
                return (
                <Fragment key={row.id}>
                  <tr className="border-b border-outline-variant/10">
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <button
                        type="button"
                        className="group flex flex-col items-start gap-0.5 text-left"
                        onClick={() =>
                          setExpandedId((id) => (id === row.id ? null : row.id))
                        }
                        disabled={!row.trust.lockboxAddress}
                      >
                        <span className="font-mono text-[11px] sm:text-xs md:text-sm font-medium text-on-surface group-hover:text-primary">
                          {row.id}
                        </span>
                        {row.trust.lockboxAddress ? (
                          <span className="font-label-sm text-[9px] sm:text-[10px] md:text-label-sm text-on-surface-variant">
                            {expandedId === row.id ? "Hide lockbox" : "Lockbox"}
                          </span>
                        ) : null}
                      </button>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="font-body-md text-[12px] sm:text-[13px] md:text-body-md text-on-surface-variant">
                        {row.party}
                      </div>
                      <div className="mt-0.5 font-label-sm text-[9px] sm:text-[10px] md:text-label-sm text-outline">
                        {trustHint(row.trust)}
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <span className="rounded-sm bg-surface-container-high px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-2.5 md:py-1 font-label-sm text-[10px] sm:text-[11px] md:text-label-sm tracking-wide text-on-surface whitespace-nowrap">
                        {row.terms}
                      </span>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-right font-mono text-[11px] sm:text-xs md:text-sm text-on-surface whitespace-nowrap">
                      ₱{row.face.toLocaleString()}.00
                    </td>
                    <td
                      className={[
                        "px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-right font-mono text-[11px] sm:text-xs md:text-sm font-medium whitespace-nowrap",
                        row.immediate ? "text-primary" : "text-on-surface-variant",
                      ].join(" ")}
                    >
                      {row.immediate ? `₱${row.immediate.toLocaleString()}.00` : "—"}
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4 text-center">
                      {row.status === "fundable" ? (
                        <StatusBadge kind="minted">Ready</StatusBadge>
                      ) : null}
                      {row.status === "awaiting_payer" ? (
                        <StatusBadge kind="scanning">Pending</StatusBadge>
                      ) : null}
                      {row.status === "settled" ? (
                        <StatusBadge kind="settled" icon="check_circle">
                          Funded
                        </StatusBadge>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-3.5 md:px-6 md:py-4">
                      <div className="flex items-center justify-center">
                        {row.status === "fundable" ? (
                          <Button
                            variant="teal"
                            size="sm"
                            disabled={swappingId === row.id}
                            onClick={() => void executeSwap(row.id, row.face)}
                            className="whitespace-nowrap"
                          >
                            {swappingId === row.id
                              ? swapStep === "mint"
                                ? "Tokenizing…"
                                : "Swapping…"
                              : "Tokenize & Swap"}
                          </Button>
                        ) : null}
                        {row.status === "awaiting_payer" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={confirmingId === row.id}
                            onClick={() => void confirmPayerDemo(row.id)}
                            className="whitespace-nowrap"
                          >
                            {confirmingId === row.id ? "Confirming…" : "Confirm payer"}
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
                      </div>
                    </td>
                  </tr>
                  {showLockbox ? (
                    <InvoiceTrustRow
                      trust={row.trust}
                      onMarkCollected={() => void markCollectedDemo(row.id)}
                    />
                  ) : null}
                </Fragment>
              );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-outline-variant/10 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-3">
          <p className="font-label-sm text-[10px] sm:text-[11px] md:text-label-sm text-on-surface-variant">
            Page {page} of {totalPages}
            {total > 0 ? ` · showing ${invoices.length} of ${total}` : ""}
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || initialLoading || refreshing}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex-1 sm:flex-initial"
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || initialLoading || refreshing}
              onClick={() => setPage((p) => p + 1)}
              className="flex-1 sm:flex-initial"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
