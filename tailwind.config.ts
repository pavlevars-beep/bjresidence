import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          dark: "#59624F",
          DEFAULT: "#7B846D",
          light: "#7B846D",
        },
        beige: {
          DEFAULT: "#E8DDCC",
        },
        cream: {
          DEFAULT: "#F7F4EE",
        },
        ink: {
          DEFAULT: "#1E1F1C",
        },
        wood: {
          DEFAULT: "#A9784E",
        },
        stone: {
          DEFAULT: "#D8D5CE",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(30, 31, 28, 0.08)",
        card: "0 8px 30px -12px rgba(30, 31, 28, 0.12)",
      },
      maxWidth: {
        "8xl": "90rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
