import { getAiServiceUrl } from "~/lib/api-config";

export interface ITextToSpeechPayload {
  headers?: string[];
  params?: Record<string, string | number | boolean>;
  payload: {
    model_id: string;
    text: string;
    voice_settings: Record<string, string | number | boolean>;
  };
}

export const postTextToSpeech = async (
  body: ITextToSpeechPayload
): Promise<ArrayBuffer> => {
  const baseUrl = getAiServiceUrl();
  const response = await fetch(`${baseUrl}/audio/text-to-speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Erro ao gerar áudio" }));
    const error = new Error(
      errorData.message || "Erro ao gerar áudio"
    ) as Error & { statusCode?: number };
    error.statusCode = response.status;
    throw error;
  }

  return response.arrayBuffer();
};

/** @deprecated Use postTextToSpeech. Kept for backward compatibility. */
export const postElevenLabsTextToSpeech = postTextToSpeech;
