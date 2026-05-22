import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: { absolute: "Axial — Instant Capital, Invisible Compliance" },
  description:
    "Liquidity and compliance engine for Philippine MSMEs. Unlock cash from tokenized receivables on Stellar while BIR EIS submissions happen automatically.",
};

const STEPS = [
  {
    n: "01",
    title: "Payer confirms invoice",
    body: "B2B payer verifies the receivable and acknowledges the Notice of Assignment.",
  },
  {
    n: "02",
    title: "Tokenize the receivable",
    body: "Axial mints a Stellar Asset Contract (SAC) representing the verified receivable.",
  },
  {
    n: "03",
    title: "Receive instant USDC advance",
    body: "An atomic swap delivers ~85% of face value in USDC to your Stellar wallet.",
  },
  {
    n: "04",
    title: "Route statutory payroll",
    body: "A single Soroban transaction splits SSS, PhilHealth, and Pag-IBIG contributions on-chain.",
  },
  {
    n: "05",
    title: "BIR EIS filed silently",
    body: "The compliance oracle assembles 20 BIR fields, JWS-signs, and submits within T+3 — no manual input.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface selection:bg-primary/20 selection:text-primary">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-outline-variant/10 bg-surface-container-lowest/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5 md:px-[64px] md:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container text-primary shadow-[0_0_15px_rgba(190,198,224,0.1)]">
              <LogoMark size={20} className="sm:hidden" />
              <LogoMark size={22} className="hidden sm:block" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-[18px] sm:text-[20px] font-bold tracking-tight text-primary">
                Axial
              </span>
              <span className="inline-flex items-center rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/5 px-2 py-0.5 font-label-sm text-[10px] sm:text-[11px] uppercase tracking-wider text-[#2DD4BF]">
                testnet
              </span>
            </div>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-primary px-3 py-2 sm:px-4 sm:py-2.5 font-label-md text-[13px] sm:text-[14px] font-semibold text-on-primary shadow-[0_0_15px_rgba(190,198,224,0.15)] transition-all hover:opacity-90 active:scale-95"
          >
            <span className="hidden sm:inline">Open app</span>
            <span className="sm:hidden">App</span>
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 md:px-[64px] md:py-24 lg:py-32">
        <p className="mb-4 sm:mb-5 font-label-sm text-[10px] sm:text-label-sm uppercase tracking-wider text-[#2DD4BF]">
          Build on Stellar Philippines · Hackathon 2026
        </p>
        <h1 className="max-w-3xl font-headline-xl text-[32px] leading-[1.15] sm:text-[40px] md:text-headline-xl text-on-surface">
          Instant Capital,<br />Invisible Compliance.
        </h1>
        <p className="mt-5 sm:mt-6 max-w-xl font-body-md text-[15px] leading-relaxed sm:font-body-lg sm:text-body-lg text-on-surface-variant">
          Philippine MSMEs lose months of cash flow to Net 60–90 B2B payment terms.
          Axial unlocks that capital through tokenized receivables on Stellar — and
          files BIR EIS automatically, on every transaction.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 sm:gap-2.5 rounded-lg sm:rounded-xl bg-primary px-5 py-3 sm:px-6 sm:py-3.5 font-label-md text-sm sm:text-label-md font-semibold text-on-primary shadow-[0_0_20px_rgba(190,198,224,0.15)] transition-opacity hover:opacity-90"
          >
            Launch testnet demo
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
          </Link>
          <a
            href="https://github.com/Axon-Enjin/axial"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-label-md text-sm sm:text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">code</span>
            View source
          </a>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="mx-auto max-w-[1440px] px-5 pb-12 sm:px-8 sm:pb-16 md:px-[64px] md:pb-20">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <div className="rounded-lg sm:rounded-xl border border-outline-variant/10 bg-surface-container/40 p-5 sm:p-6 md:p-8 backdrop-blur-md">
            <span className="material-symbols-outlined mb-3 sm:mb-4 block text-[24px] sm:text-[28px] text-[#2DD4BF]">
              account_balance
            </span>
            <h2 className="mb-2 sm:mb-3 font-headline-md text-[20px] sm:text-headline-md text-on-surface">
              $221B locked in receivables
            </h2>
            <p className="font-body-md text-[14px] leading-relaxed sm:text-body-md text-on-surface-variant">
              Net 60–90 payment terms are the norm in Philippine B2B trade. Suppliers
              deliver, then wait months for payment — starved of the working capital
              needed to grow, hire, or stay compliant.
            </p>
          </div>
          <div className="rounded-lg sm:rounded-xl border border-outline-variant/10 bg-surface-container/40 p-5 sm:p-6 md:p-8 backdrop-blur-md">
            <span className="material-symbols-outlined mb-3 sm:mb-4 block text-[24px] sm:text-[28px] text-[#2DD4BF]">
              gavel
            </span>
            <h2 className="mb-2 sm:mb-3 font-headline-md text-[20px] sm:text-headline-md text-on-surface">
              BIR EIS mandate, T+3 window
            </h2>
            <p className="font-body-md text-[14px] leading-relaxed sm:text-body-md text-on-surface-variant">
              Phase 1 taxpayers — large taxpayers, e-commerce platforms, exporters —
              must submit electronic invoices to BIR within three calendar days of each
              transaction. Today that is a manual, error-prone process.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 sm:pb-20 md:px-[64px] md:pb-24">
        <h2 className="mb-2 font-headline-lg text-[24px] sm:text-headline-lg text-on-surface">
          How Axial works
        </h2>
        <p className="mb-8 sm:mb-12 font-body-md text-[15px] sm:font-body-lg sm:text-body-lg text-on-surface-variant">
          Five steps. One invoice. Zero manual compliance.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-5 md:gap-6">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="rounded-lg sm:rounded-xl border border-outline-variant/10 bg-surface-container/30 p-5 sm:p-6 backdrop-blur-sm"
            >
              <span className="mb-3 sm:mb-4 block font-headline-md text-[20px] sm:text-headline-md font-bold text-[#2DD4BF]/60">
                {step.n}
              </span>
              <h3 className="mb-2 font-label-md text-[12px] sm:text-label-md font-semibold uppercase tracking-wider text-on-surface">
                {step.title}
              </h3>
              <p className="font-body-md text-[13px] leading-relaxed sm:text-body-md text-on-surface-variant">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="border-t border-outline-variant/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-5 sm:gap-6 px-5 py-12 sm:px-8 sm:py-16 md:px-[64px] md:py-20 text-center">
          <h2 className="font-headline-lg text-[24px] sm:text-headline-lg text-on-surface">
            See it run on Stellar testnet.
          </h2>
          <p className="max-w-md font-body-md text-[15px] leading-relaxed sm:font-body-lg sm:text-body-lg text-on-surface-variant px-4 sm:px-0">
            Upload a real invoice, mint a receivable, execute an atomic USDC swap, and
            watch BIR EIS file itself — all in one session.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 sm:gap-2.5 rounded-lg sm:rounded-xl bg-primary px-5 py-3 sm:px-6 sm:py-3.5 font-label-md text-sm sm:text-label-md font-semibold text-on-primary shadow-[0_0_20px_rgba(190,198,224,0.15)] transition-opacity hover:opacity-90"
          >
            Open the demo
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-outline-variant/10">
        <div className="mx-auto flex max-w-[1440px] flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-5 py-5 sm:px-8 sm:py-6 md:px-[64px]">
          <span className="flex items-center gap-2 font-label-sm text-[11px] sm:text-label-sm uppercase tracking-wider text-on-surface-variant">
            <LogoMark size={14} className="sm:hidden" />
            <LogoMark size={16} className="hidden sm:block" />
            Axial · Stellar · 2026
          </span>
          <span className="font-label-sm text-[10px] sm:text-label-sm text-center sm:text-left text-on-surface-variant">
            USDC on Stellar · BIR EIS Phase 1 · Philippines
          </span>
        </div>
      </footer>
    </div>
  );
}
