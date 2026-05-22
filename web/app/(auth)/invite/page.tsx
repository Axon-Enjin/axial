import type { Metadata } from "next";
import { Suspense } from "react";
import { InviteForm } from "@/components/auth/InviteForm";

export const metadata: Metadata = {
  title: "Accept invite",
  description: "Accept your invitation to join Axial.",
};

export default function InvitePage() {
  return (
    <Suspense>
      <InviteForm />
    </Suspense>
  );
}
