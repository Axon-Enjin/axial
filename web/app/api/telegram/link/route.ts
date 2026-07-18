import { NextResponse } from "next/server";
import { assertSessionAccess } from "@/lib/auth/session-gate";
import { resolveOrgId } from "@/lib/org/store";
import {
  createLinkCode,
  deleteLinksForOrg,
  isTelegramConfigured,
  listLinksByOrg,
} from "@/lib/telegram/store";

export async function GET() {
  const gate = await assertSessionAccess("read");
  if (gate.denied) return gate.denied;

  const orgId = resolveOrgId(gate.user?.orgId);
  const links = await listLinksByOrg(orgId);
  return NextResponse.json({
    configured: isTelegramConfigured(),
    orgId,
    linked: links.length > 0,
    links: links.map((l) => ({
      chatId: l.chatId,
      linkedAt: l.linkedAt,
      role: l.role,
    })),
  });
}

export async function POST() {
  const gate = await assertSessionAccess("operator");
  if (gate.denied) return gate.denied;

  if (!gate.user?.orgId && process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Org required" }, { status: 400 });
  }

  const orgId = resolveOrgId(gate.user?.orgId);
  const role = gate.user?.role ?? "owner";
  if (role !== "owner" && role !== "admin" && gate.user) {
    return NextResponse.json({ error: "Owner or admin required" }, { status: 403 });
  }

  const code = await createLinkCode({
    orgId,
    userId: gate.user?.id ?? null,
    role: role === "admin" || role === "owner" ? role : "member",
  });

  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.trim();
  const startCommand = `/start ${code.code}`;
  return NextResponse.json({
    code: code.code,
    expiresAt: code.expiresAt,
    startCommand,
    botUsername: botUsername || null,
    deepLink: botUsername
      ? `https://t.me/${botUsername}?start=${code.code}`
      : null,
  });
}

export async function DELETE() {
  const gate = await assertSessionAccess("operator");
  if (gate.denied) return gate.denied;

  const orgId = resolveOrgId(gate.user?.orgId);
  await deleteLinksForOrg(orgId);
  return NextResponse.json({ ok: true });
}
