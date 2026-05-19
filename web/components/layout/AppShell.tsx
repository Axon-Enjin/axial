"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useApp } from "@/components/providers/AppProvider";
import { PAGE_META } from "@/lib/demo-actions";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? PAGE_META["/"];
  const { walletConnected, toggleWallet, dispatch } = useApp();

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-container-lowest font-body-md text-body-md text-on-surface selection:bg-primary/20 selection:text-primary">
      <AppSidebar onNewTransaction={() => dispatch("unlock")} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-64">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          walletConnected={walletConnected}
          onWalletToggle={toggleWallet}
        />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
