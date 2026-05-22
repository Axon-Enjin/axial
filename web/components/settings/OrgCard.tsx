"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useApp } from "@/components/providers/AppProvider";
import { isAuthConfigured } from "@/lib/supabase/browser";

type Member = {
  id: string;
  user_id: string;
  role: string;
  email?: string;
  accepted_at: string | null;
};

type Invite = {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  token: string;
};

export function OrgCard() {
  const { currentUser } = useApp();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [sending, setSending] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    url?: string;
    error?: string;
  } | null>(null);

  const orgId = currentUser?.orgId;
  const isAdmin =
    currentUser?.role === "owner" || currentUser?.role === "admin";

  useEffect(() => {
    if (!isAuthConfigured() || !orgId) {
      setLoading(false);
      return;
    }
    // Fetch members and pending invites from Supabase
    Promise.all([
      fetch("/api/auth/members").then((r) => r.json()),
      fetch("/api/auth/invite/list").then((r) => r.json()),
    ])
      .then(([membersData, invitesData]) => {
        setMembers(Array.isArray(membersData) ? membersData : []);
        setInvites(Array.isArray(invitesData) ? invitesData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);
    setInviteResult(null);

    try {
      const res = await fetch("/api/auth/invite", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invite failed");
      setInviteResult({ url: data.inviteUrl });
      setInviteEmail("");
      // Reload invites
      fetch("/api/auth/invite/list")
        .then((r) => r.json())
        .then((d) => setInvites(Array.isArray(d) ? d : []));
    } catch (err) {
      setInviteResult({ error: err instanceof Error ? err.message : "Failed" });
    } finally {
      setSending(false);
    }
  }

  async function revokeInvite(id: string) {
    await fetch(`/api/auth/invite?id=${id}`, { method: "DELETE" });
    setInvites((prev) => prev.filter((i) => i.id !== id));
  }

  if (!isAuthConfigured()) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Icon name="corporate_fare" size={22} className="text-on-surface-variant" />
          <h3 className="font-headline-md text-headline-md text-on-surface">Organization</h3>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant/60">
          Auth is not configured — set{" "}
          <code className="rounded bg-surface-container px-1 font-mono text-xs text-[#2DD4BF]">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          to enable org management.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="corporate_fare" size={22} className="text-primary" />
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {currentUser?.orgName ?? "Organization"}
            </h3>
          </div>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            {currentUser?.email} ·{" "}
            <span className="capitalize">{currentUser?.role ?? "member"}</span>
          </p>
        </div>
        {currentUser?.orgId ? (
          <span className="shrink-0 rounded-md border border-outline-variant/20 bg-surface-container px-2 py-1 font-mono text-xs text-on-surface-variant/50">
            {currentUser.orgId.slice(0, 8)}…
          </span>
        ) : null}
      </div>

      {/* Members */}
      <div className="mb-4">
        <p className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          Members
        </p>
        {loading ? (
          <div className="flex items-center gap-2 py-2 text-on-surface-variant/50">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-outline" />
            <span className="font-body-md text-body-md">Loading…</span>
          </div>
        ) : members.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant/50">
            No members found.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/10">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                    {(m.email ?? m.user_id).slice(0, 2).toUpperCase()}
                  </span>
                  <span className="truncate font-body-md text-body-md text-on-surface">
                    {m.email ?? m.user_id.slice(0, 8) + "…"}
                  </span>
                </div>
                <span className="shrink-0 rounded-full bg-surface-container px-2 py-0.5 font-label-sm text-label-sm capitalize text-on-surface-variant">
                  {m.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pending invites */}
      {invites.filter((i) => !i.accepted_at).length > 0 ? (
        <div className="mb-4">
          <p className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Pending invites
          </p>
          <ul className="divide-y divide-outline-variant/10">
            {invites
              .filter((i) => !i.accepted_at)
              .map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <span className="truncate font-body-md text-body-md text-on-surface">
                      {inv.email}
                    </span>
                    <p className="font-label-sm text-label-sm text-on-surface-variant/60" style={{ fontSize: "11px" }}>
                      expires {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => revokeInvite(inv.id)}
                      className="shrink-0 font-label-sm text-label-sm text-on-surface-variant/50 hover:text-red-400"
                    >
                      Revoke
                    </button>
                  ) : null}
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      {/* Invite form — admins + owners only */}
      {isAdmin ? (
        <form onSubmit={sendInvite} className="mt-2 border-t border-outline-variant/10 pt-4">
          <p className="mb-2 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Invite team member
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.ph"
              className="flex-1 rounded-lg border border-outline-variant/60 bg-surface-container px-3 py-2 font-mono text-sm text-on-surface outline-none focus:border-primary placeholder:text-on-surface-variant/40"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-lg border border-outline-variant/60 bg-surface-container px-3 py-2 font-body-md text-body-md text-on-surface outline-none focus:border-primary"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <Button
              type="submit"
              variant="primary"
              disabled={sending || !inviteEmail.trim()}
              className="shrink-0"
            >
              {sending ? "Sending…" : "Invite"}
            </Button>
          </div>

          {inviteResult?.url ? (
            <div className="mt-3 rounded-lg border border-[#2DD4BF]/20 bg-[#2DD4BF]/10 p-3">
              <p className="mb-1 font-label-sm text-label-sm text-[#2DD4BF]">
                Invite link (share with colleague):
              </p>
              <input
                readOnly
                value={inviteResult.url}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full rounded bg-surface-container px-2 py-1 font-mono text-xs text-on-surface"
              />
            </div>
          ) : inviteResult?.error ? (
            <p className="mt-2 font-body-md text-body-md text-red-400">
              {inviteResult.error}
            </p>
          ) : null}
        </form>
      ) : null}
    </Card>
  );
}
