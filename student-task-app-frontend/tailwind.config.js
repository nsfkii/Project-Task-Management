/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Palet warna kustom "calm study" agar tidak terlalu generic
      // Menimpa skala blue & indigo yang dipakai luas di aplikasi
      colors: {
        blue: {
          50: '#f2f9f8',
          100: '#dff1ee',
          200: '#bee3dc',
          300: '#95cec4',
          400: '#67b4a7',
          500: '#4b988d',
          600: '#3d7c74',
          700: '#356560',
          800: '#2f5250',
          900: '#2b4543',
          950: '#162727',
        },
        indigo: {
          50: '#f3f8f8',
          100: '#e2efee',
          200: '#c4dedb',
          300: '#9fc6c1',
          400: '#79aaa2',
          500: '#5f8f87',
          600: '#4e7670',
          700: '#43615d',
          800: '#3a504d',
          900: '#334443',
          950: '#1b2726',
        },
      },
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