import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    fileParallelism: false,
    maxConcurrency: 1,
    exclude: [
      "**/node_modules/**",
      "**/e2e/**",
      "**/.next/**",
      "**/dist/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
