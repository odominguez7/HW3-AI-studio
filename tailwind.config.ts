import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        spark: {
          50: "#fdf6ec",
          100: "#faeacc",
          200: "#f5d494",
          300: "#efb84f",
          400: "#eba02a",
          500: "#e28314",
          600: "#c8600e",
          700: "#a64110",
          800: "#883414",
          900: "#702c14",
          950: "#401406",
        },
        night: {
          50: "#f5f6fa",
          100: "#eaebf4",
          200: "#d0d3e7",
          300: "#a7aed2",
          400: "#7882b9",
          500: "#5762a2",
          600: "#444d87",
          700: "#393f6e",
          800: "#32375c",
          900: "#2d304e",
          950: "#0f1021",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui"],
        body: ["var(--font-body)", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config;
