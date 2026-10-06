/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        sap: {
          bg: '#f5f6f8', // Warm light neutral application canvas
          surface: '#ffffff',
          surfaceAlt: '#f8fafc',
          surfaceSelected: '#edf5ff',
          border: '#d9dcdf',
          borderLight: '#e8ecef',
          borderDark: '#b5bcc4',
          blue: '#0070f2', // Official SAP Fiori Horizon brand blue
          blueHover: '#0064d9',
          blueDark: '#0854a0',
          blueLight: '#edf5ff',
          headerBg: '#ffffff', // Clean light shell header
          headerBorder: '#d9dcdf',
          textMain: '#1d2d3e', // Deep enterprise contrast text
          textMuted: '#556b82', // Readable secondary text
          textSubtle: '#8c9ba5',
          success: '#107e3e',
          successBg: '#f0fdf4',
          successBorder: '#bbf7d0',
          warning: '#d97706',
          warningBg: '#fffbeb',
          warningBorder: '#fde68a',
          error: '#bb0000',
          errorBg: '#fef2f2',
          errorBorder: '#fecaca',
          neutral: '#556b82',
          neutralBg: '#f1f5f9',
          neutralBorder: '#cbd5e1',
        }
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '3px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        subtle: '0 1px 2px rgba(0, 0, 0, 0.04)',
        elevated: '0 4px 12px rgba(0, 0, 0, 0.08)',
        modal: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
