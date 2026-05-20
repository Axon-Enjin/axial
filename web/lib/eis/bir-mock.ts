import type { BirAcknowledgement } from "./types";

/** Simulates BIR EIS HTTPS acknowledgement (hackathon mock). */
export function acknowledgeEisSubmission(
  jwsCompact: string,
  payloadId: string,
): BirAcknowledgement {
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
