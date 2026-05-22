import { AppShell } from "@/components/layout/AppShell";
import { AppProvider } from "@/components/providers/AppProvider";
import { getAuthUser } from "@/lib/supabase/server";
import { resolvePublicChainStatus } from "@/lib/soroban/server-config";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chain = await resolvePublicChainStatus();
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
      <AppShell network={chain.network} user={user}>
        {children}
      </AppShell>
    </AppProvider>
  );
}
