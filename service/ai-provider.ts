import { useUserMetrics } from "~/composables/useUserMetrics";
import { getApiUrl } from "~/lib/api-config";

const CHAT_COMPLETION_TIMEOUT_MS = 60_000;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatCompletionRequest {
  question: string;
  model?: string;
  history?: ChatMessage[];
}

interface ChatCompletionResponse {
  message: {
    content: string;
    role: string;
  };
}

function timeoutPromise<T>(ms: number, message: string): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

const useChatCompletion = async (
  question: string,
  model?: string,
  history?: ChatMessage[],
): Promise<ChatCompletionResponse> => {
  const { setMetricsHeaders } = useUserMetrics();
  const headers = setMetricsHeaders();

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "x-user-timezone": headers.get("x-user-timezone") || "",
    "x-user-language": headers.get("x-user-language") || "",
  };

  const requestBody: ChatCompletionRequest = {
    question,
  };

  if (model) {
    requestBody.model = model;
  }

  if (history && history.length > 0) {
    requestBody.history = history;
  }

  const apiUrl = getApiUrl();
  const fetchPromise = (async () => {
    const response = await fetch(`${apiUrl}/chat`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erro ao processar requisição" }));
      const error = new Error(errorData.message || "Erro ao processar requisição") as Error & { statusCode?: number };
      error.statusCode = response.status;
      throw error;
    }

    return response.json();
  })();

  const timeoutMessage = "Tempo esgotado. Tente novamente.";
  return Promise.race([
    fetchPromise,
    timeoutPromise<ChatCompletionResponse>(CHAT_COMPLETION_TIMEOUT_MS, timeoutMessage),
  ]);
};

export { useChatCompletion };
