/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        secondary: '#0EA5E9',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
      }
    }
  },
  plugins: [],
}
