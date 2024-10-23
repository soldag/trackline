// eslint-disable-next-line import/default
import react from "@vitejs/plugin-react";
import path from "path";

export default {
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "build",
  },
  plugins: [react()],
};
