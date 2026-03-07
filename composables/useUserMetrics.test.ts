import { describe, expect, it, vi, beforeEach } from "vitest";
import { useUserMetrics } from "~/composables/useUserMetrics";

describe("useUserMetrics", () => {
  beforeEach(() => {
    vi.stubGlobal("Intl", {
      DateTimeFormat: vi.fn().mockReturnValue({
        resolvedOptions: () => ({ timeZone: "America/New_York" }),
      }),
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { language: "en-US", languages: ["en-US", "en"] },
      writable: true,
    });
  });

  it("getTimezone returns timezone", () => {
    const { getTimezone } = useUserMetrics();
    expect(getTimezone()).toBe("America/New_York");
  });

  it("getLanguage returns language", () => {
    const { getLanguage } = useUserMetrics();
    expect(getLanguage()).toBe("en-US");
  });

  it("setMetricsHeaders sets x-user-timezone and x-user-language", () => {
    const { setMetricsHeaders } = useUserMetrics();
    const headers = setMetricsHeaders();
    expect(headers.get("x-user-timezone")).toBe("America/New_York");
    expect(headers.get("x-user-language")).toBe("en-US");
  });

  it("getTimezone returns null on error", () => {
    vi.stubGlobal("Intl", { DateTimeFormat: vi.fn().mockImplementation(() => { throw new Error(""); }) });
    const { getTimezone } = useUserMetrics();
    expect(getTimezone()).toBeNull();
  });

  it("getLanguage returns null on error", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        get language() { throw new Error(""); },
        get languages() { throw new Error(""); },
      },
      writable: true,
    });
    const { getLanguage } = useUserMetrics();
    expect(getLanguage()).toBeNull();
  });

  it("getLanguage falls back to languages[0] when language is empty", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { language: "", languages: ["pt-BR", "pt", "en"] },
      writable: true,
    });
    const { getLanguage } = useUserMetrics();
    expect(getLanguage()).toBe("pt-BR");
  });
});
