# Supabase (Axial backend)

**Project ref:** `ifzyntqwymmgimnxtguz`  
**URL:** `https://ifzyntqwymmgimnxtguz.supabase.co`

Must match `web/.env.local` and `.cursor/mcp.json` (`project_ref=ifzyntqwymmgimnxtguz`).  
If Cursor MCP shows a different project URL, disconnect and re-auth Supabase MCP, then pick this project.

PostgreSQL backing for **BIR EIS**, **Active Factoring** (invoices), **Payer registry**, **Settlement / reserve ledger**, and **Auth + multi-tenancy** (orgs, memberships, invites).

## Migrations — run in order

| File | What it creates |
|---|---|
| [`001_eis_submissions.sql`](migrations/001_eis_submissions.sql) | `eis_submissions` table — BIR EIS pipeline state |
| [`002_factoring_invoices.sql`](migrations/002_factoring_invoices.sql) | `factoring_invoices` table — invoice CRUD + status FSM |
| [`003_closed_loop.sql`](migrations/003_closed_loop.sql) | `payers`, `invoice_confirmations`, `notices_of_assignment` — closed-loop payer KYB + NoA |
| [`004_reserve_ledger.sql`](migrations/004_reserve_ledger.sql) | `reserve_ledger` — settlement reserves + leakage tracking |
| [`005_eis_t3_fields.sql`](migrations/005_eis_t3_fields.sql) | `due_by`, `submitted_at` on `eis_submissions` — T+3 deadline enforcement |
| [`006_auth_multitenancy.sql`](migrations/006_auth_multitenancy.sql) | `orgs`, `org_memberships`, `org_invites`; `org_id` on all data tables; RLS policies; `handle_new_user()` trigger |

## Setup (one time)

1. Open [dashboard](https://supabase.com/dashboard/project/ifzyntqwymmgimnxtguz).
2. **SQL Editor** → run all 6 migrations in order (001 → 006).
3. **Auth → Providers**: enable **Email** (magic link), optionally **Google** OAuth.
4. **Auth → URL Configuration**: add your app URL(s) to *Site URL* and *Redirect URLs*  
   e.g. `http://localhost:3000`, `https://axial.axonenjin.com`; redirect URL must be `{base}/auth/callback`.
5. **Project Settings → API** → copy:
   - Project URL → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose)
   - `anon` / `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe to expose — RLS-protected)

6. Add to `web/.env.local`:

```env
SUPABASE_URL=https://ifzyntqwymmgimnxtguz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...   # service_role (server only)
NEXT_PUBLIC_SUPABASE_URL=https://ifzyntqwymmgimnxtguz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...  # anon/public key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

7. Restart `npm run dev` in `web/`.

## Auth setup (Supabase dashboard)

After running migration 006:

1. **Authentication → Email templates**: customize the magic link email if desired.
2. **Authentication → Providers → Google** (optional): add OAuth credentials from Google Cloud Console; set redirect URL to `{NEXT_PUBLIC_BASE_URL}/auth/callback`.
3. **Authentication → URL Configuration → Redirect URLs**: whitelist `{NEXT_PUBLIC_BASE_URL}/auth/callback`.

When a new user signs up, the `handle_new_user()` trigger automatically:
- Creates an org named after the user's email prefix
- Creates an owner membership for the user
- Stores `org_id` in `auth.users.raw_user_meta_data`

## Verify

```bash
curl -s http://localhost:3000/api/soroban/status | jq .eisStore
# "supabase"

curl -s http://localhost:3000/api/eis/submissions | jq .store
# "supabase"

curl -s "http://localhost:3000/api/invoices?page=1&pageSize=5" | jq '{store, total, totalPages}'
# store: "supabase", total: 12 after auto-seed
```

## Seed demo rows

With `npm run dev` running and `eisStore: "supabase"`:

```bash
curl -X POST http://localhost:3000/api/eis/seed
```

Runs the real oracle pipeline (mock JWS → mock BIR ack → memo write-back) for three demo events.

Live path (preferred for demo): **Liquidity → Tokenize & Swap** → **Compliance → Route Payroll** — each on-chain tx auto-triggers the EIS pipeline via `triggerEisFromChain`.

## Data flow

```
On-chain action (mint / swap / payroll)
  → triggerEisFromChain (fire-and-forget)
  → processLedgerEvent (oracle)
  → signEisPayload (HS256 mock or RS256 live)
  → getBirEisClient().submit()
  → BIR acknowledgement
  → upsertSubmission → Supabase eis_submissions
  → GET /api/eis/submissions
  → ComplianceView (poll 8s)
```

## Fallback

If env vars are missing, the app uses JSON file fallbacks under `web/data/` (`eisStore: "file"`). Auth middleware transparently allows all requests if `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not set (local dev without auth).

## MCP / team access

If your team uses the Supabase MCP in Cursor, point it at this project and run the migration SQL above. Do not commit `.env.local`.

> ⚠️ Do **not** register this project's Supabase MCP server globally — only register it within the Axial project context.
