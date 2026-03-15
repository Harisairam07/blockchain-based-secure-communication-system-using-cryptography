/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0f172a',
          panel: '#1e293b',
          accent: '#22c55e',
          border: '#334155',
          muted: '#94a3b8'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,197,94,.3), 0 15px 35px rgba(34,197,94,.12)'
      },
      fontFamily: {
        body: ['Manrope', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
