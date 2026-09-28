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
          50: '#FFFDF7',
          100: '#FBF3E4',
          200: '#F2E2C4',
          300: '#E4C796',
          400: '#D1A362',
          500: '#B57D3B',
          600: '#8F5D26',
          700: '#6E441B',
          800: '#513114',
          900: '#38200D',
          950: '#241306',
        },
        cream: {
          DEFAULT: '#FFFDF7',
          warm: '#FBF3E4',
          butter: '#FFF7E0',
          card: '#FFFFFF'
        },
        spice: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          500: '#E11D48',
          600: '#BE123C',
          700: '#9F1239',
        },
        herb: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(97, 63, 32, 0.08), 0 2px 6px -1px rgba(97, 63, 32, 0.04)',
        'warm-md': '0 8px 24px -3px rgba(97, 63, 32, 0.12), 0 4px 10px -2px rgba(97, 63, 32, 0.06)',
        'warm-lg': '0 12px 28px -4px rgba(97, 63, 32, 0.14), 0 4px 12px -2px rgba(97, 63, 32, 0.07)',
        'warm-xl': '0 20px 35px -5px rgba(97, 63, 32, 0.16), 0 10px 15px -5px rgba(97, 63, 32, 0.08)',
        'snack': '0 4px 0 0 #38200D',
        'snack-sm': '0 2px 0 0 #38200D',
        'snack-amber': '0 4px 0 0 #B45309',
        'snack-card': '0 6px 0 0 rgba(56, 32, 13, 0.12), 0 10px 24px -4px rgba(97, 63, 32, 0.1)',
        'snack-card-hover': '0 10px 0 0 rgba(56, 32, 13, 0.16), 0 18px 32px -4px rgba(97, 63, 32, 0.16)',
      }
    },
  },
  plugins: [],
}
