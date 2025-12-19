import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";

const isCI = process.env.CI === "true";
const isMainBranch = process.env.GITHUB_REF_NAME === "main";

export default {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: "trackline",
      project: "trackline-frontend",
      disable: !isCI || !isMainBranch,
    }),
  ],
  server: {
    host: "127.0.0.1",
  },
};
