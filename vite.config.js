import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo, Vite reenvía /api (y las imágenes de Active Storage en /rails)
// al servidor Rails. Así el navegador ve un único origen y no hace falta CORS.
const backendUrl = process.env.VITE_BACKEND_URL || "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": backendUrl,
      "/rails": backendUrl,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },
});
