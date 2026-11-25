import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        start: resolve(import.meta.dirname, "pages/index.html"),
        questions: resolve(import.meta.dirname, "pages/questions.html"),
        result: resolve(import.meta.dirname, "pages/result.html"),
      },
    },
  },
});
