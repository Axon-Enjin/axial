import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthUser = vi.fn();
const isServerAuthConfigured = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getAuthUser: (...args: unknown[]) => getAuthUser(...args),
  isServerAuthConfigured: (...args: unknown[]) => isServerAuthConfigured(...args),
}));

describe("assertSessionAccess", () => {
  beforeEach(() => {
    vi.resetModules();
    getAuthUser.mockReset();
    isServerAuthConfigured.mockReset();
  });

  it("requires a session when auth is configured", async () => {
    isServerAuthConfigured.mockReturnValue(true);
    getAuthUser.mockResolvedValue(null);
    const { assertSessionAccess } = await import("./session-gate");
    const result = await assertSessionAccess("read");
    expect(result.denied?.status).toBe(401);
    expect(result.user).toBeNull();
  });

  it("returns the user when signed in", async () => {
    isServerAuthConfigured.mockReturnValue(true);
    getAuthUser.mockResolvedValue({
      id: "u1",
      email: "a@b.c",
      orgId: "org-1",
      orgName: "Acme",
      role: "owner",
    });
    const { assertSessionAccess } = await import("./session-gate");
    const result = await assertSessionAccess("read");
    expect(result.denied).toBeNull();
    expect(result.user?.orgId).toBe("org-1");
  });

  it("allows read when auth is not configured", async () => {
    isServerAuthConfigured.mockReturnValue(false);
    const { assertSessionAccess } = await import("./session-gate");
    const result = await assertSessionAccess("read");
    expect(result.denied).toBeNull();
  });
});
