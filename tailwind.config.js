/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A90E2',
        secondary: '#FF9966',
        accent: '#6FCF97',
        dark: '#333333',
        light: '#F9F9F9',
      },
    },
  },
  plugins: [],
} 