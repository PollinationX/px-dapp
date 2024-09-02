/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}', './node_modules/flowbite-react/**/*.js', './pages/**/*.{ts,tsx}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        pollinationx: {
          black: '#222222',
          grey: '#888888',
          honey: '#FAB432',
          purple: '#42298F',
          'honey-500': '#F3B563',
          'honey-900': '#FFD08E'
        }
      },
      fontFamily: {
        Metropolis: ['var(--font-metropolis)']
      }
    }
  },
  plugins: [require('flowbite/plugin')]
}
