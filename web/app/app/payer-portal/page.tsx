import type { Metadata } from "next";
import { PayerPortalView } from "@/components/views/PayerPortalView";

export const metadata: Metadata = {
  title: { absolute: "Payer Portal · Axial" },
  description: "Confirm your invoice and acknowledge the Notice of Assignment.",
};

type Props = {
  searchParams: Promise<{ token?: string; invoice?: string }>;
};

export default async function PayerPortalPage({ searchParams }: Props) {
  const { token, invoice } = await searchParams;
  return <PayerPortalView token={token} invoiceId={invoice} />;
}
