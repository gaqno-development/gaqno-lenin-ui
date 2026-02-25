export interface IClientMetrics {
  user_ip: string | null;
  user_city: string | null;
  user_country: string | null;
  user_region: string | null;
  user_browser: string | null;
  user_os: string | null;
  user_device: string | null;
  user_language: string | null;
  user_timezone: string | null;
}

export const useClientMetrics = () => {
  const getTimezone = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return null;
    }
  };

  const getLanguage = () => {
    try {
      return navigator.language || navigator.languages?.[0];
    } catch {
      return null;
    }
  };

  const parseUserAgent = (
    userAgent: string
  ): { browser: string | null; os: string | null; device: string | null } => {
    if (!userAgent) return { browser: null, os: null, device: null };

    let browser = null;
    let os = null;
    let device = null;

    // Browser detection
    if (userAgent.includes("Chrome")) {
      browser = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
    } else if (userAgent.includes("Safari")) {
      browser = "Safari";
    } else if (userAgent.includes("Edge")) {
      browser = "Edge";
    } else if (userAgent.includes("Opera")) {
      browser = "Opera";
    }

    // OS detection
    if (userAgent.includes("Windows")) {
      os = "Windows";
    } else if (userAgent.includes("Mac OS X")) {
      os = "macOS";
    } else if (userAgent.includes("Linux")) {
      os = "Linux";
    } else if (userAgent.includes("Android")) {
      os = "Android";
    } else if (userAgent.includes("iOS")) {
      os = "iOS";
    }

    // Device detection
    if (userAgent.includes("Mobile")) {
      device = "Mobile";
    } else if (userAgent.includes("Tablet")) {
      device = "Tablet";
    } else {
      device = "Desktop";
    }

    return { browser, os, device };
  };

  const METRICS_TIMEOUT_MS = 5_000;

  const fetchWithTimeout = (url: string, ms: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
  };

  const getClientMetrics = async (): Promise<IClientMetrics> => {
    const userAgent = navigator.userAgent;
    const browserInfo = parseUserAgent(userAgent);
    const timezone = getTimezone();
    const language = getLanguage();

    let userIp: string | null = null;
    try {
      const response = await fetchWithTimeout("https://api.ipify.org?format=json", METRICS_TIMEOUT_MS);
      const data = await response.json();
      userIp = data.ip ?? null;
    } catch (error) {
      console.error("Error getting IP address:", error);
    }

    let city: string | null = null;
    let country: string | null = null;
    let region: string | null = null;

    if (userIp) {
      try {
        const response = await fetchWithTimeout(
          `http://ip-api.com/json/${userIp}?fields=city,country,regionName`,
          METRICS_TIMEOUT_MS,
        );
        const data = await response.json();

        if (data.status === "success") {
          city = data.city ?? null;
          country = data.country ?? null;
          region = data.regionName ?? null;
        }
      } catch (error) {
        console.error("Error resolving IP location:", error);
      }
    }

    return {
      user_ip: userIp,
      user_city: city,
      user_country: country,
      user_region: region,
      user_browser: browserInfo.browser,
      user_os: browserInfo.os,
      user_device: browserInfo.device,
      user_language: language,
      user_timezone: timezone,
    };
  };

  return {
    getClientMetrics,
    getTimezone,
    getLanguage,
  };
};
