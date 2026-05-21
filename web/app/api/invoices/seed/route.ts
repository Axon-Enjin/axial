import { NextResponse } from "next/server";
import { seedDemoInvoices } from "@/lib/invoices/seed-demo";
import { getInvoiceStoreBackend } from "@/lib/invoices/store";

function seedAllowed(): boolean {
  if (process.env.AXIAL_ALLOW_SEED === "true") return true;
  return process.env.NODE_ENV === "development";
}

export async function POST(request: Request) {
  if (!seedAllowed()) {
    return NextResponse.json({ error: "Seed disabled in this environment" }, { status: 403 });
  }

  const force = new URL(request.url).searchParams.get("force") === "true";

  try {
    const invoices = await seedDemoInvoices(force);
    return NextResponse.json({
      store: getInvoiceStoreBackend(),
      seeded: invoices.length,
      message:
        invoices.length > 0
          ? `Seeded ${invoices.length} demo invoices`
          : "Store already has invoices (use ?force=true to replace)",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
