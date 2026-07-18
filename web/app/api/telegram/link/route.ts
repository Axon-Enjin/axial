import { NextResponse } from "next/server";
import { assertSessionAccess } from "@/lib/auth/session-gate";
import { ensureUserOrg, resolveOrgId } from "@/lib/org/store";
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

  if (!gate.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let orgId = gate.user.orgId;
  let role = gate.user.role ?? "owner";
  if (!orgId) {
    try {
      const ensured = await ensureUserOrg({
        userId: gate.user.id,
        email: gate.user.email,
      });
      orgId = ensured.orgId;
      role = ensured.role;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not provision organization";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  orgId = resolveOrgId(orgId);
  if (role !== "owner" && role !== "admin") {
    return NextResponse.json({ error: "Owner or admin required" }, { status: 403 });
  }

  const code = await createLinkCode({
    orgId,
    userId: gate.user.id,
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
