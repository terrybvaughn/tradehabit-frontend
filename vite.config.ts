import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  // Dev-server settings for Replit
  server: {
    host: true, // listen on 0.0.0.0 so the repl can be reached externally
    port: 5000, // Replit webview requires port 5000
    allowedHosts: true, // disable host check (or list specific hosts)
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Change to your Flask backend URL
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
