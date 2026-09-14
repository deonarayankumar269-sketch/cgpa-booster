/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { navy: "#0F172A", canvas: "#F8FAFC" },
      boxShadow: { card: "0 10px 30px rgba(15,23,42,.06)" }
    }
  },
  plugins: []
};