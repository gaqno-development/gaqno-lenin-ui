import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  postTextToSpeech,
  postElevenLabsTextToSpeech,
} from "~/service/elevenlabs";

describe("elevenlabs", () => {
  beforeEach(() => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { API_URL: "https://api.test", AI_SERVICE_URL: "https://ai.test" },
    }));
  });

  it("postTextToSpeech returns ArrayBuffer", async () => {
    const buffer = new ArrayBuffer(8);
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(buffer),
    });

    const result = await postTextToSpeech({
      payload: {
        model_id: "eleven",
        text: "Hello",
        voice_settings: {},
      },
    });
    expect(result).toBe(buffer);
    expect(fetch).toHaveBeenCalledWith(
      "https://ai.test/audio/text-to-speech",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("throws on API error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "TTS failed" }),
    });

    await expect(
      postTextToSpeech({
        payload: { model_id: "x", text: "x", voice_settings: {} },
      })
    ).rejects.toThrow("TTS failed");
  });

  it("uses fallback message when response.json fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("parse error")),
    });

    await expect(
      postTextToSpeech({
        payload: { model_id: "x", text: "x", voice_settings: {} },
      })
    ).rejects.toThrow("Erro ao gerar áudio");
  });

  it("postElevenLabsTextToSpeech is alias of postTextToSpeech", () => {
    expect(postElevenLabsTextToSpeech).toBe(postTextToSpeech);
  });
});
