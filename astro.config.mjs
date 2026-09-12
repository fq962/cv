import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

import { SITE_URL } from "./src/consts";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: "ignore",
  integrations: [
    tailwind(),
    react(),
    sitemap({
      changefreq: "monthly",
      lastmod: new Date(),
      serialize(item) {
        // La home manda sobre las páginas de detalle.
        item.priority = item.url === `${SITE_URL}/` ? 1.0 : 0.8;
        return item;
      },
    }),
  ],
});
