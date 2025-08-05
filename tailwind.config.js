/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'work-sans': ['Work Sans', 'sans-serif'],
        'raleway': ['Raleway', 'sans-serif'],
      },
      colors: {
        // Original design colors
        'water-blue': {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#2a9cd7', // Main blue from original
          600: '#1890ff',
          700: '#096dd9',
          800: '#0050b3',
          900: '#003a8c',
        },
        'water-dark': {
          50: '#f0f2f5',
          100: '#d9d9d9',
          200: '#bfbfbf',
          300: '#8c8c8c',
          400: '#595959',
          500: '#434343',
          600: '#333333', // Filter section background
          700: '#262626',
          800: '#1f1f1f',
          900: '#181818', // Active button background
        },
        'water-accent': {
          50: '#e6f4ff',
          100: '#bae0ff',
          200: '#91caff',
          300: '#69b1ff',
          400: '#4096ff',
          500: '#217cac', // Header text color
          600: '#1765a0',
          700: '#0d4f8c',
          800: '#053975',
          900: '#002766',
        },
        'water-gradient': {
          start: '#0abcf9',
          middle: '#2a9cd7',
          end: '#195d81',
        },
        'wave-blue': '#1d6d96', // Wave shape color
      },
    },
  },
  plugins: [],
};