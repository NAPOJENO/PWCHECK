// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
      },
    },
  },
});
