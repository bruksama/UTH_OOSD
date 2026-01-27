/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for SPTS - "Academic Clarity" Theme
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // Indigo-500
          600: '#4f46e5',  // Indigo-600 (Main Brand)
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Status colors - Refined for better accessibility
        status: {
          normal: '#059669',     // Emerald-600
          atRisk: '#d97706',     // Amber-600
          probation: '#dc2626',  // Red-600
          graduated: '#7c3aed',  // Violet-600
        },
        // Alert level colors
        alert: {
          info: '#3b82f6',      // Blue-500
          warning: '#f59e0b',   // Amber-500
          high: '#f97316',      // Orange-500
          critical: '#ef4444',  // Red-500
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
