import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("~/components/ui/toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("useToast", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exposes showSuccess, showError, showInfo, showWarning and toast", async () => {
    const { useToast } = await import("~/composables/useToast");
    const result = useToast();
    expect(result.toast).toBeDefined();
    expect(result.showSuccess).toBeTypeOf("function");
    expect(result.showError).toBeTypeOf("function");
    expect(result.showInfo).toBeTypeOf("function");
    expect(result.showWarning).toBeTypeOf("function");
  });

  it("showSuccess calls toast with default variant", async () => {
    const { useToast } = await import("~/composables/useToast");
    const mockToast = vi.fn();
    vi.doMock("~/components/ui/toast", () => ({
      useToast: () => ({ toast: mockToast }),
    }));
    const mod = await import("~/composables/useToast");
    const { useToast: useToastFn } = mod;
    const { showSuccess, toast } = useToastFn();
    showSuccess("Title", "Desc");
    expect(toast).toHaveBeenCalledWith({
      title: "Title",
      description: "Desc",
      variant: "default",
    });
  });

  it("showError calls toast with destructive variant", async () => {
    const { useToast } = await import("~/composables/useToast");
    const { showError, toast } = useToast();
    showError("Error", "Details");
    expect(toast).toHaveBeenCalledWith({
      title: "Error",
      description: "Details",
      variant: "destructive",
    });
  });

  it("showInfo calls toast with default variant", async () => {
    const { useToast } = await import("~/composables/useToast");
    const { showInfo, toast } = useToast();
    showInfo("Info", "Details");
    expect(toast).toHaveBeenCalledWith({
      title: "Info",
      description: "Details",
      variant: "default",
    });
  });

  it("showWarning calls toast with default variant", async () => {
    const { useToast } = await import("~/composables/useToast");
    const { showWarning, toast } = useToast();
    showWarning("Warning", "Details");
    expect(toast).toHaveBeenCalledWith({
      title: "Warning",
      description: "Details",
      variant: "default",
    });
  });
});
