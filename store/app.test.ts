import { describe, expect, it, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAppStore } from "~/store/app";

describe("app store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initial state", () => {
    const store = useAppStore();
    expect(store.darkMode).toBe(true);
    expect(store.loading).toBe(false);
    expect(store.language).toBe("pt");
    expect(store.model).toBe("qwen/qwen3-4b");
    expect(store.sidemenu).toBe(false);
  });

  it("toggleDarkMode", () => {
    const store = useAppStore();
    store.toggleDarkMode();
    expect(store.darkMode).toBe(false);
    store.toggleDarkMode();
    expect(store.darkMode).toBe(true);
  });

  it("toggleSidemenu", () => {
    const store = useAppStore();
    store.toggleSidemenu();
    expect(store.sidemenu).toBe(true);
  });

  it("setLoading", () => {
    const store = useAppStore();
    store.setLoading(true);
    expect(store.loading).toBe(true);
  });

  it("setModal", () => {
    const store = useAppStore();
    store.setModal({ show: true, title: "T", content: "C" });
    expect(store.modal).toEqual({ show: true, title: "T", content: "C" });
  });

  it("toggleLanguage cycles pt->en->cn->pt", () => {
    const store = useAppStore();
    store.toggleLanguage();
    expect(store.language).toBe("en");
    store.toggleLanguage();
    expect(store.language).toBe("cn");
    store.toggleLanguage();
    expect(store.language).toBe("pt");
  });

  it("setModel", () => {
    const store = useAppStore();
    store.setModel("gpt-4");
    expect(store.model).toBe("gpt-4");
  });
});
