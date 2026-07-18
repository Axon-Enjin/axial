# Axial — Lean Business Canvas

**Version:** 1.1  
**Date:** 2026-07-18  
**Product:** Axial by Axon Enjin  
**Posture:** Product-to-startup (Philippines-first fintech infrastructure)

---

## Canvas

| Block | Content |
|-------|---------|
| **Problem** | (1) Net 60–90 B2B terms trap MSME cash while payroll is bi-weekly. (2) BIR EIS (T+3, Dec 2026) + statutory payroll are still spreadsheet work. (3) Traditional factoring is slow, collateral-heavy, and ignores compliance. |
| **Customer segments** | **Primary:** 10–50 person PH B2B agencies (software, creative, specialized manpower). **Secondary:** F&B / institutional distributors. **Buyers of risk capital:** regulated / qualified financing partners (not retail DeFi LPs). **Payers:** enterprise buyers who must confirm invoices and ack NoA. |
| **Unique value proposition** | **Working capital financing** for Net 60–90 MSMEs, delivered as **Instant Capital, Effortless Compliance** — unlock ~85% of a *confirmed* receivable in minutes (USDC on Stellar, UI in PHP) while BIR EIS + statutory splits are prepared for one-click human approval on the same pipeline. |
| **Solution** | Closed-loop confirmed-invoice financing (the WCF product form): payer KYB → invoice confirm → NoA → mint receivable SAC → atomic USDC advance → payroll split → EIS Co-Pilot → lockbox settlement + reconcile. |
| **Channels** | Founder-network white-glove pilots · product site (this landing) · Stellar / fintech partner intros · supply-chain payer-led wedges · content on EIS deadline urgency. |
| **Revenue streams** | (A) Platform spread ~0.5–1.5% of face per funded invoice. (B) Tiered compliance SaaS. Optional FX edge + micro origination fee. |
| **Cost structure** | Engineering + Cloud Run/Supabase · counsel / KYB · liquidity partner economics (pass-through) · support for Co-Pilot filings · security/custody upgrades. |
| **Key metrics** | Time-to-liquidity (upload → advance) · % invoices with payer+NoA before fund · EIS prepared within T+3 · settle/leakage rate · SaaS NR · financed face PHP · Mainnet tx success. |
| **Unfair advantage** | Domain-specific Soroban contracts already on **Mainnet** + PH-native compliance oracle (EIS + SSS/PhilHealth/Pag-IBIG) on one event bus — not a generic wallet or accounting bolt-on. Closed-loop discipline (confirm + NoA + lockbox) vs open DeFi credit. |
| **Key partners** | Licensed financing company (RA 8556) · Circle USDC · Stellar ecosystem · (future) PDAX / PHP anchors · BIR-certified transmission path · KYB vendor · counsel. |

---

## One-liner for investors

> Axial is Philippine MSME infrastructure that turns a confirmed B2B invoice into instant working capital and review-ready tax/statutory compliance — on Stellar Mainnet, with closed-loop settlement so funders finance receivables that actually exist.

---

## What we are / are not

| We are | We are not |
|--------|------------|
| Working capital financing for confirmed B2B AR | Pure rate/speed factoring with no compliance story |
| Liquidity + compliance **rails** | A generic accounting suite (Xero competitor) |
| Confirmed-invoice financing tech | An open, underwriting-free DeFi pool |
| Compliance **Co-Pilot** (prepare → review → submit) | Silent auto-filer without PTT |
| PHP-first UX on USDC settlement | A speculative crypto product |

---

## Roadmap themes (product)

1. **Reliability** — demo path + settle (S5) + ops crons  
2. **Trust surfaces** — funder book, clear-signing, transparency counters  
3. **Production gates** — KYB, PTT, legal NoA, licensed capital partner  
4. **Scale** — payer-led GTM, SaaS packaging, SEA compliance packs (not forked chains)

---

## Related docs

- [`feasibility-axial.md`](feasibility-axial.md)  
- [`unit-economics-axial.md`](unit-economics-axial.md)  
- [`gtm-axial.md`](gtm-axial.md)  
- [`clr-axial.md`](clr-axial.md)  
- [`rfc-axial-closed-loop-settlement.md`](rfc-axial-closed-loop-settlement.md)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-15 | Initial lean canvas for startup posture |
