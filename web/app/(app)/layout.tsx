import { AppShell } from "@/components/layout/AppShell";
import { AppProvider } from "@/components/providers/AppProvider";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
