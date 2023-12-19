import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    minify: true,
    outDir: "dist",
    lib: {
      entry: "src/lib/index.ts",
      name: "ssw.rules.widget",
      fileName: (format) => `ssw.rules.widget.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react"],
    },
  },
});
