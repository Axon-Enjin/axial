export type NotificationKind =
  | "funded"
  | "mid_tenor"
  | "pre_due"
  | "leaked"
  | "eis_failed"
  | "org_frozen"
  | "disputed";

export type AppNotification = {
  id: string;
  orgId: string | null;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};
