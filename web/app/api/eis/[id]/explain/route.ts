import { NextResponse } from "next/server";
import { assertSessionAccess } from "@/lib/auth/session-gate";
import { explainEisPayload } from "@/lib/eis/explain";
import { findSubmissionByIdOrPayloadId } from "@/lib/eis/store";
import { resolveEisPartyDefaults } from "@/lib/org/store";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Advisory explain for a prepared EIS payload.
 * Always runs rule-based checks. Optional LLM narrative when EIS_EXPLAIN_LLM=true.
 * Never submits to BIR.
 */
export async function POST(_request: Request, context: RouteContext) {
  const gate = await assertSessionAccess("read");
  if (gate.denied) return gate.denied;

  const { id } = await context.params;
  const key = id?.trim();
  if (!key) {
    return NextResponse.json({ error: "Submission id is required" }, { status: 400 });
  }

  const sub = await findSubmissionByIdOrPayloadId(key);
  if (!sub) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const parties = await resolveEisPartyDefaults(gate.user?.orgId);
  const rules = explainEisPayload({
    payload: sub.payload,
    dueBy: sub.dueBy,
    sellerTinDefault: parties.seller.tin,
    buyerTinDefault: parties.buyer.tin,
  });

  let mode: "rules" | "llm" = "rules";
  let narrative: string | null = null;

  if (process.env.EIS_EXPLAIN_LLM === "true") {
    narrative = await maybeLlmNarrative(sub.payload, rules.summary);
    if (narrative) mode = "llm";
  }

  return NextResponse.json({
    id: sub.id,
    payloadId: sub.payloadId,
    mode,
    summary: rules.summary,
    readyToApprove: rules.readyToApprove,
    findings: rules.findings,
    narrative,
  });
}

async function maybeLlmNarrative(
  payload: unknown,
  rulesSummary: string,
): Promise<string | null> {
  const url = process.env.EIS_EXPLAIN_LLM_URL?.trim();
  const key = process.env.EIS_EXPLAIN_LLM_API_KEY?.trim();
  const model = process.env.EIS_EXPLAIN_LLM_MODEL?.trim() || "gpt-4o-mini";
  if (!url || !key) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You advise a Philippine MSME founder reviewing a BIR EIS payload before human Approve. Be concise. Do not claim legal authority. Do not instruct auto-submit. Flag risks only.",
          },
          {
            role: "user",
            content: `Rule summary: ${rulesSummary}\n\nPayload JSON:\n${JSON.stringify(payload)}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}
