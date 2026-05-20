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
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
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

## Fallback

If env vars are missing, the app uses `web/data/eis-submissions.json` (`eisStore: "file"`).

## MCP / team access

If your team uses the Supabase MCP in Cursor, point it at this project and run the migration SQL above. Do not commit `.env.local`.
