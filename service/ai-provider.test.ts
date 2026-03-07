import { describe, expect, it, vi, beforeEach } from "vitest";
import { useChatCompletion } from "~/service/ai-provider";

vi.mock("~/composables/useUserMetrics", () => ({
  useUserMetrics: () => ({
    setMetricsHeaders: () => {
      const h = new Headers();
      h.set("x-user-timezone", "UTC");
      h.set("x-user-language", "en");
      return h;
    },
  }),
}));

describe("ai-provider", () => {
  beforeEach(() => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { API_URL: "https://api.test" },
    }));
  });

  it("returns chat completion response", async () => {
    const mockRes = { message: { content: "Hi", role: "assistant" } };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRes),
    });

    const result = await useChatCompletion("Hello");
    expect(result).toEqual(mockRes);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.test/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ question: "Hello" }),
      })
    );
  });

  it("includes model when provided", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: { content: "x", role: "assistant" } }),
    });

    await useChatCompletion("Hi", "gpt-4");
    expect(fetch).toHaveBeenCalledWith(
      "https://api.test/chat",
      expect.objectContaining({
        body: JSON.stringify({ question: "Hi", model: "gpt-4" }),
      })
    );
  });

  it("includes history when provided", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: { content: "x", role: "assistant" } }),
    });

    await useChatCompletion("Hi", undefined, [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ]);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.test/chat",
      expect.objectContaining({
        body: JSON.stringify({
          question: "Hi",
          history: [
            { role: "user", content: "Hello" },
            { role: "assistant", content: "Hi there" },
          ],
        }),
      })
    );
  });

  it("throws on API error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "Server error" }),
    });

    await expect(useChatCompletion("Hi")).rejects.toThrow("Server error");
  });

  it("does not include history when empty array", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: { content: "x", role: "assistant" } }),
    });

    await useChatCompletion("Hi", undefined, []);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.test/chat",
      expect.objectContaining({
        body: JSON.stringify({ question: "Hi" }),
      })
    );
  });

  it("uses fallback message when response.json fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("parse error")),
    });

    await expect(useChatCompletion("Hi")).rejects.toThrow("Erro ao processar requisição");
  });

  it(
    "rejects on timeout",
    async () => {
      globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
      await expect(useChatCompletion("Hi")).rejects.toThrow(
        "Tempo esgotado. Tente novamente."
      );
    },
    65_000
  );
});
