import { afterEach, describe, expect, it } from "vitest";
import { resolveOrgId } from "./store";

describe("resolveOrgId", () => {
  const prev = process.env.AXIAL_ORG_ID;

  afterEach(() => {
    if (prev === undefined) delete process.env.AXIAL_ORG_ID;
    else process.env.AXIAL_ORG_ID = prev;
  });

  it("never defaults to demo-msme", () => {
    delete process.env.AXIAL_ORG_ID;
    expect(resolveOrgId()).toBe("demo-org");
    expect(resolveOrgId(null)).toBe("demo-org");
    expect(resolveOrgId("")).toBe("demo-org");
  });

  it("prefers explicit org id then env", () => {
    process.env.AXIAL_ORG_ID = "env-org";
    expect(resolveOrgId("  custom  ")).toBe("custom");
    expect(resolveOrgId()).toBe("env-org");
  });
});
