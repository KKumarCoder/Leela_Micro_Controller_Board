import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [react(), tailwindcss()],
  theme: {
    extend: {
      colors: {
        "primary-dark": "#0F2348",
        "primary-orange": "#E98F0B",
        "primary-red": "#E22213",
      },
    },
  },
});
