/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
        },
      },
    },
  },
  plugins: [],
};
