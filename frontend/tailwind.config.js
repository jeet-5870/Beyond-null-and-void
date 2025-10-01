/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: { // 🔑 ADDED custom 'xs' breakpoint
        'xs': '375px',
      },
      colors:{
        // Replaced old colors with a new dark theme palette
        'primary-dark': '#0f172a', // Slate 900
        'secondary-dark': '#1e293b', // Slate 800
        'accent-blue': '#38bdf8', // Sky 400
        'text-light': '#f1f5f9', // Slate 100
        'text-muted': '#94a3b8', // Slate 400
        'success': '#10b981', // Emerald 500
        'warning': '#f59e0b', // Amber 500
        'danger': '#ef4444', // Red 500
      }
    },
  },
  plugins: [],
}