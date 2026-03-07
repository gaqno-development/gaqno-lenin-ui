import { describe, expect, it, vi, beforeEach } from "vitest";
import { useAnalytics } from "~/service/analytics";

describe("analytics", () => {
  beforeEach(() => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { API_URL: "https://api.test", AI_SERVICE_URL: "https://ai.test" },
    }));
  });

  it("returns analytics data", async () => {
    const mockData = {
      totalQuestions: 10,
      metrics: {
        byCountry: {},
        byBrowser: {},
        byDevice: {},
        byOS: {},
      },
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await useAnalytics();
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.test/metrics/analytics",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("throws on API error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Analytics error" }),
    });

    await expect(useAnalytics()).rejects.toThrow("Analytics error");
  });

  it("uses fallback message when response.json fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error("parse error")),
    });

    await expect(useAnalytics()).rejects.toThrow("Erro ao buscar analytics");
  });
});
