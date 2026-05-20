# Supabase (Axial backend)

PostgreSQL backing for the **BIR EIS oracle** and future app projections.

## Setup (one time)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run [`migrations/001_eis_submissions.sql`](migrations/001_eis_submissions.sql).
3. **Project Settings → API** → copy:
   - Project URL → `SUPABASE_URL`
   - **service_role** key (secret) → `SUPABASE_SERVICE_ROLE_KEY`  
     Never expose the service role key in the browser or commit it.

4. Add to `web/.env.local`:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...   # Dashboard → API → service_role (preferred)
# SUPABASE_ANON_KEY=...             # optional demo fallback (see web/lib/supabase/client.ts)
```

5. Restart `npm run dev` in `web/`.

## Verify

```bash
curl -s http://localhost:3000/api/soroban/status | jq .eisStore
# "supabase"

curl -s http://localhost:3000/api/eis/submissions | jq .store
# "supabase"
```

Run a Liquidity swap, then check **Compliance → BIR EIS Connect** or the `eis_submissions` table in Supabase Table Editor.

## Seed demo rows (empty table / judge dry-run)

With `npm run dev` running and `eisStore: "supabase"`:

```bash
curl -X POST http://localhost:3000/api/eis/seed
```

This runs the real oracle pipeline (mock JWS → mock BIR ack → memo write-back) for three demo events and upserts into `eis_submissions`. **Compliance** polls `GET /api/eis/submissions` every 8s and will show the rows.

Live path (preferred for demo video): Liquidity **Tokenize & Swap** → Compliance **Route Payroll** — each on-chain tx auto-triggers the same pipeline via `triggerEisFromChain`.

## Data flow

```
On-chain action (mint / swap / payroll)
  → triggerEisFromChain (fire-and-forget)
  → processLedgerEvent (oracle)
  → upsertSubmission → Supabase eis_submissions
  → GET /api/eis/submissions
  → ComplianceView (poll 8s)
```

## Fallback

If env vars are missing, the app uses `web/data/eis-submissions.json` (`eisStore: "file"`).

## MCP / team access

If your team uses the Supabase MCP in Cursor, point it at this project and run the migration SQL above. Do not commit `.env.local`.
