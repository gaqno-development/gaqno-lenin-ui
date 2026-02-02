import {
  transcribe as transcribeFile,
  type TranscribeRequest,
} from "~/service/stt";

const DEFAULT_MIME = "audio/webm;codecs=opus";

export function useStt() {
  const isTranscribing = ref(false);
  const isRecording = ref(false);
  const error = ref<string | null>(null);

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  const chunks: Blob[] = [];

  const transcribe = async (
    file: File,
    params?: Partial<TranscribeRequest>
  ): Promise<string> => {
    isTranscribing.value = true;
    error.value = null;
    try {
      const result = await transcribeFile(
        file,
        params ?? { model_id: "scribe_v2" }
      );
      return result.text?.trim() ?? "";
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Falha ao transcrever áudio";
      error.value = message;
      throw e;
    } finally {
      isTranscribing.value = false;
    }
  };

  const startRecording = async (): Promise<void> => {
    error.value = null;
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported(DEFAULT_MIME)
        ? DEFAULT_MIME
        : undefined,
      audioBitsPerSecond: 128000,
    });
    chunks.length = 0;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.start(100);
    isRecording.value = true;
  };

  const stopAndTranscribe = async (
    options?: Partial<TranscribeRequest>
  ): Promise<string> => {
    const rec = recorder;
    if (!rec || rec.state === "inactive") {
      throw new Error("Gravação não iniciada");
    }
    return new Promise((resolve, reject) => {
      rec.onstop = async () => {
        const mimeType = rec.mimeType || "audio/webm";
        stream?.getTracks().forEach((t) => t.stop());
        stream = null;
        recorder = null;
        isRecording.value = false;
        if (chunks.length === 0) {
          reject(new Error("Nenhum áudio gravado"));
          return;
        }
        const blob = new Blob(chunks, { type: mimeType });
        const ext = mimeType.includes("webm") ? "webm" : "mp4";
        const file = new File([blob], `recording.${ext}`, { type: blob.type });
        try {
          const text = await transcribe(file, options);
          resolve(text);
        } catch (e) {
          reject(e);
        }
      };
      rec.stop();
    });
  };

  return {
    transcribe,
    startRecording,
    stopAndTranscribe,
    isTranscribing,
    isRecording,
    error,
  };
}
