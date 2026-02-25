import { defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  meta: { name: "newrelic" },
  setup(_options, nuxt) {
    nuxt.hook("listen", () => {
      try {
        require("newrelic");
      } catch {
        // newrelic not available in build context
      }
    });
  },
});
