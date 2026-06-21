import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { plugin as markdown } from "vite-plugin-markdown";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/aizu-blog/" : "/",
  plugins: [
    react(),
    markdown({ mode: ['html', 'toc'] })
  ],
});