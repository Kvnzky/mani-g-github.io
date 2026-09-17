/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mani: {
          50: '#FDFBF7',
          100: '#F6EFE3',
          200: '#EADEC7',
          300: '#D7BF9B',
          400: '#BC966A',
          500: '#9E7241',
          600: '#7C552E',
          700: '#613F20',
          800: '#4B3019',
          900: '#372212',
          950: '#23140A',
        },
        cream: {
          DEFAULT: '#FFFDF9',
          warm: '#FDF8ED',
          card: '#FFFFFF'
        },
        spice: {
          500: '#E11D48',
          600: '#BE123C',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(97, 63, 32, 0.08), 0 2px 6px -1px rgba(97, 63, 32, 0.04)',
        'warm-lg': '0 10px 25px -3px rgba(97, 63, 32, 0.12), 0 4px 10px -2px rgba(97, 63, 32, 0.06)',
        'warm-xl': '0 20px 35px -5px rgba(97, 63, 32, 0.15), 0 10px 15px -5px rgba(97, 63, 32, 0.08)',
      }
    },
  },
  plugins: [],
}
