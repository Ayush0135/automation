/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
        slate: {
          850: "#151e2e",
          950: "#0b0f19",
        },
        instagram: {
          light: "#FDF2F8",
          DEFAULT: "#E1306C",
          dark: "#833AB4",
        },
        meta: {
          light: "#EFF6FF",
          DEFAULT: "#0064E0",
          dark: "#0052B4",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "ui-monospace",
          "Menlo",
          "Monaco",
          '"Cascadia Mono"',
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
