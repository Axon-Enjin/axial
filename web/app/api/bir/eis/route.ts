/**
 * POST /api/bir/eis
 *
 * Mock BIR EIS HTTPS endpoint (hackathon + local dev).
 *
 * In production (BIR_EIS_LIVE=true) this route is unused — the oracle
 * sends directly to the real BIR endpoint (see lib/eis/bir-client.ts).
 *
 * Request body: { jws: string, payloadId: string }
 * Response 200: { status: "accepted", birReferenceId: string, receivedAt: string }
 * Response 422: { error: string }
 */
import { NextResponse } from "next/server";

type Body = {
  jws?: string;
  payloadId?: string;
};

export async function POST(request: Request) {
  // If live BIR is configured, this mock endpoint should not be called
  if (process.env.BIR_EIS_LIVE === "true") {
    return NextResponse.json(
      {
        error:
          "BIR_EIS_LIVE=true — this mock endpoint is disabled. " +
          "The oracle submits directly to the real BIR endpoint.",
      },
      { status: 410 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const jws = body.jws?.trim();
  const payloadId = body.payloadId?.trim();

  if (!jws || !payloadId) {
    return NextResponse.json(
      { error: "jws and payloadId are required" },
      { status: 400 },
    );
  }

  if (jws.split(".").length !== 3) {
    return NextResponse.json(
      { error: "Invalid JWS compact serialization" },
      { status: 422 },
    );
  }

  const suffix = payloadId.replace(/^PLD-/, "").slice(-6);
  const birReferenceId = `BIR-2026-${suffix}`;
  const receivedAt = new Date().toISOString();

  return NextResponse.json({
    status: "accepted",
    birReferenceId,
    receivedAt,
  });
}
