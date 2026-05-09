/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        host: ['"Host Grotesk"', "system-ui", "sans-serif"],
      },
      colors: {
        peach: {
          50: "#fff8f1",
          100: "#f1d4bd",
          200: "#e9be9b",
          300: "#e2a87a",
          400: "#d7baa2",
          500: "#cccbc9",
          600: "#b4682b",
        },
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
