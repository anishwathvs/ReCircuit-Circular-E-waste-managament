/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#084D36',
          50: '#F0F9F5',
          100: '#E0F3EA',
          200: '#BFE7D5',
          300: '#8CD3B5',
          400: '#4EB88E',
          500: '#16834D',
          600: '#0E6B3F',
          700: '#0A5633',
          800: '#084D36',
          900: '#053726',
          950: '#021F15',
        },
        accent: {
          DEFAULT: '#62B735',
          green: '#22C55E',
          lime: '#62B735',
          50: '#F5FCF2',
          100: '#EBF8E9',
          500: '#62B735',
          600: '#4E9826',
        },
        mint: {
          DEFAULT: '#EBF8E9',
          light: '#F3FAF1',
          50: '#F7FCF5',
          100: '#EBF8E9',
          200: '#D5F2D0',
        },
        recircuit: {
          bg: '#F8FAF7',
          card: '#FFFFFF',
          text: '#151A17',
          muted: '#6B756E',
          border: '#E5EBE5',
          dark: '#084D36',
          accent: '#62B735',
          secondary: '#16834D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(8, 77, 54, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px -4px rgba(8, 77, 54, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}

