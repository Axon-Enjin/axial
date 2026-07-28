# Cursor — Axial project MCP

Repo-level MCP only. **Do not** add this Supabase server to your global `~/.cursor/mcp.json`.

## Supabase (hosted)

Configs (same server, either is enough — Cursor may load one or both):

- [`.cursor/mcp.json`](mcp.json) — Cursor project-managed MCP
- [`.mcp.json`](../.mcp.json) — project-root MCP (some agents look here)

- **Project:** `ifzyntqwymmgimnxtguz` (`https://ifzyntqwymmgimnxtguz.supabase.co`)
- **Mode:** `read_only=false` while applying migrations (flip back to `true` after)
- **Auth:** OAuth via Supabase (no PAT in this repo)

### Enable (one time)

1. Open this repo in Cursor (folder = `axial` root).
2. **Settings → Tools & MCP** (or Customize → MCP).
3. Find **supabase** under **Project Managed** (or from `.mcp.json`) → toggle **on**.
4. Click **Authenticate** / **Connect** — log in to Supabase, pick org that owns `ifzyntqwymmgimnxtguz`.
5. Restart Cursor **or** start a **new Agent chat** so tools reload.

### Verify

Ask the agent: *"List tables in the Axial Supabase project using MCP."*

You should see `eis_submissions`, `factoring_invoices`, `payers`, `orgs`, `telegram_links` (after migration 010), etc.

### Apply Telegram migration

After MCP is authenticated and write-enabled, ask:

*"Apply supabase/migrations/010_telegram_links.sql via Supabase MCP."*

Or run that SQL in Dashboard → SQL Editor if MCP still shows 0 tools.

### Troubleshooting

- **0 tools / server missing:** Toggle off/on; check **Output → MCP Logs**; new Agent chat.
- **needsAuth:** Click Authenticate again on the supabase server card.
- **Wrong project:** `project_ref` must match `SUPABASE_URL` in `web/.env.local`.
- **Windows:** Hosted HTTP MCP — use URL config above, not legacy `npx` stdio unless OAuth fails.
- **Stuck read-only:** URL must include `read_only=false` for DDL; set `read_only=true` again after migrations.

### Security

- Scoped to this project only (`project_ref=…`).
- Prefer `read_only=true` day-to-day; enable write only for migrations.
- Never put `SUPABASE_SERVICE_ROLE_KEY` or Telegram tokens in MCP config.
- Never point MCP at unrelated production customer data.

See also: [`supabase/README.md`](../supabase/README.md), [`CLAUDE.md`](../CLAUDE.md).
