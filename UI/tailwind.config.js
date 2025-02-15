/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'persian-blue': '#1C1F5E', // Adjust as needed
        'tomato': '#FF6347',
      },
    },
  },
  plugins: [],
}