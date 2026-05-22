/**
 * BIR EIS JWS signing.
 *
 * Two modes:
 *
 * MOCK (default — hackathon):
 *   HS256 HMAC over payload JSON. Secret from EIS_JWS_MOCK_SECRET env var.
 *   Produces a valid compact JWS that the mock BIR endpoint accepts.
 *   NOT acceptable to the real BIR EIS endpoint.
 *
 * LIVE (production — PTT required):
 *   RS256 with the BIR-registered private key (PKCS#8 PEM, base64-encoded).
 *   Key from BIR_JWS_PRIVATE_KEY_B64 env var (base64 of the PEM file).
 *   In production this key should be in a vault (AWS Secrets Manager, etc.);
 *   load it via BIR_JWS_PRIVATE_KEY_B64 only for staging/PTT testing.
 *
 * Switch to live signing: set BIR_EIS_LIVE=true and BIR_JWS_PRIVATE_KEY_B64.
 *
 * BIR JWS requirements (from BIR EIRS v1.2 spec, pre-release May 2026):
 *   alg: RS256
 *   header: { alg: "RS256", typ: "JWT", kid: "<BIR-issued key ID>" }
 *   payload: BirEisPayload (JSON)
 *   cert: your BIR-registered X.509 certificate (PEM) registered at enrollment
 *
 * See docs/clr-axial.md for the PTT certification path.
 */

import { createHmac, createSign } from "node:crypto";
import type { BirEisPayload } from "./types";

// ── Mock signing (HS256) ──────────────────────────────────────────────────────

/**
 * Hackathon mock JWS — HS256 over payload JSON.
 * Production path: vault + BIR-registered RS256 key.
 */
export function signEisPayloadMock(payload: BirEisPayload): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = process.env.EIS_JWS_MOCK_SECRET ?? "axial-hackathon-eis-mock-key";
  const sig = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

// ── Live signing (RS256) ──────────────────────────────────────────────────────

/**
 * Production JWS signing — RS256 with the BIR-registered private key.
 *
 * Requires:
 *   BIR_JWS_PRIVATE_KEY_B64 — base64-encoded PKCS#8 PEM private key
 *   BIR_JWS_KEY_ID          — BIR-issued key ID (optional, included in header kid)
 *
 * The key is the private key corresponding to the X.509 certificate you
 * enrolled with BIR during the PTT process.
 */
export function signEisPayloadRS256(payload: BirEisPayload): string {
  const keyB64 = process.env.BIR_JWS_PRIVATE_KEY_B64;
  if (!keyB64) {
    throw new Error(
      "BIR_JWS_PRIVATE_KEY_B64 is not set — cannot sign with RS256. " +
        "Set BIR_EIS_LIVE=false to use the mock signer.",
    );
  }

  const keyPem = Buffer.from(keyB64, "base64").toString("utf8");
  const kid = process.env.BIR_JWS_KEY_ID ?? undefined;

  const headerObj: Record<string, string> = { alg: "RS256", typ: "JWT" };
  if (kid) headerObj.kid = kid;

  const header = Buffer.from(JSON.stringify(headerObj)).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${header}.${body}`;

  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const sig = sign.sign(keyPem, "base64url");

  return `${signingInput}.${sig}`;
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Sign an EIS payload using the configured algorithm.
 * Uses RS256 when BIR_EIS_LIVE=true and the key is present; HS256 mock otherwise.
 */
export function signEisPayload(payload: BirEisPayload): string {
  if (
    process.env.BIR_EIS_LIVE === "true" &&
    process.env.BIR_JWS_PRIVATE_KEY_B64
  ) {
    return signEisPayloadRS256(payload);
  }
  return signEisPayloadMock(payload);
}
