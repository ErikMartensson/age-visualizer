import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";

export default defineConfig({
  plugins: [
    fresh(),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    host: true,
  },
});
