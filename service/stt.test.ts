import { describe, expect, it, vi, beforeEach } from "vitest";
import { transcribe, getRealtimeSttToken } from "~/service/stt";

vi.mock("~/lib/api-config", () => ({
  getAiServiceUrl: () => "https://ai.test",
}));

describe("stt", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("transcribe returns text on success", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: "Hello world" }),
    });
    const file = new File(["x"], "a.webm", { type: "audio/webm" });
    const result = await transcribe(file);
    expect(result).toEqual({ text: "Hello world" });
    expect(fetch).toHaveBeenCalledWith(
      "https://ai.test/audio/speech-to-text",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("transcribe sends params", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: "x" }),
    });
    const file = new File(["x"], "a.webm", { type: "audio/webm" });
    await transcribe(file, {
      model_id: "scribe_v1",
      language_code: "pt",
      diarize: true,
      tag_audio_events: true,
    });
    const formData = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body;
    expect(formData.get("model_id")).toBe("scribe_v1");
    expect(formData.get("language_code")).toBe("pt");
    expect(formData.get("diarize")).toBe("true");
    expect(formData.get("tag_audio_events")).toBe("true");
  });

  it("transcribe throws on API error", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "STT failed" }),
    });
    const file = new File(["x"], "a.webm", { type: "audio/webm" });
    await expect(transcribe(file)).rejects.toThrow("STT failed");
  });

  it("getRealtimeSttToken returns token and wsUrl", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: "abc", wsUrl: "wss://x" }),
    });
    const result = await getRealtimeSttToken();
    expect(result).toEqual({ token: "abc", wsUrl: "wss://x" });
    expect(fetch).toHaveBeenCalledWith(
      "https://ai.test/audio/speech-to-text/realtime-token",
      { method: "POST" }
    );
  });

  it("getRealtimeSttToken throws on API error", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Token error" }),
    });
    await expect(getRealtimeSttToken()).rejects.toThrow("Token error");
  });

  it("transcribe uses fallback when response.json fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("parse error")),
    });
    const file = new File(["x"], "a.webm", { type: "audio/webm" });
    await expect(transcribe(file)).rejects.toThrow("Erro ao transcrever áudio");
  });

  it("getRealtimeSttToken uses fallback when response.json fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new Error("parse error")),
    });
    await expect(getRealtimeSttToken()).rejects.toThrow("Erro ao obter token de STT");
  });
});
