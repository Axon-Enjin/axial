"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type LinkStatus = {
  configured: boolean;
  linked: boolean;
  links: { chatId: number; linkedAt: string; role: string }[];
};

type LinkCode = {
  code: string;
  expiresAt: string;
  startCommand: string;
  botUsername: string | null;
  deepLink: string | null;
};

export function TelegramLinkCard() {
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [code, setCode] = useState<LinkCode | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/telegram/link");
      const data = (await res.json()) as LinkStatus & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function generateCode() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/telegram/link", { method: "POST" });
      const data = (await res.json()) as LinkCode & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not create link code");
      setCode(data);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create link code");
    } finally {
      setBusy(false);
    }
  }

  async function unlink() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/telegram/link", { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Unlink failed");
      setCode(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlink failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Icon name="send" className="text-on-surface-variant" />
        <h3 className="font-headline-md text-headline-md text-on-surface">Telegram</h3>
      </div>
      <p className="mb-4 font-body-md text-body-md text-on-surface-variant">
        Calm status alerts and EIS review nudges in chat. No money movement from Telegram.
      </p>

      {status && !status.configured ? (
        <p className="mb-3 font-body-md text-body-md text-amber-300/90">
          Bot token not configured on this environment. Linking still works for local file mode.
        </p>
      ) : null}

      {status?.linked ? (
        <p className="mb-3 font-body-md text-body-md text-on-surface">
          Linked · {status.links.length} chat{status.links.length === 1 ? "" : "s"}
        </p>
      ) : (
        <p className="mb-3 font-body-md text-body-md text-on-surface-variant">
          Not linked yet.
        </p>
      )}

      {code ? (
        <div className="mb-4 rounded-lg border border-outline-variant/20 bg-surface-container px-3 py-2.5">
          <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            One-time code
          </div>
          <p className="mt-1 font-mono text-sm text-on-surface">{code.startCommand}</p>
          {code.deepLink ? (
            <a
              href={code.deepLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block font-label-sm text-label-sm text-[#2DD4BF] hover:underline"
            >
              Open bot with code
            </a>
          ) : null}
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Expires {new Date(code.expiresAt).toLocaleTimeString("en-PH")}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mb-3 font-body-md text-body-md text-red-400/90">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" disabled={busy} onClick={() => void generateCode()}>
          {busy ? "Working…" : "Generate link code"}
        </Button>
        {status?.linked ? (
          <Button variant="secondary" disabled={busy} onClick={() => void unlink()}>
            Unlink
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
