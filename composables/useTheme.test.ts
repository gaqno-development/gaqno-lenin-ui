import { describe, expect, it, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.stubGlobal("process", { ...process, client: true });

describe("useTheme", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    document.documentElement.classList.remove("dark");
  });

  it("returns isDark, toggleTheme, setTheme, initializeTheme", async () => {
    const { useTheme } = await import("~/composables/useTheme");
    const theme = useTheme();
    expect(theme.isDark).toBeDefined();
    expect(theme.toggleTheme).toBeTypeOf("function");
    expect(theme.setTheme).toBeTypeOf("function");
    expect(theme.initializeTheme).toBeTypeOf("function");
  });

  it("toggleTheme flips dark mode and applies theme", async () => {
    const { useTheme } = await import("~/composables/useTheme");
    const theme = useTheme();
    theme.toggleTheme();
    expect(theme.isDark.value).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    theme.toggleTheme();
    expect(theme.isDark.value).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("setTheme applies dark/light correctly", async () => {
    const { useTheme } = await import("~/composables/useTheme");
    const theme = useTheme();
    theme.setTheme(false);
    expect(theme.isDark.value).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    theme.setTheme(true);
    expect(theme.isDark.value).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("initializeTheme reads from localStorage when dark", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "dark"),
      setItem: vi.fn(),
    });
    const { useTheme } = await import("~/composables/useTheme");
    const theme = useTheme();
    theme.initializeTheme();
    expect(theme.isDark.value).toBe(true);
  });

  it("initializeTheme reads from localStorage when light", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "light"),
      setItem: vi.fn(),
    });
    const { useTheme } = await import("~/composables/useTheme");
    const theme = useTheme();
    theme.initializeTheme();
    expect(theme.isDark.value).toBe(false);
  });

  it("initializeTheme defaults to dark when localStorage has no theme", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    const { useTheme } = await import("~/composables/useTheme");
    const theme = useTheme();
    theme.initializeTheme();
    expect(theme.isDark.value).toBe(true);
  });
});
