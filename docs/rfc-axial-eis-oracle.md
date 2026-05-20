# RFC: BIR EIS Oracle (Hackathon MVP)

Off-chain service that maps Stellar ledger-final events to BIR EIS JSON, signs with mock JWS, submits to a mock BIR endpoint, and writes the acknowledgement reference to a Stellar memo.

## Flow

```text
mint | swap | payroll (on-chain API success)
  → enqueueEisProcessing (fire-and-forget)
  → mapLedgerEventToEisPayload (20 fields)
  → signEisPayloadMock (HS256 JWS)
  → acknowledgeEisSubmission (mock BIR)
  → writeBirMemoToStellar (0.0000001 XLM + text memo)
  → persist in web/data/eis-submissions.json
  → Compliance UI polls GET /api/eis/submissions
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/bir/eis` | Mock BIR accept (external shape) |
| `GET` | `/api/eis/submissions` | List for Compliance table |
| `POST` | `/api/eis/process` | Manual replay / debug |

## Idempotency

`{org_id}:{stellar_tx_hash}:{reference_id}` — duplicate events return existing `memo_written` record.

## Production gaps

- Vault-backed JWS (not `EIS_JWS_MOCK_SECRET`)
- Real BIR EIS API + PTT
- PostgreSQL + BullMQ worker (not JSON file store)
- Horizon event subscription (not only API hooks)
