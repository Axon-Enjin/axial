import type { Metadata } from "next";
import { FunderPortalView } from "@/components/views/FunderPortalView";
import { resolveFunderPortalAccess } from "@/lib/funder/portal-auth";
import { getAuthUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { absolute: "Funder Portal · Axial" },
  description: "Read-only treasury book and diligence checklist for liquidity providers.",
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function FunderPortalPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const user = await getAuthUser();
  const access = resolveFunderPortalAccess({
    token,
    hasSession: Boolean(user),
    role: user?.role,
  });

  return <FunderPortalView access={access} token={token} />;
}
