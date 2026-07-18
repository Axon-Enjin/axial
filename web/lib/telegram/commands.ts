import { listInvoices, getInvoice } from "@/lib/invoices/store";
import { listSubmissions, findSubmissionByIdOrPayloadId } from "@/lib/eis/store";
import { listNotifications } from "@/lib/notifications/store";
import { quoteAdvance } from "@/lib/soroban/quote";
import { quotePayrollSplit } from "@/lib/soroban/payroll-quote";
import { explainEisPayload } from "@/lib/eis/explain";
import { submitPreparedSubmission } from "@/lib/eis/oracle";
import {
  consumeLinkCode,
  findLinkByChatId,
  upsertTelegramLink,
} from "./store";
import type { TelegramLink } from "./types";

const pendingApproves = new Map<string, { submissionId: string; expiresAt: number }>();

function pendingKey(chatId: number, submissionId: string): string {
  return `${chatId}:${submissionId}`;
}

export async function handleTelegramCommand(input: {
  chatId: number;
  telegramUserId: number | null;
  text: string;
}): Promise<string> {
  const raw = input.text.trim();
  const [cmdRaw, ...args] = raw.split(/\s+/);
  const cmd = (cmdRaw ?? "").split("@")[0]?.toLowerCase() ?? "";

  if (cmd === "/start") {
    const code = args[0];
    if (!code) {
      return "Send /start <code> from Axial Settings → Link Telegram.";
    }
    const linkCode = await consumeLinkCode(code);
    if (!linkCode) {
      return "That link code is invalid or expired. Generate a new one in Settings.";
    }
    await upsertTelegramLink({
      orgId: linkCode.orgId,
      userId: linkCode.userId,
      chatId: input.chatId,
      telegramUserId: input.telegramUserId,
      role: linkCode.role,
    });
    return `Linked to org ${linkCode.orgId}. Try /status, /eis, /alerts.`;
  }

  const link = await findLinkByChatId(input.chatId);
  if (!link) {
    return "This chat is not linked. Open Axial Settings and send /start <code>.";
  }

  switch (cmd) {
    case "/help":
      return [
        "Axial MSME ops",
        "/status — overview",
        "/invoices — recent invoices",
        "/invoice <id>",
        "/quote <facePhp>",
        "/eis — filings awaiting review",
        "/approve <id> — then /approve <id> confirm",
        "/alerts",
        "/payroll <gross>",
      ].join("\n");
    case "/status":
      return statusText(link);
    case "/invoices":
      return invoicesText();
    case "/invoice":
      return invoiceText(args[0]);
    case "/quote":
      return quoteText(args[0]);
    case "/eis":
      return eisText(link.orgId);
    case "/approve":
      return approveText(link, args);
    case "/alerts":
      return alertsText(link.orgId);
    case "/payroll":
      return payrollText(args[0]);
    default:
      return "Unknown command. Try /help.";
  }
}

async function statusText(link: TelegramLink): Promise<string> {
  const { items, total } = await listInvoices(1, 100);
  const fundable = items.filter((i) => i.status === "fundable").length;
  const submissions = await listSubmissions(50);
  const prefix = `${link.orgId}:`;
  const orgSubs = submissions.filter(
    (s) => s.idempotencyKey.startsWith(prefix) || !s.idempotencyKey.includes(":"),
  );
  const awaiting = orgSubs.filter((s) => s.status === "prepared").length;
  return [
    `Org ${link.orgId}`,
    `Invoices: ${total} · fundable ${fundable}`,
    `EIS awaiting review: ${awaiting}`,
  ].join("\n");
}

async function invoicesText(): Promise<string> {
  const { items } = await listInvoices(1, 8);
  if (items.length === 0) return "No invoices yet.";
  return items
    .map(
      (i) =>
        `${i.id.slice(0, 10)}… · ${i.status} · ₱${i.face.toLocaleString("en-PH")}`,
    )
    .join("\n");
}

