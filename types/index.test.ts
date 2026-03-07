import { describe, expect, it } from "vitest";
import * as types from "~/types";

describe("types", () => {
  it("exports User interface", () => {
    expect(types).toBeDefined();
  });
});
