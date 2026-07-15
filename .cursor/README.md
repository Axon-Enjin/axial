# Cursor — Axial project MCP

Repo-level MCP only. **Do not** add this Supabase server to your global `~/.cursor/mcp.json`.

## Supabase (hosted)

Config: [`mcp.json`](mcp.json)

- **Project:** `ifzyntqwymmgimnxtguz` (`https://ifzyntqwymmgimnxtguz.supabase.co`)
- **Mode:** read-only Postgres + database/docs/development/debugging tools
- **Auth:** OAuth via Supabase (no PAT in this repo)

### Enable (one time)

1. Open this repo in Cursor.
2. **Settings → Tools & MCP** (or Customize → MCP).
3. Find **supabase** under **Project Managed** and toggle it on.
4. Click **Authenticate** / **Connect** when prompted — log in to Supabase and pick the org that owns `ifzyntqwymmgimnxtguz`.
5. Restart Cursor or start a new Agent chat if tools do not appear.

### Verify

Ask the agent: *"List tables in the Axial Supabase project using MCP."*

You should see `eis_submissions`, `factoring_invoices`, `payers`, `orgs`, etc.

### Troubleshooting

- **0 tools:** Toggle server off/on in Settings → Tools & MCP; check **Output → MCP Logs**.
- **Wrong project:** `project_ref` in `mcp.json` must match `SUPABASE_URL` in `web/.env.local`.
- **Windows:** Hosted HTTP MCP does not need `cmd /c`; use this URL config, not legacy `npx` stdio unless OAuth fails.

### Security

- Read-only is enforced in the URL (`read_only=true`).
- Scoped to this project only (`project_ref=…`).
- Never point MCP at production customer data; dev/staging project only.

See also: [`supabase/README.md`](../supabase/README.md), [`CLAUDE.md`](../CLAUDE.md).
