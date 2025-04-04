// vite.config.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "src/client", // ← Vite starts from here
  build: {
    outDir: path.resolve(__dirname, "dist/client"),
    emptyOutDir: true,
  }
});
