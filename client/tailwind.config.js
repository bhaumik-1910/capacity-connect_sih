/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0B2545',
          navyLight: '#134074',
          blue: '#1D2D44',
          accent: '#0284C7',
          gold: '#D97706',
          goldLight: '#F59E0B',
          saffron: '#EA580C',
          surface: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          bg: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
