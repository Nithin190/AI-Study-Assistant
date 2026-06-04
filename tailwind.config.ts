import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7C3AED",
          "purple-light": "#a78bfa",
          cyan: "#06b6d4",
          "cyan-light": "#38bdf8",
          green: "#10b981",
          amber: "#f59e0b",
          rose: "#ef4444",
          indigo: "#4F46E5",
        },
        ink: {
          900: "#020008",
          800: "#0e0818",
          700: "#1e293b",
          600: "#334155",
          500: "#64748b",
          400: "#94a3b8",
          300: "#cbd5e1",
          200: "#e2e8f0",
          100: "#f1f5f9",
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        display: ["Instrument Serif", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.7s ease-out",
        "slide-down": "slideDown 0.4s ease-out",
        "float": "float 4s ease-in-out infinite",
        "blob": "blob 14s ease-in-out infinite",
        "blob2": "blob2 18s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "scan": "scan 7s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(40px, -50px) scale(1.08)" },
          "66%": { transform: "translate(-25px, 30px) scale(0.95)" },
        },
        blob2: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-30px, 40px) scale(1.05)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(124, 58, 237, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        scan: {
          "0%": { top: "-2px", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { top: "100vh", opacity: "0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-purple-cyan": "linear-gradient(135deg, #7C3AED, #06b6d4)",
        "gradient-card": "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
      },
      boxShadow: {
        "glow-purple": "0 0 24px rgba(124, 58, 237, 0.4), 0 0 60px rgba(124, 58, 237, 0.2)",
        "glow-cyan": "0 0 24px rgba(6, 182, 212, 0.3), 0 0 50px rgba(6, 182, 212, 0.15)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.06) inset",
        "glass": "0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
