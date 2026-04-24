/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rayo: {
          'celeste': 'rgb(27, 153, 214)',
          'celeste-oscuro': 'rgb(20, 120, 175)',
          'celeste-claro': 'rgb(60, 175, 230)',
          'amarillo': 'rgb(245, 183, 49)',
          'amarillo-claro': 'rgb(255, 205, 80)',
          'blanco': 'rgb(255, 255, 255)',
          'gris-claro': 'rgb(245, 248, 252)',
          'gris-medio': 'rgb(120, 140, 160)',
          'oscuro': 'rgb(25, 45, 65)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'rayo-pulse': 'rayoPulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        rayoPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
