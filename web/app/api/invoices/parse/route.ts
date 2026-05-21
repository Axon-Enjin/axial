import { NextResponse } from "next/server";
import { extractInvoiceFields } from "@/lib/invoices/extract-fields";
import { resolveUploadMimeType } from "@/lib/invoices/mime";
import { extractTextFromBuffer } from "@/lib/invoices/ocr";
import { upsertFromParse } from "@/lib/invoices/store";
import { toClientInvoice } from "@/lib/invoices/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
]);

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "file field is required" }, { status: 400 });
  }

  const name = file instanceof File ? file.name : undefined;
  const mimeType = resolveUploadMimeType(file.type || "", name);
  if (!ALLOWED.has(mimeType)) {
    return NextResponse.json(
      { error: "Use PNG, JPEG, WebP, or PDF" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  try {
    const rawText = await extractTextFromBuffer(buffer, mimeType);
    if (rawText.length < 12) {
      return NextResponse.json(
        { error: "Could not read enough text from this file" },
        { status: 422 },
      );
    }

    const parsed = extractInvoiceFields(rawText);
    if (parsed.face <= 0) {
      return NextResponse.json(
        {
          error: "No invoice amount detected — check scan quality or enter manually",
          rawTextPreview: rawText.slice(0, 500),
          partial: parsed,
        },
        { status: 422 },
      );
    }

    const saved = await upsertFromParse({
      invoiceId: parsed.invoiceId,
      party: parsed.party,
      terms: parsed.terms,
      face: parsed.face,
    });

    return NextResponse.json({
      parsed,
      invoice: toClientInvoice(saved),
      rawTextPreview: rawText.slice(0, 800),
      charCount: rawText.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invoice parse failed";
    console.error("[invoices/parse]", message, err);
    const isTimeout =
      /timed out|timeout|FUNCTION_INVOCATION_TIMEOUT/i.test(message);
    const isOcrDisabled = /OCR is disabled/i.test(message);
    const status = isTimeout ? 504 : isOcrDisabled ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
