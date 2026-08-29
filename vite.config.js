import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative base so the built site works wherever it lands on GitHub Pages —
  // a project repo (user.github.io/repo/) or a user page (user.github.io/).
  base: "./",
  server: { port: 5173, open: false },
});
