/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // SmartConvo Palette
        light: {
          bg: '#F3E8FF', // Soft lilac background
          secondary: '#FFFFFF',
          section: '#E9D5FF',
          text: '#4C1D95', // Deep purple text
          textSecondary: '#6D28D9',
          textMuted: '#A78BFA',
        },
        dark: {
          bg: '#2E1065', // Very deep purple
          secondary: '#4C1D95',
          text: '#F5F3FF',
          textSecondary: '#C4B5FD',
          textMuted: '#8B5CF6',
        },
        accent: {
          purple: '#A855F7', // Prime purple
          deepPurple: '#7E22CE',
          cyan: '#C084FC', // Lighter purple
          glow: '#E9D5FF',
        }
      },
      backgroundImage: {
        // Light Mode Gradients
        'light-gradient': 'none',
        'light-accent': 'linear-gradient(135deg, #3b82f6, #0ea5e9)',

        // Dark Mode Gradients
        'dark-gradient': 'none', // Solid background for standard look
        'dark-accent': 'linear-gradient(135deg, #60a5fa, #3b82f6)',

        // Liquid Glass Gradients (Removed for standard look)
        'glass-gradient': 'none',
        'glass-card': 'none',
      },
      boxShadow: {
        'soft': '0 8px 20px rgba(124, 58, 237, 0.2)',
        'glass': '0 10px 40px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.4)',
        'neon': '0 0 30px rgba(147, 51, 234, 0.6)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        }
      }
    },
  },
  plugins: [],
};
