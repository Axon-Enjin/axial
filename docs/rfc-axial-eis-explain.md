# RFC: Advisory EIS explain (rule-based + optional LLM)

**Status:** Accepted for implementation (advisory only)  
**Date:** 2026-07-17  
**Related:** [`rfc-axial-eis-oracle.md`](rfc-axial-eis-oracle.md) · [`prd-axial.md`](prd-axial.md) §7 · locked Co-Pilot model in [`Axial.md`](Axial.md)

## Problem

Compliance Co-Pilot stops at `prepared` for human review. Founders need a short critique of the mapped BIR payload (TIN, VAT math, T+3) without turning Approve into an autonomous agent. PRD v1 forbids embedding LLM in domain submit paths.

## Decision

1. **Default path is rule-based.** `explainEisPayload()` in `web/lib/eis/explain.ts` runs deterministic checks. Surfaced in `EisPayloadPanel` and Telegram `/eis`.
2. **Optional LLM narrative** behind `POST /api/eis/[id]/explain` when `EIS_EXPLAIN_LLM=true` and a provider key is set. The LLM receives the stored payload JSON and returns prose. It never calls `submitPreparedSubmission`.
3. **Human Approve remains the only submit gate.** Telegram `/approve` requires an explicit `confirm` step.

## Non-goals

- Auto-submit to BIR
- Tax advice or statutory interpretation presented as legal counsel
- Chat memory / multi-turn agent over the org ledger
- Replacing Tesseract OCR (separate future intake RFC)

## API

`POST /api/eis/[id]/explain`

Auth: same session gate as EIS read.

Response shape:

```json
{
  "mode": "rules" | "llm",
  "summary": "string",
  "readyToApprove": true,
  "findings": [{ "code": "vat_math", "severity": "warn", "message": "…" }],
  "narrative": "optional LLM prose when enabled"
}
```

## Env

| Var | Role |
|-----|------|
| `EIS_EXPLAIN_LLM` | `true` to allow provider call |
| `EIS_EXPLAIN_LLM_URL` | OpenAI-compatible chat completions URL (optional; defaults off) |
| `EIS_EXPLAIN_LLM_API_KEY` | Provider key |
| `EIS_EXPLAIN_LLM_MODEL` | Model id |

When LLM is off or fails, the route returns the rule-based result only (`mode: "rules"`).

## Liability

Advisory text is not a BIR filing. PTT / live BIR remain gated by `BIR_EIS_LIVE` and human Approve. Update PRD §7 when shipping LLM mode to production tenants.
