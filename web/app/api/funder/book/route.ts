import { NextResponse } from "next/server";
import { listFunderBook } from "@/lib/funder/book";
import { resolveSorobanConfig } from "@/lib/soroban/server-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10));

  try {
    const cfg = await resolveSorobanConfig();
    const funderAddress = cfg.funderPublic;
    const book = await listFunderBook(page, pageSize, funderAddress);

    return NextResponse.json({
      ...book,
      network: cfg.network,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Funder book failed";
    console.error("[funder/book GET]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
