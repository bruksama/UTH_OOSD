/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for SPTS
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Status colors
        status: {
          normal: '#10b981',     // Green
          atRisk: '#f59e0b',     // Yellow/Orange
          probation: '#ef4444', // Red
          graduated: '#6366f1', // Indigo
        },
        // Alert level colors
        alert: {
          info: '#3b82f6',      // Blue
          warning: '#f59e0b',   // Yellow
          high: '#f97316',      // Orange
          critical: '#ef4444', // Red
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
