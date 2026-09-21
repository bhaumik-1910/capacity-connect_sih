/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Government Minimalism Design Tokens
        primary: {
          DEFAULT: '#1F4E79',
          hover: '#163A5C',
          soft: '#EAF2F8',
          muted: '#D0E1F0',
        },
        govText: {
          primary: '#17202A',
          secondary: '#5F6B76',
          muted: '#87919B',
        },
        govBg: {
          DEFAULT: '#F7F8FA',
          surface: '#FFFFFF',
          subtle: '#F1F3F6',
        },
        govBorder: {
          DEFAULT: '#E5E7EB',
          subtle: '#F0F2F5',
        },
        govSuccess: {
          DEFAULT: '#1F7A4D',
          soft: '#E8F5E9',
          text: '#145A32',
        },
        govWarning: {
          DEFAULT: '#A66A00',
          soft: '#FFF8E1',
          text: '#7D5000',
        },
        govError: {
          DEFAULT: '#B42318',
          soft: '#FEE4E2',
          text: '#912018',
        },
        govInfo: {
          DEFAULT: '#2563EB',
          soft: '#EFF6FF',
          text: '#1D4ED8',
        },
        // Legacy alias compatibility
        gov: {
          navy: '#1F4E79',
          navyLight: '#163A5C',
          blue: '#1F4E79',
          accent: '#1F4E79',
          gold: '#A66A00',
          goldLight: '#FFF8E1',
          saffron: '#D97706',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E5E7EB',
          bg: '#F7F8FA',
        }
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '8px',
        'xl': '8px', // Restrained radius
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'md': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        'container': '1440px',
      }
    },
  },
  plugins: [],
}
