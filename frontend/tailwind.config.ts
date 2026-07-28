import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        primary: {
          DEFAULT: 'var(--primary)',
          50: '#E8F0EC',
          100: '#C5DACF',
          200: '#A1C3B2',
          300: '#7EAD95',
          400: '#5C9778',
          500: 'var(--primary)',
          600: '#365846',
          700: '#284234',
          800: '#1B2C23',
          900: '#0E1611',
        },
        accent: 'var(--accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        text: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'rgba(0,0,0,0.04)',
          focus: 'var(--border-focus)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #436E57 0%, #5B866E 100%)',
        'gradient-surface': 'linear-gradient(180deg, #FFFFFF 0%, #F7F8F5 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.90) 100%)',
        'gradient-glow':
          'radial-gradient(ellipse at top, rgba(67,110,87,0.08) 0%, transparent 60%)',
        'gradient-score': 'conic-gradient(from 180deg, #436E57, #5B866E, #5EBE7A)',
      },
      boxShadow: {
        glow: '0 0 30px rgba(67,110,87,0.08)',
        'glow-sm': '0 0 15px rgba(67,110,87,0.05)',
        'glow-lg': '0 0 60px rgba(67,110,87,0.12)',
        card: '0 10px 30px rgba(0,0,0,0.05)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.08)',
        button: '0 14px 35px rgba(67,110,87,0.22)',
        inner: 'inset 0 1px 0 rgba(0,0,0,0.02)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(67,110,87,0.05)' },
          '100%': { boxShadow: '0 0 30px rgba(67,110,87,0.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
