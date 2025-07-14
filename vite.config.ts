/// <reference types="vitest" />
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      include: ["src/**/*.ts"],
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "kuai",
      fileName: (format) => `kuai.${format}.js`,
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "src/main.ts"),
      },
    },
  },
});
