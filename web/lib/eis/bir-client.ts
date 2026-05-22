/**
 * BIR EIS client — pluggable mock/live interface.
 *
 * Switch to the live BIR EIS endpoint by setting:
 *   BIR_EIS_LIVE=true
 *   BIR_EIS_ENDPOINT=https://eis.bir.gov.ph/api/einvoice   (BIR staging/production)
 *   BIR_EIS_API_KEY=<BIR-issued API key after PTT approval>
 *
 * The mock client is used by default (hackathon) and satisfies the same interface.
 * When BIR_EIS_LIVE=true, the live client sends the JWS-signed payload to the real BIR endpoint.
 *
 * JWS signing is handled separately in lib/eis/jws.ts.
 * The BIR-registered signing key (RS256 PEM) is read from BIR_JWS_PRIVATE_KEY_B64.
 *
 * Permit to Transmit (PTT) is required before using the live client.
 * See: docs/clr-axial.md for the PTT certification path.
 */

import type { BirAcknowledgement } from "./types";

// ── Client interface ──────────────────────────────────────────────────────────

export interface BirEisClient {
  /** Submit a JWS-signed EIS payload and return the BIR acknowledgement. */
  submit(jwsCompact: string, payloadId: string): Promise<BirAcknowledgement>;
  /** Whether this client sends to the live BIR endpoint (vs. mock). */
  readonly isLive: boolean;
}

// ── Mock client (default — hackathon) ────────────────────────────────────────

class MockBirEisClient implements BirEisClient {
  readonly isLive = false;

  async submit(jwsCompact: string, payloadId: string): Promise<BirAcknowledgement> {
    if (!jwsCompact || jwsCompact.split(".").length !== 3) {
      throw new Error("Invalid JWS compact serialization");
    }
    const suffix = payloadId.replace(/^PLD-/, "").slice(-6);
    return {
      accepted: true,
      birReferenceId: `BIR-2026-${suffix}`,
      receivedAt: new Date().toISOString(),
    };
  }
}

// ── Live client (PTT required) ────────────────────────────────────────────────

/**
 * Live BIR EIS client — sends JWS-signed payloads to the real BIR endpoint.
 *
 * Prerequisites:
 * 1. BIR Permit to Transmit (PTT) approved for your TIN
 * 2. BIR-issued API key registered against your PTT
 * 3. RS256 private key uploaded to BIR portal + matching cert in your vault
 * 4. Set BIR_EIS_LIVE=true, BIR_EIS_ENDPOINT, BIR_EIS_API_KEY
 *
 * BIR EIS API contract (as of BIR EIRS v1.2):
 *   POST {endpoint}/invoice/transmit
 *   Headers: X-API-Key: {BIR_EIS_API_KEY}, Content-Type: application/jose
 *   Body: JWS compact serialization (RS256)
 *   Response 200: { referenceId: string, status: "ACCEPTED", receivedAt: string }
 *   Response 422: { code: string, message: string }
 *   Response 429: rate limited (retry with exponential backoff)
 *
 * NOTE: BIR EIS v1.2 spec is pre-release as of May 2026. Validate against the
 * final spec once PTT is granted — field names may differ.
 */
class LiveBirEisClient implements BirEisClient {
  readonly isLive = true;

  private readonly endpoint: string;
  private readonly apiKey: string;

  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  async submit(jwsCompact: string, payloadId: string): Promise<BirAcknowledgement> {
    if (!jwsCompact || jwsCompact.split(".").length !== 3) {
      throw new Error("Invalid JWS compact serialization");
    }

    const url = `${this.endpoint}/invoice/transmit`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/jose",
          "X-API-Key": this.apiKey,
          // Correlation ID for BIR audit trail — matches the payload's invoiceId
          "X-Payload-Id": payloadId,
        },
        body: jwsCompact,
        // BIR endpoint SLA is 30s per the EIS spec
        signal: AbortSignal.timeout(30_000),
      });
    } catch (err) {
      throw new Error(
        `BIR EIS endpoint unreachable: ${err instanceof Error ? err.message : "Network error"}`,
      );
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") ?? "60";
      throw new Error(`BIR EIS rate limit hit — retry after ${retryAfter}s`);
    }

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const code = (body as Record<string, unknown>).code as string | undefined;
      const message =
        (body as Record<string, unknown>).message as string | undefined;
      throw new Error(
        `BIR EIS rejected payload: ${code ?? response.status} — ${message ?? response.statusText}`,
      );
    }

    const b = body as Record<string, unknown>;
    return {
      accepted: true,
      birReferenceId: (b.referenceId as string) ?? `BIR-LIVE-${payloadId}`,
      receivedAt:
        (b.receivedAt as string) ?? new Date().toISOString(),
    };
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────

let _client: BirEisClient | null = null;

/**
 * Returns the active BIR EIS client.
 *
 * Uses the live client when BIR_EIS_LIVE=true and both BIR_EIS_ENDPOINT
 * and BIR_EIS_API_KEY are set. Falls back to the mock otherwise.
 *
 * The client is a singleton per serverless instance.
 */
export function getBirEisClient(): BirEisClient {
  if (_client) return _client;

  const isLive = process.env.BIR_EIS_LIVE === "true";
  const endpoint = process.env.BIR_EIS_ENDPOINT ?? "";
  const apiKey = process.env.BIR_EIS_API_KEY ?? "";

  if (isLive && endpoint && apiKey) {
    _client = new LiveBirEisClient(endpoint, apiKey);
  } else {
    _client = new MockBirEisClient();
  }

  return _client;
}

/** Resets the singleton — for testing only. */
export function resetBirEisClient(): void {
  _client = null;
}
