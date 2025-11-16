/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'light-bg': '#fff5e4',
        'light-card': '#ffc4c4',
        'light-accent': '#ee6983',
        'light-heading': '#850e35',
        
        'dark-bg': '#250e2c',
        'dark-card': '#837ab6',
        'dark-muted': '#9d85b6',
        'dark-accent': '#cc8db3',
        'dark-button': '#f6a5c0',
        'dark-glow': '#f7c2ea',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Lexend Deca', 'sans-serif'],
      },
      boxShadow: {
        'soft-light': '0 8px 30px rgba(238, 105, 131, 0.2)',
        'soft-dark': '0 8px 30px rgba(247, 194, 234, 0.2)',
      },
    },
  },
  plugins: [],
}
