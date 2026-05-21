import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { buildSeedInvoice, countInvoices, upsertInvoice } from "./store";
import type { FactoringInvoice } from "./types";

const DEMO_ROWS: Parameters<typeof buildSeedInvoice>[0][] = [
  {
    id: "INV-2023-8901",
    party: "Acme Logistics Corp",
    terms: "Net 60",
    face: 125_000,
    status: "fundable",
    payerConfirmed: true,
    noaAcknowledged: true,
  },
  {
    id: "INV-2023-8904",
    party: "Nexus Tech Solutions",
    terms: "Net 90",
    face: 450_000,
    status: "awaiting_payer",
  },
  {
    id: "INV-2023-8872",
    party: "Global Freight Systems",
    terms: "Net 30",
    face: 75_500,
    status: "settled",
    collectionStatus: "collected",
    mintTxHash: "demo-mint-8872",
    swapTxHash: "demo-swap-8872",
  },
  {
    id: "INV-2023-8850",
    party: "Metro Retail Group",
    terms: "Net 45",
    face: 210_000,
    status: "awaiting_payer",
  },
  {
    id: "INV-2023-8841",
    party: "Pacific Foods Inc",
    terms: "Net 60",
    face: 88_400,
    status: "fundable",
    payerConfirmed: true,
  },
  {
    id: "INV-2023-8833",
    party: "Cebu Manufacturing Co",
    terms: "Net 90",
    face: 320_000,
    status: "awaiting_payer",
  },
  {
    id: "INV-2023-8820",
    party: "Skyline Properties",
    terms: "Net 30",
    face: 156_000,
    status: "settled",
    collectionStatus: "open",
    mintTxHash: "demo-mint-8820",
    swapTxHash: "demo-swap-8820",
  },
  {
    id: "INV-2023-8812",
    party: "Harbor Shipping Lines",
    terms: "Net 60",
    face: 540_000,
    status: "fundable",
    payerConfirmed: true,
  },
  {
    id: "INV-2023-8805",
    party: "Digitel Services PH",
    terms: "Net 45",
    face: 92_750,
    status: "awaiting_payer",
  },
  {
    id: "INV-2023-8798",
    party: "Luzon Agri Supply",
    terms: "Net 90",
    face: 178_200,
    status: "awaiting_payer",
  },
  {
    id: "INV-2023-8786",
    party: "Prime Healthcare Supplies",
    terms: "Net 30",
    face: 245_000,
    status: "settled",
    collectionStatus: "collected",
    mintTxHash: "demo-mint-8786",
    swapTxHash: "demo-swap-8786",
  },
  {
    id: "INV-2023-8771",
    party: "Visayas Cold Chain",
    terms: "Net 60",
    face: 412_500,
    status: "fundable",
    payerConfirmed: true,
  },
];

async function clearAllInvoices() {
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("factoring_invoices")
      .delete()
      .neq("id", "");
    if (error) {
      throw new Error(`Clear invoices failed: ${error.message}`);
    }
    return;
  }
  const dir = join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "factoring-invoices.json"), JSON.stringify({ invoices: [] }), "utf8");
}

export async function seedDemoInvoices(force = false): Promise<FactoringInvoice[]> {
  const existing = await countInvoices();
  if (existing > 0 && !force) {
    return [];
  }
  if (force && existing > 0) {
    await clearAllInvoices();
  }

  const saved: FactoringInvoice[] = [];
  for (let i = 0; i < DEMO_ROWS.length; i++) {
    const inv = buildSeedInvoice(DEMO_ROWS[i]!, i * 7);
    saved.push(await upsertInvoice(inv));
  }
  return saved;
}
