# Cursor project config (Axial only)

## MCP — project scope

Supabase MCP for this repo lives **only** in [mcp.json](./mcp.json):

- **Project ref:** `ifzyntqwymmgimnxtguz`
- Must match `web/.env.local` → `SUPABASE_URL`

Do **not** add Axial’s Supabase server to the **global** `~/.cursor/mcp.json`. A global entry for another project ref will win in the agent and point MCP at the wrong database.

After changing MCP config:

1. **Settings → Tools & MCP** — toggle Supabase off/on
2. Start a **new** chat in this workspace
3. Confirm MCP `get_project_url` returns `https://ifzyntqwymmgimnxtguz.supabase.co`
