/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#818CF8',
          hover: '#A5B4FC',
          dim: 'rgba(129,140,248,0.12)',
          600: '#6366F1',
        },
        surface: '#131B2E',
        subtle: '#1C2742',
        success: '#34D399',
        danger: '#F87171',
        warning: '#FBBF24',
        info: '#60A5FA',
      },
      backgroundColor: {
        main: '#0B1120',
        surface: '#131B2E',
        subtle: '#1C2742',
      },
      textColor: {
        main: '#F1F5F9',
        secondary: '#94A3B8',
        tertiary: '#64748B',
      },
      borderColor: {
        DEFAULT: '#1E2D4A',
        subtle: '#1E2D4A',
        hover: '#2D4266',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
