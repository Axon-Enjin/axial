import type { KybStatus } from "../types";
import { updatePayerKyb } from "../store";

export type KybProvider = {
  mode: "mock" | "manual" | "vendor";
  verifyOnCreate(payerId: string): Promise<void>;
  setStatus(payerId: string, status: KybStatus): Promise<void>;
};

export function resolveKybMode(): "mock" | "manual" | "vendor" {
  const mode = (process.env.AXIAL_KYB_MODE ?? "mock").toLowerCase();
  if (mode === "manual" || mode === "vendor") return mode;
  return "mock";
}

export function createKybProvider(): KybProvider {
  const mode = resolveKybMode();

  if (mode === "manual") {
    return {
      mode: "manual",
      async verifyOnCreate() {
        // stays pending until admin PATCH
      },
      async setStatus(payerId, status) {
        await updatePayerKyb(payerId, status);
      },
    };
  }

  if (mode === "vendor") {
    return {
      mode: "vendor",
      async verifyOnCreate() {
        // vendor hook — stays pending until vendor callback
      },
      async setStatus(payerId, status) {
        await updatePayerKyb(payerId, status);
      },
    };
  }

  return {
    mode: "mock",
    async verifyOnCreate(payerId) {
      await updatePayerKyb(payerId, "verified");
    },
    async setStatus(payerId, status) {
      await updatePayerKyb(payerId, status);
    },
  };
}
