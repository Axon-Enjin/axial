import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Axial — Instant Capital, Invisible Compliance",
  description:
    "Liquidity and compliance engine for Philippine MSMEs. Unlock cash from tokenized receivables on Stellar while BIR EIS submissions happen automatically.",
};

const STEPS = [
  {
    n: "01",
    title: "Upload invoice",
    body: "Drop a PDF or XML. OCR extracts the invoice number, buyer, amount, and due date.",
  },
  {
    n: "02",
    title: "Tokenize the receivable",
    body: "Axial mints a Stellar Asset Contract (SAC) representing the verified receivable.",
  },
  {
    n: "03",
    title: "Receive an instant USDC advance",
    body: "An atomic swap delivers 85% of face value in USDC directly to your Stellar wallet.",
  },
  {
    n: "04",
    title: "Route statutory payroll",
    body: "A single transaction splits SSS, PhilHealth, and Pag-IBIG contributions on-chain.",
  },
  {
    n: "05",
    title: "BIR EIS filed silently",
    body: "The compliance oracle assembles 20 BIR fields, JWS-signs the payload, and submits to BIR within T+3 — no manual input.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface selection:bg-primary/20 selection:text-primary">
      {/* ── Nav ── */}
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-[64px] py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container shadow-[0_0_15px_rgba(190,198,224,0.08)]">
            <span className="material-symbols-outlined text-[18px] text-primary">
              architecture
            </span>
          </div>
          <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
            Axial
          </span>
          <span className="ml-1 inline-flex items-center rounded-full border border-[#2DD4BF]/30 px-1.5 py-px font-label-sm text-label-sm uppercase tracking-wider text-[#2DD4BF]">
            testnet
          </span>
        </div>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 rounded-xl bg-surface-container border border-outline-variant/20 px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
        >
          Open app
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-[1440px] px-[64px] py-20 md:py-28">
        <p className="mb-5 font-label-sm text-label-sm uppercase tracking-wider text-[#2DD4BF]">
          Build on Stellar Philippines · Hackathon 2026
        </p>
        <h1 className="max-w-3xl font-headline-xl text-headline-xl text-on-surface">
          Instant Capital,<br />Invisible Compliance.
        </h1>
        <p className="mt-6 max-w-xl font-body-lg text-body-lg text-on-surface-variant">
          Philippine MSMEs lose months of cash flow to Net 60–90 B2B payment terms.
          Axial unlocks that capital through tokenized receivables on Stellar — and
          files BIR EIS automatically, on every transaction.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/app"
            className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 font-label-md text-label-md font-semibold text-on-primary shadow-[0_0_20px_rgba(190,198,224,0.15)] transition-opacity hover:opacity-90"
          >
            Launch testnet demo
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <a
            href="https://github.com/Axon-Enjin/axial"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">code</span>
            View source
          </a>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="mx-auto max-w-[1440px] px-[64px] pb-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-outline-variant/10 bg-surface-container/40 p-8 backdrop-blur-md">
            <span className="material-symbols-outlined mb-4 block text-[28px] text-[#2DD4BF]">
              account_balance
            </span>
            <h2 className="mb-3 font-headline-md text-headline-md text-on-surface">
              $221B locked in receivables
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Net 60–90 payment terms are the norm in Philippine B2B trade. Suppliers
              deliver, then wait months for payment — starved of the working capital
              needed to grow, hire, or stay compliant.
            </p>
          </div>
          <div className="rounded-xl border border-outline-variant/10 bg-surface-container/40 p-8 backdrop-blur-md">
            <span className="material-symbols-outlined mb-4 block text-[28px] text-[#2DD4BF]">
              gavel
            </span>
            <h2 className="mb-3 font-headline-md text-headline-md text-on-surface">
              BIR EIS mandate, T+3 window
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Phase 1 taxpayers — large taxpayers, e-commerce platforms, exporters —
              must submit electronic invoices to BIR within three calendar days of each
              transaction. Today that is a manual, error-prone process.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-[1440px] px-[64px] pb-24">
        <h2 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
          How Axial works
        </h2>
        <p className="mb-12 font-body-lg text-body-lg text-on-surface-variant">
          Five steps. One invoice. Zero manual compliance.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="rounded-xl border border-outline-variant/10 bg-surface-container/30 p-6 backdrop-blur-sm"
            >
              <span className="mb-4 block font-headline-md text-headline-md font-bold text-[#2DD4BF]/60">
                {step.n}
              </span>
              <h3 className="mb-2 font-label-md text-label-md font-semibold uppercase tracking-wider text-on-surface">
                {step.title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="border-t border-outline-variant/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-[64px] py-20 text-center">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            See it run on Stellar testnet.
          </h2>
          <p className="max-w-md font-body-lg text-body-lg text-on-surface-variant">
            Upload a real invoice, mint a receivable, execute an atomic USDC swap, and
            watch BIR EIS file itself — all in one session.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 font-label-md text-label-md font-semibold text-on-primary shadow-[0_0_20px_rgba(190,198,224,0.15)] transition-opacity hover:opacity-90"
          >
            Open the demo
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-outline-variant/10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[64px] py-6">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Axial · Hackathon build · Stellar testnet · May 2026
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            USDC on Stellar · BIR EIS Phase 1 · Philippines
          </span>
        </div>
      </footer>
    </div>
  );
}
