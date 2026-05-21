import { AppShell } from "@/components/layout/AppShell";
import { AppProvider } from "@/components/providers/AppProvider";
import { getPublicChainStatus } from "@/lib/soroban/config";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { network } = getPublicChainStatus();
  return (
    <AppProvider>
      <AppShell network={network}>{children}</AppShell>
    </AppProvider>
  );
}
