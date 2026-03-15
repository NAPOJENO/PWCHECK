// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// Explicitně předat env do buildu (pro Vercel)
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY ?? "";
const apiUrl = process.env.PUBLIC_API_URL ?? "";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  vite: {
    define: {
      "import.meta.env.PUBLIC_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(supabaseKey),
      "import.meta.env.PUBLIC_API_URL": JSON.stringify(apiUrl),
    },
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
