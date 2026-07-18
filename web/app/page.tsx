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
  PILLARS,
  RAILS,
  STEPS,
  TEAM,
} from "@/lib/landing/startup-content";

export const metadata: Metadata = {
  title: { absolute: "Axial - Instant Capital, Effortless Compliance" },
  description:
    "Liquidity and compliance infrastructure for Philippine MSMEs. Unlock cash from confirmed receivables on Stellar Mainnet while BIR EIS filings are prepared for one-click review.",
};

const ctaPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-label-md font-semibold text-on-primary transition-opacity hover:opacity-90 active:scale-[0.98]";

const ctaSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/30 px-6 py-3.5 font-label-md text-on-surface-variant transition-colors hover:text-on-surface active:scale-[0.98]";

export default function LandingPage() {
  const [leadPillar, ...restPillars] = PILLARS;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 border-b border-outline-variant/10 bg-surface-container-lowest/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 md:px-[64px]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container text-primary sm:h-10 sm:w-10">
              <LogoMark size={20} />
            </div>
            <span className="font-headline-md text-[18px] font-bold tracking-tight text-primary sm:text-[20px]">
              Axial
            </span>
          </div>
          <nav className="hidden items-center gap-5 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-label-sm text-[12px] text-on-surface-variant transition-colors hover:text-on-surface"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 font-label-md text-[13px] font-semibold text-on-primary transition-opacity hover:opacity-90 sm:px-4 sm:py-2.5 sm:text-[14px]"
          >
            Open product
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Hero: brand-first, left-aligned */}
      <section className="relative min-h-[min(100dvh,720px)] overflow-hidden border-b border-outline-variant/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(45,212,191,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(190,198,224,0.08), transparent 50%)",
          }}
        />
        <div className="relative mx-auto flex max-w-[1440px] flex-col justify-center px-5 py-16 sm:px-8 sm:py-20 md:px-[64px] md:py-24">
          <p className="mb-4 font-label-sm text-[10px] uppercase tracking-wider text-[#2DD4BF] sm:text-label-sm">
            Live on Stellar Mainnet · Philippines-first
          </p>
          <h1 className="max-w-4xl font-headline-xl text-[36px] leading-[1.1] text-on-surface sm:text-[48px] md:text-[56px]">
            Axial
          </h1>
          <p className="mt-3 max-w-2xl font-headline-lg text-[22px] text-on-surface/90 sm:text-[28px]">
            Instant Capital, Effortless Compliance.
          </p>
          <p className="mt-6 max-w-xl font-body-md text-[15px] leading-relaxed text-on-surface-variant sm:text-body-lg">
            Unlock cash from confirmed B2B receivables on Stellar, and prepare BIR EIS plus
            statutory payroll for human review on one pipeline.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link href="/app" className={ctaPrimary}>
              Open product
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <a href="#canvas" className={ctaSecondary}>
              Business canvas
            </a>
          </div>
        </div>
      </section>

      {/* Problem: split columns, no matching card twins */}
      <section
        id="problem"
        className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 sm:px-8 md:px-[64px] md:py-20"
      >
        <h2 className="mb-3 max-w-2xl font-headline-lg text-[24px] text-on-surface sm:text-headline-lg">
          The structural gap
        </h2>
        <p className="mb-12 max-w-2xl font-body-md text-on-surface-variant">
          Philippine MSMEs are not failing because they are unprofitable. They are cash-trapped and
          compliance-loaded at the same time.
        </p>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          <div className="border-t border-[#FB7185]/40 pt-6">
            <span className="material-symbols-outlined mb-3 block text-[28px] text-[#FB7185]">
              account_balance
            </span>
            <h3 className="mb-2 font-headline-md text-[20px] text-on-surface">Liquidity trap</h3>
            <p className="font-body-md text-[14px] leading-relaxed text-on-surface-variant">
              Enterprise buyers enforce <span className="text-on-surface">Net 60-90</span> while
              labor law demands <span className="text-on-surface">bi-weekly payroll</span>. Cash sits
              in receivables; payroll does not wait.
            </p>
            <p className="mt-4 font-label-sm text-[11px] text-[#2DD4BF]">
              ~$221B funding demand vs ~$15B formal supply
            </p>
          </div>
          <div className="border-t border-[#F59E0B]/40 pt-6">
            <span className="material-symbols-outlined mb-3 block text-[28px] text-[#F59E0B]">
              gavel
            </span>
            <h3 className="mb-2 font-headline-md text-[20px] text-on-surface">Compliance burden</h3>
            <p className="font-body-md text-[14px] leading-relaxed text-on-surface-variant">
              BIR Electronic Invoicing deadline{" "}
              <span className="text-on-surface">December 31, 2026</span> requires JSON + JWS within
              T+3. Most MSMEs still run statutory payroll on spreadsheets.
            </p>
            <p className="mt-4 font-label-sm text-[11px] text-[#2DD4BF]">
              Mandate urgency pulls adoption without paid acquisition
            </p>
          </div>
        </div>
      </section>

      {/* Product: asymmetric pillars + step list + live/next */}
      <section id="product" className="border-y border-outline-variant/10 bg-surface-container/20">
        <div className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 sm:px-8 md:px-[64px] md:py-20">
          <h2 className="mb-3 font-headline-lg text-[24px] text-on-surface sm:text-headline-lg">
            One pipeline.{" "}
            <span className="text-[#2DD4BF]">Liquidity in. Compliance out.</span>
          </h2>
          <p className="mb-12 max-w-2xl font-body-md text-on-surface-variant">
            Confirmed-invoice financing on Stellar Mainnet, with a Compliance Co-Pilot that prepares
            filings for your approval, not silent auto-submission.
          </p>

          <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="rounded-xl border border-[#2DD4BF]/25 bg-surface-container-lowest/70 p-8 lg:col-span-7">
              <span className="material-symbols-outlined mb-4 block text-[32px] text-[#2DD4BF]">
                {leadPillar.icon}
              </span>
              <h3 className="mb-3 font-headline-md text-[22px] text-on-surface">{leadPillar.title}</h3>
              <p className="max-w-lg font-body-md text-[15px] leading-relaxed text-on-surface-variant">
                {leadPillar.body}
              </p>
            </div>
            <div className="flex flex-col justify-center divide-y divide-outline-variant/15 lg:col-span-5">
              {restPillars.map((c) => (
                <div key={c.title} className="py-6 first:pt-0 last:pb-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px] text-[#2DD4BF]">
                      {c.icon}
                    </span>
                    <h3 className="font-headline-sm text-[16px] text-on-surface">{c.title}</h3>
                  </div>
                  <p className="font-body-md text-[13px] text-on-surface-variant">{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          <h3 className="mb-8 font-headline-md text-[18px] text-on-surface">How it works</h3>
          <ol className="mb-16 space-y-0 border-t border-outline-variant/15">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="grid grid-cols-1 gap-3 border-b border-outline-variant/15 py-6 sm:grid-cols-[2.5rem_1fr_minmax(0,14rem)] sm:items-start sm:gap-6"
              >
                <span className="font-headline-md text-[18px] font-semibold text-[#2DD4BF]/70">
                  {step.n}
                </span>
                <div>
                  <h4 className="mb-1 font-headline-sm text-[15px] text-on-surface">{step.title}</h4>
                  <p className="font-body-md text-[13px] text-on-surface-variant">{step.body}</p>
                </div>
                <p className="font-label-sm text-[10px] leading-relaxed text-on-surface-variant/70 sm:text-right">
                  <span className="text-[#2DD4BF]/80">T</span> {step.trigger}
                  <br />
                  <span className="text-[#2DD4BF]/80">L</span> {step.logic}
                  <br />
                  <span className="text-[#2DD4BF]/80">A</span> {step.action}
                </p>
              </li>
            ))}
          </ol>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <h3 className="mb-4 font-headline-md text-[18px] text-on-surface">Live today</h3>
              <ul className="space-y-2.5">
                {LIVE_NOW.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 font-body-md text-[14px] text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined shrink-0 text-[18px] text-[#2DD4BF]">
                      check
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-headline-md text-[18px] text-on-surface">Building next</h3>
              <ul className="space-y-2.5">
                {NEXT_UP.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 font-body-md text-[14px] text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant/50">
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

      {/* Feasibility: table only */}
      <section
        id="feasibility"
        className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 sm:px-8 md:px-[64px] md:py-20"
      >
        <h2 className="mb-3 font-headline-lg text-[24px] text-on-surface sm:text-headline-lg">
          Feasibility
        </h2>
        <p className="mb-8 max-w-2xl font-body-md text-on-surface-variant">
          Technically ready on Mainnet. Commercially gated on BIR Permit to Transmit, licensed
          financing posture, and payer KYB, not on reinventing the chain stack.
        </p>
        <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container/40">
                <th className="px-4 py-3 font-label-sm text-[11px] text-on-surface-variant">
                  Dimension
                </th>
                <th className="px-4 py-3 font-label-sm text-[11px] text-on-surface-variant">
                  Rating
                </th>
                <th className="px-4 py-3 font-label-sm text-[11px] text-on-surface-variant">
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

      {/* Economics: two engines, denser dl */}
      <section id="economics" className="border-y border-outline-variant/10 bg-surface-container/20">
        <div className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 sm:px-8 md:px-[64px] md:py-20">
          <h2 className="mb-3 font-headline-lg text-[24px] text-on-surface sm:text-headline-lg">
            Unit economics
          </h2>
          <p className="mb-10 max-w-2xl font-body-md text-on-surface-variant">
            Two engines. Planning assumptions for partners, not audited financials.
          </p>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="mb-1 font-headline-md text-[18px] text-on-surface">
                A · Liquidity spread
              </h3>
              <p className="mb-5 font-body-md text-[13px] text-on-surface-variant">
                Per funded invoice · target platform take 0.5-1.5% of face (≈1% rule of thumb)
              </p>
              <dl className="space-y-3">
                {ECONOMICS_ENGINE_A.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between gap-4 border-b border-outline-variant/10 pb-3 last:border-0"
                  >
                    <dt className="font-label-sm text-[12px] text-on-surface-variant">{row.label}</dt>
                    <dd className="text-right font-body-md text-[14px] text-on-surface">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="mb-1 font-headline-md text-[18px] text-on-surface">
                B · Compliance SaaS
              </h3>
              <p className="mb-5 font-body-md text-[13px] text-on-surface-variant">
                Recurring moat. EIS mandate makes this stick even without factoring that month.
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
          <p className="mt-8 font-label-sm text-[11px] text-on-surface-variant/70">
            Hard ceiling: MSME all-in cost stays below traditional PH factoring. Long-tenor AR is
            priced for duration, not pitched as short-cycle PayFi APY.
          </p>
        </div>
      </section>

      {/* Canvas: quieter labels, quote */}
      <section
        id="canvas"
        className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 sm:px-8 md:px-[64px] md:py-20"
      >
        <h2 className="mb-3 font-headline-lg text-[24px] text-on-surface sm:text-headline-lg">
          Business canvas
        </h2>
        <p className="mb-10 max-w-2xl font-body-md text-on-surface-variant">
          Lean canvas for Axial as a Philippines-first fintech infrastructure company.
        </p>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {CANVAS.map((block) => (
            <div key={block.title} className="border-t border-outline-variant/20 pt-4">
              <h3 className="mb-2 font-label-md text-[13px] font-semibold text-[#2DD4BF]">
                {block.title}
              </h3>
              <p className="font-body-md text-[13px] leading-relaxed text-on-surface-variant">
                {block.body}
              </p>
            </div>
          ))}
        </div>
        <blockquote className="mt-12 max-w-3xl border-l-2 border-[#2DD4BF]/50 pl-5 font-body-md text-[15px] leading-relaxed text-on-surface">
          Axial turns a confirmed B2B invoice into instant working capital and review-ready
          tax/statutory compliance on Stellar Mainnet, with closed-loop settlement so funders
          finance receivables that actually exist.
        </blockquote>
      </section>

      {/* Rails: 2x2 hairline grid */}
      <section className="border-y border-outline-variant/10 bg-surface-container/20">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:px-[64px] md:py-20">
          <h2 className="mb-10 font-headline-lg text-[24px] text-on-surface sm:text-headline-lg">
            Rails and discipline
          </h2>
          <div className="grid grid-cols-1 gap-0 border-t border-outline-variant/15 sm:grid-cols-2">
            {RAILS.map((x) => (
              <div
                key={x.t}
                className="border-b border-outline-variant/15 p-6 sm:odd:border-r sm:p-8"
              >
                <h3 className="mb-2 font-headline-sm text-[15px] text-[#2DD4BF]">{x.t}</h3>
                <p className="font-body-md text-[13px] text-on-surface-variant">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team: lighter frames */}
      <section
        id="team"
        className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 sm:px-8 md:px-[64px] md:py-20"
      >
        <h2 className="mb-2 text-center font-headline-lg text-[24px] text-on-surface sm:text-headline-lg">
          Team
        </h2>
        <p className="mb-12 text-center font-body-md text-on-surface-variant">
          Axon Enjin · Building Axial as production infrastructure for Philippine MSMEs
        </p>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m) => (
            <div key={m.name} className="flex flex-col items-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.img}
                alt={m.name}
                className="mb-4 h-32 w-32 rounded-full border border-[#2DD4BF]/25 object-cover sm:h-36 sm:w-36"
              />
              <h3 className="mb-1 font-headline-sm text-[15px] font-semibold text-on-surface">
                {m.name}
              </h3>
              <p className="font-body-sm text-[12px] text-on-surface-variant">{m.role}</p>
              {"tag" in m && m.tag ? (
                <p className="mt-1 font-label-sm text-[11px] text-[#2DD4BF]">{m.tag}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-outline-variant/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-5 px-5 py-16 text-center md:px-[64px]">
          <h2 className="font-headline-lg text-[24px] text-on-surface sm:text-headline-lg">
            See the product on Mainnet
          </h2>
          <p className="max-w-xl font-body-md text-[15px] text-on-surface-variant">
            Upload an invoice, confirm the payer, advance USDC, and review an EIS-ready filing. The
            same rails we are taking to production.
          </p>
          <Link href="/app" className={ctaPrimary}>
            Open product
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/axial-axonenjin-qr.png"
            alt="Scan to open Axial"
            width={72}
            height={72}
            className="hidden rounded-lg border border-outline-variant/20 opacity-90 sm:block"
          />
        </div>
      </section>

      <footer className="border-t border-outline-variant/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-5 py-6 sm:flex-row md:px-[64px]">
          <span className="flex items-center gap-2 font-label-sm text-[11px] text-on-surface-variant">
            <LogoMark size={14} />
            Axial · Axon Enjin · 2026
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Axon-Enjin/axial"
              target="_blank"
              rel="noopener noreferrer"
              className="font-label-sm text-[11px] text-on-surface-variant transition-colors hover:text-[#2DD4BF]"
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
