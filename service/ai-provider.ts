import { useUserMetrics } from "~/composables/useUserMetrics";
import { useClientMetrics } from "~/composables/useClientMetrics";
import { getApiUrl } from "~/lib/api-config";

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

const useChatCompletion = async (
  question: string,
  model?: string,
  history?: ChatMessage[],
): Promise<ChatCompletionResponse> => {
  const { setMetricsHeaders } = useUserMetrics();
  const { getClientMetrics } = useClientMetrics();
  const headers = setMetricsHeaders();
  const clientMetrics = await getClientMetrics();

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "x-user-timezone": headers.get("x-user-timezone") || clientMetrics.user_timezone || "",
    "x-user-language": headers.get("x-user-language") || clientMetrics.user_language || "",
  };

  if (clientMetrics.user_ip) requestHeaders["x-user-ip"] = clientMetrics.user_ip;
  if (clientMetrics.user_city) requestHeaders["x-user-city"] = clientMetrics.user_city;
  if (clientMetrics.user_country) requestHeaders["x-user-country"] = clientMetrics.user_country;
  if (clientMetrics.user_region) requestHeaders["x-user-region"] = clientMetrics.user_region;
  if (clientMetrics.user_browser) requestHeaders["x-user-browser"] = clientMetrics.user_browser;
  if (clientMetrics.user_os) requestHeaders["x-user-os"] = clientMetrics.user_os;
  if (clientMetrics.user_device) requestHeaders["x-user-device"] = clientMetrics.user_device;

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
};

export { useChatCompletion };
