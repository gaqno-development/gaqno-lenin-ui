import { describe, expect, it, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAudioStore } from "~/store/audio";

describe("audio store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initial state", () => {
    const store = useAudioStore();
    expect(store.generateAudio).toBe(true);
    expect(store.autoplayAudio).toBe(true);
    expect(store.audioSpeed).toBe(1.0);
    expect(store.defaultVolume).toBe(0.8);
    expect(store.notificationsEnabled).toBe(true);
  });

  it("updateGenerateAudio", () => {
    const store = useAudioStore();
    store.updateGenerateAudio(false);
    expect(store.generateAudio).toBe(false);
  });

  it("updateAutoplayAudio", () => {
    const store = useAudioStore();
    store.updateAutoplayAudio(false);
    expect(store.autoplayAudio).toBe(false);
  });

  it("updateAudioSpeed", () => {
    const store = useAudioStore();
    store.updateAudioSpeed(1.5);
    expect(store.audioSpeed).toBe(1.5);
  });

  it("updateDefaultVolume", () => {
    const store = useAudioStore();
    store.updateDefaultVolume(0.5);
    expect(store.defaultVolume).toBe(0.5);
  });

  it("updateNotificationsEnabled", () => {
    const store = useAudioStore();
    store.updateNotificationsEnabled(false);
    expect(store.notificationsEnabled).toBe(false);
  });

  it("resetToDefaults", () => {
    const store = useAudioStore();
    store.updateGenerateAudio(false);
    store.updateAudioSpeed(2);
    store.resetToDefaults();
    expect(store.generateAudio).toBe(true);
    expect(store.audioSpeed).toBe(1.0);
  });
});
