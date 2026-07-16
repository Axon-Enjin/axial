import { afterEach, describe, expect, it } from "vitest";
import { assertCronAuthorized } from "./auth";

describe("assertCronAuthorized", () => {
  const prevSecret = process.env.CRON_SECRET;
  const prevNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (prevSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = prevSecret;
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
  });

  it("fails closed in production when CRON_SECRET is unset", async () => {
    delete process.env.CRON_SECRET;
    process.env.NODE_ENV = "production";
    const res = assertCronAuthorized(new Request("http://localhost/api/eis/worker"));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(503);
  });

  it("allows unset secret outside production", () => {
    delete process.env.CRON_SECRET;
    process.env.NODE_ENV = "development";
    expect(assertCronAuthorized(new Request("http://localhost/x"))).toBeNull();
  });

  it("rejects wrong bearer token when secret is set", async () => {
    process.env.CRON_SECRET = "s3cret";
    process.env.NODE_ENV = "development";
    const res = assertCronAuthorized(
      new Request("http://localhost/x", {
        headers: { authorization: "Bearer wrong" },
      }),
    );
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it("accepts matching bearer token", () => {
    process.env.CRON_SECRET = "s3cret";
    expect(
      assertCronAuthorized(
        new Request("http://localhost/x", {
          headers: { authorization: "Bearer s3cret" },
        }),
      ),
    ).toBeNull();
  });
});
