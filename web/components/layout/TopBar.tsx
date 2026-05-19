"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

type TopBarProps = {
  title: string;
  subtitle?: string | null;
  walletConnected: boolean;
  onWalletToggle: () => void;
};

export function TopBar({
  title,
  subtitle,
  walletConnected,
  onWalletToggle,
}: TopBarProps) {
  return (
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
          onClick={onWalletToggle}
          className={`flex items-center gap-2 font-label-md text-label-md transition-colors hover:text-primary active:scale-95 ${walletConnected ? "text-[#2DD4BF]" : ""}`}
        >
          <Icon name="account_balance_wallet" size={20} />
          {walletConnected ? "GC02…X9L4M" : "Wallet Connect"}
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
  );
}
