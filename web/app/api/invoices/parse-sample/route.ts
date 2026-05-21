import { NextResponse } from "next/server";
import {
  resolveSampleId,
  SAMPLE_INVOICES,
} from "@/lib/invoices/sample-invoices";
import { upsertFromParse } from "@/lib/invoices/store";
import { toClientInvoice } from "@/lib/invoices/types";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  let sampleId = resolveSampleId(searchParams.get("id"));

  try {
    const body = (await request.json()) as { id?: string };
    if (body?.id) {
      sampleId = resolveSampleId(body.id) ?? sampleId;
    }
  } catch {
    /* query param only */
  }

  if (!sampleId || !SAMPLE_INVOICES[sampleId]) {
    return NextResponse.json(
      { error: "Unknown sample. Use id=8901 or id=8904." },
      { status: 400 },
    );
  }

  const parsed = SAMPLE_INVOICES[sampleId];

  try {
    const saved = await upsertFromParse({
      invoiceId: parsed.invoiceId,
      party: parsed.party,
      terms: parsed.terms,
      face: parsed.face,
    });

    return NextResponse.json({
      parsed,
      invoice: toClientInvoice(saved),
      source: "sample",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sample import failed";
    console.error("[invoices/parse-sample]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
