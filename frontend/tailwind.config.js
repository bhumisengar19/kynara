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
        sans: ['Inter', 'sans-serif'],
        rounded: ['Quicksand', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Theme 2: Minimal Light (Kynara Minimal)
        kynaraLight: {
          bg: '#FDFCF0', // Cream Whiteish
          pink: '#FFD1DC',
          lavender: '#E6E6FA',
          mint: '#B2FFD8',
          beige: '#F5F5DC',
          text: '#4A3B4F',
          card: 'rgba(255, 255, 255, 0.7)',
        },
        // Theme 1: Futuristic Dark (Kynara Night)
        kynaraDark: {
          bg: '#05070A', // Deep Midnight
          navy: '#0B0E23',
          indigo: '#1A1A3A',
          violet: '#4C1D95',
          midnight: '#2E1065',
          lavender: '#C084FC', // Glowing accent
          text: '#F3E8FF',
          card: 'rgba(15, 23, 42, 0.6)',
        },
        // Preserve some existing if needed, but we'll focus on the new ones
        light: {
          bg: '#FDFCF0',
          secondary: '#FFFFFF',
          text: '#4A3B4F',
        },
        dark: {
          bg: '#05070A',
          secondary: '#1A1A3A',
          text: '#F3E8FF',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'drift': 'drift 20s linear infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'floating-flower': 'floating-flower 10s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        },
        drift: {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '100%': { transform: 'translateX(100px) translateY(50px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.2)' },
        },
        breathe: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.1)' },
        },
        'floating-flower': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -50px) rotate(10deg)' },
          '66%': { transform: 'translate(-20px, 20px) rotate(-5deg)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
