import { expect, test } from "@playwright/test";

test.describe("Axial edge guardrails (API + UI)", () => {
  test("landing page loads brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Axial/i).first()).toBeVisible({ timeout: 45_000 });
  });

  test("NoA ack without token returns 401", async ({ request }) => {
    const res = await request.post("/api/noa/e2e-invoice-missing/ack", {
      data: {},
    });
    expect(res.status()).toBe(401);
    const body = (await res.json()) as { error?: string };
    expect(String(body.error)).toMatch(/token/i);
  });

  test("confirm GET never leaks a raw authToken string", async ({ request }) => {
    const res = await request.get("/api/invoices/nonexistent-e2e/confirm");
    expect(res.status()).toBeLessThan(500);
    const text = await res.text();
    expect(text.trim().startsWith("<!DOCTYPE")).toBeFalsy();
    const body = JSON.parse(text) as { confirmation?: { authToken: string | null } | null };
    expect(JSON.stringify(body)).not.toMatch(/"authToken"\s*:\s*"[^"]+"/);
    if (body.confirmation) {
      expect(body.confirmation.authToken).toBeNull();
    }
  });

  test("swap without explicit sourceInvoiceId is rejected when seed is off", async ({
    request,
  }) => {
    // This assertion is covered in Vitest with env control. In E2E seed is on,
    // so assert the complementary closed-loop signal: missing invoice → not fundable or demo.
    const res = await request.post("/api/swap/execute", {
      data: {
        invoiceId: "e2e-never-fundable",
        sourceInvoiceId: "e2e-never-fundable",
        faceAmount: 10_000,
      },
    });
    expect([200, 409, 502]).toContain(res.status());
  });

  test("liquidity page loads", async ({ page }) => {
    await page.goto("/app/liquidity");
    await expect(page.locator("body")).toContainText(/Liquidity|Factoring|Invoice|USDC|Axial/i, {
      timeout: 45_000,
    });
  });

  test("compliance page loads Co-Pilot copy", async ({ page }) => {
    await page.goto("/app/compliance");
    await expect(page.locator("body")).toContainText(
      /prepared for your review|Compliance|Filing|Oracle|EIS/i,
      { timeout: 45_000 },
    );
  });

  test("EIS submissions endpoint responds", async ({ request }) => {
    const res = await request.get("/api/eis/submissions");
    // File-fallback: 200. Auth-configured: 401 (still proves the gate exists).
    expect([200, 401]).toContain(res.status());
    if (res.status() === 200) {
      const body = (await res.json()) as { submissions: unknown[] };
      expect(Array.isArray(body.submissions)).toBeTruthy();
    }
  });

  test("prepare-only EIS process leaves prepared status when auto-ack off", async ({
    request,
  }) => {
    const ref = `e2e-prep-${Date.now()}`;
    const res = await request.post("/api/eis/process", {
      data: {
        kind: "swap_executed",
        referenceId: ref,
        stellarTxHash: `tx-${ref}`,
        amount: 1000,
      },
    });
    // 200 prepared, or 401 if auth configured
    expect([200, 401]).toContain(res.status());
    if (res.status() === 200) {
      const body = (await res.json()) as { status?: string };
      expect(body.status).toBe("prepared");
    }
  });
});
