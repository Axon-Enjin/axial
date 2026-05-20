import { createHmac } from "node:crypto";
import type { BirEisPayload } from "./types";

/** Hackathon mock JWS — HS256 over payload JSON (production: vault + BIR-registered key). */
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
