/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#E0010B",
          50: "#FFF1F1",
          100: "#FFE0E0",
          200: "#FFC5C5",
          300: "#FF9B9B",
          400: "#FF5C5C",
          500: "#FF2626",
          600: "#E0010B",
          700: "#C20009",
          800: "#9D050C",
          900: "#820B11",
          950: "#470003",
        },
      },
    },
  },
  plugins: [],
};
