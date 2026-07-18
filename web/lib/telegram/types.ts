export type TelegramLink = {
  id: string;
  orgId: string;
  userId: string | null;
  chatId: number;
  telegramUserId: number | null;
  role: string;
  linkedAt: string;
};

export type TelegramLinkCode = {
  code: string;
  orgId: string;
  userId: string | null;
  role: string;
  expiresAt: string;
  createdAt: string;
};
