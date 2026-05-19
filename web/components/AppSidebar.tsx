"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Command Center", icon: "dashboard" },
  { href: "/liquidity", label: "Liquidity", icon: "swap_horiz" },
  { href: "/compliance", label: "Compliance", icon: "gavel" },
  { href: "/settings", label: "Settings", icon: "settings_input_component" },
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
          ? "relative flex items-center gap-3 rounded-r-full border-r-2 border-primary bg-secondary-container/30 px-4 py-3 font-label-md text-label-md text-primary shadow-[0_0_15px_rgba(190,198,224,0.1)]"
          : "flex items-center gap-3 rounded-r-full border-r-2 border-transparent px-4 py-3 font-label-md text-label-md text-on-surface-variant transition-all duration-300 hover:bg-surface-variant/20 hover:text-on-surface"
      }
    >
      <span
        className={`material-symbols-outlined text-[20px] ${active ? "fill" : ""}`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}

type AppSidebarProps = {
  onNewTransaction?: () => void;
};

export function AppSidebar({ onNewTransaction }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col gap-4 border-r border-outline-variant/10 bg-surface-container-lowest/40 py-8 backdrop-blur-2xl md:flex">
      <div className="mb-4 flex items-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container shadow-[0_0_15px_rgba(190,198,224,0.1)]">
          <span className="material-symbols-outlined text-[20px] text-primary">
            architecture
          </span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
            Axial MVP
          </h1>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Architect Mode
          </p>
        </div>
      </div>

      <div className="px-6 mb-6">
        <button
          type="button"
          onClick={onNewTransaction}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 font-label-md text-label-md font-semibold text-on-primary shadow-[0_0_15px_rgba(190,198,224,0.2)] transition-opacity hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Transaction
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-2">
        {NAV.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/10 px-2 pt-4">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-r-full border-r-2 border-transparent px-4 py-3 font-label-md text-label-md text-on-surface-variant transition-all duration-300 hover:bg-surface-variant/20 hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]">
            help_outline
          </span>
          Support
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-r-full border-r-2 border-transparent px-4 py-3 font-label-md text-label-md text-on-surface-variant transition-all duration-300 hover:bg-surface-variant/20 hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </Link>
      </div>
    </nav>
  );
}
