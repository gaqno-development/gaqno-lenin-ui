import { defineNuxtConfig } from "nuxt/config";
import { config } from "dotenv";

config();

export default defineNuxtConfig({
  compatibilityDate: "2025-11-27",
  modules: [
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/eslint-module",
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
    "nuxt-delay-hydration",
    "nuxt-swiper",
    "shadcn-nuxt",
    "@vite-pwa/nuxt",
    "~/modules/newrelic",
  ],
  eslint: {
    lintOnStart: false,
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "LeninGPT",
      short_name: "LeninGPT",
      description: "A digital incarnation of Vladimir Ilyich Lenin",
      theme_color: "#c41e3a",
      background_color: "#f4f1ea",
      display: "standalone",
      orientation: "portrait",
      icons: [
        {
          src: "/lenin_profile.jpg",
          sizes: "512x512",
          type: "image/jpeg",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico,jpg,jpeg,ttf}"],
      maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  pinia: {
    // Pinia configuration
  },
  tailwindcss: {
    cssPath: "~/global.css",
  },
  runtimeConfig: {
    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL,
      AI_SERVICE_URL: process.env.NUXT_PUBLIC_AI_SERVICE_URL,
    },
  },
});
