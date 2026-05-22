"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/ui/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import type { AuthUser } from "@/lib/supabase/server";

const NAV = [
  { href: "/app", label: "Command Center", icon: "dashboard" },
  { href: "/app/liquidity", label: "Liquidity", icon: "swap_horiz" },
  { href: "/app/compliance", label: "Compliance", icon: "gavel" },
  { href: "/app/settings", label: "Settings", icon: "settings_input_component" },
] as const;

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "relative flex items-center gap-2.5 rounded-r-full border-r-2 border-primary bg-secondary-container/30 px-3 py-2.5 font-label-md text-[14px] text-primary shadow-[0_0_15px_rgba(190,198,224,0.1)]"
          : "flex items-center gap-2.5 rounded-r-full border-r-2 border-transparent px-3 py-2.5 font-label-md text-[14px] text-on-surface-variant transition-all duration-300 hover:bg-surface-variant/20 hover:text-on-surface"
      }
    >
      <span
        className={`material-symbols-outlined text-[18px] ${active ? "fill" : ""}`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}

type AppSidebarProps = {
  network: string;
  user?: AuthUser | null;
  onNewTransaction?: () => void;
};

export function AppSidebar({ network, user, onNewTransaction }: AppSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 top-0 right-0 z-50 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container text-primary shadow-[0_0_15px_rgba(190,198,224,0.1)]">
            <LogoMark size={18} />
          </div>
          <div>
            <h1 className="font-headline-md text-[16px] font-bold tracking-tight text-primary">
              Axial
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container text-on-surface transition-colors hover:bg-surface-variant/50"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[20px]">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <nav
        className={`fixed left-0 top-0 z-50 h-screen w-[280px] flex-col gap-4 border-r border-outline-variant/10 bg-surface-container-lowest/98 py-16 backdrop-blur-2xl transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "flex translate-x-0" : "flex -translate-x-full"
        }`}
      >
        <div className="px-4 mb-4">
          <button
            type="button"
            onClick={() => {
              onNewTransaction?.();
              setMobileMenuOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-4 font-label-md text-sm font-semibold text-on-primary shadow-[0_0_15px_rgba(190,198,224,0.2)] transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Transaction
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={
                item.href === "/app"
                  ? pathname === "/app"
                    ? "relative flex items-center gap-3 rounded-r-full border-r-2 border-primary bg-secondary-container/30 px-4 py-2.5 font-label-md text-sm text-primary shadow-[0_0_15px_rgba(190,198,224,0.1)]"
                    : "flex items-center gap-3 rounded-r-full border-r-2 border-transparent px-4 py-2.5 font-label-md text-sm text-on-surface-variant transition-all duration-300 hover:bg-surface-variant/20 hover:text-on-surface"
                  : pathname.startsWith(item.href)
                    ? "relative flex items-center gap-3 rounded-r-full border-r-2 border-primary bg-secondary-container/30 px-4 py-2.5 font-label-md text-sm text-primary shadow-[0_0_15px_rgba(190,198,224,0.1)]"
                    : "flex items-center gap-3 rounded-r-full border-r-2 border-transparent px-4 py-2.5 font-label-md text-sm text-on-surface-variant transition-all duration-300 hover:bg-surface-variant/20 hover:text-on-surface"
              }
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  (item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href))
                    ? "fill"
                    : ""
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/10 px-2 pt-4">
          <div className="mb-2 px-4">
            <div className="flex items-center gap-2">
              <p className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Network
              </p>
              <span
                className={[
                  "inline-flex items-center rounded-full border px-1.5 py-px font-label-sm text-[10px] uppercase tracking-wider",
                  network === "mainnet"
                    ? "border-primary/40 text-primary"
                    : "border-[#2DD4BF]/40 text-[#2DD4BF]",
                ].join(" ")}
              >
                {network}
              </span>
            </div>
          </div>
          <Link
            href="https://github.com/axial-ph"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-r-full border-r-2 border-transparent px-4 py-2.5 font-label-md text-sm text-on-surface-variant transition-all duration-300 hover:bg-surface-variant/20 hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
            Support
          </Link>

          {user ? (
            <div className="px-2 pb-2">
              <UserMenu email={user.email} orgName={user.orgName} role={user.role} />
            </div>
          ) : null}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col gap-2 border-r border-outline-variant/10 bg-surface-container-lowest/40 py-5 backdrop-blur-2xl md:flex">
      <div className="mb-1 flex flex-col gap-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container text-primary shadow-[0_0_15px_rgba(190,198,224,0.1)]">
            <LogoMark size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-headline-md text-[20px] font-bold tracking-tight text-primary">
              Axial
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
            Architect Mode
          </p>
          <span className={[
            "inline-flex items-center rounded-full border px-2 py-0.5 font-label-sm text-[10px] uppercase tracking-wider",
            network === "mainnet"
              ? "border-primary/40 bg-primary/5 text-primary"
              : "border-[#2DD4BF]/40 bg-[#2DD4BF]/5 text-[#2DD4BF]",
          ].join(" ")}>
            {network}
          </span>
        </div>
      </div>

      <div className="px-4 mb-2">
        <button
          type="button"
          onClick={onNewTransaction}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-4 font-label-md text-[14px] font-semibold text-on-primary shadow-[0_0_15px_rgba(190,198,224,0.2)] transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Transaction
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-2 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </div>

      {/* Footer: user identity + help */}
      <div className="mt-auto flex flex-col gap-0.5 border-t border-outline-variant/10 px-2 pt-3">
        <Link
          href="https://github.com/axial-ph"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-r-full border-r-2 border-transparent px-3 py-2.5 font-label-md text-[14px] text-on-surface-variant transition-all duration-300 hover:bg-surface-variant/20 hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[18px]">help_outline</span>
          Support
        </Link>

        {/* User menu — real logout when auth is configured */}
        {user ? (
          <div className="px-2 pb-1">
            <UserMenu
              email={user.email}
              orgName={user.orgName}
              role={user.role}
            />
          </div>
        ) : null}
      </div>
    </nav>
    </>
  );
}
