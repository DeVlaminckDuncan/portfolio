// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://duncandevlaminck.be",
  output: "static",
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  integrations: [sitemap()],
});