async function invoiceText(id: string | undefined): Promise<string> {
  if (!id) return "Usage: /invoice <id>";
  const inv = await getInvoice(id);
  if (!inv) return "Invoice not found.";
  return [
    inv.id,
    `Party: ${inv.party}`,
    `Face: ₱${inv.face.toLocaleString("en-PH")}`,
    `Status: ${inv.status}`,
    `Collection: ${inv.collectionStatus}`,
  ].join("\n");
}

function quoteText(faceRaw: string | undefined): string {
  const face = Number(faceRaw);
  if (!Number.isFinite(face) || face <= 0) return "Usage: /quote <facePhp>";
  const { advance, reserve, advanceBps } = quoteAdvance(face);
  return [
    `Face ₱${face.toLocaleString("en-PH")}`,
    `Advance (${advanceBps / 100}%): ₱${advance.toLocaleString("en-PH")}`,
    `Reserve: ₱${reserve.toLocaleString("en-PH")}`,
  ].join("\n");
}

async function eisText(orgId: string): Promise<string> {
  const submissions = await listSubmissions(50);
  const prefix = `${orgId}:`;
  const rows = submissions.filter(
    (s) =>
      (s.idempotencyKey.startsWith(prefix) || !s.idempotencyKey.includes(":")) &&
      (s.status === "prepared" || s.status === "failed"),
  );
  if (rows.length === 0) return "No filings awaiting review.";
  return rows
    .slice(0, 8)
    .map((s) => {
      const explain = explainEisPayload({ payload: s.payload, dueBy: s.dueBy });
      return `${s.id.slice(0, 8)}… · ${s.status} · ${explain.summary}`;
    })
    .join("\n");
}

async function approveText(
  link: TelegramLink,
  args: string[],
): Promise<string> {
  const id = args[0];
  if (!id) return "Usage: /approve <id>  then  /approve <id> confirm";

  const confirm = (args[1] ?? "").toLowerCase() === "confirm";
  const sub = await findSubmissionByIdOrPayloadId(id);
  if (!sub) return "Submission not found.";

  if (!confirm) {
    pendingApproves.set(pendingKey(link.chatId, sub.id), {
      submissionId: sub.id,
      expiresAt: Date.now() + 5 * 60_000,
    });
    const explain = explainEisPayload({ payload: sub.payload, dueBy: sub.dueBy });
    return [
      `Ready to approve ${sub.id.slice(0, 8)}…`,
      explain.summary,
      `Reply: /approve ${sub.id} confirm`,
    ].join("\n");
  }

  const pending = pendingApproves.get(pendingKey(link.chatId, sub.id));
  if (!pending || pending.expiresAt < Date.now()) {
    return "Confirmation expired. Run /approve <id> again first.";
  }
  pendingApproves.delete(pendingKey(link.chatId, sub.id));

  if (sub.status !== "prepared" && sub.status !== "failed" && sub.status !== "queued") {
    return `Cannot approve status ${sub.status}.`;
  }

  try {
    const updated = await submitPreparedSubmission(sub);
    return `Approved. Status: ${updated.status}${updated.birReferenceId ? ` · BIR ${updated.birReferenceId}` : ""}`;
  } catch (err) {
    return err instanceof Error ? err.message : "Approve failed";
  }
}

async function alertsText(orgId: string): Promise<string> {
  const items = await listNotifications(orgId, 8);
  if (items.length === 0) return "No alerts.";
  return items.map((n) => `${n.title}: ${n.body}`).join("\n");
}

function payrollText(grossRaw: string | undefined): string {
  const gross = Number(grossRaw);
  if (!Number.isFinite(gross) || gross <= 0) return "Usage: /payroll <gross>";
  const q = quotePayrollSplit(gross);
  return [
    `Gross ₱${q.gross.toLocaleString("en-PH")}`,
    `SSS ₱${q.sss.toLocaleString("en-PH")}`,
    `PhilHealth ₱${q.philhealth.toLocaleString("en-PH")}`,
    `Pag-IBIG ₱${q.pagibig.toLocaleString("en-PH")}`,
    `Net ₱${q.net.toLocaleString("en-PH")}`,
  ].join("\n");
}
