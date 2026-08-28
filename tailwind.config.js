/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        zen: {
          900: '#070c18',
          800: '#0f172a',
          700: '#1e293b',
          accent: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.35)',
        }
      }
    },
  },
  plugins: [],
}
