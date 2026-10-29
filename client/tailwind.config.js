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
        obsidian: {
          950: "#07090e",
          900: "#0c1017",
          850: "#111622",
          800: "#182030",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
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
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          "ui-monospace",
          "monospace",
        ],
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.4, transform: "scale(1)" },
          "50%": { opacity: 0.8, transform: "scale(1.05)" },
        },
        wave: {
          "0%, 100%": { height: "4px" },
          "50%": { height: "16px" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        "sound-wave-1": "wave 1.2s ease-in-out infinite",
        "sound-wave-2": "wave 0.9s ease-in-out 0.2s infinite",
        "sound-wave-3": "wave 1.4s ease-in-out 0.4s infinite",
        "sound-wave-4": "wave 1.0s ease-in-out 0.1s infinite",
      },
    },
  },
  plugins: [],
};
