/**
 * Concrete checks for Axial Edge Guardrails (Phases 1–3).
 * Run: node scripts/verify-edge-guardrails.mjs  (from web/)
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(webRoot, "..");
let failed = 0;

function ok(label, cond) {
  if (cond) {
    console.log(`  PASS  ${label}`);
  } else {
    console.error(`  FAIL  ${label}`);
    failed++;
  }
}

function read(rel) {
  return readFileSync(join(webRoot, rel), "utf8");
}

function readRepo(rel) {
  return readFileSync(join(repoRoot, rel), "utf8");
}

console.log("Edge guardrails verification\n");

// ── Pure FX helper (mirrors lib/fx/convert.ts) ──────────────────────────────
function phpToUsdcWhole(phpAmount, phpPerUsdc) {
  if (!Number.isFinite(phpAmount) || !Number.isFinite(phpPerUsdc) || phpPerUsdc <= 0) {
    return 0;
  }
  return Math.trunc(phpAmount / phpPerUsdc);
}
ok("phpToUsdcWhole(56500, 56.5) === 1000", phpToUsdcWhole(56500, 56.5) === 1000);
ok("phpToUsdcWhole rejects bad rate", phpToUsdcWhole(100, 0) === 0);

// ── Static presence checks ──────────────────────────────────────────────────
const swap = read("app/api/swap/execute/route.ts");
ok("swap fail-closed when not seed", swap.includes('AXIAL_ALLOW_SEED === "true"') && swap.includes("sourceInvoiceId is required") && swap.includes("explicitSourceId"));
ok("swap awaits register_invoice", swap.includes("await registerInvoiceOnChain"));
ok("swap blocks already funded", swap.includes("ALREADY_FUNDED"));

const invoicesPatch = read("app/api/invoices/[id]/route.ts");
ok("confirm_payer seed-gated", invoicesPatch.includes("Demo confirm_payer is seed-only"));
ok("mark_collected uses settling", invoicesPatch.includes("beginCollectingInvoice"));
ok("mark_collected reverts on settle fail", invoicesPatch.includes("revertCollectingInvoice"));
ok("inflow cap guard", invoicesPatch.includes("INFLOW_CAP"));

const noaAck = read("app/api/noa/[receivableId]/ack/route.ts");
ok("NoA ack requires token", noaAck.includes("token is required") && noaAck.includes("getConfirmationByToken"));

const confirm = read("app/api/invoices/[id]/confirm/route.ts");
ok("confirm GET redacts authToken", confirm.includes("function redactAuthToken") && confirm.includes("authToken: null"));

const oracle = read("lib/eis/oracle.ts");
ok("EIS prepare-only default", oracle.includes('status: "prepared"') && oracle.includes("submitPreparedSubmission"));
ok("EIS demo auto-ack gated", oracle.includes("EIS_DEMO_AUTO_ACK") && oracle.includes("BIR_EIS_LIVE"));

ok("EIS approve route exists", existsSync(join(webRoot, "app/api/eis/[id]/approve/route.ts")));
ok("cron auth helper exists", existsSync(join(webRoot, "lib/cron/auth.ts")));
ok("migration 007 prepared status", existsSync(join(repoRoot, "supabase/migrations/007_eis_prepared_status.sql")));
ok("migration 009 settlement guards", existsSync(join(repoRoot, "supabase/migrations/009_invoice_settlement_guards.sql")));

const liquidity = read("components/views/LiquidityView.tsx");
ok("stable chain invoice id (no Date.now suffix)", /chainInvoiceId\s*=\s*id\b/.test(liquidity) && !/chainInvoiceId\s*=\s*`\$\{id\}-\$\{Date\.now\(\)\}`/.test(liquidity));

const lockbox = read("app/api/lockbox/fund/build/route.ts");
ok("lockbox converts PHP→USDC", lockbox.includes("resolveFaceUsdc") && lockbox.includes("amountUsdc"));

const orgStore = read("lib/org/store.ts");
ok("canonical org id defaults to demo-org", orgStore.includes('"demo-org"') && !orgStore.includes("demo-msme"));

const envExample = read(".env.example");
ok(".env.example AXIAL_ORG_ID=demo-org", /AXIAL_ORG_ID=demo-org/.test(envExample));
ok(".env.example documents EIS_DEMO_AUTO_ACK", envExample.includes("EIS_DEMO_AUTO_ACK"));

console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
