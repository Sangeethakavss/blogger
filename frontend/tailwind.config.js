/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        poppins: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#182226',
          cream: '#faf8f5',
          border: '#ece8e1',
        },
        dark: {
          bg: '#0b0f12',
          surface: '#12181d',
          card: '#162026',
          border: '#23303a',
          borderLight: '#2c3c49',
          muted: '#8ea0ad',
          text: '#f1f5f9',
          heading: '#ffffff',
          accent: '#e2ad76',
        },
      },
    },
  },
  plugins: [],
};
