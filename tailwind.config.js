/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        healthGreen: '#10B981',
        heartRed: '#EF4444',
        darkBg: '#05070a',
        cardBg: '#11141b',
      },
    },
  },
  plugins: [],
}