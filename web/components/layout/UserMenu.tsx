"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { getSupabaseBrowser, isAuthConfigured } from "@/lib/supabase/browser";

type UserMenuProps = {
  /** Authenticated user's email */
  email: string | null;
  /** Org name */
  orgName: string | null;
  /** Role in the org */
  role?: string | null;
};

export function UserMenu({ email, orgName, role }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  if (!isAuthConfigured() || !email) return null;

  const initials = email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-container-high"
        aria-label="User menu"
      >
        {/* Avatar */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 font-label-sm text-label-sm text-primary">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-label-sm text-label-sm text-on-surface">
            {email}
          </p>
          {orgName ? (
            <p className="truncate font-label-sm text-label-sm text-on-surface-variant/60" style={{ fontSize: "11px" }}>
              {orgName}{role ? ` · ${role}` : ""}
            </p>
          ) : null}
        </div>
        <Icon
          name={open ? "expand_less" : "expand_more"}
          size={16}
          className="shrink-0 text-on-surface-variant"
        />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container shadow-lg">
          <div className="border-b border-outline-variant/10 px-3 py-2.5">
            <p className="font-label-sm text-label-sm text-on-surface truncate">{email}</p>
            {orgName ? (
              <p className="font-label-sm text-label-sm text-on-surface-variant/70 truncate" style={{ fontSize: "11px" }}>
                {orgName}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => { setOpen(false); router.push("/app/settings"); }}
            className="flex w-full items-center gap-2 px-3 py-2.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="manage_accounts" size={16} />
            Account settings
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2 px-3 py-2.5 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
          >
            <Icon name="logout" size={16} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
