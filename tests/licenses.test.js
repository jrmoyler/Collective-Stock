import { describe, expect, it } from "vitest";
import { LICENSES, getLicense } from "../src/licensing/license-definitions.js";

describe("licensing architecture", () => {
  it("supports the required rights profiles", () => expect(Object.keys(LICENSES)).toEqual(expect.arrayContaining(["collective-ai-internal-use", "royalty-free-commercial-use", "editorial-use", "restricted-approval-required", "rights-managed-custom", "public-download"])));
  it("marks private profiles at the data layer", () => expect(getLicense("collective-ai-internal-use").private).toBe(true));
  it("falls back to approval-required instead of permissive rights", () => expect(getLicense("unknown").short).toBe("Approval required"));
});
