export const getApiUrl = (): string => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.API_URL;
  if (!apiUrl) {
    throw new Error(
      "API URL is not configured. Please set NUXT_PUBLIC_API_URL environment variable."
    );
  }
  return apiUrl;
};

export const getAiServiceUrl = (): string => {
  const config = useRuntimeConfig();
  const aiServiceUrl = config.public.AI_SERVICE_URL;
  const apiUrl = config.public.API_URL;
  const base = aiServiceUrl || apiUrl;
  if (!base) {
    throw new Error(
      "AI Service URL is not configured. Set NUXT_PUBLIC_AI_SERVICE_URL or NUXT_PUBLIC_API_URL."
    );
  }
  return base;
};
