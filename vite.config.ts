import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/client',   // 👈 tells Vite where to find index.html
  server: {
    port: 5173
  }
});
