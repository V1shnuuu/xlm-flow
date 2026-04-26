import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        primary: "hsl(var(--primary))",
        success: "hsl(var(--success))",
        danger: "hsl(var(--danger))"
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0, 0, 0, 0.18)"
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.99)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        floatIn: "floatIn 360ms ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
