import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // "old library" ink + parchment tones, kept minimal (no ornate motifs)
        ink: {
          950: "#0b0c10",
          900: "#111318",
          800: "#191b22",
          700: "#22242e",
        },
        parchment: {
          50: "#faf7f2",
          100: "#f3ede2",
          200: "#e6dcc9",
        },
        saffron: {
          400: "#f2a65a",
          500: "#e8873a",
          600: "#d0722a",
        },
        indigo: {
          400: "#8b93f8",
          500: "#6f78f0",
          600: "#5a5fd6",
        },
      },
      borderRadius: {
        xl: "14px",
        "2xl": "16px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.12)",
        glass: "0 1px 0 rgba(255,255,255,0.06) inset",
      },
      backdropBlur: { xs: "2px" },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        blink: "blink 1s step-start infinite",
        fadeUp: "fadeUp 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
