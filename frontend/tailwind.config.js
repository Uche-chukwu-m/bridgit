/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Overpass', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#15171a',
        sign: '#ffcc00',
        road: '#f4f2ed',
        ok: '#15803d',
        tight: '#b45309',
        blocked: '#b91c1c',
      },
    },
  },
  plugins: [],
};
