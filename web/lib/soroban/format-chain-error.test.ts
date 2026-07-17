import { describe, expect, it } from "vitest";
import { formatChainError } from "./format-chain-error";

describe("formatChainError", () => {
  it("maps resource limit to calm retry copy", () => {
    expect(formatChainError("RESOURCE_LIMIT_EXCEEDED")).toMatch(/Network congested/);
  });

  it("maps bad auth", () => {
    expect(formatChainError("op_bad_auth")).toMatch(/signature invalid/i);
  });
});
