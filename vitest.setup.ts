import { vi } from "vitest";
import { ref, computed } from "vue";

vi.stubGlobal("ref", ref);
vi.stubGlobal("computed", computed);
vi.stubGlobal("useRuntimeConfig", () => ({
  public: {
    API_URL: "https://api.test",
    AI_SERVICE_URL: "https://ai.test",
  },
}));

vi.stubGlobal("process", { ...process, client: true });
