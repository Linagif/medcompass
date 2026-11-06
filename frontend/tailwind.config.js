/** Design tokens for MedCompass. Change colours here and the whole UI follows. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep navy: main text and dark surfaces
        navy: { 950: "#0a1f33", 900: "#0f2a43", 800: "#173a59", 700: "#24506f", 600: "#3d6785", 500: "#5f869f" },
        // Muted teal: accents, focus and primary actions
        teal: { 50: "#effaf8", 100: "#d5f1ed", 200: "#aee3dd", 300: "#7dcdc6", 400: "#4db3ad", 500: "#2b9a98", 600: "#1f7d7e", 700: "#1c6466", 800: "#1b5052", 900: "#1a4244" },
        // Light surfaces
        paper: { DEFAULT: "#f6faf9", card: "#ffffff", line: "#dbe6e6", muted: "#eaf2f1" },
      },
      fontFamily: {
        // System fonts only: no third-party font requests (privacy, speed, offline-friendly)
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,42,67,0.05), 0 4px 14px rgba(15,42,67,0.05)",
        lift: "0 2px 4px rgba(15,42,67,0.06), 0 10px 24px rgba(15,42,67,0.08)",
      },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        dot: { "0%, 80%, 100%": { opacity: "0.25", transform: "scale(0.8)" }, "40%": { opacity: "1", transform: "scale(1)" } },
      },
      animation: { rise: "rise 0.25s ease-out both", dot: "dot 1.2s infinite ease-in-out both" },
    },
  },
  plugins: [],
};
