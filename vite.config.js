import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { plugin as markdown } from "vite-plugin-markdown";

// https://vite.dev/config/
export default defineConfig({
  // Cloudflare Pages用にベースパスを常に "/" に固定します
  base: "/",
  plugins: [
    react(),
    markdown({ mode: ['html', 'toc'] })
  ],
});