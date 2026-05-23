/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F6F1",
        warm: "#EDE9E3",
        sand: "#D4CFC7",
        stone: "#A39E96",
        ink: "#1A1A1A",
        accent: "#E8553D",
      },
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', '"SF Mono"', "monospace"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
