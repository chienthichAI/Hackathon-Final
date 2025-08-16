/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'fpt-primary': '#1e3a8a',
        'fpt-primary-light': '#3b82f6',
        'fpt-primary-dark': '#1e40af',
        'fpt-secondary': '#1e3a8a',
        'fpt-accent': '#00D4AA',
        'fpt-mint': '#7FFFD4',
        'fpt-purple': '#8B5CF6',
        'fpt-purple-light': '#A78BFA',
      },
      fontFamily: {
        'sans': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 85, 170, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 85, 170, 0.8)' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00D4AA 0%, #7FFFD4 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      },
    },
  },
  plugins: [],
}
