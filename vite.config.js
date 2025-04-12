import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",
  
  css: {
    devSourcemap: true,
    // Add preprocessor options if needed
  },

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
      },
    },
  },
});
