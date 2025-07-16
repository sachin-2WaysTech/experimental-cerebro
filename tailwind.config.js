/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gradient-start': '#FFDE58',
        'gradient-middle': '#FF8E6C',
        'gradient-end': '#BA49AB',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FFDE58 0%, #FF8E6C 50%, #BA49AB 100%)',
        'brand-text-gradient': 'linear-gradient(135deg, #FFDE58 0%, #FF8E6C 50%, #BA49AB 100%)',
      },
      borderImage: {
        'brand-gradient': 'linear-gradient(135deg, #FFDE58 0%, #FF8E6C 50%, #BA49AB 100%) 1',
      }
    },
  },
  plugins: [],
}
