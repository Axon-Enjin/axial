import { listLinksByOrg } from "./store";
import { telegramBotReady, telegramSendMessage } from "./client";

/** Fan-out calm in-app notifications to linked Telegram chats. */
export function fanoutTelegramNotification(input: {
  orgId?: string | null;
  title: string;
  body: string;
  href?: string | null;
}): void {
  if (!input.orgId || !telegramBotReady()) return;
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  const link = input.href && base ? `\n${base}${input.href}` : "";
  const text = `${input.title}\n${input.body}${link}`;

  void (async () => {
    try {
      const links = await listLinksByOrg(input.orgId!);
      await Promise.all(links.map((l) => telegramSendMessage(l.chatId, text)));
    } catch {
      // Non-fatal — in-app notification already persisted
    }
  })();
}
