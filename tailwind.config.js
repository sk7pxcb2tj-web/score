/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Kanit', 'sans-serif'] },
      colors: {
        bg0: '#0a0a0f', bg1: '#12121a', bg2: '#1a1a26', bg3: '#22222e',
        gold: '#e8b84b', 'gold-dim': '#8a6a22',
      },
    },
  },
  plugins: [],
}
