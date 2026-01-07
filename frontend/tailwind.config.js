/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Alias default blue to our dynamic primary color for instant theming
        blue: {
          50: 'color-mix(in srgb, var(--primary-color), white 90%)',
          100: 'color-mix(in srgb, var(--primary-color), white 80%)',
          200: 'color-mix(in srgb, var(--primary-color), white 60%)',
          300: 'color-mix(in srgb, var(--primary-color), white 40%)',
          400: 'color-mix(in srgb, var(--primary-color), white 20%)',
          500: 'var(--primary-color)',
          600: 'color-mix(in srgb, var(--primary-color), black 10%)',
          700: 'color-mix(in srgb, var(--primary-color), black 20%)',
          800: 'color-mix(in srgb, var(--primary-color), black 40%)',
          900: 'color-mix(in srgb, var(--primary-color), black 60%)',
        },
        primary: {
          50: 'color-mix(in srgb, var(--primary-color), white 90%)',
          100: 'color-mix(in srgb, var(--primary-color), white 80%)',
          200: 'color-mix(in srgb, var(--primary-color), white 60%)',
          300: 'color-mix(in srgb, var(--primary-color), white 40%)',
          400: 'color-mix(in srgb, var(--primary-color), white 20%)',
          500: 'var(--primary-color)',
          600: 'color-mix(in srgb, var(--primary-color), black 10%)',
          700: 'color-mix(in srgb, var(--primary-color), black 20%)',
          800: 'color-mix(in srgb, var(--primary-color), black 40%)',
          900: 'color-mix(in srgb, var(--primary-color), black 60%)',
        },
        secondary: {
          50: 'color-mix(in srgb, var(--secondary-color), white 90%)',
          100: 'color-mix(in srgb, var(--secondary-color), white 80%)',
          200: 'color-mix(in srgb, var(--secondary-color), white 60%)',
          300: 'color-mix(in srgb, var(--secondary-color), white 40%)',
          400: 'color-mix(in srgb, var(--secondary-color), white 20%)',
          500: 'var(--secondary-color)',
          600: 'color-mix(in srgb, var(--secondary-color), black 10%)',
          700: 'color-mix(in srgb, var(--secondary-color), black 20%)',
          800: 'color-mix(in srgb, var(--secondary-color), black 40%)',
          900: 'color-mix(in srgb, var(--secondary-color), black 60%)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
