import { NextResponse } from "next/server";
import { acknowledgeEisSubmission } from "@/lib/eis/bir-mock";

type Body = {
  jws?: string;
  payloadId?: string;
};

/** Mock BIR EIS HTTPS endpoint (hackathon). */
export async function POST(request: Request) {
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

  try {
    const ack = acknowledgeEisSubmission(jws, payloadId);
    return NextResponse.json({
      status: "accepted",
      birReferenceId: ack.birReferenceId,
      receivedAt: ack.receivedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "BIR rejected payload";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
