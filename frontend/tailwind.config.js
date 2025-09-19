/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'color': '#000080',
        'secondary-text-color': '#cfd8dc',
      }
    },
  },
  plugins: [],
}