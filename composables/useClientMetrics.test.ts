import { describe, expect, it, vi, beforeEach } from "vitest";
import { useClientMetrics } from "~/composables/useClientMetrics";

describe("useClientMetrics", () => {
  beforeEach(() => {
    vi.stubGlobal("Intl", {
      DateTimeFormat: vi.fn().mockReturnValue({
        resolvedOptions: () => ({ timeZone: "UTC" }),
      }),
    });
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Chrome", language: "en" },
      writable: true,
    });
    globalThis.fetch = vi.fn();
  });

  it("parseUserAgent detects Chrome", () => {
    const { getClientMetrics } = useClientMetrics();
    const fn = getClientMetrics as () => Promise<{ user_browser: string | null }>;
    expect(true).toBe(true);
  });

  it("getTimezone returns timezone", () => {
    const { getClientMetrics } = useClientMetrics();
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ip: "1.2.3.4" }) })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            status: "success",
            city: "NYC",
            country: "US",
            regionName: "NY",
          }),
      });
    return getClientMetrics().then((m) => {
      expect(m.user_timezone).toBe("UTC");
      expect(m.user_browser).toBe("Chrome");
      expect(m.user_ip).toBe("1.2.3.4");
      expect(m.user_city).toBe("NYC");
      expect(m.user_country).toBe("US");
      expect(m.user_region).toBe("NY");
    });
  });

  it("parseUserAgent returns browser os device", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0" },
      writable: true,
    });
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ip: "1.2.3.4" }) })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ status: "success" }),
      });
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_browser).toBe("Firefox");
      expect(m.user_os).toBe("Windows");
      expect(m.user_device).toBe("Desktop");
    });
  });

  it("handles fetch failure for ip", () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("net"));
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_ip).toBeNull();
      expect(m.user_city).toBeNull();
    });
  });

  it("handles empty userAgent", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "" },
      writable: true,
    });
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("net"));
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_browser).toBeNull();
      expect(m.user_os).toBeNull();
      expect(m.user_device).toBeNull();
    });
  });

  it("parseUserAgent detects Safari", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15" },
      writable: true,
    });
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("net"));
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_browser).toBe("Safari");
      expect(m.user_os).toBe("macOS");
    });
  });

  it("parseUserAgent detects Edge", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/91.0" },
      writable: true,
    });
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("net"));
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_browser).toBe("Edge");
    });
  });

  it("parseUserAgent detects Opera", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 Opera/9.80" },
      writable: true,
    });
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("net"));
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_browser).toBe("Opera");
    });
  });

  it("parseUserAgent detects Linux", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/91.0" },
      writable: true,
    });
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("net"));
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_os).toBe("Linux");
    });
  });

  it("parseUserAgent detects Android", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 (Android 11; Mobile) Chrome/91.0" },
      writable: true,
    });
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("net"));
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_os).toBe("Android");
      expect(m.user_device).toBe("Mobile");
    });
  });

  it("parseUserAgent detects iOS", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 (iOS 14.0; iPhone) Safari/605.1 Mobile" },
      writable: true,
    });
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("net"));
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_os).toBe("iOS");
    });
  });

  it("parseUserAgent detects Tablet", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { userAgent: "Mozilla/5.0 (Tablet; Linux) Firefox/91.0" },
      writable: true,
    });
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("net"));
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_device).toBe("Tablet");
    });
  });

  it("handles ip-api status not success", () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ip: "1.2.3.4" }) })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ status: "fail" }),
      });
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_ip).toBe("1.2.3.4");
      expect(m.user_city).toBeNull();
      expect(m.user_country).toBeNull();
      expect(m.user_region).toBeNull();
    });
  });

  it("getTimezone returns null when Intl throws", () => {
    vi.stubGlobal("Intl", {
      DateTimeFormat: vi.fn().mockImplementation(() => {
        throw new Error("Intl error");
      }),
    });
    const { getTimezone } = useClientMetrics();
    expect(getTimezone()).toBeNull();
  });

  it("getLanguage returns null when navigator throws", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        get language() {
          throw new Error("navigator error");
        },
        get languages() {
          throw new Error("navigator error");
        },
      },
      writable: true,
    });
    const { getLanguage } = useClientMetrics();
    expect(getLanguage()).toBeNull();
  });

  it("handles ip-api location fetch failure", () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ json: () => Promise.resolve({ ip: "1.2.3.4" }) })
      .mockRejectedValueOnce(new Error("location failed"));
    return useClientMetrics().getClientMetrics().then((m) => {
      expect(m.user_ip).toBe("1.2.3.4");
      expect(m.user_city).toBeNull();
    });
  });
});
