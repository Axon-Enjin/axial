"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { AppNotification } from "@/lib/notifications/types";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = (await res.json()) as { items?: AppNotification[]; unread?: number };
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      // decorative fallback
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 60_000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnread(0);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/10 bg-surface-container transition-colors hover:bg-surface-variant/50"
        aria-label="Notifications"
      >
        <Icon name="notifications" size={20} />
        {unread > 0 ? (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(190,198,224,0.6)]" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-outline-variant/20 bg-surface-container-low shadow-lg">
          <div className="flex items-center justify-between border-b border-outline-variant/10 px-4 py-3">
            <span className="font-label-md text-label-md text-on-surface">Updates</span>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary"
              >
                Mark read
              </button>
            ) : null}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-6 font-body-md text-body-md text-on-surface-variant/60">
                No updates yet.
              </li>
            ) : (
              items.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-outline-variant/5 px-4 py-3 ${n.readAt ? "opacity-70" : ""}`}
                >
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="block hover:text-primary"
                    >
                      <p className="font-label-md text-label-md text-on-surface">{n.title}</p>
                      <p className="mt-0.5 font-body-md text-[12px] text-on-surface-variant">
                        {n.body}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <p className="font-label-md text-label-md text-on-surface">{n.title}</p>
                      <p className="mt-0.5 font-body-md text-[12px] text-on-surface-variant">
                        {n.body}
                      </p>
                    </>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
