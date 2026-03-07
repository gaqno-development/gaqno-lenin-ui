import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("~/service/stt", () => ({
  transcribe: vi.fn(),
}));

describe("useStt", () => {
  beforeEach(async () => {
    vi.resetModules();
    const { transcribe } = await import("~/service/stt");
    vi.mocked(transcribe).mockReset();
  });

  it("transcribe returns text on success", async () => {
    const { transcribe } = await import("~/service/stt");
    vi.mocked(transcribe).mockResolvedValue({ text: "  hello world  " });
    const { useStt } = await import("~/composables/useStt");
    const { transcribe: transcribeFn } = useStt();
    const file = new File(["x"], "a.webm", { type: "audio/webm" });
    const result = await transcribeFn(file);
    expect(result).toBe("hello world");
    expect(transcribe).toHaveBeenCalledWith(file, { model_id: "scribe_v2" });
  });

  it("transcribe passes params", async () => {
    const { transcribe } = await import("~/service/stt");
    vi.mocked(transcribe).mockResolvedValue({ text: "ok" });
    const { useStt } = await import("~/composables/useStt");
    const { transcribe: transcribeFn } = useStt();
    const file = new File(["x"], "a.webm", { type: "audio/webm" });
    await transcribeFn(file, { model_id: "scribe_v1", language_code: "pt" });
    expect(transcribe).toHaveBeenCalledWith(file, {
      model_id: "scribe_v1",
      language_code: "pt",
    });
  });

  it("transcribe sets error and throws on failure", async () => {
    const { transcribe } = await import("~/service/stt");
    vi.mocked(transcribe).mockRejectedValue(new Error("API error"));
    const { useStt } = await import("~/composables/useStt");
    const { transcribe: transcribeFn, error } = useStt();
    const file = new File(["x"], "a.webm", { type: "audio/webm" });
    await expect(transcribeFn(file)).rejects.toThrow("API error");
    expect(error.value).toBe("API error");
  });

  it("transcribe uses fallback message when error is not Error instance", async () => {
    const { transcribe } = await import("~/service/stt");
    vi.mocked(transcribe).mockRejectedValue("string error");
    const { useStt } = await import("~/composables/useStt");
    const { transcribe: transcribeFn, error } = useStt();
    const file = new File(["x"], "a.webm", { type: "audio/webm" });
    await expect(transcribeFn(file)).rejects.toBe("string error");
    expect(error.value).toBe("Falha ao transcrever áudio");
  });

  it("transcribe returns empty when text is empty", async () => {
    const { transcribe } = await import("~/service/stt");
    vi.mocked(transcribe).mockResolvedValue({ text: "" });
    const { useStt } = await import("~/composables/useStt");
    const { transcribe: transcribeFn } = useStt();
    const file = new File(["x"], "a.webm", { type: "audio/webm" });
    const result = await transcribeFn(file);
    expect(result).toBe("");
  });

  it("startRecording and stopAndTranscribe", async () => {
    const stopTrack = vi.fn();
    const mockStream = { getTracks: () => [{ stop: stopTrack }] };
    const mockChunks: Blob[] = [];
    let ondataavailable: ((e: { data: Blob }) => void) | null = null;
    let onstop: (() => void) | null = null;
    const mockRecorder = {
      mimeType: "audio/webm",
      state: "recording",
      start: vi.fn(),
      stop: vi.fn(() => {
        if (ondataavailable) ondataavailable({ data: new Blob(["x"], { type: "audio/webm" }) });
        if (onstop) onstop();
      }),
      get ondataavailable() { return ondataavailable; },
      set ondataavailable(fn: (e: { data: Blob }) => void) { ondataavailable = fn; },
      get onstop() { return onstop; },
      set onstop(fn: () => void) { onstop = fn; },
    };
    const MediaRecorderCtor = vi.fn().mockImplementation(() => mockRecorder);
    (MediaRecorderCtor as unknown as { isTypeSupported: () => boolean }).isTypeSupported = vi.fn().mockReturnValue(true);
    vi.stubGlobal("MediaRecorder", MediaRecorderCtor);
    vi.stubGlobal("navigator", {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(mockStream) },
    });
    const { transcribe } = await import("~/service/stt");
    vi.mocked(transcribe).mockResolvedValue({ text: "transcribed" });
    const { useStt } = await import("~/composables/useStt");
    const { startRecording, stopAndTranscribe, isRecording } = useStt();
    await startRecording();
    expect(isRecording.value).toBe(true);
    const result = await stopAndTranscribe();
    expect(result).toBe("transcribed");
    expect(stopTrack).toHaveBeenCalled();
  });

  it("stopAndTranscribe throws when not recording", async () => {
    const { useStt } = await import("~/composables/useStt");
    const { stopAndTranscribe } = useStt();
    await expect(stopAndTranscribe()).rejects.toThrow("Gravação não iniciada");
  });

  it("startRecording uses undefined mimeType when not supported", async () => {
    const stopTrack = vi.fn();
    const mockStream = { getTracks: () => [{ stop: stopTrack }] };
    let ondataavailable: ((e: { data: Blob }) => void) | null = null;
    let onstop: (() => void) | null = null;
    const mockRecorder = {
      mimeType: "audio/mp4",
      state: "recording",
      start: vi.fn(),
      stop: vi.fn(() => {
        if (ondataavailable) ondataavailable({ data: new Blob(["x"], { type: "audio/mp4" }) });
        if (onstop) onstop();
      }),
      get ondataavailable() { return ondataavailable; },
      set ondataavailable(fn: (e: { data: Blob }) => void) { ondataavailable = fn; },
      get onstop() { return onstop; },
      set onstop(fn: () => void) { onstop = fn; },
    };
    const MediaRecorderCtor = vi.fn().mockImplementation(() => mockRecorder);
    (MediaRecorderCtor as unknown as { isTypeSupported: () => boolean }).isTypeSupported = vi.fn().mockReturnValue(false);
    vi.stubGlobal("MediaRecorder", MediaRecorderCtor);
    vi.stubGlobal("navigator", {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(mockStream) },
    });
    const { transcribe } = await import("~/service/stt");
    vi.mocked(transcribe).mockResolvedValue({ text: "ok" });
    const { useStt } = await import("~/composables/useStt");
    const { startRecording, stopAndTranscribe } = useStt();
    await startRecording();
    const result = await stopAndTranscribe();
    expect(result).toBe("ok");
  });

  it("stopAndTranscribe rejects when transcribe fails", async () => {
    const stopTrack = vi.fn();
    const mockStream = { getTracks: () => [{ stop: stopTrack }] };
    let ondataavailable: ((e: { data: Blob }) => void) | null = null;
    let onstop: (() => void) | null = null;
    const mockRecorder = {
      mimeType: "audio/webm",
      state: "recording",
      start: vi.fn(),
      stop: vi.fn(() => {
        if (ondataavailable) ondataavailable({ data: new Blob(["x"], { type: "audio/webm" }) });
        if (onstop) onstop();
      }),
      get ondataavailable() { return ondataavailable; },
      set ondataavailable(fn: (e: { data: Blob }) => void) { ondataavailable = fn; },
      get onstop() { return onstop; },
      set onstop(fn: () => void) { onstop = fn; },
    };
    const MediaRecorderCtor = vi.fn().mockImplementation(() => mockRecorder);
    (MediaRecorderCtor as unknown as { isTypeSupported: () => boolean }).isTypeSupported = vi.fn().mockReturnValue(true);
    vi.stubGlobal("MediaRecorder", MediaRecorderCtor);
    vi.stubGlobal("navigator", {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(mockStream) },
    });
    const { transcribe } = await import("~/service/stt");
    vi.mocked(transcribe).mockRejectedValue(new Error("Transcribe failed"));
    const { useStt } = await import("~/composables/useStt");
    const { startRecording, stopAndTranscribe } = useStt();
    await startRecording();
    await expect(stopAndTranscribe()).rejects.toThrow("Transcribe failed");
  });

  it("stopAndTranscribe rejects when no audio recorded", async () => {
    const stopTrack = vi.fn();
    const mockStream = { getTracks: () => [{ stop: stopTrack }] };
    let onstop: (() => void) | null = null;
    const mockRecorder = {
      mimeType: "audio/webm",
      state: "recording",
      start: vi.fn(),
      stop: vi.fn(() => {
        if (onstop) onstop();
      }),
      set ondataavailable(_fn: (e: { data: Blob }) => void) {},
      get onstop() { return onstop; },
      set onstop(fn: () => void) { onstop = fn; },
    };
    const MediaRecorderCtor = vi.fn().mockImplementation(() => mockRecorder);
    (MediaRecorderCtor as unknown as { isTypeSupported: () => boolean }).isTypeSupported = vi.fn().mockReturnValue(true);
    vi.stubGlobal("MediaRecorder", MediaRecorderCtor);
    vi.stubGlobal("navigator", {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(mockStream) },
    });
    const { useStt } = await import("~/composables/useStt");
    const { startRecording, stopAndTranscribe } = useStt();
    await startRecording();
    await expect(stopAndTranscribe()).rejects.toThrow("Nenhum áudio gravado");
  });
});
