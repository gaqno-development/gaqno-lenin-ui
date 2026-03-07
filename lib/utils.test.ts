import { describe, expect, it } from "vitest";
import { cn, getCurrentLocalTime, createLocalTimestamp, formatSupabaseTimestamp } from "~/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });
});

describe("getCurrentLocalTime", () => {
  it("returns formatted time string", () => {
    const result = getCurrentLocalTime();
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("accepts timezone parameter", () => {
    const result = getCurrentLocalTime("America/New_York");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("returns ISO string on error", () => {
    const result = getCurrentLocalTime("Invalid/Timezone");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("createLocalTimestamp", () => {
  it("returns timestamp format", () => {
    const result = createLocalTimestamp();
    expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/);
  });

  it("accepts timezone parameter", () => {
    const result = createLocalTimestamp("UTC");
    expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/);
  });

  it("returns ISO string on error", () => {
    const result = createLocalTimestamp("Invalid/Timezone");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("formatSupabaseTimestamp", () => {
  it("formats UTC timestamp", () => {
    const result = formatSupabaseTimestamp("2025-01-15 12:00:00.000000");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("strips +00 suffix", () => {
    const result = formatSupabaseTimestamp("2025-01-15 12:00:00.542291+00");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("accepts user timezone", () => {
    const result = formatSupabaseTimestamp("2025-01-15 12:00:00.000000", "Europe/London");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("returns original on error", () => {
    const result = formatSupabaseTimestamp("2025-01-15 12:00:00", "Invalid/Timezone");
    expect(result).toBe("2025-01-15 12:00:00");
  });
});
