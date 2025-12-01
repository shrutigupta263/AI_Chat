/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'primary-light': '#EEF2FF',
        background: '#F9FAFB',
        card: '#FFFFFF',
        border: '#E5E7EB',
        'text-dark': '#111827',
        'text-muted': '#6B7280',
        'sidebar-start': '#4C1D95',
        'sidebar-end': '#6366F1',
      },
      borderRadius: {
        card: '16px',
        input: '12px',
      },
      boxShadow: {
        card: '0 24px 60px rgba(15, 23, 42, 0.08)',
      },
      spacing: {
        4: '1rem',
        8: '2rem',
        16: '4rem',
        24: '6rem',
        32: '8rem',
      },
      animation: {
        'slide-in': 'slideIn 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

