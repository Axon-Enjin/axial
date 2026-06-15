"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useApp } from "@/components/providers/AppProvider";
import { PAGE_META } from "@/lib/demo-actions";
import type { AuthUser } from "@/lib/supabase/server";

export function AppShell({
  children,
  network,
  user,
}: {
  children: React.ReactNode;
  network: string;
  user?: AuthUser | null;
}) {
  const pathname = usePathname();
  const isPortalRoute =
    pathname.startsWith("/app/payer-portal") ||
    pathname.startsWith("/app/funder-portal");
  const meta = PAGE_META[pathname] ?? PAGE_META["/app"];
  const {
    walletConnected,
    freighterPublicKey,
    freighterConnecting,
    connectWalletFromShell,
    dispatch,
  } = useApp();

  if (isPortalRoute) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-surface-container-lowest font-body-md text-body-md text-on-surface">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-container-lowest font-body-md text-body-md text-on-surface selection:bg-primary/20 selection:text-primary">
      <AppSidebar
        network={network}
        user={user}
        onNewTransaction={() => dispatch("unlock")}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col pt-14 md:ml-64 md:pt-0">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          walletConnected={walletConnected}
          walletPublicKey={freighterPublicKey}
          walletConnecting={freighterConnecting}
          onWalletConnect={() => void connectWalletFromShell()}
        />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
