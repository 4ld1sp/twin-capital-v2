/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "var(--primary)",
        "accent": "#00d6ab",
      },
      backgroundColor: {
        "main": "var(--bg-main)",
        "glass": "var(--card-bg)",
        "background-dark": "#000000",
        "background-light": "#f2f2f7",
      },
      textColor: {
        "main": "var(--text-primary)",
        "secondary": "var(--text-secondary)",
      },
      borderColor: {
        "glass": "var(--card-border)",
      },
      fontFamily: {
        "display": ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
