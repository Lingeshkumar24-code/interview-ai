/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8', 900: '#1E3A8A' },
        secondary: { DEFAULT: '#06B6D4', 500: '#06B6D4', 600: '#0891B2' },
        accent: { DEFAULT: '#8B5CF6', 500: '#8B5CF6', 600: '#7C3AED' },
        dark: { DEFAULT: '#0F172A', 50: '#F8FAFC', 100: '#F1F5F9', 800: '#1E293B', 900: '#0F172A' }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        gradient: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        glow: { from: { boxShadow: '0 0 20px #2563EB' }, to: { boxShadow: '0 0 40px #8B5CF6' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
