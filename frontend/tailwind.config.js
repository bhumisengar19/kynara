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
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Light Mode
        light: {
          bg: '#F8F7FF',
          secondary: '#FFFFFF',
          section: '#F3F0FF',
          text: '#1F2937',
          textSecondary: '#6B7280',
          textMuted: '#9CA3AF',
        },
        // Dark Mode
        dark: {
          bg: '#0F0B1F',
          secondary: '#14112B',
          text: '#F3F4F6',
          textSecondary: '#A1A1AA',
          textMuted: '#71717A',
        },
        // Accent Colors
        accent: {
          purple: '#A78BFA',
          deepPurple: '#7C3AED',
          cyan: '#22D3EE',
          glow: '#9333EA',
        }
      },
      backgroundImage: {
        // Light Mode Gradients
        'light-gradient': 'linear-gradient(135deg, #F8F7FF 0%, #EDE9FE 100%)',
        'light-accent': 'linear-gradient(135deg, #A78BFA, #7C3AED)',
        
        // Dark Mode Gradients
        'dark-gradient': 'linear-gradient(135deg, #0F0B1F 0%, #1E1B4B 100%)',
        'dark-accent': 'linear-gradient(135deg, #9333EA, #6366F1)',
        
        // Liquid Glass Gradients
        'glass-gradient': 'linear-gradient(135deg, #E9D5FF 0%, #FDE68A 30%, #BAE6FD 60%, #FBCFE8 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2))',
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
