/**
 * Verify Supabase project ifzyntqwymmgimnxtguz from web/.env.local (Node, not browser).
 * Usage: node scripts/connect-supabase.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

function loadEnv() {
  const raw = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    env[t.slice(0, i)] = t.slice(i + 1);
  }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or key in web/.env.local");
  process.exit(1);
}

const expectedRef = "ifzyntqwymmgimnxtguz";
if (!url.includes(expectedRef)) {
  console.error(`SUPABASE_URL must include ${expectedRef}, got ${url}`);
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function probeTable(name) {
  const { count, error } = await sb.from(name).select("*", { count: "exact", head: true });
  if (error) return { name, ok: false, error: error.message };
  return { name, ok: true, count: count ?? 0 };
}

console.log(`Connecting to ${url} …`);
const tables = await Promise.all([
  probeTable("eis_submissions"),
  probeTable("factoring_invoices"),
]);

for (const t of tables) {
  if (t.ok) {
    console.log(`  ✓ ${t.name} — ${t.count} rows`);
  } else {
    console.log(`  ✗ ${t.name} — ${t.error}`);
  }
}

const allOk = tables.every((t) => t.ok);
if (!allOk) {
  console.log("\nRun migrations in Supabase SQL Editor:");
  console.log("  supabase/migrations/001_eis_submissions.sql");
  console.log("  supabase/migrations/002_factoring_invoices.sql");
  console.log(`  https://supabase.com/dashboard/project/${expectedRef}/sql/new`);
  process.exit(2);
}

console.log("\nSupabase connected. Restart npm run dev if the app was already running.");
