import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#3b82f6",
          dark: "#2563eb",
          light: "#60a5fa",
        },
        surface: {
          DEFAULT: "#0f172a",
          elevated: "#1e293b",
          hover: "rgba(255,255,255,0.05)",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.15)",
        },
        muted: {
          DEFAULT: "#94a3b8",
          dark: "#475569",
        },
        status: {
          active: "#22c55e",
          provisioning: "#3b82f6",
          error: "#ef4444",
          pending: "#f59e0b",
          stopped: "#64748b",
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-in-left": "slide-in-left 0.25s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59,130,246,0.35)" },
          "50%": { boxShadow: "0 0 0 8px transparent" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
