"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

function truncateKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

type TopBarProps = {
  title: string;
  subtitle?: string | null;
  walletConnected: boolean;
  walletPublicKey: string | null;
  walletConnecting?: boolean;
  onWalletConnect: () => void;
};

export function TopBar({
  title,
  subtitle,
  walletConnected,
  walletPublicKey,
  walletConnecting = false,
  onWalletConnect,
}: TopBarProps) {
  const walletLabel = walletPublicKey
    ? truncateKey(walletPublicKey)
    : walletConnecting
      ? "Connecting…"
      : "Connect Freighter";
  return (
    <>
      {/* Mobile Top Bar */}
      <header className="sticky top-14 z-10 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-lowest/80 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex-1 min-w-0">
          <h2 className="font-headline-md text-[18px] tracking-tight text-on-surface truncate">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 font-body-md text-[12px] text-on-surface-variant truncate">
              {subtitle}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onWalletConnect}
          disabled={walletConnecting}
          className={`flex items-center gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container px-2.5 py-1.5 font-label-sm text-[11px] transition-colors hover:bg-surface-variant/50 active:scale-95 ${walletConnected ? "text-[#2DD4BF]" : "text-on-surface-variant"}`}
        >
          <Icon name="account_balance_wallet" size={16} />
          {walletConnected ? (
            <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF] shadow-[0_0_10px_rgba(45,212,191,0.6)]" />
          ) : null}
        </button>
      </header>

      {/* Desktop Top Bar */}
      <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-outline-variant/10 bg-surface-container-lowest/80 px-margin-desktop py-6 backdrop-blur-md md:flex">
      <div>
        <h2 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 font-body-md text-body-md text-on-surface-variant">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-6 text-on-surface-variant">
        <button
          type="button"
          onClick={onWalletConnect}
          disabled={walletConnecting}
          className={`flex items-center gap-2 font-label-md text-label-md transition-colors hover:text-primary active:scale-95 ${walletConnected ? "text-[#2DD4BF]" : ""}`}
        >
          <Icon name="account_balance_wallet" size={20} />
          {walletLabel}
          {walletConnected ? (
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-[#2DD4BF] shadow-[0_0_10px_rgba(45,212,191,0.6)]" />
          ) : null}
        </button>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/10 bg-surface-container transition-colors hover:bg-surface-variant/50"
        >
          <Icon name="notifications" size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(190,198,224,0.6)]" />
        </button>
        <Avatar initials="AM" size={40} />
      </div>
    </header>
    </>
  );
}
