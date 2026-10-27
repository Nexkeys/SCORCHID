/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Anton', 'Impact', 'ui-sans-serif', 'sans-serif'],
        body: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        coal: '#07090b',
        ink: '#0c1116',
      },
      letterSpacing: {
        widest2: '0.3em',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-2%, 3%)' },
          '50%': { transform: 'translate(3%, -2%)' },
          '75%': { transform: 'translate(-3%, -3%)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        marqueeSlow: 'marquee 55s linear infinite',
        marqueeFast: 'marquee 18s linear infinite',
        grain: 'grain 0.8s steps(2) infinite',
        blink: 'blink 1s steps(1) infinite',
      },
    },
  },
  plugins: [],
}
