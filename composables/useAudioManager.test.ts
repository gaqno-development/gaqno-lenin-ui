import { describe, expect, it, beforeEach, vi } from "vitest";
import { useAudioManager } from "~/composables/useAudioManager";

describe("useAudioManager", () => {
  beforeEach(() => {
    const { pauseAllAudios } = useAudioManager();
    pauseAllAudios();
  });

  it("registerAudio and unregisterAudio", () => {
    const { registerAudio, unregisterAudio, getCurrentPlayingAudio } =
      useAudioManager();
    const el = document.createElement("audio");
    registerAudio(el);
    expect(getCurrentPlayingAudio()).toBeNull();
    unregisterAudio(el);
  });

  it("pauseAllOtherAudios pauses other audios", () => {
    const {
      registerAudio,
      unregisterAudio,
      pauseAllOtherAudios,
      getCurrentPlayingAudio,
    } = useAudioManager();
    const a1 = document.createElement("audio");
    const a2 = document.createElement("audio");
    a1.pause = () => {};
    a2.pause = () => {};
    Object.defineProperty(a1, "paused", { value: false });
    Object.defineProperty(a2, "paused", { value: false });
    const spy1 = vi.spyOn(a1, "pause");
    const spy2 = vi.spyOn(a2, "pause");
    registerAudio(a1);
    registerAudio(a2);
    pauseAllOtherAudios(a1);
    expect(spy2).toHaveBeenCalled();
    expect(getCurrentPlayingAudio()).toBe(a1);
    unregisterAudio(a1);
    unregisterAudio(a2);
  });

  it("pauseAllAudios pauses all", () => {
    const { registerAudio, unregisterAudio, pauseAllAudios } = useAudioManager();
    const el = document.createElement("audio");
    Object.defineProperty(el, "paused", { value: false, configurable: true });
    const spy = vi.spyOn(el, "pause");
    registerAudio(el);
    pauseAllAudios();
    expect(spy).toHaveBeenCalled();
    unregisterAudio(el);
  });
});
