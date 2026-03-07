import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "composables/**/*.ts",
        "service/**/*.ts",
        "store/**/*.ts",
        "lib/**/*.ts",
        "types/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.spec.ts",
        "nuxt.config.ts",
        "**/node_modules/**",
        "types/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "~": path.resolve(__dirname, "./"),
      "#imports": path.resolve(__dirname, "./.nuxt/imports.d.ts"),
    },
  },
});
