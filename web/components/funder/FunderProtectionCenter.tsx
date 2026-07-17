"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatTile } from "@/components/ui/StatTile";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { FunderBookPage, FunderDealRow, FunderDealStatus } from "@/lib/funder/types";
import { OffSystemReversalPanel } from "@/components/liquidity/OffSystemReversalPanel";
import { FunderDealDrawer } from "./FunderDealDrawer";
import { FunderTxLinks } from "./FunderTxLinks";

const PAGE_SIZE = 5;

function dealStatusBadge(status: FunderDealStatus) {
  switch (status) {
    case "advanced":
      return (
        <StatusBadge kind="minted" icon="trending_up">
          Advanced
        </StatusBadge>
      );
    case "awaiting_collection":
      return (
        <StatusBadge kind="scanning" icon="schedule">
          Awaiting
        </StatusBadge>
      );
    case "repaid":
      return (
        <StatusBadge kind="settled" icon="check_circle">
          Repaid
        </StatusBadge>
      );
    case "partial":
      return (
        <StatusBadge kind="warning" icon="warning">
          Partial
        </StatusBadge>
      );
    case "leaked":
      return (
        <StatusBadge kind="error" icon="error">
          At risk
        </StatusBadge>
      );
  }
}

type Props = {
  explorerTxBase?: string;
  treasuryUsdc?: string | null;
  refreshKey?: number;
  showShareLink?: boolean;
  embedded?: boolean;
};

