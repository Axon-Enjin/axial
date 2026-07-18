import { NextResponse } from "next/server";
import { handleTelegramCommand } from "@/lib/telegram/commands";
import { telegramSendMessage } from "@/lib/telegram/client";
import { isTelegramConfigured } from "@/lib/telegram/store";

export const dynamic = "force-dynamic";

type TelegramUpdate = {
  message?: {
    chat?: { id?: number };
    from?: { id?: number };
    text?: string;
  };
};

export async function POST(request: Request) {
  if (!isTelegramConfigured()) {
    return NextResponse.json({ error: "Telegram bot not configured" }, { status: 503 });
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text;
  if (chatId == null || !text) {
    return NextResponse.json({ ok: true });
  }

  try {
    const reply = await handleTelegramCommand({
      chatId,
      telegramUserId: update.message?.from?.id ?? null,
      text,
    });
    await telegramSendMessage(chatId, reply);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Command failed";
    await telegramSendMessage(chatId, message);
  }

  return NextResponse.json({ ok: true });
}
