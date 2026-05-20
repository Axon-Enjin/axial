import { NextResponse } from "next/server";
import { seedDemoEisSubmissions } from "@/lib/eis/seed-demo";
import { getEisStoreBackend } from "@/lib/eis/store";

function seedAllowed(): boolean {
  if (process.env.AXIAL_ALLOW_SEED === "true") return true;
  return process.env.NODE_ENV === "development";
}

export async function POST() {
  if (!seedAllowed()) {
    return NextResponse.json({ error: "Seed disabled in this environment" }, { status: 403 });
  }

  try {
    const submissions = await seedDemoEisSubmissions();
    return NextResponse.json({
      store: getEisStoreBackend(),
      seeded: submissions.length,
      submissions: submissions.map((s) => ({
        payloadId: s.payloadId,
        status: s.status,
        eventKind: s.eventKind,
        birReferenceId: s.birReferenceId,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
