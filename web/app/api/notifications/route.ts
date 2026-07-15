import { NextResponse } from "next/server";
import {
  countUnread,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/store";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const orgId = (user?.user_metadata?.org_id as string | undefined) ?? undefined;

  const items = await listNotifications(orgId, 40);
  return NextResponse.json({ items, unread: countUnread(items) });
}

export async function PATCH(request: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const orgId = (user?.user_metadata?.org_id as string | undefined) ?? undefined;

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
