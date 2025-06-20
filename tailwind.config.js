/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a5f8',
          500: '#1a8ee5',
          600: '#0e76cc',
          700: '#0e5ea4',
          800: '#115187',
          900: '#144470',
          DEFAULT: '#1a8ee5',
        },
        secondary: {
          50: '#fff8f0',
          100: '#ffecd6',
          200: '#ffd4ad',
          300: '#ffb777',
          400: '#ff9966',
          500: '#ff7d4d',
          600: '#e85d39',
          700: '#cc472d',
          800: '#a93a28',
          900: '#8a3323',
          DEFAULT: '#ff9966',
        },
        accent: {
          50: '#eefbf3',
          100: '#d6f5e3',
          200: '#b0ecc9',
          300: '#7ddca8',
          400: '#6FCF97',
          500: '#3ab369',
          600: '#2a9554',
          700: '#237645',
          800: '#1f5e39',
          900: '#1a4d30',
          DEFAULT: '#6FCF97',
        },
        dark: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#333333',
          DEFAULT: '#333333',
        },
        light: {
          50: '#ffffff',
          100: '#fefefe',
          200: '#fdfdfd',
          300: '#fcfcfc',
          400: '#fafafa',
          500: '#f9f9f9',
          600: '#f5f5f5',
          700: '#f0f0f0',
          800: '#e8e8e8',
          900: '#e0e0e0',
          DEFAULT: '#F9F9F9',
        },
      },
      backgroundColor: {
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#2d2d2d',
        'dark-accent': '#404040',
      },
      textColor: {
        'dark-primary': '#e0e0e0',
        'dark-secondary': '#a0a0a0',
        'dark-accent': '#4A90E2',
      },
      borderColor: {
        'dark-border': '#4a4a4a',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
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
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
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
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideDown: 'slideDown 0.3s ease-in-out',
        slideUp: 'slideUp 0.3s ease-in-out',
        heartBeat: 'heartBeat 0.7s ease-in-out',
        wiggle: 'wiggle 0.5s ease-in-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'display': ['Poppins', 'ui-sans-serif', 'system-ui'],
        'body': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
}

