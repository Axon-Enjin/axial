import { AppShell } from "@/components/layout/AppShell";
import { AppProvider } from "@/components/providers/AppProvider";
import { getPublicChainStatus } from "@/lib/soroban/config";
import { getAuthUser } from "@/lib/supabase/server";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { network } = getPublicChainStatus();
  const user = await getAuthUser();

  return (
    <AppProvider
      initialUser={
        user
          ? {
              id: user.id,
              email: user.email,
              orgId: user.orgId,
              orgName: user.orgName,
              role: user.role,
            }
          : null
      }
    >
      <AppShell network={network} user={user}>
        {children}
      </AppShell>
    </AppProvider>
  );
}
