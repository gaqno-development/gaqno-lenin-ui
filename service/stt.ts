import { getAiServiceUrl } from "~/lib/api-config";

export type SttModelId = "scribe_v1" | "scribe_v2";

export interface TranscribeRequest {
  model_id: SttModelId;
  language_code?: string;
  tag_audio_events?: boolean;
  diarize?: boolean;
}

export interface TranscribeResponse {
  text: string;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    type: string;
    speaker_id?: string;
    logprob?: number;
  }>;
  language_code?: string;
  language_probability?: number;
}

export interface RealtimeSttTokenResponse {
  token: string;
  wsUrl: string;
}

const DEFAULT_MODEL: SttModelId = "scribe_v2";

export async function transcribe(
  file: File,
  params: Partial<TranscribeRequest> = {}
): Promise<TranscribeResponse> {
  const baseUrl = getAiServiceUrl();
  const form = new FormData();
  form.append("file", file);
  form.append("model_id", params.model_id ?? DEFAULT_MODEL);
  if (params.language_code != null) {
    form.append("language_code", params.language_code);
  }
  if (params.tag_audio_events != null) {
    form.append("tag_audio_events", String(params.tag_audio_events));
  }
  if (params.diarize != null) {
    form.append("diarize", String(params.diarize));
  }

  const response = await fetch(`${baseUrl}/audio/speech-to-text`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Erro ao transcrever áudio" }));
    const error = new Error(
      errorData.message || "Erro ao transcrever áudio"
    ) as Error & { statusCode?: number };
    (error as Error & { statusCode?: number }).statusCode = response.status;
    throw error;
  }

  return response.json();
}

export async function getRealtimeSttToken(): Promise<RealtimeSttTokenResponse> {
  const baseUrl = getAiServiceUrl();
  const response = await fetch(
    `${baseUrl}/audio/speech-to-text/realtime-token`,
    { method: "POST" }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Erro ao obter token de STT" }));
    throw new Error(errorData.message || "Erro ao obter token de STT");
  }

  return response.json();
}
