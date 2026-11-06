/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#080c14',
          darker: '#04070d',
          card: '#0d1322',
          border: '#1b253b',
          accent: '#00f0ff',
          neon: '#00ff88',
          warn: '#ffb703',
          danger: '#ff003c'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
