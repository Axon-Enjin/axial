# Axial — Feasibility Assessment

**Version:** 1.0  
**Date:** 2026-07-15  
**Status:** Living — for founders, investors, and partners  
**Foundation:** [`Axial.md`](Axial.md) · [`research-pinkraft-axial.md`](research-pinkraft-axial.md) · [`scrutiny-pbw.md`](scrutiny-pbw.md)

---

## 1. Executive verdict

**Technically feasible today. Commercially feasible with gated regulatory steps. Economically sound if funder capital and compliance SaaS compound.**

Axial already runs the core liquidity + compliance pipeline on **Stellar Mainnet** with real Circle USDC. Remaining blockers are not “can it work on-chain?” — they are **Permit to Transmit (BIR)**, **licensed financing posture (RA 8556)**, **payer KYB**, and **closed-loop settle hardening**.

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Product / tech | High | 4 Soroban contracts live; mint, swap, payroll, lockbox funding wired |
| Regulatory path | Medium | Human-in-the-loop EIS now; live BIR gated on software cert + PTT |
| Unit economics | High (modeled) | Dual engine: ~1% platform spread + compliance SaaS |
| Go-to-market | Medium | Wedge ICP clear; enterprise payer onboarding is the slow gate |
| Capital | Medium | Needs regulated/qualified liquidity partner, not open DeFi pool |

---

## 2. Problem–solution fit

| Structural problem (PH MSMEs) | Axial response | Feasibility |
|-------------------------------|----------------|-------------|
| Net 60–90 AR vs bi-weekly payroll | Tokenize confirmed receivable → ~85% USDC advance | Proven on Mainnet |
| Manual SSS / PhilHealth / Pag-IBIG | On-chain payroll split | Proven on Mainnet |
| BIR EIS T+3 (deadline Dec 31, 2026) | Oracle prepares JWS payload → human review → submit | Mock live; PTT gates production |
| Payment-redirection / fake-invoice risk | Payer confirm + NoA + lockbox + recourse | Partially live; settle distribution completing |

---

## 3. Technical feasibility

**Already shipped**

- Receivable mint, atomic USDC swap, payroll split, settlement contract deployed + initialized on Mainnet  
- Payer portal, NoA issue/ack, eligibility gate before funding  
- EIS oracle (map → JWS → mock BIR → Stellar memo), T+3 worker + Horizon poll endpoints  
- Supabase multi-tenant auth; Cloud Run deploy  

**In progress / near-term**

- On-chain `settle` with lockbox balance pre-check (S5)  
- Funder Protection Center (book + diligence)  
- Clear-signing UX and pipeline legibility  

**External dependencies (not inventable in-repo)**

| Dependency | Status | Mitigation |
|------------|--------|------------|
| Circle USDC | Live | Name freeze/FX risk; denomination-agnostic contracts |
| Reflector FX | Live + 56.5 fallback | Monitor oracle health |
| PDAX / PHP rail | Mock UI; Connect API not granted | SEP-24 abstraction ready |
| BIR EIS live API | Mock | Compliance Co-Pilot until PTT |
| KYB vendor | Mock auto-verify | Swap vendor before production volume |

---

## 4. Regulatory & legal feasibility (Philippines-first)

| Topic | Posture | Gate |
|-------|---------|------|
| BIR EIS | Prepare → review → submit (not silent auto-file) | Software certification + Permit to Transmit |
| Factoring / discounting AR | Tech + origination on top of **licensed financing entity** (RA 8556) | Counsel + partner CA |
| NoA / assignment | Product flow exists | Licensed PH attorney review of legal text |
| Custody | Custodial demo signing today; Freighter path exists | Roadmap to self-custody / MPC |
| Data privacy | Org-scoped multi-tenancy | Privacy Policy + Terms before live MSMEs |

**Honesty rule:** Do not claim “blockchain prevents double-financing.” Anti-fraud rests on **payer confirmation + NoA acknowledgement + lockbox discipline**.

---

## 5. Market feasibility

- **Demand:** ~$221B MSME funding demand vs ~$15B formal supply (Visa / industry cited baseline).  
- **Urgency:** BIR EIS Phase 1 deadline **Dec 31, 2026** pulls compliance spend without marketing.  
- **Wedge ICP:** 10–50 person B2B agencies (software, creative, specialized manpower) — digitally native, short sales cycle, acute payroll pain.  
- **Secondary:** F&B / distributors — higher volume after agency proof.  
- **Comps:** Huma (PayFi velocity), Centrifuge (RWA on Stellar), Acudeen (PH factoring demand proof). Axial’s moat is **liquidity + statutory + EIS on one rail**.

**Chicken-and-egg:** Closed loop needs the **enterprise payer** onboarded before the small seller is fundable. GTM starts where payers are motivated (supply-chain compliance pressure).

---

## 6. Go / no-go criteria

**Go (pilot)** when:

1. End-to-end Mainnet demo is reliable (mint + swap hashes visible)  
2. Payer confirm → NoA → lockbox → settle path exercised at least once  
3. Compliance Co-Pilot UX matches messaging (review before submit)  
4. Counsel signs off on NoA pilot wording  

**No-go for production volume** until:

1. PTT (or certified partner transmitter) for BIR  
2. Real KYB on payers  
3. Licensed financing partner for funder capital  
4. Cloud Scheduler + monitoring for EIS/reconcile workers  

---

## 7. Risks (summary)

See [`rfc-axial-risk-mitigation.md`](rfc-axial-risk-mitigation.md) and [`scrutiny-pbw.md`](scrutiny-pbw.md). Top five:

1. Filing wrong returns without human review → **mitigated by Co-Pilot**  
2. Fake / unconfirmed invoices → **mitigated by payer + NoA gate**  
3. Circle freeze / USDC FX → **named managed risks**  
4. Custodial key concentration → **Freighter / MPC roadmap**  
5. Long-duration AR vs Huma-style velocity yields → **price duration or recycle capital**

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-15 | Initial feasibility for product-to-startup posture |