export function FunderProtectionCenter({
  explorerTxBase = "https://stellar.expert/explorer/public/tx",
  treasuryUsdc,
  refreshKey = 0,
  showShareLink = false,
  embedded = true,
}: Props) {
  const [book, setBook] = useState<FunderBookPage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [portalLink, setPortalLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [reversalDeal, setReversalDeal] = useState<FunderDealRow | null>(null);
  const hasLoadedRef = useRef(false);

  const loadBook = useCallback(async (targetPage: number, silent?: boolean) => {
    const background = silent ?? hasLoadedRef.current;
    if (!background) setLoading(true);
    try {
      const res = await fetch(
        `/api/funder/book?page=${targetPage}&pageSize=${PAGE_SIZE}`,
      );
      const data = (await res.json()) as FunderBookPage & { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Book failed (${res.status})`);
      setBook(data);
      setPage(data.page ?? targetPage);
      hasLoadedRef.current = true;
    } catch {
      if (!background) setBook(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBook(page);
  }, [page, loadBook, refreshKey]);

  useEffect(() => {
    if (!showShareLink) return;
    void fetch("/api/funder/portal/link")
      .then((r) => r.json())
      .then((d: { url?: string }) => setPortalLink(d.url ?? null))
      .catch(() => setPortalLink(null));
  }, [showShareLink]);

  const copyPortalLink = useCallback(async () => {
    if (!portalLink) return;
    try {
      await navigator.clipboard.writeText(portalLink);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  }, [portalLink]);

  const items = book?.items ?? [];
  const summary = book?.summary;
  const totalPages = book?.totalPages ?? 1;
  const total = book?.total ?? 0;

  return (
    <div className={embedded ? "mt-4 sm:mt-5 md:mt-6" : ""} id="funder-book">
    <Card padding="none">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 border-b border-outline-variant/15 p-4 sm:p-5 md:p-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon name="shield" size={22} className="text-primary" />
            <h3 className="font-headline-md text-[18px] sm:text-headline-md text-on-surface">
              Funder Protection Center
            </h3>
          </div>
          <p className="mt-1 font-body-md text-[13px] sm:text-body-md text-on-surface-variant">
            Treasury book — diligence checklist per advanced receivable.
          </p>
          {showShareLink && portalLink ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
                LP portal link
              </span>
              <button
                type="button"
                onClick={() => void copyPortalLink()}
                className="inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border border-outline-variant/20 bg-surface-container-high/50 px-2.5 py-1 font-mono text-[10px] sm:text-xs text-primary hover:border-primary/30"
              >
                <Icon name={linkCopied ? "check" : "link"} size={14} />
                {linkCopied ? "Copied" : portalLink.replace(/^https?:\/\//, "")}
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {embedded ? (
            <a
              href="/app/funder-portal"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant hover:text-primary"
            >
              <Icon name="open_in_new" size={16} />
              Portal
            </a>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => void loadBook(page, true)}
          >
            <Icon name="refresh" size={16} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-outline-variant/10 p-4 sm:grid-cols-3 sm:p-5 md:p-6">
        <StatTile
          label="Treasury USDC"
          value={treasuryUsdc?.split(".")[0] ?? "—"}
          unit={treasuryUsdc ? "USDC" : ""}
          accent
        />
        <StatTile
          label="Active deals"
          value={String(summary?.totalDeals ?? "—")}
          unit={
            summary?.awaitingCollection
              ? `${summary.awaitingCollection} awaiting`
              : "in book"
          }
        />
        <StatTile
          label="At risk"
          value={String(summary?.atRisk ?? 0)}
          unit={summary?.repaid ? `${summary.repaid} repaid` : "deals"}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-outline-variant/15 bg-surface-container-low/40">
              <th className="px-3 py-2.5 sm:px-4 md:px-6 font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
                Receivable
              </th>
              <th className="px-3 py-2.5 sm:px-4 md:px-6 font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
                Payer
              </th>
              <th className="px-3 py-2.5 sm:px-4 md:px-6 text-right font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
                Face
              </th>
              <th className="px-3 py-2.5 sm:px-4 md:px-6 text-right font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
                Advance
              </th>
              <th className="px-3 py-2.5 sm:px-4 md:px-6 text-center font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
                Status
              </th>
              <th className="px-3 py-2.5 sm:px-4 md:px-6 text-right font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
                On-chain
              </th>
              <th className="px-3 py-2.5 sm:px-4 md:px-6 text-center font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
                Diligence
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <tr key={`funder-skel-${i}`} className="border-b border-outline-variant/10">
                  <td colSpan={7} className="px-3 py-3 md:px-6">
                    <div className="h-4 max-w-md animate-pulse rounded bg-surface-container-high" />
                  </td>
                </tr>
              ))
            ) : null}
            {!loading && items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 md:px-6 text-center font-body-md text-[13px] text-on-surface-variant"
                >
                  No advanced deals yet — tokenize and swap an invoice to populate the funder book.
                </td>
              </tr>
            ) : null}
            {!loading &&
              items.map((row: FunderDealRow) => {
                const expanded = expandedId === row.receivableId;
                const diligenceOk =
                  row.diligence.payerKybOk &&
                  row.diligence.payerConfirmedOk &&
                  row.diligence.noaAckOk;
                return (
                  <Fragment key={row.receivableId}>
                    <tr className="border-b border-outline-variant/10">
                      <td className="px-3 py-3 sm:px-4 md:px-6">
                        <button
                          type="button"
                          className="font-mono text-[11px] sm:text-xs text-on-surface hover:text-primary text-left"
                          onClick={() =>
                            setExpandedId((id) =>
                              id === row.receivableId ? null : row.receivableId,
                            )
                          }
                        >
                          {row.receivableId}
                        </button>
                      </td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 font-body-md text-[12px] sm:text-body-md text-on-surface-variant">
                        {row.party}
                      </td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 text-right font-mono text-[11px] sm:text-xs text-on-surface whitespace-nowrap">
                        ₱{row.faceAmount.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 text-right font-mono text-[11px] sm:text-xs text-primary whitespace-nowrap">
                        {row.advanceAmount != null
                          ? `₱${row.advanceAmount.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {dealStatusBadge(row.dealStatus)}
                          {row.dealStatus === "leaked" || row.dealStatus === "partial" ? (
                            <button
                              type="button"
                              className="font-label-sm text-[10px] text-[#2DD4BF] hover:underline"
                              onClick={() => setReversalDeal(row)}
                            >
                              Re-route to lockbox
                            </button>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 text-right">
                        <FunderTxLinks
                          mintTxHash={row.mintTxHash}
                          swapTxHash={row.swapTxHash}
                          settlementTxHash={row.settlementTxHash}
                          explorerTxBase={explorerTxBase}
                        />
                      </td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId((id) =>
                              id === row.receivableId ? null : row.receivableId,
                            )
                          }
                          className={[
                            "inline-flex items-center gap-1 font-label-sm text-[10px] sm:text-label-sm",
                            diligenceOk ? "text-[#2DD4BF]" : "text-on-surface-variant",
                          ].join(" ")}
                        >
                          <Icon
                            name={diligenceOk ? "verified" : "info"}
                            size={16}
                          />
                          {diligenceOk ? "Clear" : "Review"}
                        </button>
                      </td>
                    </tr>
                    {expanded ? <FunderDealDrawer deal={row} /> : null}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {total > PAGE_SIZE ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-outline-variant/10 px-3 py-2.5 sm:px-4 md:px-6">
          <p className="font-label-sm text-[10px] sm:text-label-sm text-on-surface-variant">
            Page {page} of {totalPages} · {total} deals
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </Card>

      {reversalDeal ? (
        <OffSystemReversalPanel
          invoiceId={reversalDeal.receivableId}
          party={reversalDeal.party}
          facePhp={reversalDeal.faceAmount}
          onCancel={() => setReversalDeal(null)}
          onDone={() => {
            setReversalDeal(null);
            void loadBook(page, true);
          }}
        />
      ) : null}
    </div>
  );
}
