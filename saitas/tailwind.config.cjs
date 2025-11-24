/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        'gridors-primary': 'var(--color-primary)',
        'gridors-primary-light': 'var(--color-primary-light)',
        'gridors-accent': 'var(--color-accent)',
        'gridors-muted': 'var(--color-muted)',
        'gridors-light': 'var(--color-light)',
        'gridors-primary-darker': 'var(--color-gridors-primary-darker)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'serif-pro': ['Source Serif Pro', 'serif'],
        'oswald': ['Oswald', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // <--- ŠI EILUTĖ ATKOMENTUOTA!
  ],
};