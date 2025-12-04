import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/health-report-extractor/',
  server: {
    host: "::",
    port: 9595,
    allowedHosts: ["ai.codebyte.solutions"],
  },
  preview: {
    host: "::",
    port: 9595,
    allowedHosts: ["ai.codebyte.solutions"],
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
