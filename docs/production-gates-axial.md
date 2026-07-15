# Axial — Production Gates Tracker

**Version:** 1.0  
**Date:** 2026-07-15  
**Status:** Living — parallel track to engineering phases  
**Owner:** Founders + counsel + partners

> Engineering can ship startup-credible v1 without closing every gate. **No live MSME onboarding at scale** until all P0 rows are green.

---

## P0 — Block production MSME volume

| Gate | Status | Owner | Notes |
|------|--------|-------|-------|
| Real payer KYB | ⬜ | Eng + vendor | Replace mock auto-verify on payer create |
| BIR Permit to Transmit + live EIS | ⬜ | Regulatory | `BIR_EIS_LIVE=true`; vault JWS keys |
| NoA legal text counsel review | ⬜ | Legal | [`clr-axial.md`](clr-axial.md) |
| Terms of Use + Privacy Policy | ⬜ | Legal | Trust & Boundary screen |
| Licensed financing partner (RA 8556) | ⬜ | Business | Axial = tech + origination rails |
| Mainnet settle dry-run signed off | 🟡 | Eng | [`settle-dry-run-checklist.md`](settle-dry-run-checklist.md) |

## P1 — Operational credibility

| Gate | Status | Owner | Notes |
|------|--------|-------|-------|
| GCP Cloud Scheduler (3 crons) | ⬜ | DevOps | [`scripts/setup-gcp-cloud-scheduler.sh`](../scripts/setup-gcp-cloud-scheduler.sh) |
| Per-org TIN config (not demo defaults) | ⬜ | Eng | Settings + Supabase org profile |
| Custody roadmap (Freighter / MPC) | 🟡 | Eng | Freighter path exists for MSME/payer |
| Monitoring on stuck EIS submissions | ⬜ | Eng | Alert on `queued`/`failed` > T+3 |

## P2 — Gated / partner-dependent

| Gate | Status | Owner | Notes |
|------|--------|-------|-------|
| PDAX Connect API | ❌ | Business | Sandbox not granted; mock UI only |
| Funder marketplace | ⬜ | Product | After single-funder settle solid |

---

## Compliance model (locked)

- **Effortless Compliance** = prepare → review → submit  
- Auto-file only after BIR software certification + PTT  
- Human checkpoint answers fraud/error liability

---

## Review cadence

- Weekly founder sync: update Status column  
- After each phase in [`remaining-work-axial.md`](remaining-work-axial.md), reconcile this table

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-15 | Initial production gates tracker (Phase 5) |
