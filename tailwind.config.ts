import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic colors map to CSS variables so light/dark themes work correctly.
        bg: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          subtle: "rgb(var(--bg-subtle) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          elevated: "rgb(var(--surface-elevated) / <alpha-value>)",
          highlight: "rgb(var(--surface-highlight) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          subtle: "rgb(var(--border-subtle) / <alpha-value>)",
        },
        fg: {
          DEFAULT: "rgb(var(--fg) / <alpha-value>)",
          secondary: "rgb(var(--fg-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--fg-tertiary) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
          muted: "rgb(var(--accent-muted) / <alpha-value>)",
          strong: "rgb(var(--accent-strong) / <alpha-value>)",
        },
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
        // Legacy aliases kept for any untouched code paths.
        ink: {
          950: "rgb(var(--bg) / <alpha-value>)",
          900: "rgb(var(--surface) / <alpha-value>)",
          800: "rgb(var(--surface-elevated) / <alpha-value>)",
          700: "rgb(var(--surface-highlight) / <alpha-value>)",
        },
        parchment: {
          50: "rgb(var(--fg) / <alpha-value>)",
          100: "rgb(var(--fg-secondary) / <alpha-value>)",
          200: "rgb(var(--fg-tertiary) / <alpha-value>)",
        },
        saffron: {
          400: "rgb(var(--accent-strong) / <alpha-value>)",
          500: "rgb(var(--accent) / <alpha-value>)",
          600: "rgb(var(--accent-hover) / <alpha-value>)",
        },
        indigo: {
          400: "#A5B4FC",
          500: "#818CF8",
          600: "#6366F1",
        },
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.18)",
        glow: "0 0 0 1px rgba(232, 123, 53, 0.15), 0 4px 24px rgba(232, 123, 53, 0.15)",
        glass: "0 1px 0 rgba(255,255,255,0.04) inset",
      },
      backdropBlur: { xs: "2px" },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont"],
        serif: ["Source Serif 4", "Georgia", "ui-serif", "serif"],
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeOut: { from: { opacity: "1" }, to: { opacity: "0" } },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        blink: "blink 1s step-start infinite",
        fadeUp: "fadeUp 0.25s ease-out forwards",
        fadeIn: "fadeIn 0.2s ease-out forwards",
        fadeOut: "fadeOut 0.2s ease-out forwards",
        scaleIn: "scaleIn 0.2s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
