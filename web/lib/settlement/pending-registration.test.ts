import { afterEach, describe, expect, it } from "vitest";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  enqueuePendingRegistration,
  listPendingRegistrations,
  markRegistrationAttempt,
} from "./pending-registration";

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "pending-settlement-registrations.json");

afterEach(async () => {
  await rm(STORE_PATH, { force: true });
});

describe("pending settlement registration store", () => {
  it("enqueues and clears on success", async () => {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(STORE_PATH, JSON.stringify({ pending: [] }), "utf8");

    await enqueuePendingRegistration({
      invoiceId: "inv-1",
      swapTxHash: "abc",
      faceUsdc: 1000,
      advance: 850,
      lastError: "boom",
    });
    expect(await listPendingRegistrations()).toHaveLength(1);

    await markRegistrationAttempt("inv-1", { ok: true });
    expect(await listPendingRegistrations()).toHaveLength(0);
  });

  it("increments attempts on failure", async () => {
    await enqueuePendingRegistration({
      invoiceId: "inv-2",
      swapTxHash: "def",
      faceUsdc: 100,
      advance: 85,
    });
    await markRegistrationAttempt("inv-2", { ok: false, error: "rpc down" });
    const rows = await listPendingRegistrations();
    expect(rows[0]?.attempts).toBe(1);
    expect(rows[0]?.lastError).toBe("rpc down");
  });
});
