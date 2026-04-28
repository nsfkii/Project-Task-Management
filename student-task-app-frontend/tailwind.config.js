/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Tambahkan breakpoint kustom
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Tambahan spacing untuk responsif
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Max width
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
}