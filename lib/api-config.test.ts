import { describe, expect, it, vi } from "vitest";
import { getApiUrl, getAiServiceUrl } from "~/lib/api-config";

describe("api-config", () => {
  it("getApiUrl returns API_URL from config", () => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { API_URL: "https://api.example.com", AI_SERVICE_URL: "https://ai.example.com" },
    }));
    expect(getApiUrl()).toBe("https://api.example.com");
  });

  it("getApiUrl throws when API_URL is missing", () => {
    vi.stubGlobal("useRuntimeConfig", () => ({ public: {} }));
    expect(() => getApiUrl()).toThrow("API URL is not configured");
  });

  it("getAiServiceUrl returns AI_SERVICE_URL when set", () => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { API_URL: "https://api.example.com", AI_SERVICE_URL: "https://ai.example.com" },
    }));
    expect(getAiServiceUrl()).toBe("https://ai.example.com");
  });

  it("getAiServiceUrl falls back to API_URL when AI_SERVICE_URL is missing", () => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { API_URL: "https://api.example.com" },
    }));
    expect(getAiServiceUrl()).toBe("https://api.example.com");
  });

  it("getAiServiceUrl throws when both are missing", () => {
    vi.stubGlobal("useRuntimeConfig", () => ({ public: {} }));
    expect(() => getAiServiceUrl()).toThrow("AI Service URL is not configured");
  });
});
