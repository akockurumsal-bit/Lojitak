/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#39FF14',
        'neon-blue': '#00F0FF',
        'neon-orange': '#FF5F1F',
        'slate-900': '#0f172a',
        'slate-800': '#1e293b',
      }
    },
  },
  plugins: [],
}
