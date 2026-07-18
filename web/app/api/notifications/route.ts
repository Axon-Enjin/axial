import { NextResponse } from "next/server";
import { assertSessionAccess } from "@/lib/auth/session-gate";
import {
  countUnread,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/store";

export async function GET() {
  const gate = await assertSessionAccess("read");
  if (gate.denied) return gate.denied;

  const orgId = gate.user?.orgId ?? undefined;
  const items = await listNotifications(orgId, 40);
  return NextResponse.json({ items, unread: countUnread(items) });
}

export async function PATCH(request: Request) {
  const gate = await assertSessionAccess("read");
  if (gate.denied) return gate.denied;

  const orgId = gate.user?.orgId ?? undefined;

  let body: { id?: string; all?: boolean };
  try {
    body = (await request.json()) as { id?: string; all?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.all) {
    await markAllNotificationsRead(orgId);
    return NextResponse.json({ ok: true });
  }

  if (body.id) {
    await markNotificationRead(body.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "id or all required" }, { status: 400 });
}
