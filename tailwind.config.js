/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        'primary-dark': '#3A80D2',
        secondary: '#FF9966',
        accent: '#6FCF97',
        dark: '#333333',
        light: '#F9F9F9',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)', maxHeight: '0' },
          '100%': { opacity: '1', transform: 'translateY(0)', maxHeight: '1000px' },
        },
        heartBeat: {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.3)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.3)' },
          '70%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%': { transform: 'translateY(-50%) rotate(0deg)' },
          '25%': { transform: 'translateY(-50%) rotate(-10deg)' },
          '50%': { transform: 'translateY(-50%) rotate(10deg)' },
          '75%': { transform: 'translateY(-50%) rotate(-5deg)' },
          '100%': { transform: 'translateY(-50%) rotate(0deg)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideDown: 'slideDown 0.3s ease-in-out',
        heartBeat: 'heartBeat 0.7s ease-in-out',
        wiggle: 'wiggle 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
}

