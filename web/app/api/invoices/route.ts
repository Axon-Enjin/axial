import { NextResponse } from "next/server";
import { assertSessionAccess } from "@/lib/auth/session-gate";
import { seedDemoInvoices } from "@/lib/invoices/seed-demo";
import {
  countInvoices,
  getInvoiceStoreBackend,
  listInvoices,
} from "@/lib/invoices/store";
import { toClientInvoice } from "@/lib/invoices/types";

function seedAllowed(): boolean {
  if (process.env.AXIAL_ALLOW_SEED === "true") return true;
  return process.env.NODE_ENV === "development";
}

export async function GET(request: Request) {
  const gate = await assertSessionAccess("read");
  if (gate.denied) return gate.denied;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 5));
  const autoSeed = searchParams.get("seed") !== "false";

  try {
    let total = await countInvoices();
    if (total === 0 && autoSeed && seedAllowed()) {
      await seedDemoInvoices();
      total = await countInvoices();
    }

    const { items, total: listedTotal } = await listInvoices(page, pageSize);
    const totalPages = Math.max(1, Math.ceil(listedTotal / pageSize));

    const store = getInvoiceStoreBackend();
    return NextResponse.json({
      store,
      page,
      pageSize,
      total: listedTotal,
      totalPages,
      items: items.map(toClientInvoice),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "List failed";
    console.error("[invoices GET]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
