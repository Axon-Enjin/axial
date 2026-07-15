import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import {
  CANVAS,
  ECONOMICS_ENGINE_A,
  ECONOMICS_ENGINE_B,
  FEASIBILITY_ROWS,
  LIVE_NOW,
  NAV_LINKS,
  NEXT_UP,
  STEPS,
  TEAM,
} from "@/lib/landing/startup-content";

export const metadata: Metadata = {
  title: { absolute: "Axial — Instant Capital, Effortless Compliance" },
  description:
    "Liquidity and compliance infrastructure for Philippine MSMEs. Unlock cash from confirmed receivables on Stellar Mainnet while BIR EIS filings are prepared for one-click review.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 border-b border-outline-variant/10 bg-surface-container-lowest/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8 md:px-[64px]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container text-primary">
              <LogoMark size={20} />
            </div>
            <span className="font-headline-md text-[18px] sm:text-[20px] font-bold tracking-tight text-primary">
              Axial
            </span>
          </div>
          <nav className="hidden lg:flex items-center gap-5">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-label-sm text-[12px] text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 sm:px-4 sm:py-2.5 font-label-md text-[13px] sm:text-[14px] font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Open product
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-outline-variant/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(45,212,191,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(190,198,224,0.08), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 md:px-[64px] md:py-28">
          <p className="mb-4 font-label-sm text-[10px] sm:text-label-sm uppercase tracking-wider text-[#2DD4BF]">
            Live on Stellar Mainnet · Philippines-first
          </p>
          <h1 className="max-w-4xl font-headline-xl text-[36px] leading-[1.1] sm:text-[48px] md:text-[56px] text-on-surface">
            Axial
          </h1>
          <p className="mt-3 max-w-2xl font-headline-lg text-[22px] sm:text-[28px] text-on-surface/90">
            Instant Capital, Effortless Compliance.
          </p>
          <p className="mt-6 max-w-2xl font-body-md text-[15px] leading-relaxed sm:text-body-lg text-on-surface-variant">
            Infrastructure for Philippine MSMEs: unlock working capital from confirmed B2B
            receivables on Stellar, and prepare BIR EIS plus statutory payroll for human review —
            on one pipeline.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-label-md font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Enter the product
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <a
              href="#canvas"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/30 px-6 py-3.5 font-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Business canvas
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:px-[64px] md:py-20 scroll-mt-24">
        <h2 className="mb-2 font-headline-lg text-[24px] sm:text-headline-lg text-on-surface">
          The structural gap
        </h2>
        <p className="mb-8 max-w-2xl font-body-md text-on-surface-variant">
          Philippine MSMEs are not failing because they are unprofitable — they are cash-trapped and
          compliance-loaded at the same time.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-outline-variant/10 bg-surface-container/40 p-6 md:p-8">
            <span className="material-symbols-outlined mb-3 block text-[28px] text-[#FB7185]">
              account_balance
            </span>
            <h3 className="mb-2 font-headline-md text-[20px] text-on-surface">Liquidity trap</h3>
            <p className="font-body-md text-[14px] leading-relaxed text-on-surface-variant">
              Enterprise buyers enforce <span className="text-on-surface">Net 60–90</span> while
              labor law demands <span className="text-on-surface">bi-weekly payroll</span>. Cash sits
              in receivables; payroll does not wait.
            </p>
            <p className="mt-3 font-label-sm text-[11px] text-[#2DD4BF]">
              ~$221B funding demand vs ~$15B formal supply
            </p>
          </div>
          <div className="rounded-xl border border-outline-variant/10 bg-surface-container/40 p-6 md:p-8">
            <span className="material-symbols-outlined mb-3 block text-[28px] text-[#F59E0B]">
              gavel
            </span>
            <h3 className="mb-2 font-headline-md text-[20px] text-on-surface">Compliance burden</h3>
            <p className="font-body-md text-[14px] leading-relaxed text-on-surface-variant">
              BIR Electronic Invoicing — deadline{" "}
              <span className="text-on-surface">December 31, 2026</span> — requires JSON + JWS within
              T+3. Most MSMEs still run statutory payroll on spreadsheets.
            </p>
            <p className="mt-3 font-label-sm text-[11px] text-[#2DD4BF]">
              Mandate urgency pulls adoption without paid acquisition
            </p>
          </div>
        </div>
      </section>

      {/* Product */}
      <section id="product" className="border-y border-outline-variant/10 bg-surface-container/20">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:px-[64px] md:py-20 scroll-mt-24">
          <h2 className="mb-2 font-headline-lg text-[24px] sm:text-headline-lg text-on-surface">
            One pipeline.{" "}
            <span className="text-[#2DD4BF]">Liquidity in. Compliance out.</span>
          </h2>
          <p className="mb-10 max-w-3xl font-body-md text-on-surface-variant">
            Confirmed-invoice financing on Stellar Mainnet, with a Compliance Co-Pilot that prepares
            filings for your approval — not silent auto-submission.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-14">
            {[
              {
                icon: "bolt",
                title: "Instant capital",
                body: "Tokenize a payer-confirmed receivable. Advance ~85% in USDC via atomic swap. No collateral.",
              },
              {
                icon: "call_split",
                title: "Statutory payroll",
                body: "Route SSS, PhilHealth, and Pag-IBIG in one Soroban transaction.",
              },
              {
                icon: "fact_check",
                title: "Effortless BIR EIS",
                body: "Oracle maps 20 fields and JWS-signs. You review and submit within T+3.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/60 p-6"
              >
                <span className="material-symbols-outlined mb-3 block text-[28px] text-[#2DD4BF]">
                  {c.icon}
                </span>
                <h3 className="mb-2 font-headline-sm text-[16px] text-on-surface">{c.title}</h3>
                <p className="font-body-md text-[13px] text-on-surface-variant">{c.body}</p>
              </div>
            ))}
          </div>

          <h3 className="mb-6 font-headline-md text-[18px] text-on-surface">How it works</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/50 p-5"
              >
                <span className="mb-3 block font-headline-md text-[20px] font-bold text-[#2DD4BF]/50">
                  {step.n}
                </span>
                <h4 className="mb-2 font-label-md text-[12px] font-semibold uppercase tracking-wider text-on-surface">
                  {step.title}
                </h4>
                <p className="mb-3 font-body-md text-[13px] text-on-surface-variant">{step.body}</p>
                <p className="font-label-sm text-[10px] leading-relaxed text-on-surface-variant/70">
                  <span className="text-[#2DD4BF]/80">T</span> {step.trigger} ·{" "}
                  <span className="text-[#2DD4BF]/80">L</span> {step.logic} ·{" "}
                  <span className="text-[#2DD4BF]/80">A</span> {step.action}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 font-headline-md text-[18px] text-on-surface">Live today</h3>
              <ul className="space-y-2">
                {LIVE_NOW.map((item) => (
                  <li key={item} className="flex gap-2 font-body-md text-[14px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-[#2DD4BF]">check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-headline-md text-[18px] text-on-surface">Building next</h3>
              <ul className="space-y-2">
                {NEXT_UP.map((item) => (
                  <li key={item} className="flex gap-2 font-body-md text-[14px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50">
                      arrow_forward
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feasibility */}
      <section id="feasibility" className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:px-[64px] md:py-20 scroll-mt-24">
        <h2 className="mb-2 font-headline-lg text-[24px] sm:text-headline-lg text-on-surface">
          Feasibility
        </h2>
        <p className="mb-8 max-w-2xl font-body-md text-on-surface-variant">
          Technically ready on Mainnet. Commercially gated on BIR Permit to Transmit, licensed
          financing posture, and payer KYB — not on reinventing the chain stack.
        </p>
        <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container/40">
                <th className="px-4 py-3 font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Dimension
                </th>
                <th className="px-4 py-3 font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Rating
                </th>
                <th className="px-4 py-3 font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {FEASIBILITY_ROWS.map((row) => (
                <tr key={row.dim} className="border-b border-outline-variant/10 last:border-0">
                  <td className="px-4 py-4 font-body-md text-[14px] text-on-surface">{row.dim}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-md border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-2 py-0.5 font-label-sm text-[11px] text-[#2DD4BF]">
                      {row.rating}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-body-md text-[13px] text-on-surface-variant">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Unit economics */}
      <section id="economics" className="border-y border-outline-variant/10 bg-surface-container/20">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:px-[64px] md:py-20 scroll-mt-24">
          <h2 className="mb-2 font-headline-lg text-[24px] sm:text-headline-lg text-on-surface">
            Unit economics
          </h2>
          <p className="mb-10 max-w-2xl font-body-md text-on-surface-variant">
            Two engines. Planning assumptions for partners — not audited financials.
          </p>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/60 p-6">
              <h3 className="mb-1 font-headline-md text-[18px] text-on-surface">
                A · Liquidity spread
              </h3>
              <p className="mb-5 font-body-md text-[13px] text-on-surface-variant">
                Per funded invoice · target platform take 0.5–1.5% of face (≈1% rule of thumb)
              </p>
              <dl className="space-y-3">
                {ECONOMICS_ENGINE_A.map((row) => (
                  <div key={row.label} className="flex justify-between gap-4 border-b border-outline-variant/10 pb-3 last:border-0">
                    <dt className="font-label-sm text-[12px] text-on-surface-variant">{row.label}</dt>
                    <dd className="font-body-md text-[14px] text-on-surface text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/60 p-6">
              <h3 className="mb-1 font-headline-md text-[18px] text-on-surface">
                B · Compliance SaaS
              </h3>
              <p className="mb-5 font-body-md text-[13px] text-on-surface-variant">
                Recurring moat — EIS mandate makes this stick even without factoring that month
              </p>
              <ul className="space-y-4">
                {ECONOMICS_ENGINE_B.map((t) => (
                  <li key={t.tier} className="border-b border-outline-variant/10 pb-4 last:border-0">
                    <div className="flex justify-between gap-3">
                      <span className="font-label-md text-[13px] text-on-surface">{t.tier}</span>
                      <span className="font-body-md text-[13px] text-[#2DD4BF]">{t.price}</span>
                    </div>
                    <p className="mt-1 font-body-md text-[12px] text-on-surface-variant">{t.includes}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 font-label-sm text-[11px] text-on-surface-variant/70">
            Hard ceiling: MSME all-in cost stays below traditional PH factoring. Long-tenor AR is
            priced for duration — not pitched as short-cycle PayFi APY.
          </p>
        </div>
      </section>

      {/* Business canvas */}
      <section id="canvas" className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:px-[64px] md:py-20 scroll-mt-24">
        <h2 className="mb-2 font-headline-lg text-[24px] sm:text-headline-lg text-on-surface">
          Business canvas
        </h2>
        <p className="mb-8 max-w-2xl font-body-md text-on-surface-variant">
          Lean canvas for Axial as a Philippines-first fintech infrastructure company.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CANVAS.map((block) => (
            <div
              key={block.title}
              className="rounded-xl border border-outline-variant/10 bg-surface-container/30 p-5"
            >
              <h3 className="mb-2 font-label-md text-[11px] uppercase tracking-wider text-[#2DD4BF]">
                {block.title}
              </h3>
              <p className="font-body-md text-[13px] leading-relaxed text-on-surface-variant">
                {block.body}
              </p>
            </div>
          ))}
        </div>
        <blockquote className="mt-10 max-w-3xl border-l-2 border-[#2DD4BF]/50 pl-5 font-body-md text-[15px] leading-relaxed text-on-surface">
          Axial turns a confirmed B2B invoice into instant working capital and review-ready
          tax/statutory compliance — on Stellar Mainnet, with closed-loop settlement so funders
          finance receivables that actually exist.
        </blockquote>
      </section>

      {/* Trust / rails */}
      <section className="border-y border-outline-variant/10 bg-surface-container/20">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:px-[64px] md:py-20">
          <h2 className="mb-8 font-headline-lg text-[24px] sm:text-headline-lg text-on-surface">
            Rails & discipline
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Stellar Mainnet",
                d: "Production USDC, 3–5s finality, audit trail for compliance memos.",
              },
              {
                t: "Closed loop",
                d: "Payer confirm + NoA + lockbox — anti-fraud is legal assignment, not “the chain prevents it.”",
              },
              {
                t: "Co-Pilot compliance",
                d: "Prepare → review → submit. Auto-file only after BIR certification + PTT.",
              },
              {
                t: "Licensed capital",
                d: "Funders are qualified financing partners under RA 8556 posture — not open DeFi pools.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/50 p-5"
              >
                <h3 className="mb-2 font-headline-sm text-[15px] text-[#2DD4BF]">{x.t}</h3>
                <p className="font-body-md text-[13px] text-on-surface-variant">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:px-[64px] md:py-20 scroll-mt-24">
        <h2 className="mb-2 font-headline-lg text-[24px] sm:text-headline-lg text-on-surface text-center">
          Team
        </h2>
        <p className="mb-12 font-body-md text-on-surface-variant text-center">
          Axon Enjin · Building Axial as production infrastructure for Philippine MSMEs
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {TEAM.map((m) => (
            <div
              key={m.name}
              className="flex flex-col items-center text-center p-6 rounded-xl border border-outline-variant/10 bg-surface-container/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.img}
                alt={m.name}
                className="mb-4 h-32 w-32 sm:h-36 sm:w-36 rounded-full border-2 border-[#2DD4BF]/20 object-cover"
              />
              <h3 className="font-headline-sm text-[15px] font-semibold text-on-surface mb-1">
                {m.name}
              </h3>
              <p className="font-body-sm text-[12px] text-on-surface-variant">{m.role}</p>
              {"tag" in m && m.tag ? (
                <p className="mt-1 font-label-sm text-[11px] text-[#2DD4BF] uppercase tracking-wider">
                  {m.tag}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-outline-variant/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-5 px-5 py-16 md:px-[64px] text-center">
          <h2 className="font-headline-lg text-[24px] sm:text-headline-lg text-on-surface">
            See the product on Mainnet
          </h2>
          <p className="max-w-xl font-body-md text-[15px] text-on-surface-variant">
            Upload an invoice, confirm the payer, advance USDC, and review an EIS-ready filing —
            the same rails we are taking to production.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-label-md font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Open product
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <img
            src="/axial-axonenjin-qr.png"
            alt="Scan to open Axial"
            width={72}
            height={72}
            className="hidden sm:block rounded-lg border border-outline-variant/20 opacity-90"
          />
        </div>
      </section>

      <footer className="border-t border-outline-variant/10">
        <div className="mx-auto flex max-w-[1440px] flex-col sm:flex-row items-center justify-between gap-3 px-5 py-6 md:px-[64px]">
          <span className="flex items-center gap-2 font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
            <LogoMark size={14} />
            Axial · Axon Enjin · 2026
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Axon-Enjin/axial"
              target="_blank"
              rel="noopener noreferrer"
              className="font-label-sm text-[11px] text-on-surface-variant hover:text-[#2DD4BF] transition-colors"
            >
              GitHub
            </a>
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              Stellar Mainnet · USDC
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
